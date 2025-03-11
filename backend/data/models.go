package data

import (
	"encoding/json"
	"flex/data/models"
)

type technicalResource struct {
	ID      int     `json:"id"`
	Name    string  `json:"name"`
	Details *string `json:"details,omitempty"`
}

type controllableUnitLookup struct {
	ID                 int                 `json:"id"`
	BusinessID         string              `json:"business_id"`
	Name               string              `json:"name"`
	AccountingPointID  string              `json:"accounting_point_id"`
	EndUserID          int                 `json:"end_user_id"`
	TechnicalResources []technicalResource `json:"technical_resources"`
}

// MarshalControllableUnitLookupResult marshals the result of the database
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
