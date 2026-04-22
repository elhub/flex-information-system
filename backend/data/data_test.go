package data //nolint:testpackage

import (
	"net/url"
	"testing"
)

//nolint:funlen
func TestValidAtQueryRewrite(t *testing.T) {
	t.Parallel()

	testCases := []struct {
		name     string
		input    url.Values
		expected url.Values
	}{
		{
			name:     "no valid_at parameter",
			input:    url.Values{"status": {"eq.active"}},
			expected: url.Values{"status": {"eq.active"}},
		},
		{
			name:  "valid_at with date rewrites to valid_from and or",
			input: url.Values{"valid_at": {"2024-01-15"}},
			expected: url.Values{
				"valid_from": {"lte.2024-01-15"},
				"or":         {"(valid_to.gt.2024-01-15,valid_to.is.null)"},
			},
		},
		{
			name:     "valid_at with empty value clears existing valid_from and or",
			input:    url.Values{"valid_at": {""}, "valid_from": {"lte.2023-01-01"}, "or": {"(valid_to.gt.2023-01-01,valid_to.is.null)"}},
			expected: url.Values{"valid_at": {""}},
		},
		{
			name:  "prefixed valid_at rewrites prefixed keys",
			input: url.Values{"some_table.valid_at": {"2024-06-01"}},
			expected: url.Values{
				"some_table.valid_from": {"lte.2024-06-01"},
				"some_table.or":         {"(valid_to.gt.2024-06-01,valid_to.is.null)"},
			},
		},
		{
			name: "valid_at replaces pre-existing valid_from and or",
			input: url.Values{
				"valid_at":   {"2024-03-10"},
				"valid_from": {"lte.2020-01-01"},
				"or":         {"(valid_to.gt.2020-01-01,valid_to.is.null)"},
			},
			expected: url.Values{
				"valid_from": {"lte.2024-03-10"},
				"or":         {"(valid_to.gt.2024-03-10,valid_to.is.null)"},
			},
		},
		{
			name:  "unrelated parameters are preserved alongside valid_at rewrite",
			input: url.Values{"valid_at": {"2024-01-15"}, "status": {"eq.active"}},
			expected: url.Values{
				"valid_from": {"lte.2024-01-15"},
				"or":         {"(valid_to.gt.2024-01-15,valid_to.is.null)"},
				"status":     {"eq.active"},
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			validAtQueryRewrite(tc.input)
			if len(tc.input) != len(tc.expected) {
				t.Errorf("got %v keys, expected %v keys; got=%v expected=%v",
					len(tc.input), len(tc.expected), tc.input, tc.expected)
				return
			}
			for key, expectedValues := range tc.expected {
				actualValues, ok := tc.input[key]
				if !ok {
					t.Errorf("key %q missing from result; got=%v", key, tc.input)
					continue
				}
				if len(actualValues) != len(expectedValues) {
					t.Errorf("key %q: got %v values, expected %v; got=%v expected=%v",
						key, actualValues, expectedValues, tc.input, tc.expected)
					continue
				}
				for i, v := range expectedValues {
					if actualValues[i] != v {
						t.Errorf("key %q[%d]: got %q, expected %q", key, i, actualValues[i], v)
					}
				}
			}
		})
	}
}
