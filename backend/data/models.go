package data

// entityLookupRequest is the expected format for the body of the
// entity lookup operation.
type entityLookupRequest struct {
	BusinessID string `json:"business_id"`
	Name       string `json:"name"`
	Type       string `json:"type"`
}

// EntityLookupResponse is the format of a valid response in the
// entity lookup operation.
type EntityLookupResponse struct {
	EntityID int `json:"entity_id"`
}
