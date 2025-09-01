package scope_test

import (
	"encoding/json"
	"flex/auth/scope"
	"testing"
)

func TestListString(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		list     scope.List
		expected string
	}{
		{
			name:     "Empty list",
			list:     scope.List{},
			expected: "",
		},
		{
			name: "Single scope",
			list: scope.List{
				{Verb: scope.Read, Asset: "users"},
			},
			expected: "read:users",
		},
		{
			name: "Multiple scopes",
			list: scope.List{
				{Verb: scope.Read, Asset: "users"},
				{Verb: scope.Manage, Asset: "groups"},
				{Verb: scope.Use, Asset: "api:v1"},
			},
			expected: "read:users manage:groups use:api:v1",
		},
		{
			name: "Complex nested scopes",
			list: scope.List{
				{Verb: scope.Read, Asset: "users:profile"},
				{Verb: scope.Manage, Asset: "api:v1:resources"},
			},
			expected: "read:users:profile manage:api:v1:resources",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := tt.list.String()
			if result != tt.expected {
				t.Errorf("List.String() = %q, want %q", result, tt.expected)
			}
		})
	}
}

//nolint:funlen
func TestListCovers(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		list     scope.List
		other    scope.Scope
		expected bool
	}{
		{
			name:     "Empty list covers nothing",
			list:     scope.List{},
			other:    scope.Scope{Verb: scope.Read, Asset: "users"},
			expected: false,
		},
		{
			name: "Single matching scope",
			list: scope.List{
				{Verb: scope.Read, Asset: "users"},
			},
			other:    scope.Scope{Verb: scope.Read, Asset: "users"},
			expected: true,
		},
		{
			name: "Single non-matching scope",
			list: scope.List{
				{Verb: scope.Read, Asset: "users"},
			},
			other:    scope.Scope{Verb: scope.Read, Asset: "groups"},
			expected: false,
		},
		{
			name: "Higher privilege covers lower",
			list: scope.List{
				{Verb: scope.Manage, Asset: "users"},
			},
			other:    scope.Scope{Verb: scope.Read, Asset: "users"},
			expected: true,
		},
		{
			name: "Lower privilege does not cover higher",
			list: scope.List{
				{Verb: scope.Read, Asset: "users"},
			},
			other:    scope.Scope{Verb: scope.Manage, Asset: "users"},
			expected: false,
		},
		{
			name: "Parent asset covers child",
			list: scope.List{
				{Verb: scope.Read, Asset: "users"},
			},
			other:    scope.Scope{Verb: scope.Read, Asset: "users:profile"},
			expected: true,
		},
		{
			name: "Child asset does not cover parent",
			list: scope.List{
				{Verb: scope.Read, Asset: "users:profile"},
			},
			other:    scope.Scope{Verb: scope.Read, Asset: "users"},
			expected: false,
		},
		{
			name: "Multiple scopes - first matches",
			list: scope.List{
				{Verb: scope.Read, Asset: "users"},
				{Verb: scope.Read, Asset: "groups"},
			},
			other:    scope.Scope{Verb: scope.Read, Asset: "users"},
			expected: true,
		},
		{
			name: "Multiple scopes - second matches",
			list: scope.List{
				{Verb: scope.Read, Asset: "users"},
				{Verb: scope.Read, Asset: "groups"},
			},
			other:    scope.Scope{Verb: scope.Read, Asset: "groups"},
			expected: true,
		},
		{
			name: "Multiple scopes - none match",
			list: scope.List{
				{Verb: scope.Read, Asset: "users"},
				{Verb: scope.Read, Asset: "groups"},
			},
			other:    scope.Scope{Verb: scope.Read, Asset: "admin"},
			expected: false,
		},
		{
			name: "Multiple scopes - hierarchical match",
			list: scope.List{
				{Verb: scope.Read, Asset: "users"},
				{Verb: scope.Manage, Asset: "api"},
			},
			other:    scope.Scope{Verb: scope.Use, Asset: "api:v1:resources"},
			expected: true,
		},
		{
			name: "Complex list with various privileges",
			list: scope.List{
				{Verb: scope.Read, Asset: "users:profile"},
				{Verb: scope.Use, Asset: "groups"},
				{Verb: scope.Manage, Asset: "admin"},
			},
			other:    scope.Scope{Verb: scope.Read, Asset: "admin:settings"},
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := tt.list.Covers(tt.other)
			if result != tt.expected {
				t.Errorf("List.Covers() = %v, want %v\nList: %s\nOther: %s",
					result, tt.expected, tt.list.String(), tt.other.String())
			}
		})
	}
}

