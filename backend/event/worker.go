package event

import (
	"context"
	"errors"
	authModels "flex/auth/models"
	"flex/event/models"
	"flex/internal/trace"
	"flex/pgpool"
	"fmt"
	"log/slog"
	"time"
)

var errNilArguments = errors.New("arguments must not be nil")

var tracer = trace.Tracer("flex/event/worker") //nolint:gochecknoglobals

// Worker holds a connection pool for event handling.
type Worker struct {
	pool   *pgpool.Pool
	ctxKey string
}

// NewWorker creates an event worker.
func NewWorker(
	pool *pgpool.Pool,
	ctxKey string,
) (*Worker, error) {
	if pool == nil {
		return nil, errNilArguments
	}

	return &Worker{pool, ctxKey}, nil
}

const (
	batchSize    = 42
	waitDuration = 10 * time.Second
)

// Start is the main loop of the worker, it polls for unprocessed events.
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
			ctx, span := tracer.Start(ctx, "eventWorker.processBatch", trace.WithNewRoot())

			hadEvents, err := eventWorker.processBatch(ctx)
			span.End()

			if err != nil {
				slog.ErrorContext(ctx, "could not process batch", "error", err)
				// Wait before retrying on error
				time.Sleep(waitDuration)
				continue
			}

			if !hadEvents {
				// No events found, wait before polling again
				time.Sleep(waitDuration)
			}
			// If hadEvents is true, immediately loop to process next batch
		}
	}
}

// processBatch fetches and processes a batch of unprocessed events.
// Returns true if any events were processed, false if the queue was empty.
//
//nolint:cyclop,funlen
func (eventWorker *Worker) processBatch(ctx context.Context) (bool, error) {
	conn, err := eventWorker.pool.Acquire(ctx)
	if err != nil {
		return false, systemConnectionError(err)
	}
	defer conn.Release()

	tx, err := conn.Begin(ctx)
	if err != nil {
		return false, transactionError(err)
	}
	defer tx.Rollback(ctx)

	queries := models.New(tx)

	events, err := queries.GetEventsToProcess(ctx, batchSize)
	if err != nil {
		return false, fmt.Errorf("could not get events to process: %w", err)
	}

	if len(events) == 0 {
		// No events to process, rollback and return
		return false, nil
	}

	slog.DebugContext(ctx, "processing event batch", "count", len(events))

	// need to keep track of event IDs to mark them as processed later
	eventIDs := make([]int, 0, len(events))

	for _, event := range events {
		slog.DebugContext(
			ctx, "handling event", "type", event.Type, "id", event.ID,
		)

		// Determine resource ID (use subject_id if present, otherwise source_id)
		resourceID := event.SourceID
		if event.SubjectID != nil {
			resourceID = *event.SubjectID
		}

		// TODO (improvement): go through the auth API instead of the models
		eventPartyID, err := authModels.PartyOfIdentity(ctx, tx, event.RecordedBy)
		if err != nil {
			return false, fmt.Errorf("could not get party of identity: %w", err)
		}

		// determine who should be notified
		notificationRecipients, err := queries.GetNotificationRecipients(
			ctx,
			event.Type,
			resourceID,
			event.RecordedAt,
		)
		if err != nil {
			return false, fmt.Errorf("could not get notification recipients: %w", err)
		}

		slog.DebugContext(ctx, "notification recipients", "recipients", notificationRecipients)

		// if the party that caused the event is in the list of recipients, they should not receive a notification
		for i, recipient := range notificationRecipients {
			if recipient == eventPartyID {
				notificationRecipients = append(notificationRecipients[:i], notificationRecipients[i+1:]...)
				break
			}
		}

		if len(notificationRecipients) > 0 {
			err = queries.NotifyMany(ctx, int(event.ID), notificationRecipients)
			if err != nil {
				return false, fmt.Errorf("could not insert notification: %w", err)
			}

			slog.InfoContext(ctx, "notified parties of event", "event_id", event.ID)
		} else {
			slog.DebugContext(ctx, "no parties to notify for event", "event_id", event.ID)
		}

		eventIDs = append(eventIDs, int(event.ID))
	}

	// Mark all events in the batch as processed
	err = queries.MarkEventsAsProcessed(ctx, eventIDs)
	if err != nil {
		return false, fmt.Errorf("could not mark events as processed: %w", err)
	}

	if err = tx.Commit(ctx); err != nil {
		return false, fmt.Errorf("could not commit transaction: %w", err)
	}

	return true, nil
}

// error messages

var errEndContext = errors.New("event worker context ended")

func systemConnectionError(err error) error {
	return fmt.Errorf("could not acquire system connection: %w", err)
}

func transactionError(err error) error {
	return fmt.Errorf("could not start transaction: %w", err)
}
