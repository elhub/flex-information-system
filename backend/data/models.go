package data

import (
	"encoding/json"
	"flex/data/models"
)

// controllableUnitLookupRequest is the expected format for the body of the
// controllable unit lookup operation.
type controllableUnitLookupRequest struct {
	EndUserBusinessID          *string `json:"end_user,omitempty"`
	ControllableUnitBusinessID *string `json:"controllable_unit,omitempty"`
	AccountingPointID          *string `json:"accounting_point,omitempty"`
}

// technicalResource represents technical resource information as part of the
// data returned in the controllable unit lookup operation.
type technicalResource struct {
	ID      int     `json:"id"`
	Name    string  `json:"name"`
	Details *string `json:"details,omitempty"`
}

// ControllableUnitLookup is the format of a valid response in the controllable
// unit lookup operation.
type ControllableUnitLookup struct {
	ID                 int                 `json:"id"`
	BusinessID         string              `json:"business_id"`
	Name               string              `json:"name"`
	AccountingPointID  int                 `json:"accounting_point_id"`
	EndUserID          int                 `json:"end_user_id"`
	TechnicalResources []technicalResource `json:"technical_resources"`
}

// ReformatControllableUnitLookupResult turns the raw result of the
// controllable unit lookup operation into the response format expected in the
// API specification.
func ReformatControllableUnitLookupResult(
	cuLookup []models.ControllableUnitLookupRow,
) ([]ControllableUnitLookup, error) {
	reformattedCULookupResult := []ControllableUnitLookup{}

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

		reformattedCULookupResult = append(
			reformattedCULookupResult,
			ControllableUnitLookup{
				ID:                 cuLookupRow.ID,
				BusinessID:         cuLookupRow.BusinessID,
				Name:               cuLookupRow.Name,
				AccountingPointID:  cuLookupRow.AccountingPointID,
				EndUserID:          cuLookupRow.EndUserID,
				TechnicalResources: technicalResources,
			},
		)
	}

	return reformattedCULookupResult, nil
}
