package pgrepl

import (
	"context"
	"errors"
	"flex/pgrepl/pgoutput"
	"fmt"
	"log/slog"
	"time"

	"github.com/jackc/pglogrepl"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgproto3"
)

// timeout for sending/receiving messages over the replication connection,
// before considering the connection is dead.
const messageTimeout = 40 * time.Second

// Connection stores the internal information and state of a replication listener.
type Connection struct {
	conn      *pgconn.PgConn
	logPrefix string
	lsn       pglogrepl.LSN
	// transactionLSN is used to keep track of the last LSN of a transaction.
	// We need it since we process begin and commit messages separately from the
	// data modification messages.
	transactionLSN pglogrepl.LSN
}

// NewConnection creates a replication connection waiting for message listening
// to be started.
func NewConnection(
	ctx context.Context,
	connURI string,
	slotName string,
	logPrefix string,
) (*Connection, error) {
	var pgxConn *pgx.Conn

	pgxConn, err := pgx.Connect(ctx, connURI+"?replication=database")
	if err != nil {
		return nil, connectError(err)
	}

	conn := pgxConn.PgConn()

	// We are using the pgoutput plugin
	// Parameters are documented here:
	// https://www.postgresql.org/docs/16/protocol-logical-replication.html
	pluginArguments := []string{
		"\"proto_version\" '1'",
		"publication_names" + " 'event_insert'",
	}

	// StartReplication sends the START_REPLICATION command to the server
	// https://www.postgresql.org/docs/15/protocol-replication.html
	err = pglogrepl.StartReplication(
		ctx,
		conn,
		slotName,
		// The START_REPLICATION command instructs the server to start streaming WAL
		// for logical replication, starting at either WAL location XXX/XXX or the slot's confirmed_flush_lsn,
		// whichever is greater. So we are just sending 0/0 to start where we last flushed.
		pglogrepl.LSN(0),
		pglogrepl.StartReplicationOptions{
			Timeline:   0, // 0 will make pglogrepl not add the TIMELINE option to the command. TIMELINE is not relevant for logical replication.
			Mode:       pglogrepl.LogicalReplication,
			PluginArgs: pluginArguments,
		},
	)
	if err != nil {
		return nil, startReplicationError(err)
	}

	return &Connection{
		conn:           conn,
		logPrefix:      logPrefix,
		lsn:            pglogrepl.LSN(0),
		transactionLSN: pglogrepl.LSN(0),
	}, nil
}

// ReceiveMessage waits for messages from the replication connection that can
// be parsed into a Message, silently looping and handling the other possible
// types of messages that can be sent in the replication protocol.
//
//nolint:cyclop,gocognit,funlen
func (replConn *Connection) ReceiveMessage(
	ctx context.Context,
) (*pgoutput.InsertMessage, error) {
	for {
		messageCtx, cancel := context.WithTimeout(ctx, messageTimeout)
		defer cancel()

		msg, err := replConn.conn.ReceiveMessage(messageCtx)
		if err != nil {
			return nil, messageReceptionError(err)
		}

		switch msg := msg.(type) {
		case *pgproto3.CopyData:
			// the protocol can send XLogData messages with information that we can
			// parse and give to the handler, or keep-alive messages that we may
			// have to reply to
			switch msg.Data[0] {
			case pglogrepl.XLogDataByteID:
				xld, err := pglogrepl.ParseXLogData(msg.Data[1:])
				if err != nil {
					return nil, parseXLogDataError(err)
				}

				messageType := xld.WALData[0]
				switch messageType {
				case pgoutput.MessageTypeBegin:
					var beginMessage pgoutput.BeginMessage

					err = beginMessage.UnmarshalBinary(xld.WALData)
					if err != nil {
						return nil, fmt.Errorf("failed to unmarshal pgoutput begin message: %w", err)
					}
					slog.DebugContext(ctx, "pgoutput begin message received",
						"finalLSN", beginMessage.FinalLSN,
						"waldata", xld.WALData,
					)
					replConn.transactionLSN = pglogrepl.LSN(beginMessage.FinalLSN)
				case pgoutput.MessageTypeInsert:
					if replConn.lsn > replConn.transactionLSN {
						slog.InfoContext(ctx, "replication skipping outdated message", "lsn", replConn.transactionLSN)
						continue
					}
					var insertMessage pgoutput.InsertMessage

					err = insertMessage.UnmarshalBinary(xld.WALData)
					if err != nil {
						return nil, fmt.Errorf("failed to unmarshal pgoutput insert message: %w", err)
					}
					slog.DebugContext(ctx, "pgoutput insert message received",
						"oid", insertMessage.Oid,
						"columns", insertMessage.TupleData.Columns,
						"waldata", xld.WALData,
					)
					return &insertMessage, nil
				case pgoutput.MessageTypeCommit:
					var commitMessage pgoutput.CommitMessage

					err = commitMessage.UnmarshalBinary(xld.WALData)
					if err != nil {
						return nil, fmt.Errorf("failed to unmarshal pgoutput commit message: %w", err)
					}
					slog.DebugContext(ctx, "pgoutput commit message received",
						"commitLSN", commitMessage.CommitLSN,
						"transactionLSN", commitMessage.EndLSN,
						"waldata", xld.WALData,
					)

					// if the client made it to a commit message, we can assume that it handled all the previous
					// messages in the transaction, so we can update the replication connection's LSN to the
					// end of the transaction.
					replConn.lsn = pglogrepl.LSN(commitMessage.EndLSN)
				default:
					slog.DebugContext(ctx, "pgoutput message received", "messageType", string(xld.WALData[0]))
				}

			case pglogrepl.PrimaryKeepaliveMessageByteID:
				err := replConn.handlePrimaryKeepaliveMessage(ctx, msg.Data[1:])
				if err != nil {
					return nil, keepaliveError(err)
				}
			default:
				return nil, unexpectedCopyDataError(msg.Data[0])
			}
		case *pgproto3.ErrorResponse:
			return nil, errorMessageError(msg.Message)
		default:
			return nil, unexpectedMessageError(msg)
		}
	}
}

