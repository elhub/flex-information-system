package event

import (
	"flex/pgrepl"
	"fmt"
	"strconv"
	"strings"

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

	eventSource, err := change.GetStringColumnValue("source")
	if err != nil {
		return event, fmt.Errorf("could not get event source: %w", err)
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

	event.ResourceID, err = getResourceID(eventSource)
	if err != nil {
		return event, fmt.Errorf("could not get resource ID: %w", err)
	}

	return event, nil
}

func getResourceID(eventSource string) (int, error) {
	i := strings.LastIndex(eventSource, "/")

	resourceID, err := strconv.Atoi(eventSource[i+1:])
	if err != nil {
		return 0, fmt.Errorf("could not get resource ID from source: %w", err)
	}
	return resourceID, nil
}
