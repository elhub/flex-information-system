package scope_test

import (
	"encoding/json"
	"flex/auth/scope"
	"testing"
)

func TestNewScope(t *testing.T) {
	t.Parallel()
	t.Run("valid scopes", func(t *testing.T) {
		t.Parallel()
		testValidNewScope(t)
	})

	t.Run("invalid scopes", func(t *testing.T) {
		t.Parallel()
		testInvalidNewScope(t)
	})
}

//nolint:funlen
func testValidNewScope(t *testing.T) {
	t.Helper()

	tests := []struct {
		name     string
		verb     scope.Verb
		parts    []string
		expected scope.Scope
	}{
		{
			name:  "Single asset part",
			verb:  scope.Read,
			parts: []string{"users"},
			expected: scope.Scope{
				Verb:  scope.Read,
				Asset: "users",
			},
		},
		{
			name:  "Multiple asset parts",
			verb:  scope.Manage,
			parts: []string{"users", "profile", "email"},
			expected: scope.Scope{
				Verb:  scope.Manage,
				Asset: "users:profile:email",
			},
		},
		{
			name:  "Asset part with numbers",
			verb:  scope.Read,
			parts: []string{"api", "v1", "users123"},
			expected: scope.Scope{
				Verb:  scope.Read,
				Asset: "api:v1:users123",
			},
		},
		{
			name:  "Asset part with underscores",
			verb:  scope.Use,
			parts: []string{"user_profile", "email_address"},
			expected: scope.Scope{
				Verb:  scope.Use,
				Asset: "user_profile:email_address",
			},
		},
		{
			name:  "Asset part starting with number",
			verb:  scope.Manage,
			parts: []string{"123users", "456groups"},
			expected: scope.Scope{
				Verb:  scope.Manage,
				Asset: "123users:456groups",
			},
		},
		{
			name:  "Asset part with mixed alphanumeric and underscores",
			verb:  scope.Read,
			parts: []string{"api_v1_2023", "user123_profile"},
			expected: scope.Scope{
				Verb:  scope.Read,
				Asset: "api_v1_2023:user123_profile",
			},
		},
		{
			name:  "Asset part with only numbers",
			verb:  scope.Use,
			parts: []string{"123", "456"},
			expected: scope.Scope{
				Verb:  scope.Use,
				Asset: "123:456",
			},
		},
		{
			name:  "Asset part with only underscores",
			verb:  scope.Manage,
			parts: []string{"_", "___"},
			expected: scope.Scope{
				Verb:  scope.Manage,
				Asset: "_:___",
			},
		},
		{
			name:  "Asset part with leading underscore",
			verb:  scope.Read,
			parts: []string{"_users", "_profile"},
			expected: scope.Scope{
				Verb:  scope.Read,
				Asset: "_users:_profile",
			},
		},
		{
			name:  "Asset part with trailing underscore",
			verb:  scope.Use,
			parts: []string{"users_", "profile_"},
			expected: scope.Scope{
				Verb:  scope.Use,
				Asset: "users_:profile_",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result, err := scope.New(tt.verb, tt.parts...)
			if err != nil {
				t.Errorf("NewScope() unexpected error: %v", err)
				return
			}

			if result.Verb != tt.expected.Verb {
				t.Errorf("NewScope() verb = %v, want %v", result.Verb, tt.expected.Verb)
			}

			if result.Asset != tt.expected.Asset {
				t.Errorf("NewScope() asset = %v, want %v", result.Asset, tt.expected.Asset)
			}
		})
	}
}

