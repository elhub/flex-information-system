package auth

import (
	"encoding/json"
	"flex/internal/validate"
	"fmt"
	"time"

	"github.com/lestrrat-go/jwx/v3/jws"
)

// accessToken is the struct that holds the payload of the access JWT.
type accessToken struct {
	EntityID       int      `json:"entity_id"`
	ExpirationTime unixTime `json:"exp"`
	ExternalID     string   `json:"eid"`
	PartyID        int      `json:"party_id,omitempty"`
	Role           string   `json:"role"`
	Scopes         []string `json:"scopes"`
}

// Validate checks that the access token has all the required fields set in the correct ways.
func (a accessToken) Validate() error {
	val := validate.New()
	val.Check(a.EntityID > 0, "entity_id is not set")
	val.Check(a.Role != "", "role is empty")
	val.Check(a.Role == "flex_entity" || a.PartyID > 0, "party_id is not set")
	val.Check(!a.IsExpired(), "token has expired")
	val.Check(a.ExternalID != "", "external_id is empty")
	val.Check(a.Scopes != nil, "scopes are not set")
	return val.Error()
}

// IsExpired returns true if the access token has expired.
func (a accessToken) IsExpired() bool {
	return a.ExpirationTime.Before(time.Now())
}

// ExpiresIn returns the number of seconds until the access token expires.
func (a accessToken) ExpiresIn() int {
	return int(time.Until(a.ExpirationTime.Time).Seconds())
}

// verifyTokenString takes a JWT in compact format, verifies with
// jws.Verify and unmarshals into the payloadStruct pointer.
// If payloadStruct is nil, the payload is not unmarshalled.
// The jws.VerifyOption is passed directly to jws.Verify.
// The access token is not validated. Use the Validate method for that.
func verifyTokenString(token string, payloadStruct any, options ...jws.VerifyOption) error {
	payload, err := jws.Verify([]byte(token), options...)
	if err != nil {
		return fmt.Errorf("error in verifying token: %w", err)
	}

	if payloadStruct == nil {
		return nil
	}

	err = json.Unmarshal(payload, &payloadStruct)
	if err != nil {
		return fmt.Errorf("error in unmarshalling token: %w", err)
	}

	return nil
}

// Sign is a convenience method to sign the access token using jws.Sign.
// It marshals the access token to JSON and signs it with the provided options.
// The return value is a signed token in compact format (j.w.t).
func (a accessToken) Sign(options ...jws.SignOption) ([]byte, error) {
	b, err := json.Marshal(a)
	if err != nil {
		return nil, fmt.Errorf("error in marshalling access token: %w", err)
	}
	token, err := jws.Sign(b, options...)
	if err != nil {
		return nil, fmt.Errorf("error in signing access token: %w", err)
	}
	return token, nil
}

// newUnixExpirationTime returns a unixTime with the current time plus the given duration in seconds.
func newUnixExpirationTime(tokenDurationSeconds int) unixTime {
	return unixTime{time.Now().Add(time.Duration(tokenDurationSeconds) * time.Second)}
}
