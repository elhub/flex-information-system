package meteringpointdatahub

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