//nolint:funlen
func testInvalidNewScope(t *testing.T) {
	t.Helper()

	tests := []struct {
		name  string
		verb  scope.Verb
		parts []string
	}{
		{
			name:  "No asset parts",
			verb:  scope.Use,
			parts: []string{},
		},
		{
			name:  "Single empty part",
			verb:  scope.Read,
			parts: []string{""},
		},
		{
			name:  "Multiple parts with one empty",
			verb:  scope.Manage,
			parts: []string{"users", "", "profile"},
		},
		{
			name:  "Asset part with hyphen",
			verb:  scope.Read,
			parts: []string{"user-profile"},
		},
		{
			name:  "Asset part with space",
			verb:  scope.Read,
			parts: []string{"user profile"},
		},
		{
			name:  "Asset part with colon",
			verb:  scope.Read,
			parts: []string{"user:profile"},
		},
		{
			name:  "Asset part with dot",
			verb:  scope.Read,
			parts: []string{"user.profile"},
		},
		{
			name:  "Asset part with special characters",
			verb:  scope.Read,
			parts: []string{"user@domain.com"},
		},
		{
			name:  "Asset part with slash",
			verb:  scope.Read,
			parts: []string{"api/v1"},
		},
		{
			name:  "Multiple parts with one invalid",
			verb:  scope.Manage,
			parts: []string{"users", "user-profile", "email"},
		},
		{
			name:  "Asset part with unicode characters",
			verb:  scope.Read,
			parts: []string{"usërs"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			_, err := scope.New(tt.verb, tt.parts...)
			if err == nil {
				t.Errorf("NewScope() expected error but got none")
			}
		})
	}
}

