package pgrepl

import (
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"
)

// Message defines the format of messages received from a replication connection.
type Message struct {
	Change  []Change `json:"change"`
	NextLSN string   `json:"nextlsn"`
}

// Change defines a modification that happened on a database and was logged
// to a replication connection.
type Change struct {
	Kind         string        `json:"kind"`
	Schema       string        `json:"schema"`
	Table        string        `json:"table"`
	ColumnNames  []string      `json:"columnnames"`
	ColumnTypes  []string      `json:"columntypes"`
	ColumnValues []interface{} `json:"columnvalues"`
	OldKeys      OldKeys       `json:"oldkeys"`
}

// GetColumnValue finds the value of a column in a changed row, from the name
// of this column.
func (change Change) GetColumnValue(columnName string) interface{} {
	for i, name := range change.ColumnNames {
		if name == columnName {
			return change.ColumnValues[i]
		}
	}

	return nil
}

// GetStringColumnValue specialises GetColumnValue to a string column.
func (change Change) GetStringColumnValue(columnName string) (string, error) {
	valuei := change.GetColumnValue(columnName)
	if valuei == nil {
		return "", errJSONFieldMissing
	}

	value, ok := valuei.(string)
	if !ok {
		return "", jsonNumberError(valuei)
	}

	return value, nil
}

// GetIntColumnValue specialises GetColumnValue to an integer column.
func (change Change) GetIntColumnValue(columnName string) (int, error) {
	valuei := change.GetColumnValue(columnName)
	if valuei == nil {
		return 0, errJSONFieldMissing
	}

	valuef, ok := valuei.(float64) // JSON numbers are floats
	if !ok {
		return 0, jsonNumberError(valuei)
	}

	return int(valuef), nil
}

// GetTstzrangeLowerColumnValue specialises GetColumnValue to a tstzrange column
// and extracts the lower bound of the interval.
func (change Change) GetTstzrangeLowerColumnValue(
	columnName string,
) (*pgtype.Timestamptz, error) {
	valuei := change.GetColumnValue(columnName)
	if valuei == nil {
		return nil, errJSONFieldMissing
	}

	valueStr, ok := valuei.(string)
	if !ok {
		return nil, jsonStringError(valuei)
	}

	// trimming the interval notation, e.g. :
	// ["2007-11-28 10:54:12.694595+00",)
	//   2007-11-28 10:54:12.694595+00
	timestampStr := valueStr[2 : len(valueStr)-3]

	timestamp := new(pgtype.Timestamptz)
	err := timestamp.Scan(timestampStr)
	if err != nil {
		return nil, timestampParseError(err)
	}

	return timestamp, nil
}

var errJSONFieldMissing = errors.New("JSON field missing")

var errNotAJSONNumber = errors.New("not a JSON number")

func jsonNumberError(value interface{}) error {
	return fmt.Errorf("%w: %v", errNotAJSONNumber, value)
}

var errNotAJSONString = errors.New("not a JSON string")

func jsonStringError(value interface{}) error {
	return fmt.Errorf("%w: %v", errNotAJSONString, value)
}

func timestampParseError(err error) error {
	return fmt.Errorf("could not parse timestamp: %w", err)
}

// OldKeys defines the old values of a row before an update or delete operation.
type OldKeys struct {
	KeyNames  []string      `json:"keynames"`
	KeyTypes  []string      `json:"keytypes"`
	KeyValues []interface{} `json:"keyvalues"`
}
