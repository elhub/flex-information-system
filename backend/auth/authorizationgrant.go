package auth

import (
	"errors"
	"flex/internal/validate"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

// errInvalidSubject is returned when the subject has invalid format.
var errInvalidSubject = errors.New("invalid subject")

// subject is either the iss or sub of a authorization grant token.
type subject struct {
	// Type is the type of the subject, either entity or party.
	Type string
	// IdentifierType is the type of the identifier, either org, gln or uuid.
	IdentifierType string
	// Identifier is the identifier of the subject.
	Identifier string
}

// String returns the subject as a string.
func (s *subject) String() string {
	return "no:" + s.Type + ":" + s.IdentifierType + ":" + s.Identifier
}

// MarshalJSON marshals a subject to a JSON string.
func (s *subject) MarshalJSON() ([]byte, error) {
	return []byte(`"` + s.String() + `"`), nil
}

// UnmarshalJSON unmarshals a subject from a JSON string.
//
//nolint:cyclop,goconst
func (s *subject) UnmarshalJSON(data []byte) error {
	nQuote := 2
	nParts := 4
	nSep := nParts - 1
	lenGln := 13
	lenOrg := 9
	minLen := nQuote + nSep + len("entity") + len("org") + lenOrg

	if len(data) < minLen {
		return fmt.Errorf("%w: too short", errInvalidSubject)
	}

	// Remove quotes
	data = data[1 : len(data)-1]

	parts := strings.Split(string(data), `:`)
	if len(parts) != nParts {
		return fmt.Errorf("%w: incorrect number of parts", errInvalidSubject)
	}

	prefix, subjectType, identifierType, identifier := parts[0], parts[1], parts[2], parts[3]

	if prefix != "no" {
		return fmt.Errorf("%w: incorrect subject prefix", errInvalidSubject)
	}

	if subjectType != "entity" && subjectType != "party" {
		return fmt.Errorf("%w: incorrect subject type", errInvalidSubject)
	}

	if subjectType == "entity" && identifierType != "uuid" {
		return fmt.Errorf("%w: invalid entity identifier type", errInvalidSubject)
	}

	if subjectType == "party" && identifierType != "gln" && identifierType != "uuid" {
		return fmt.Errorf("%w: invalid party identifier type", errInvalidSubject)
	}

	if identifierType == "uuid" { //nolint:nestif
		if err := uuid.Validate(identifier); err != nil {
			return fmt.Errorf("%w: invalid uuid identifier", errInvalidSubject)
		}
	} else { // Not a UUID. All others are integer-looking.
		if _, err := strconv.Atoi(identifier); err != nil {
			return fmt.Errorf("%w: invalid numeric identifier", errInvalidSubject)
		}

		if identifierType == "org" && len(identifier) != lenOrg {
			return fmt.Errorf("%w: invalid org identifier", errInvalidSubject)
		}

		if identifierType == "gln" && len(identifier) != lenGln {
			return fmt.Errorf("%w: invalid gln identifier", errInvalidSubject)
		}
	}

	s.Type = subjectType
	s.IdentifierType = identifierType
	s.Identifier = identifier
	return nil
}

// authorizationGrant is the struct that holds the payload of the authorization grant token.
// This is an implementation of https://datatracker.ietf.org/doc/html/rfc7523#section-4.
// Claims follow the standard in https://datatracker.ietf.org/doc/html/rfc7519#section-4.
// The structure of the token is inspired by maskinporten grant tokens
// https://docs.digdir.no/docs/Maskinporten/maskinporten_protocol_jwtgrant.
type authorizationGrant struct {
	// Audience is the intended audience of the token.
	// For the Flex API, this is the domain of the API.
	// Example: "https://flex-test.elhub.no"
	Audience string `json:"aud"`

	// Issuer is the subject identifier of the entity that issued and signed the authorization grant
	// token. We identify it by the UUID of the client used to sign the token.
	// no:entity:uuid:b31b0459-e1c7-4157-b9f6-e1994b574385
	Issuer subject `json:"iss"`

	// IssuedAt is the time at which the token was issued.
	IssuedAt unixTime `json:"iat"`

	// ExpirationTime is the time at which the token expires.
	// Maximum lifetime of the token must be less than 120 seconds.
	ExpirationTime unixTime `json:"exp"`

	// JWTID is a unique identifier for the token.
	// The identifier must be unique within the issuer domain.
	// For (future) protection against replay attacks.
	JWTID string `json:"jti"`

	// Subject is the party on behalf of whom the new token is being requested.
	// no:party:gln:1234567890123
	// no:party:uuid:123e4567-e89b-12d3-a456-426614174000
	// If omitted or empty, returned access token will be for the issuer entity.
	Subject *subject `json:"sub,omitempty"`
}

// Validate checks that the authorization grant token has all the required fields set in the correct ways.
func (a authorizationGrant) Validate() error {
	val := validate.New()
	val.Check(a.Audience != "", "aud is empty")
	val.Check(a.Issuer.Type == "entity", "iss must be an entity")
	val.Check(math.Abs(time.Until(a.IssuedAt.Time).Seconds()) < 10, "iss must be within 10 seconds of server time") //nolint:mnd
	val.Check(a.ExpirationTime.Sub(a.IssuedAt.Time).Seconds() <= 120, "maximum lifetime is 120 seconds")            //nolint:mnd
	val.Check(a.ExpirationTime.After(a.IssuedAt.Time), "iss must be before exp")
	val.Check(a.JWTID != "", "jti is empty")
	val.Check(a.Subject == nil || a.Subject.Type == "party", "sub must be a party")
	return val.Error()
}
