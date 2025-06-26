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

// accountingPoint represents accounting point information as part of the
// data returned in the controllable unit lookup operation.
type accountingPoint struct {
	ID         int    `json:"id"`
	BusinessID string `json:"business_id"`
}

// endUser represents end user information as part of the data returned in the
// controllable unit lookup operation.
type endUser struct {
	ID int `json:"id"`
}

// controllableUnit represents controllable unit information as part of the
// data returned in the controllable unit lookup operation.
type controllableUnit struct {
	ID                 int                 `json:"id"`
	BusinessID         string              `json:"business_id"`
	Name               string              `json:"name"`
	TechnicalResources []technicalResource `json:"technical_resources"`
}

// ControllableUnitLookup is the format of a valid response in the controllable
// unit lookup operation.
type ControllableUnitLookup struct {
	AccountingPoint   accountingPoint    `json:"accounting_point"`
	EndUser           endUser            `json:"end_user"`
	ControllableUnits []controllableUnit `json:"controllable_units"`
}

// ReformatControllableUnitLookupResult turns the raw result of the
// controllable unit lookup operation into the response format expected in the
// API specification.
func ReformatControllableUnitLookupResult(
	cuLookup models.ControllableUnitLookupRow,
) (*ControllableUnitLookup, error) {
	controllableUnits := []controllableUnit{}

	for _, cu := range cuLookup.ControllableUnits {
		var controllableUnit controllableUnit
		if err := json.Unmarshal(cu, &controllableUnit); err != nil {
			return nil, err //nolint:wrapcheck
		}
		controllableUnits = append(controllableUnits, controllableUnit)
	}

	return &ControllableUnitLookup{
		AccountingPoint: accountingPoint{
			ID:         cuLookup.AccountingPointID,
			BusinessID: cuLookup.AccountingPointBusinessID,
		},
		EndUser: endUser{
			ID: cuLookup.EndUserID,
		},
		ControllableUnits: controllableUnits,
	}, nil
}
