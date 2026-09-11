package data //nolint:testpackage

import (
	"net/url"
	"testing"
)

const andKey = "and"

func TestIsValidDatetime(t *testing.T) {
	t.Parallel()

	testCases := []struct {
		name  string
		input string
		valid bool
	}{
		// RFC 3339: ±HH:MM offset
		{name: "HH:MM:SS with ±HH:MM offset", input: "2024-01-15T10:30:00+01:00", valid: true},
		{name: "HH:MM:SS.FFF with ±HH:MM offset", input: "2024-01-15T10:30:00.123+01:00", valid: true},
		// RFC 3339: Z (UTC)
		{name: "HH:MM:SS with Z", input: "2024-01-15T10:30:00Z", valid: true},
		{name: "HH:MM:SS.FFF with Z", input: "2024-01-15T10:30:00.123Z", valid: true},
		// Extended: space separator with IANA timezone name
		{name: "extended format with HH:MM:SS and IANA name", input: "2024-01-15 10:30:00 Europe/Oslo", valid: true},
		{name: "extended format with milliseconds and IANA name", input: "2024-01-15 10:30:00.123 Europe/Oslo", valid: true},
		// Invalid formats
		{name: "date only", input: "2024-01-15", valid: false},
		{name: "datetime without timezone", input: "2024-01-15T10:30:00", valid: false},
		{name: "arbitrary string", input: "not-a-date", valid: false},
		{name: "empty string", input: "", valid: false},
		{name: "T separator without timezone", input: "2024-01-15T10:30", valid: false},
		{name: "extended format without timezone name", input: "2024-01-15 10:30", valid: false},
		{name: "extended format with unknown timezone", input: "2024-01-15 10:30 FOOBAR", valid: false},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got := isValidDatetime(tc.input)
			if got != tc.valid {
				t.Errorf("isValidDatetime(%q) = %v, want %v", tc.input, got, tc.valid)
			}
		})
	}
}

// assertQueryValues checks that got contains exactly the key/value pairs in want.
func assertQueryValues(t *testing.T, got, want url.Values) {
	t.Helper()

	if len(got) != len(want) {
		t.Errorf("got %v keys, expected %v keys; got=%v expected=%v",
			len(got), len(want), got, want)

		return
	}

	for key, wantValues := range want {
		gotValues, ok := got[key]
		if !ok {
			t.Errorf("key %q missing from result; got=%v", key, got)
			continue
		}

		if len(gotValues) != len(wantValues) {
			t.Errorf("key %q: got %v values, expected %v; got=%v expected=%v",
				key, gotValues, wantValues, got, want)
			continue
		}

		for i, v := range wantValues {
			if gotValues[i] != v {
				t.Errorf("key %q[%d]: got %q, expected %q", key, i, gotValues[i], v)
			}
		}
	}
}

