package pgrepl

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"strings"
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
}

// NewConnection creates a replication connection waiting for message listening
// to be started.
func NewConnection(
	ctx context.Context,
	connURI string,
	slotName string,
	addTables []string,
	logPrefix string,
) (*Connection, error) {
	var pgxConn *pgx.Conn
	pgxConn, err := pgx.Connect(ctx, connURI+"?replication=database")
	if err != nil {
		return nil, connectError(err)
	}
	conn := pgxConn.PgConn()

	// We are using the wal2json plugin
	// Parameters are documented here:
	// https://github.com/eulerto/wal2json?tab=readme-ov-file#parameters
	pluginArguments := []string{
		//  * include-lsn: add nextlsn to each changeset
		"\"include-lsn\" 'true'",
	}

	// * add-tables: include only rows from the specified tables.
	//               Default is all tables from all schemas.
	if len(addTables) > 0 {
		pluginArguments = append(pluginArguments,
			fmt.Sprintf("\"add-tables\" '%s'", strings.Join(addTables, ",")),
		)
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
		conn:      conn,
		logPrefix: logPrefix,
		lsn:       pglogrepl.LSN(0),
	}, nil
}

// ReceiveMessage waits for messages from the replication connection that can
// be parsed into a Message, silently looping and handling the other possible
// types of messages that can be sent in the replication protocol.
//
//nolint:cyclop
func (replConn *Connection) ReceiveMessage(
	ctx context.Context,
) (*Message, error) {
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
				var jsonWALMessage Message
				err = json.Unmarshal(xld.WALData, &jsonWALMessage)
				if err != nil {
					return nil, unmarshalWALDataError(err)
				}
				// thanks to the `include-lsn` option given to the START_REPLICATION command,
				// we can get the next LSN directly from the message itself
				nextLSN, err := pglogrepl.ParseLSN(jsonWALMessage.NextLSN)
				if err != nil {
					return nil, lsnParseError(err)
				}
				if replConn.lsn > nextLSN {
					slog.InfoContext(ctx, "replication skipping outdated message", "lsn", nextLSN)
					continue
				}
				return &jsonWALMessage, nil
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
				WALWritePosition: replConn.lsn,
				WALFlushPosition: replConn.lsn,
				WALApplyPosition: replConn.lsn,
				ClientTime:       time.Now(),
				ReplyRequested:   false,
			},
		)
		if err != nil {
			return sendStandbyStatusUpdateError(err)
		}
	}
	return nil
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
	if err := replConn.conn.Close(ctx); err != nil {
		return connectionCloseError(err)
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

func unmarshalWALDataError(err error) error {
	return fmt.Errorf("failed to unmarshal JSON WALData: %w", err)
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
