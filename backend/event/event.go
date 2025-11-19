package event

import (
	"flex/pgrepl"
	"flex/pgrepl/pgoutput"
	"fmt"
	"strconv"

	"github.com/jackc/pgx/v5/pgtype"
)

type event struct {
	ID         int
	Type       string
	ResourceID int
	RecordedAt pgtype.Timestamptz
	RecordedBy int
}

func fromTupleData(td *pgoutput.TupleData) (event, error) {
	event := event{} //nolint:exhaustruct

	var err error

	event.ID, err = strconv.Atoi(string(td.Columns[0]))
	if err != nil {
		return event, fmt.Errorf("could not parse ID: %w", err)
	}
	event.Type = string(td.Columns[1])

	// `source_resource` is column index 2
	// We don't need it since we have it as part of `type`

	event.ResourceID, err = strconv.Atoi(string(td.Columns[3]))
	if err != nil {
		return event, fmt.Errorf("could not parse ResourceID: %w", err)
	}

	// `data` is column index 4
	// We don't use it, so no need to parse

	// trimming the interval notation, e.g. :
	// ["2007-11-28 10:54:12.694595+00",)
	//   2007-11-28 10:54:12.694595+00
	recordedAtStr := string(td.Columns[5])[2 : len(td.Columns[5])-3]

	recordedAt := new(pgtype.Timestamptz)

	err = recordedAt.Scan(recordedAtStr)
	if err != nil {
		return event, fmt.Errorf("could not parse RecordedAt: %w", err)
	}

	event.RecordedAt = *recordedAt

	if err != nil {
		return event, fmt.Errorf("could not parse RecordedAt: %w", err)
	}
	event.RecordedBy, err = strconv.Atoi(string(td.Columns[6]))
	if err != nil {
		return event, fmt.Errorf("could not parse RecordedBy: %w", err)
	}

	return event, nil
}

//nolint:unused
func fromChange(change *pgrepl.Change) (event, error) {
	event := event{} //nolint:exhaustruct

	var err error

	event.ID, err = change.GetIntColumnValue("id")
	if err != nil {
		return event, fmt.Errorf("could not get event ID: %w", err)
	}

	event.Type, err = change.GetStringColumnValue("type")
	if err != nil {
		return event, fmt.Errorf("could not get event type: %w", err)
	}

	event.ResourceID, err = change.GetIntColumnValue("source_id")
	if err != nil {
		return event, fmt.Errorf("could not get event source ID: %w", err)
	}

	recordedAt, err := change.GetTstzrangeLowerColumnValue("record_time_range")
	if err != nil {
		return event, fmt.Errorf("could not get event time: %w", err)
	}

	event.RecordedAt = *recordedAt

	event.RecordedBy, err = change.GetIntColumnValue("recorded_by")
	if err != nil {
		return event, fmt.Errorf("could not get event identity: %w", err)
	}

	return event, nil
}
