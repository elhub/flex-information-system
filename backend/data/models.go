package data

import (
	"encoding/json"
	"flex/data/models"
)

// controllableUnitLookupRequest is the expected format for the body of the
// controllable unit lookup operation.
type controllableUnitLookupRequest struct {
	EndUserID         int     `json:"end_user_id"`
	BusinessID        *string `json:"business_id,omitempty"`
	AccountingPointID *string `json:"accounting_point_id,omitempty"`
}

// technicalResource represents technical resource information as part of the
// data returned in the controllable unit lookup operation.
type technicalResource struct {
	ID      int     `json:"id"`
	Name    string  `json:"name"`
	Details *string `json:"details,omitempty"`
}

// controllableUnitLookup is the format of a valid response in the controllable
// unit lookup operation.
type controllableUnitLookup struct {
	ID                 int                 `json:"id"`
	BusinessID         string              `json:"business_id"`
	Name               string              `json:"name"`
	AccountingPointID  string              `json:"accounting_point_id"`
	EndUserID          int                 `json:"end_user_id"`
	TechnicalResources []technicalResource `json:"technical_resources"`
}

// MarshalControllableUnitLookupResult serialises the result of the database
// controllable unit lookup operation into JSON.
func MarshalControllableUnitLookupResult(
	cuLookup []models.ControllableUnitLookupRow,
) ([]byte, error) {
	marshallableCULookupResult := []controllableUnitLookup{}

	for _, cuLookupRow := range cuLookup {
		var technicalResources []technicalResource
		if len(cuLookupRow.TechnicalResources) == 0 { // no TR for this CU
			technicalResources = []technicalResource{}
		} else {
			err := json.Unmarshal(
				cuLookupRow.TechnicalResources, &technicalResources,
			)
			if err != nil {
				return nil, err //nolint:wrapcheck
			}
		}

		marshallableCULookupResult = append(
			marshallableCULookupResult,
			controllableUnitLookup{
				ID:                 cuLookupRow.ID,
				BusinessID:         cuLookupRow.BusinessID,
				Name:               cuLookupRow.Name,
				AccountingPointID:  cuLookupRow.AccountingPointID,
				EndUserID:          cuLookupRow.EndUserID,
				TechnicalResources: technicalResources,
			},
		)
	}

	json, _ := json.Marshal(marshallableCULookupResult)
	return json, nil
}