func TestScopeToString(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		scope    scope.Scope
		expected string
	}{
		{
			name:     "Read scope with single asset",
			scope:    scope.Scope{Verb: scope.Read, Asset: "users"},
			expected: "read:users",
		},
		{
			name:     "Manage scope with nested assets",
			scope:    scope.Scope{Verb: scope.Manage, Asset: "users:profile:email"},
			expected: "manage:users:profile:email",
		},
		{
			name:     "Read scope with complex asset path",
			scope:    scope.Scope{Verb: scope.Read, Asset: "api:v1:resources:data"},
			expected: "read:api:v1:resources:data",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := tt.scope.String()
			if result != tt.expected {
				t.Errorf("scope.Scope.String() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestParseScope(t *testing.T) {
	t.Parallel()
	t.Run("valid scopes", func(t *testing.T) {
		t.Parallel()
		testValidParseScope(t)
	})

	t.Run("invalid scopes", func(t *testing.T) {
		t.Parallel()
		testInvalidParseScope(t)
	})
}

func testValidParseScope(t *testing.T) {
	t.Helper()

	tests := []struct {
		name     string
		scopeStr string
		expected scope.Scope
	}{
		{
			name:     "Valid scope with single asset",
			scopeStr: "read:users",
			expected: scope.Scope{
				Verb:  scope.Read,
				Asset: "users",
			},
		},
		{
			name:     "Valid scope with multiple assets",
			scopeStr: "manage:users:profile:email",
			expected: scope.Scope{
				Verb:  scope.Manage,
				Asset: "users:profile:email",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result, err := scope.FromString(tt.scopeStr)
			if err != nil {
				t.Errorf("scope.FromString() unexpected error: %v", err)
				return
			}

			if result.Verb != tt.expected.Verb {
				t.Errorf("scope.FromString() verb = %v, want %v", result.Verb, tt.expected.Verb)
			}

			if result.Asset != tt.expected.Asset {
				t.Errorf("scope.FromString() asset = %v, want %v", result.Asset, tt.expected.Asset)
			}
		})
	}
}

func testInvalidParseScope(t *testing.T) {
	t.Helper()

	tests := []struct {
		name     string
		scopeStr string
	}{
		{
			name:     "Invalid scope - only one part",
			scopeStr: "read",
		},
		{
			name:     "Invalid scope - empty string",
			scopeStr: "",
		},
		{
			name:     "Invalid scope - invalid verb",
			scopeStr: "invalid:users",
		},
		{
			name:     "Invalid scope - only colon",
			scopeStr: ":",
		},
		{
			name:     "Invalid scope - no assets",
			scopeStr: "use:",
		},
		{
			name:     "Invalid scope - empty asset between colons",
			scopeStr: "read:users::profile",
		},
		{
			name:     "Invalid scope - asset with hyphen",
			scopeStr: "read:user-profile",
		},
		{
			name:     "Invalid scope - asset with dot",
			scopeStr: "read:api.v1",
		},
		{
			name:     "Invalid scope - asset with space",
			scopeStr: "read:user profile",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			_, err := scope.FromString(tt.scopeStr)
			if err == nil {
				t.Errorf("scope.ScopeString() expected error but got none")
			}
		})
	}
}

//nolint:funlen
func TestScopeCovers(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		scope    scope.Scope
		other    scope.Scope
		expected bool
	}{
		{
			name:     "Identical scopes",
			scope:    scope.Scope{Verb: scope.Read, Asset: "users"},
			other:    scope.Scope{Verb: scope.Read, Asset: "users"},
			expected: true,
		},
		{
			name:     "Higher privilege covers lower",
			scope:    scope.Scope{Verb: scope.Manage, Asset: "users"},
			other:    scope.Scope{Verb: scope.Read, Asset: "users"},
			expected: true,
		},
		{
			name:     "Lower privilege does not cover higher",
			scope:    scope.Scope{Verb: scope.Read, Asset: "users"},
			other:    scope.Scope{Verb: scope.Manage, Asset: "users"},
			expected: false,
		},
		{
			name:     "Parent asset covers child asset",
			scope:    scope.Scope{Verb: scope.Read, Asset: "users"},
			other:    scope.Scope{Verb: scope.Read, Asset: "users:profile"},
			expected: true,
		},
		{
			name:     "Child asset does not cover parent",
			scope:    scope.Scope{Verb: scope.Read, Asset: "users:profile"},
			other:    scope.Scope{Verb: scope.Read, Asset: "users"},
			expected: false,
		},
		{
			name:     "Different asset paths",
			scope:    scope.Scope{Verb: scope.Read, Asset: "users"},
			other:    scope.Scope{Verb: scope.Read, Asset: "groups"},
			expected: false,
		},
		{
			name:     "Complex nested coverage",
			scope:    scope.Scope{Verb: scope.Manage, Asset: "api:v1"},
			other:    scope.Scope{Verb: scope.Use, Asset: "api:v1:users"},
			expected: true,
		},
		{
			name:     "Partial asset match fails",
			scope:    scope.Scope{Verb: scope.Read, Asset: "user"},
			other:    scope.Scope{Verb: scope.Read, Asset: "users"},
			expected: false,
		},
		{
			name:     "Exact asset match succeeds",
			scope:    scope.Scope{Verb: scope.Read, Asset: "users"},
			other:    scope.Scope{Verb: scope.Read, Asset: "users"},
			expected: true,
		},
		{
			name:     "Hierarchical match with complete parts succeeds",
			scope:    scope.Scope{Verb: scope.Read, Asset: "users"},
			other:    scope.Scope{Verb: scope.Read, Asset: "users:profile"},
			expected: true,
		},
		{
			name:     "Non-prefix asset match fails",
			scope:    scope.Scope{Verb: scope.Read, Asset: "users"},
			other:    scope.Scope{Verb: scope.Read, Asset: "user"},
			expected: false,
		},
		{
			name:     "Same verb, different unrelated assets",
			scope:    scope.Scope{Verb: scope.Use, Asset: "admin"},
			other:    scope.Scope{Verb: scope.Use, Asset: "users"},
			expected: false,
		},
		{
			name:     "Asset with colon separator prevents partial match",
			scope:    scope.Scope{Verb: scope.Read, Asset: "user"},
			other:    scope.Scope{Verb: scope.Read, Asset: "user_profile"},
			expected: false,
		},
		{
			name:     "Multi-level hierarchy match",
			scope:    scope.Scope{Verb: scope.Manage, Asset: "api"},
			other:    scope.Scope{Verb: scope.Use, Asset: "api:v1:users:profile"},
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := tt.scope.Covers(tt.other)
			if result != tt.expected {
				t.Errorf("scope.Scope.Covers() = %v, want %v\nScope: %s\nOther: %s",
					result, tt.expected, tt.scope.String(), tt.other.String())
			}
		})
	}
}

