package pgoutput

import (
	"bytes"
	"encoding/binary"
	"errors"
	"fmt"
)

// Static errors for message unmarshaling.
var (
	ErrDataTooShort   = errors.New("data too short")
	ErrUnknownColType = errors.New("unknown column type")
)

// Message type constants for PostgreSQL logical replication protocol.
const (
	// MessageTypeBegin indicates the start of a transaction.
	MessageTypeBegin = 'B'
	// MessageTypeCommit indicates the commit of a transaction.
	MessageTypeCommit = 'C'
	// MessageTypeOrigin indicates an origin message.
	MessageTypeOrigin = 'O'
	// MessageTypeRelation indicates relation metadata.
	MessageTypeRelation = 'R'
	// MessageTypeType indicates type information.
	MessageTypeType = 'Y'
	// MessageTypeInsert indicates an INSERT operation.
	MessageTypeInsert = 'I'
	// MessageTypeUpdate indicates an UPDATE operation.
	MessageTypeUpdate = 'U'
	// MessageTypeDelete indicates a DELETE operation.
	MessageTypeDelete = 'D'
	// MessageTypeTruncate indicates a TRUNCATE operation.
	MessageTypeTruncate = 'T'
	// MessageTypeMessage indicates a generic logical decoding message.
	MessageTypeMessage = 'M'
	// MessageTypeStreamStart indicates the start of a streaming transaction.
	MessageTypeStreamStart = 'S'
	// MessageTypeStreamStop indicates the stop of a streaming transaction.
	MessageTypeStreamStop = 'E'
	// MessageTypeStreamCommit indicates a streaming transaction commit.
	MessageTypeStreamCommit = 'W'
)

// InsertMessage represents an INSERT operation in the logical replication stream.
type InsertMessage struct {
	// Oid is the object identifier of the relation
	Oid uint32
	// TupleData contains the column data for the inserted row
	TupleData TupleData
}

// UnmarshalBinary decodes binary data into an InsertMessage.
func (mi *InsertMessage) UnmarshalBinary(data []byte) error {
	if len(data) < 6 { //nolint:mnd
		return fmt.Errorf("%w to unmarshal MessageInsert", ErrDataTooShort)
	}

	// The first byte is the message type, so we start reading after it
	mi.Oid = binary.BigEndian.Uint32(data[1:5])
	// Skip one byte for the 'N' - new tuple indicator

	err := mi.TupleData.UnmarshalBinary(data[6:])
	if err != nil {
		return err
	}
	return nil
}

// TupleData represents the column data for a database row.
type TupleData struct {
	// Columns contains the raw byte data for each column in the tuple
	Columns [][]byte
}

// UnmarshalBinary decodes binary data into TupleData.
func (td *TupleData) UnmarshalBinary(data []byte) error {
	if len(data) < 2 { //nolint:mnd
		return fmt.Errorf("%w to unmarshal TupleData", ErrDataTooShort)
	}

	buf := bytes.NewBuffer(data)

	numColumns := binary.BigEndian.Uint16(buf.Next(2)) //nolint:mnd
	td.Columns = make([][]byte, numColumns)

	for idx := range numColumns {
		colType := buf.Next(1)
		switch colType[0] {
		case 'n': // null
			td.Columns[idx] = nil
		case 'u': // unchanged toast
			td.Columns[idx] = nil // we don't handle this case very well
		case 't': // text formatted value
			if buf.Len() < 4 { //nolint:mnd
				return fmt.Errorf("%w to read column length", ErrDataTooShort)
			}
			colLen := binary.BigEndian.Uint32(buf.Next(4)) //nolint:mnd
			if buf.Len() < int(colLen) {
				return fmt.Errorf("%w to read column value", ErrDataTooShort)
			}
			colValue := buf.Next(int(colLen))
			td.Columns[idx] = colValue
		default:
			return ErrUnknownColType
		}
	}

	return nil
}

// CommitMessage represents a transaction commit in the logical replication stream.
type CommitMessage struct {
	// Flags contains commit-related flags
	Flags uint8
	// CommitLSN is the Log Sequence Number of the commit record
	CommitLSN uint64
	// EndLSN is the Log Sequence Number of the end of the transaction
	EndLSN uint64
}

// UnmarshalBinary decodes binary data into a CommitMessage.
func (cm *CommitMessage) UnmarshalBinary(data []byte) error {
	if len(data) < 18 { //nolint:mnd
		return fmt.Errorf("%w to unmarshal CommitMessage", ErrDataTooShort)
	}

	buf := bytes.NewBuffer(data[1:]) // Skip message type byte
	cm.Flags = buf.Next(1)[0]
	cm.CommitLSN = binary.BigEndian.Uint64(buf.Next(8)) //nolint:mnd
	cm.EndLSN = binary.BigEndian.Uint64(buf.Next(8))    //nolint:mnd

	return nil
}

// BeginMessage represents the start of a transaction in the logical replication stream.
type BeginMessage struct {
	// FinalLSN is the Log Sequence Number of the final position of the transaction
	FinalLSN uint64
	// CommitTime is the timestamp when the transaction was committed
	CommitTime uint64
	// TransactionID is the unique identifier of the transaction
	TransactionID uint32
}

// UnmarshalBinary decodes binary data into a BeginMessage.
func (bm *BeginMessage) UnmarshalBinary(data []byte) error {
	if len(data) < 21 { //nolint:mnd
		return fmt.Errorf("%w to unmarshal BeginMessage", ErrDataTooShort)
	}

	buf := bytes.NewBuffer(data[1:])                        // Skip message type byte
	bm.FinalLSN = binary.BigEndian.Uint64(buf.Next(8))      //nolint:mnd
	bm.CommitTime = binary.BigEndian.Uint64(buf.Next(8))    //nolint:mnd
	bm.TransactionID = binary.BigEndian.Uint32(buf.Next(4)) //nolint:mnd

	return nil
}