func TestListMarshalJSON(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		list     scope.List
		expected string
	}{
		{
			name:     "Empty list",
			list:     scope.List{},
			expected: `""`,
		},
		{
			name: "Single scope",
			list: scope.List{
				{Verb: scope.Read, Asset: "users"},
			},
			expected: `"read:users"`,
		},
		{
			name: "Multiple scopes",
			list: scope.List{
				{Verb: scope.Read, Asset: "users"},
				{Verb: scope.Manage, Asset: "groups"},
			},
			expected: `"read:users manage:groups"`,
		},
		{
			name: "Complex nested scopes",
			list: scope.List{
				{Verb: scope.Read, Asset: "users:profile"},
				{Verb: scope.Manage, Asset: "api:v1:resources"},
				{Verb: scope.Use, Asset: "admin:settings"},
			},
			expected: `"read:users:profile manage:api:v1:resources use:admin:settings"`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result, err := tt.list.MarshalJSON()
			if err != nil {
				t.Errorf("List.MarshalJSON() unexpected error: %v", err)
				return
			}

			if string(result) != tt.expected {
				t.Errorf("List.MarshalJSON() = %q, want %q", string(result), tt.expected)
			}
		})
	}
}

func TestListUnmarshalJSON(t *testing.T) {
	t.Parallel()
	t.Run("valid JSON", func(t *testing.T) {
		t.Parallel()
		testValidListUnmarshalJSON(t)
	})

	t.Run("invalid JSON", func(t *testing.T) {
		t.Parallel()
		testInvalidListUnmarshalJSON(t)
	})
}

//nolint:funlen
func testValidListUnmarshalJSON(t *testing.T) {
	t.Helper()

	tests := []struct {
		name     string
		jsonData string
		expected scope.List
	}{
		{
			name:     "Empty scope list",
			jsonData: `""`,
			expected: scope.List{
				{Verb: 0, Asset: ""}, // Empty string results in invalid scope
			},
		},
		{
			name:     "Single scope",
			jsonData: `"read:users"`,
			expected: scope.List{
				{Verb: scope.Read, Asset: "users"},
			},
		},
		{
			name:     "Multiple scopes",
			jsonData: `"read:users manage:groups"`,
			expected: scope.List{
				{Verb: scope.Read, Asset: "users"},
				{Verb: scope.Manage, Asset: "groups"},
			},
		},
		{
			name:     "Complex nested scopes",
			jsonData: `"read:users:profile manage:api:v1:resources use:admin:settings"`,
			expected: scope.List{
				{Verb: scope.Read, Asset: "users:profile"},
				{Verb: scope.Manage, Asset: "api:v1:resources"},
				{Verb: scope.Use, Asset: "admin:settings"},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			var list scope.List

			err := list.UnmarshalJSON([]byte(tt.jsonData))

			// Special case for empty string - it should fail
			if tt.name == "Empty scope list" {
				if err == nil {
					t.Errorf("List.UnmarshalJSON() expected error for empty string but got none")
				}

				return
			}

			if err != nil {
				t.Errorf("List.UnmarshalJSON() unexpected error: %v", err)
				return
			}

			if len(list) != len(tt.expected) {
				t.Errorf("List.UnmarshalJSON() length = %d, want %d", len(list), len(tt.expected))
				return
			}

			for idx, scope := range list {
				if scope.Verb != tt.expected[idx].Verb {
					t.Errorf("List.UnmarshalJSON() scope[%d].Verb = %v, want %v", idx, scope.Verb, tt.expected[idx].Verb)
				}

				if scope.Asset != tt.expected[idx].Asset {
					t.Errorf("List.UnmarshalJSON() scope[%d].Asset = %q, want %q", idx, scope.Asset, tt.expected[idx].Asset)
				}
			}
		})
	}
}

func testInvalidListUnmarshalJSON(t *testing.T) {
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
			name:     "Invalid JSON - array",
			jsonData: `["read:users", "manage:groups"]`,
		},
		{
			name:     "Invalid JSON - malformed",
			jsonData: `"read:users`,
		},
		{
			name:     "Invalid scope string",
			jsonData: `"invalid"`,
		},
		{
			name:     "Invalid verb in scope",
			jsonData: `"badverb:users"`,
		},
		{
			name:     "Mixed valid and invalid scopes",
			jsonData: `"read:users invalid manage:groups"`,
		},
		{
			name:     "Empty string scope (invalid)",
			jsonData: `""`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			var list scope.List

			err := list.UnmarshalJSON([]byte(tt.jsonData))
			if err == nil {
				t.Errorf("List.UnmarshalJSON() expected error but got none for input: %s", tt.jsonData)
			}
		})
	}
}