func TestScopeMarshalJSON(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		scope    scope.Scope
		expected string
	}{
		{
			name:     "Simple scope",
			scope:    scope.Scope{Verb: scope.Read, Asset: "users"},
			expected: `"read:users"`,
		},
		{
			name:     "Complex scope",
			scope:    scope.Scope{Verb: scope.Manage, Asset: "api:v1:resources"},
			expected: `"manage:api:v1:resources"`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result, err := tt.scope.MarshalJSON()
			if err != nil {
				t.Errorf("scope.Scope.MarshalJSON() unexpected error: %v", err)
				return
			}

			if string(result) != tt.expected {
				t.Errorf("scope.Scope.MarshalJSON() = %v, want %v", string(result), tt.expected)
			}
		})
	}
}

func TestScopeUnmarshalJSON(t *testing.T) {
	t.Parallel()
	t.Run("valid JSON", func(t *testing.T) {
		t.Parallel()
		testValidUnmarshalJSON(t)
	})

	t.Run("invalid JSON", func(t *testing.T) {
		t.Parallel()
		testInvalidUnmarshalJSON(t)
	})
}

func testValidUnmarshalJSON(t *testing.T) {
	t.Helper()

	tests := []struct {
		name     string
		jsonData string
		expected scope.Scope
	}{
		{
			name:     "Valid JSON scope",
			jsonData: `"read:users"`,
			expected: scope.Scope{Verb: scope.Read, Asset: "users"},
		},
		{
			name:     "Valid JSON complex scope",
			jsonData: `"manage:api:v1:resources"`,
			expected: scope.Scope{Verb: scope.Manage, Asset: "api:v1:resources"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			var scope scope.Scope

			err := scope.UnmarshalJSON([]byte(tt.jsonData))
			if err != nil {
				t.Errorf("scope.Scope.UnmarshalJSON() unexpected error: %v", err)
				return
			}

			if scope.Verb != tt.expected.Verb {
				t.Errorf("scope.Scope.UnmarshalJSON() verb = %v, want %v", scope.Verb, tt.expected.Verb)
			}

			if scope.Asset != tt.expected.Asset {
				t.Errorf("scope.Scope.UnmarshalJSON() asset = %v, want %v", scope.Asset, tt.expected.Asset)
			}
		})
	}
}

func testInvalidUnmarshalJSON(t *testing.T) {
	t.Helper()

	tests := []struct {
		name     string
		jsonData string
	}{
		{
			name:     "Invalid JSON - not a string",
			jsonData: `123`,
		},
		{
			name:     "Invalid JSON - malformed",
			jsonData: `"read:users`,
		},
		{
			name:     "Invalid scope string in JSON",
			jsonData: `"invalid"`,
		},
		{
			name:     "Invalid verb in JSON scope",
			jsonData: `"badverb:users"`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			var scope scope.Scope

			err := scope.UnmarshalJSON([]byte(tt.jsonData))
			if err == nil {
				t.Errorf("scope.Scope.UnmarshalJSON() expected error but got none")
			}
		})
	}
}

func TestScopeJSONRoundTrip(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		scope scope.Scope
	}{
		{
			name:  "Simple scope roundtrip",
			scope: scope.Scope{Verb: scope.Read, Asset: "users"},
		},
		{
			name:  "Complex scope roundtrip",
			scope: scope.Scope{Verb: scope.Manage, Asset: "api:v1:resources:data"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			// Marshal to JSON
			jsonData, err := json.Marshal(tt.scope)
			if err != nil {
				t.Errorf("json.Marshal() unexpected error: %v", err)
				return
			}

			// Unmarshal back to scope.Scope
			var unmarshaled scope.Scope

			err = json.Unmarshal(jsonData, &unmarshaled)
			if err != nil {
				t.Errorf("json.Unmarshal() unexpected error: %v", err)
				return
			}

			// Compare original and unmarshaled
			if unmarshaled.Verb != tt.scope.Verb {
				t.Errorf("Roundtrip failed: verb = %v, want %v", unmarshaled.Verb, tt.scope.Verb)
			}

			if unmarshaled.Asset != tt.scope.Asset {
				t.Errorf("Roundtrip failed: asset = %v, want %v", unmarshaled.Asset, tt.scope.Asset)
			}
		})
	}
}
