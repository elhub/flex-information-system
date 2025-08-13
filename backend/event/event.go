package event

import (
	"flex/pgrepl"
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"
)

type event struct {
	ID         int
	Type       string
	ResourceID int
	RecordedAt pgtype.Timestamptz
	RecordedBy int
}

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