//nolint:funlen
func TestListJSONRoundTrip(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		list scope.List
	}{
		{
			name: "Single scope roundtrip",
			list: scope.List{
				{Verb: scope.Read, Asset: "users"},
			},
		},
		{
			name: "Multiple scopes roundtrip",
			list: scope.List{
				{Verb: scope.Read, Asset: "users"},
				{Verb: scope.Manage, Asset: "groups"},
				{Verb: scope.Use, Asset: "api:v1"},
			},
		},
		{
			name: "Complex nested scopes roundtrip",
			list: scope.List{
				{Verb: scope.Read, Asset: "users:profile:email"},
				{Verb: scope.Manage, Asset: "api:v1:resources:data"},
				{Verb: scope.Use, Asset: "admin:settings:security"},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			// Marshal to JSON
			jsonData, err := json.Marshal(tt.list)
			if err != nil {
				t.Errorf("json.Marshal() unexpected error: %v", err)
				return
			}

			// Unmarshal back to scope.List
			var unmarshaled scope.List

			err = json.Unmarshal(jsonData, &unmarshaled)
			if err != nil {
				t.Errorf("json.Unmarshal() unexpected error: %v", err)
				return
			}

			// Compare original and unmarshaled
			if len(unmarshaled) != len(tt.list) {
				t.Errorf("Roundtrip failed: length = %d, want %d", len(unmarshaled), len(tt.list))
				return
			}

			for idx, scope := range unmarshaled {
				if scope.Verb != tt.list[idx].Verb {
					t.Errorf("Roundtrip failed: scope[%d].Verb = %v, want %v", idx, scope.Verb, tt.list[idx].Verb)
				}

				if scope.Asset != tt.list[idx].Asset {
					t.Errorf("Roundtrip failed: scope[%d].Asset = %q, want %q", idx, scope.Asset, tt.list[idx].Asset)
				}
			}
		})
	}
}

func TestListNilOperations(t *testing.T) {
	t.Parallel()
	t.Run("Nil list String()", func(t *testing.T) {
		t.Parallel()

		var list scope.List

		result := list.String()
		if result != "" {
			t.Errorf("Nil List.String() = %q, want empty string", result)
		}
	})

	t.Run("Nil list Covers()", func(t *testing.T) {
		t.Parallel()

		var list scope.List

		scope := scope.Scope{Verb: scope.Read, Asset: "users"}

		result := list.Covers(scope)
		if result != false {
			t.Errorf("Nil List.Covers() = %v, want false", result)
		}
	})

	t.Run("Nil list MarshalJSON()", func(t *testing.T) {
		t.Parallel()

		var list scope.List

		result, err := list.MarshalJSON()
		if err != nil {
			t.Errorf("Nil List.MarshalJSON() unexpected error: %v", err)
			return
		}

		if string(result) != `""` {
			t.Errorf("Nil List.MarshalJSON() = %q, want empty string JSON", string(result))
		}
	})
}

//nolint:funlen
func TestListFromStrings(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		scopeStrs   []string
		expected    scope.List
		expectError bool
	}{
		{
			name:        "Empty slice",
			scopeStrs:   []string{},
			expected:    scope.List{},
			expectError: false,
		},
		{
			name:      "Single valid scope",
			scopeStrs: []string{"read:users"},
			expected: scope.List{
				{Verb: scope.Read, Asset: "users"},
			},
			expectError: false,
		},
		{
			name:      "Multiple valid scopes",
			scopeStrs: []string{"read:users", "manage:groups", "use:api:v1"},
			expected: scope.List{
				{Verb: scope.Read, Asset: "users"},
				{Verb: scope.Manage, Asset: "groups"},
				{Verb: scope.Use, Asset: "api:v1"},
			},
			expectError: false,
		},
		{
			name:        "Invalid scope string",
			scopeStrs:   []string{"invalid"},
			expected:    nil,
			expectError: true,
		},
		{
			name:        "Mixed valid and invalid scopes",
			scopeStrs:   []string{"read:users", "invalid", "manage:groups"},
			expected:    nil,
			expectError: true,
		},
		{
			name:        "Invalid verb",
			scopeStrs:   []string{"badverb:users"},
			expected:    nil,
			expectError: true,
		},
		{
			name:        "Empty asset",
			scopeStrs:   []string{"read:"},
			expected:    nil,
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result, err := scope.ListFromStrings(tt.scopeStrs)

			if tt.expectError {
				if err == nil {
					t.Errorf("FromStrings() expected error but got none")
				}

				return
			}

			if err != nil {
				t.Errorf("FromStrings() unexpected error: %v", err)
				return
			}

			if len(result) != len(tt.expected) {
				t.Errorf("FromStrings() length = %d, want %d", len(result), len(tt.expected))
				return
			}

			for idx, scope := range result {
				if scope.Verb != tt.expected[idx].Verb {
					t.Errorf("FromStrings() scope[%d].Verb = %v, want %v", idx, scope.Verb, tt.expected[idx].Verb)
				}

				if scope.Asset != tt.expected[idx].Asset {
					t.Errorf("FromStrings() scope[%d].Asset = %q, want %q", idx, scope.Asset, tt.expected[idx].Asset)
				}
			}
		})
	}
}
