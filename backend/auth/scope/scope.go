package scope

import (
	"cmp"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strings"
)

// Package scope defines the authentication scopes used in the Flex Information System.

// Static errors for the scope package.
var (
	ErrScopeNoAssetParts     = errors.New("scope must have at least one asset part")
	ErrScopeInvalidAssetPart = errors.New("scope asset must contain at least one character and only lowercase letters, numbers and underscores")
	ErrScopeInvalidFormat    = errors.New("scope string must at least have two parts")
	ErrScopeInvalidVerb      = errors.New("invalid verb in scope")
)

// Scope represents a access scope.
type Scope struct {
	// Verb is the privilege or access level.
	Verb Verb
	// Asset is the list of assets or paths that this scope applies to.
	// The assets are hierarchical and can be nested.
	Asset string
}

// assetPartPattern is a regex pattern to validate asset parts.
var assetPartPattern = regexp.MustCompile("^[a-zA-Z0-9_]+$")

// New creates a new Scope with the given verb and assets.
// Returns an error if no parts are provided or if any part is empty.
func New(verb Verb, parts ...string) (Scope, error) {
	if len(parts) == 0 {
		return Scope{}, ErrScopeNoAssetParts
	}

	for _, part := range parts {
		if part == "" {
			return Scope{}, ErrScopeInvalidAssetPart
		}

		if ok := assetPartPattern.MatchString(part); !ok {
			return Scope{}, ErrScopeInvalidAssetPart
		}
	}

	return Scope{
		Verb:  verb,
		Asset: strings.Join(parts, ":"),
	}, nil
}

// String returns a string representation of the scope.
// The format is "<verb>:<asset1>:<asset2>:...".
func (s Scope) String() string {
	return s.Verb.String() + ":" + s.Asset
}

// FromString parses a scope string into a Scope object.
// The string should be in the format "<verb>:<asset1>:<asset2>:...".
func FromString(scopeStr string) (Scope, error) {
	parts := strings.Split(scopeStr, ":")
	if len(parts) < 2 { //nolint:mnd
		return Scope{}, ErrScopeInvalidFormat
	}

	verb, err := VerbString(parts[0])
	if err != nil {
		return Scope{}, fmt.Errorf("%w: %s", ErrScopeInvalidVerb, parts[0])
	}

	for _, part := range parts[1:] {
		if part == "" {
			return Scope{}, ErrScopeInvalidAssetPart
		}

		if ok := assetPartPattern.MatchString(part); !ok {
			return Scope{}, ErrScopeInvalidAssetPart
		}
	}

	return Scope{
		Verb:  verb,
		Asset: strings.Join(parts[1:], ":"),
	}, nil
}

// Covers checks if the current scope covers the given scope.
// A scope covers another if the verb is equal or more permissive
// and the assets are a subset of the current scope's assets.
// Asset matching is done on complete parts separated by colons.
func (s Scope) Covers(other Scope) bool {
	if !s.Verb.Covers(other.Verb) {
		return false
	}

	// For hierarchical matching, the other asset must start with this asset
	// followed by either end of string or a colon (to ensure whole part matching)
	return other.Asset == s.Asset || strings.HasPrefix(other.Asset, s.Asset+":")
}

// MarshalJSON converts a Scope into its JSON string representation.
func (s Scope) MarshalJSON() ([]byte, error) {
	return json.Marshal(s.String())
}

// UnmarshalJSON parses a JSON string into a Scope.
func (s *Scope) UnmarshalJSON(data []byte) error {
	var str string
	if err := json.Unmarshal(data, &str); err != nil {
		return err
	}

	parsedScope, err := FromString(str)
	if err != nil {
		return err
	}

	*s = parsedScope

	return nil
}

// Intersection reports if scopes a and b intersect and returns the intersection if they do.
// An intersection is the part of the asset that is common to both scopes, with the less permissive verb.
//
//nolint:varnamelen,exhaustruct
func Intersection(a, b Scope) (bool, Scope) {
	if a.Asset == b.Asset {
		return true, Scope{Verb: min(a.Verb, b.Verb), Asset: a.Asset}
	}

	if strings.HasPrefix(a.Asset, b.Asset+":") {
		return true, Scope{Verb: min(a.Verb, b.Verb), Asset: a.Asset}
	}

	if strings.HasPrefix(b.Asset, a.Asset+":") {
		return true, Scope{Verb: min(a.Verb, b.Verb), Asset: b.Asset}
	}

	return false, Scope{}
}

// Equal reports if scopes a and b are Equal.
// Useful e.g. for use with slices.CompactFunc.
func Equal(a, b Scope) bool {
	return a.Verb == b.Verb && a.Asset == b.Asset
}

// Compare is a comparison function used to Compare two scopes.
// The result is -1 when a < b, +1 when a > b and 0 when a == b
// or a and b are incomparable in the sense of a strict weak ordering
//
// The sort order is set asset part first, then the verb.
//
// Useful e.g. for use with slices.SortFunc.
func Compare(a, b Scope) int {
	if a.Asset == b.Asset {
		return cmp.Compare(int(a.Verb), int(b.Verb))
	}
	return cmp.Compare(a.Asset, b.Asset)
}