//nolint:funlen
func TestTimeRangeQueryRewrite(t *testing.T) {
	t.Parallel()

	// generic param/column names, distinct from any real resource fields, to
	// keep this test focused on the rewrite mechanism rather than valid_at/as_of semantics
	const (
		paramName, fromCol, toCol = "ts_at", "ts_from", "ts_to"
		utcTimestamp              = "2024-01-15T10:30:00Z"
	)

	testCases := []struct {
		name          string
		input         url.Values
		expected      url.Values
		expectedError bool
	}{
		{
			name:          "no " + paramName + " parameter",
			input:         url.Values{"status": {"eq.active"}},
			expected:      url.Values{"status": {"eq.active"}},
			expectedError: false,
		},
		{
			name:  paramName + " RFC 3339 with offset rewrites to a single and-filter",
			input: url.Values{paramName: {"2024-01-15T10:30:00+01:00"}},
			expected: url.Values{
				andKey: {"(" + fromCol + ".lte.2024-01-15T10:30:00+01:00,or(" + toCol + ".gt.2024-01-15T10:30:00+01:00," + toCol + ".is.null))"},
			},
			expectedError: false,
		},
		{
			name:  paramName + " RFC 3339 with milliseconds rewrites to a single and-filter",
			input: url.Values{paramName: {"2024-01-15T10:30:00.123+00:00"}},
			expected: url.Values{
				andKey: {"(" + fromCol + ".lte.2024-01-15T10:30:00.123+00:00,or(" + toCol + ".gt.2024-01-15T10:30:00.123+00:00," + toCol + ".is.null))"},
			},
			expectedError: false,
		},
		{
			name:  paramName + " extended format with UTC abbreviation rewrites to a single and-filter",
			input: url.Values{paramName: {"2024-01-15 10:30:00 UTC"}},
			expected: url.Values{
				andKey: {"(" + fromCol + ".lte.2024-01-15 10:30:00 UTC,or(" + toCol + ".gt.2024-01-15 10:30:00 UTC," + toCol + ".is.null))"},
			},
			expectedError: false,
		},
		{
			name: paramName + " with empty value leaves query unchanged",
			input: url.Values{
				paramName: {""},
				andKey:    {"(some_other_filter)"},
			},
			expected: url.Values{
				paramName: {""},
				andKey:    {"(some_other_filter)"},
			},
			expectedError: false,
		},
		{
			name:  "prefixed " + paramName + " rewrites prefixed keys",
			input: url.Values{"some_table." + paramName: {"2024-06-01T12:00:00+00:00"}},
			expected: url.Values{
				"some_table.and": {"(" + fromCol + ".lte.2024-06-01T12:00:00+00:00,or(" + toCol + ".gt.2024-06-01T12:00:00+00:00," + toCol + ".is.null))"},
			},
			expectedError: false,
		},
		{
			name: paramName + " replaces pre-existing and-filter",
			input: url.Values{
				paramName: {"2024-03-10T08:00:00Z"},
				andKey:    {"(some_old_filter)"},
			},
			expected: url.Values{
				andKey: {"(" + fromCol + ".lte.2024-03-10T08:00:00Z,or(" + toCol + ".gt.2024-03-10T08:00:00Z," + toCol + ".is.null))"},
			},
			expectedError: false,
		},
		{
			name:  "unrelated parameters are preserved alongside " + paramName + " rewrite",
			input: url.Values{paramName: {utcTimestamp}, "status": {"eq.active"}},
			expected: url.Values{
				andKey:   {"(" + fromCol + ".lte." + utcTimestamp + ",or(" + toCol + ".gt." + utcTimestamp + "," + toCol + ".is.null))"},
				"status": {"eq.active"},
			},
			expectedError: false,
		},
		{
			name:          paramName + " with date-only is invalid",
			input:         url.Values{paramName: {"2024-01-15"}},
			expected:      nil,
			expectedError: true,
		},
		{
			name:          paramName + " with arbitrary string is invalid",
			input:         url.Values{paramName: {"not-a-date"}},
			expected:      nil,
			expectedError: true,
		},
		{
			name:          paramName + " with datetime but no timezone is invalid",
			input:         url.Values{paramName: {"2024-01-15T10:30:00"}},
			expected:      nil,
			expectedError: true,
		},
		{
			name:          "prefixed " + paramName + " with invalid format returns error",
			input:         url.Values{"some_table." + paramName: {"2024-06-01"}},
			expected:      nil,
			expectedError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			err := timeRangeQueryRewrite(tc.input, paramName, fromCol, toCol)
			if tc.expectedError {
				if err == nil {
					t.Errorf("expected error but got none; input=%v", tc.input)
				}

				return
			}
			if err != nil {
				t.Errorf("unexpected error: %v", err)
				return
			}
			assertQueryValues(t, tc.input, tc.expected)
		})
	}
}

// TestValidAtQueryRewrite checks that validAtQueryRewrite wires "valid_at" to the
// "valid_from"/"valid_to" columns; the rewrite mechanism itself is covered by
// TestTimeRangeQueryRewrite.
func TestValidAtQueryRewrite(t *testing.T) {
	t.Parallel()

	input := url.Values{"valid_at": {"2024-01-15T10:30:00Z"}}
	if err := validAtQueryRewrite(input); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	assertQueryValues(t, input, url.Values{
		andKey: {"(valid_from.lte.2024-01-15T10:30:00Z,or(valid_to.gt.2024-01-15T10:30:00Z,valid_to.is.null))"},
	})
}

// TestAsOfQueryRewrite checks that asOfQueryRewrite wires "as_of" to the
// "recorded_at"/"replaced_at" columns; the rewrite mechanism itself is covered by
// TestTimeRangeQueryRewrite.
func TestAsOfQueryRewrite(t *testing.T) {
	t.Parallel()

	input := url.Values{"as_of": {"2024-01-15T10:30:00Z"}}
	if err := asOfQueryRewrite(input); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	assertQueryValues(t, input, url.Values{
		andKey: {"(recorded_at.lte.2024-01-15T10:30:00Z,or(replaced_at.gt.2024-01-15T10:30:00Z,replaced_at.is.null))"},
	})
}
