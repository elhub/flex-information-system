package data //nolint:testpackage

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
	"time"
)

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

func TestBlockBeforeDate(t *testing.T) {
	t.Parallel()

	passthrough := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	testCases := []struct {
		name           string
		blockBefore    *time.Time
		expectedStatus int
	}{
		{
			name:           "nil blockBefore passes through",
			blockBefore:    nil,
			expectedStatus: http.StatusOK,
		},
		{
			name:           "date in the past passes through",
			blockBefore:    new(time.Now().Add(-24 * time.Hour)),
			expectedStatus: http.StatusOK,
		},
		{
			name:           "date in the future blocks",
			blockBefore:    new(time.Now().Add(24 * time.Hour)),
			expectedStatus: http.StatusForbidden,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			handler := blockBeforeDate(tc.blockBefore, "SPPA-VAL002", "Service provider product applications", passthrough)
			req := httptest.NewRequestWithContext(t.Context(), http.MethodPost, "/service_provider_product_application", nil)
			rec := httptest.NewRecorder()

			handler.ServeHTTP(rec, req)

			if rec.Code != tc.expectedStatus {
				t.Errorf("status = %d, want %d", rec.Code, tc.expectedStatus)
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
func TestValidAtQueryRewrite(t *testing.T) {
	t.Parallel()

	testCases := []struct {
		name          string
		input         url.Values
		expected      url.Values
		expectedError bool
	}{
		{
			name:          "no valid_at parameter",
			input:         url.Values{"status": {"eq.active"}},
			expected:      url.Values{"status": {"eq.active"}},
			expectedError: false,
		},
		{
			name:  "valid_at RFC 3339 with offset rewrites to valid_from and or",
			input: url.Values{"valid_at": {"2024-01-15T10:30:00+01:00"}},
			expected: url.Values{
				"valid_from": {"lte.2024-01-15T10:30:00+01:00"},
				"or":         {"(valid_to.gt.2024-01-15T10:30:00+01:00,valid_to.is.null)"},
			},
			expectedError: false,
		},
		{
			name:  "valid_at RFC 3339 with milliseconds rewrites to valid_from and or",
			input: url.Values{"valid_at": {"2024-01-15T10:30:00.123+00:00"}},
			expected: url.Values{
				"valid_from": {"lte.2024-01-15T10:30:00.123+00:00"},
				"or":         {"(valid_to.gt.2024-01-15T10:30:00.123+00:00,valid_to.is.null)"},
			},
			expectedError: false,
		},
		{
			name:  "valid_at extended format with UTC abbreviation rewrites to valid_from and or",
			input: url.Values{"valid_at": {"2024-01-15 10:30:00 UTC"}},
			expected: url.Values{
				"valid_from": {"lte.2024-01-15 10:30:00 UTC"},
				"or":         {"(valid_to.gt.2024-01-15 10:30:00 UTC,valid_to.is.null)"},
			},
			expectedError: false,
		},
		{
			name:          "valid_at with empty value clears existing valid_from and or",
			input:         url.Values{"valid_at": {""}, "valid_from": {"lte.2023-01-01T00:00Z"}, "or": {"(valid_to.gt.2023-01-01T00:00Z,valid_to.is.null)"}},
			expected:      url.Values{"valid_at": {""}},
			expectedError: false,
		},
		{
			name:  "prefixed valid_at rewrites prefixed keys",
			input: url.Values{"some_table.valid_at": {"2024-06-01T12:00:00+00:00"}},
			expected: url.Values{
				"some_table.valid_from": {"lte.2024-06-01T12:00:00+00:00"},
				"some_table.or":         {"(valid_to.gt.2024-06-01T12:00:00+00:00,valid_to.is.null)"},
			},
			expectedError: false,
		},
		{
			name: "valid_at replaces pre-existing valid_from and or",
			input: url.Values{
				"valid_at":   {"2024-03-10T08:00:00Z"},
				"valid_from": {"lte.2020-01-01T00:00Z"},
				"or":         {"(valid_to.gt.2020-01-01T00:00Z,valid_to.is.null)"},
			},
			expected: url.Values{
				"valid_from": {"lte.2024-03-10T08:00:00Z"},
				"or":         {"(valid_to.gt.2024-03-10T08:00:00Z,valid_to.is.null)"},
			},
			expectedError: false,
		},
		{
			name:  "unrelated parameters are preserved alongside valid_at rewrite",
			input: url.Values{"valid_at": {"2024-01-15T10:30:00Z"}, "status": {"eq.active"}},
			expected: url.Values{
				"valid_from": {"lte.2024-01-15T10:30:00Z"},
				"or":         {"(valid_to.gt.2024-01-15T10:30:00Z,valid_to.is.null)"},
				"status":     {"eq.active"},
			},
			expectedError: false,
		},
		{
			name:          "valid_at with date-only is invalid",
			input:         url.Values{"valid_at": {"2024-01-15"}},
			expected:      nil,
			expectedError: true,
		},
		{
			name:          "valid_at with arbitrary string is invalid",
			input:         url.Values{"valid_at": {"not-a-date"}},
			expected:      nil,
			expectedError: true,
		},
		{
			name:          "valid_at with datetime but no timezone is invalid",
			input:         url.Values{"valid_at": {"2024-01-15T10:30:00"}},
			expected:      nil,
			expectedError: true,
		},
		{
			name:          "prefixed valid_at with invalid format returns error",
			input:         url.Values{"some_table.valid_at": {"2024-06-01"}},
			expected:      nil,
			expectedError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			err := validAtQueryRewrite(tc.input)
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
