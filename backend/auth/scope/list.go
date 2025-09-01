package scope

import (
	"encoding/json"
	"strings"
)

// List represents a list of Scope objects.
// We need it mostly because we want to marshal and umarshal a list of scopes
// from JSON.
type List []Scope

// String returns a string representation of the list of scopes.
// Each scope is represented as a string, and they are joined by a space.
func (l List) String() string {
	parts := make([]string, len(l))
	for i, scope := range l {
		parts[i] = scope.String()
	}

	return strings.Join(parts, " ")
}

// Covers checks if any scopes in the list cover another scope.
func (l List) Covers(other Scope) bool {
	if l == nil {
		return false
	}

	for _, s := range l {
		if s.Covers(other) {
			return true
		}
	}

	return false
}

// MarshalJSON converts a List of Scope into its JSON string representation.
func (l List) MarshalJSON() ([]byte, error) {
	return json.Marshal(l.String())
}

// UnmarshalJSON parses a JSON string into a List of Scope.
func (l *List) UnmarshalJSON(data []byte) error {
	var scopeStr string

	err := json.Unmarshal(data, &scopeStr)
	if err != nil {
		return err
	}

	// Split the string into individual scopes.
	scopeParts := strings.Split(scopeStr, " ")
	scopes := make(List, len(scopeParts))

	for idx, part := range scopeParts {
		scope, err := FromString(part)
		if err != nil {
			return err
		}

		scopes[idx] = scope
	}

	*l = scopes

	return nil
}

// ListFromStrings creates a List from a slice of scope strings.
// Each string should be in the format "verb:asset1:asset2:...".
func ListFromStrings(scopes []string) (List, error) {
	list := make(List, len(scopes))
	for idx, scopeStr := range scopes {
		scope, err := FromString(scopeStr)
		if err != nil {
			return nil, err
		}

		list[idx] = scope
	}

	return list, nil
}
