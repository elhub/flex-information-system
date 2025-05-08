package event

import (
	"context"
	"errors"
	authModels "flex/auth/models"
	"flex/event/models"
	"flex/internal/trace"
	"flex/pgpool"
	"flex/pgrepl"
	"fmt"
	"log/slog"
)

var errNilArguments = errors.New("arguments must not be nil")

var tracer = trace.Tracer("flex/event/worker") //nolint:gochecknoglobals

// Worker holds a connection to a replication slot dedicated to event handling.
type Worker struct {
	replConn  *pgrepl.Connection
	pool      *pgpool.Pool
	logPrefix string
	ctxKey    string
}

// NewWorker creates an event worker.
func NewWorker(
	replConn *pgrepl.Connection,
	pool *pgpool.Pool,
	ctxKey string,
	logPrefix string,
) (*Worker, error) {
	if replConn == nil || pool == nil {
		return nil, errNilArguments
	}
	return &Worker{replConn, pool, logPrefix, ctxKey}, nil
}

// Start is the main loop of the worker, it gives WAL messages to the handler.
// Must not be called in the main thread.
func (eventWorker *Worker) Start(ctx context.Context) error {
	// give a role to the worker so that the database methods can be used
	//nolint:revive,staticcheck
	ctx = context.WithValue(
		ctx, eventWorker.ctxKey, NewWorkerUserDetails(),
	)

	defer slog.InfoContext(ctx, "end of event worker")
	for {
		select {
		case <-ctx.Done(): // if the server closes, the worker should stop too
			return errEndContext
		default:
			ctx, span := tracer.Start(ctx, "eventWorker.handleMessage", trace.WithNewRoot())
			defer span.End()

			msg, err := eventWorker.replConn.ReceiveMessage(ctx)
			if err != nil {
				slog.ErrorContext(ctx, "could not receive message from replication connection", "error", err)
				return err //nolint:wrapcheck
			}
			if err = eventWorker.handleMessage(ctx, msg); err != nil {
				slog.ErrorContext(ctx, "could not handle message in worker", "error", err)
				return err
			}
			// the handler succeeded, so we can acknowledge the message
			if err = eventWorker.replConn.Acknowledge(msg); err != nil {
				slog.ErrorContext(ctx,
					"could not acknowledge message on replication connection", "error", err,
				)
				return err //nolint:wrapcheck
			}
		}
	}
}

// Stop stops the worker after closing underlying connections.
func (eventWorker *Worker) Stop(ctx context.Context) error {
	if err := eventWorker.replConn.Close(ctx); err != nil {
		return fmt.Errorf("could not close replication connection: %w", err)
	}
	return nil
}

// handleMessage is the function run by the worker on each Message coming
// from a replication connection dedicated to event processing. It has access
// to a transaction to perform operations on the database.
//
//nolint:cyclop,funlen
func (eventWorker *Worker) handleMessage(
	ctx context.Context,
	message *pgrepl.Message,
) error {
	conn, err := eventWorker.pool.Acquire(ctx)
	if err != nil {
		return systemConnectionError(err)
	}
	defer conn.Release()
	tx, err := conn.Begin(ctx)
	if err != nil {
		return transactionError(err)
	}
	queries := models.New(tx)

	for _, change := range message.Change {
		if change.Table != "event" {
			// This is enforced by the replication connection,
			// but we check it here just in case.
			slog.WarnContext(ctx, "event worker got a change for a table that is not 'event'")
			continue
		}

		event, err := fromChange(&change)
		if err != nil {
			return fmt.Errorf("could not parse event from change: %w", err)
		}

		slog.DebugContext(ctx, "handling event", "type", event.Type, "resource_id", event.ResourceID)

		// TODO (improvement): go through the auth API instead of the models
		var eventPartyID int
		if event.RecordedBy == 0 { // system event
			eventPartyID = 0
		} else {
			eventPartyID, err = authModels.PartyOfIdentity(ctx, tx, event.RecordedBy)
			if err != nil {
				return fmt.Errorf("could not get party of identity: %w", err)
			}
		}

		// determine who should be notified
		notificationRecipients, err := queries.GetNotificationRecipients(
			ctx,
			event.Type,
			event.ResourceID,
			event.RecordedAt,
		)
		if err != nil {
			return fmt.Errorf("could not get notification recipients: %w", err)
		}

		slog.DebugContext(ctx, "notification recipients", "recipients", notificationRecipients)

		// notify
		for _, recipient := range notificationRecipients {
			if recipient == eventPartyID {
				// never notify the party causing the event (useless)
				continue
			}

			if err := queries.Notify(ctx, event.ID, recipient); err != nil {
				return fmt.Errorf("could not insert notification: %w", err)
			}
			slog.InfoContext(ctx, fmt.Sprintf("notified party #%d of event #%d", recipient, event.ID))
		}
	}

	if err = tx.Commit(ctx); err != nil {
		return fmt.Errorf("could not commit transaction: %w", err)
	}
	return nil
}

// error messages

var errEndContext = errors.New("event worker context ended")

func systemConnectionError(err error) error {
	return fmt.Errorf("could not acquire system connection: %w", err)
}

func transactionError(err error) error {
	return fmt.Errorf("could not start transaction: %w", err)
}
