package gs1_test

import (
	"flex/internal/gs1"
	"testing"
)

// TestGSRN tests the IsValidGSRN function.
func TestGSRN(t *testing.T) {
	t.Parallel()

	testCases := []struct {
		input    string
		expected bool
	}{
		{"12345678901231", false},
		{"12345678901234560", false},
		{"123456789012345670", false},
		{"123456789012345675", true},
		{"123456789012345602", false},
		{"123456789012345606", true},
		{"777756789012345603", false},
		{"777756789012345608", true},
		{"133700000000000053", true},
		{"133700000000000060", true},
	}

	for _, testCase := range testCases {
		t.Run(testCase.input, func(t *testing.T) {
			t.Parallel()
			actual := gs1.IsValidGSRN(testCase.input)
			if actual != testCase.expected {
				t.Errorf("IsValidGSRN(%v) = %v; expected %v", testCase.input, actual, testCase.expected)
			}
		})
	}
}
