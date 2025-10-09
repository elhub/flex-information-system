package meteringpointdatahub

import (
	"encoding/json"
	"flex/internal/validate"
	"fmt"
)

// meteringPointDataRaw represents the raw JSON structure returned by the
// external metering point datahub service to describe an accounting point.
// The structure is filtered to only include the fields we care about.
type meteringPointDataRaw struct {
	Data []mpdrData `json:"data"`
}

type mpdrData struct {
	Attributes    mpdrAttributes    `json:"attributes"`
	Relationships mpdrRelationships `json:"relationships"`
}

type mpdrAttributes struct {
	Status string `json:"status"`
}

type mpdrRelationships struct {
	GridArea  mpdrReference `json:"grid-area"`  //nolint:tagliatelle
	GridOwner mpdrReference `json:"grid-owner"` //nolint:tagliatelle
	PriceArea mpdrReference `json:"price-area"` //nolint:tagliatelle
}

type mpdrReference struct {
	Data mpdrRefData `json:"data"`
}

type mpdrRefData struct {
	ID string `json:"id"`
}

// AccountingPointData represents the relevant data about an accounting point
// fetched from the external metering point datahub service, reformatted and
// adapted to the vocabulary of this project to make it easier to use.
type AccountingPointData struct {
	AccountingPointBusinessID  string
	MeteringGridAreaBusinessID string
	MeteringGridAreaName       string
	MeteringGridAreaPriceArea  string
	SystemOperatorORG          string
	SystemOperatorGLN          string
	SystemOperatorName         string
}

func unmarshalAccountingPointData(
	data []byte,
	accountingPointBusinessID string,
) (*AccountingPointData, error) {
	var mpdRaw meteringPointDataRaw
	err := json.Unmarshal(data, &mpdRaw)
	if err != nil {
		return nil, fmt.Errorf("could not parse response body: %w", err)
	}

	responseValidator := validate.New()
	responseValidator.Check(
		len(mpdRaw.Data) == 1,
		"expected exactly one metering point data entry, got %d", len(mpdRaw.Data),
	)
	responseValidator.Check(
		mpdRaw.Data[0].Attributes.Status == "Active",
		"metering point is inactive",
	)
	err = responseValidator.Error()
	if err != nil {
		return nil, err
	}

	// TODO: adjust the types above to keep more data from the API call
	return &AccountingPointData{
		AccountingPointBusinessID:  accountingPointBusinessID,
		MeteringGridAreaBusinessID: mpdRaw.Data[0].Relationships.GridArea.Data.ID,
		MeteringGridAreaName:       "TODO",
		MeteringGridAreaPriceArea:  mpdRaw.Data[0].Relationships.PriceArea.Data.ID,
		SystemOperatorORG:          "TODO",
		SystemOperatorGLN:          mpdRaw.Data[0].Relationships.GridOwner.Data.ID,
		SystemOperatorName:         "TODO",
	}, nil
}