// Acknowledge updates the replication connection's LSN to the one given in the
// message. To be called only after actually having handled the message.
func (replConn *Connection) Acknowledge(msg *Message) error {
	nextLSN, err := pglogrepl.ParseLSN(msg.NextLSN)
	if err != nil {
		return lsnParseError(err)
	}

	replConn.lsn = nextLSN

	return nil
}

// Close closes the replication connection.
func (replConn *Connection) Close(ctx context.Context) error {
	slog.InfoContext(ctx, "closing replication connection")

	err := replConn.conn.Close(ctx)
	if err != nil {
		return connectionCloseError(err)
	}

	return nil
}

func (replConn *Connection) handlePrimaryKeepaliveMessage(
	ctx context.Context,
	rawPrimaryKeepaliveData []byte,
) error {
	pkm, err := pglogrepl.ParsePrimaryKeepaliveMessage(rawPrimaryKeepaliveData)
	if err != nil {
		return parsePKMError(err)
	}

	if pkm.ReplyRequested {
		messageCtx, cancel := context.WithTimeout(ctx, messageTimeout)
		defer cancel()

		err := pglogrepl.SendStandbyStatusUpdate(
			messageCtx,
			replConn.conn,
			pglogrepl.StandbyStatusUpdate{
				// The +1 seems to be the way to do it. Dunno why.
				// At least that seems to be the convention in other tools working with logical replication
				// Examples:
				//  - https://github.com/eulerto/wal2json/blob/master/wal2json.c#L95
				//  - https://hexdocs.pm/postgrex_pgoutput/Postgrex.PgOutput.html#encode/1-examples
				WALWritePosition: replConn.lsn + 1,
				WALFlushPosition: replConn.lsn + 1,
				WALApplyPosition: replConn.lsn + 1,
				ClientTime:       time.Now(),
				ReplyRequested:   false,
			},
		)
		if err != nil {
			return sendStandbyStatusUpdateError(err)
		}

		slog.DebugContext(
			ctx, "received PrimaryKeepaliveMessage and sent status update",
			"lsn", replConn.lsn.String(),
		)
	} else {
		slog.DebugContext(
			ctx, "received PrimaryKeepaliveMessage, no reply requested",
		)
	}

	return nil
}

// error messages

func connectError(err error) error {
	return fmt.Errorf("failed to acquire connection: %w", err)
}

func startReplicationError(err error) error {
	return fmt.Errorf("failed to start replication: %w", err)
}

func keepaliveError(err error) error {
	return fmt.Errorf("failed to handle PrimaryKeepaliveMessage: %w", err)
}

var errUnexpectedCopyData = errors.New("unexpected CopyData message type")

func unexpectedCopyDataError(id byte) error {
	return fmt.Errorf("%w: %T", errUnexpectedCopyData, id)
}

func parseXLogDataError(err error) error {
	return fmt.Errorf("failed to parse XLogData: %w", err)
}

func lsnParseError(err error) error {
	return fmt.Errorf("could not parse LSN: %w", err)
}

func parsePKMError(err error) error {
	return fmt.Errorf("failed to parse primary keepalive message: %w", err)
}

func sendStandbyStatusUpdateError(err error) error {
	return fmt.Errorf("failed to send standby status update: %w", err)
}

func messageReceptionError(err error) error {
	return fmt.Errorf("failed to receive message: %w", err)
}

var errErrorMessage = errors.New("received error message")

func errorMessageError(msg string) error {
	return fmt.Errorf("%w: %s", errErrorMessage, msg)
}

var errUnexpectedMessage = errors.New("unexpected message type")

func unexpectedMessageError(msg any) error {
	return fmt.Errorf("%w: %v", errUnexpectedMessage, msg)
}

func connectionCloseError(err error) error {
	return fmt.Errorf("failed to close connection: %w", err)
}
