package gs1

import (
	"regexp"
	"strconv"
)

// IsValidGS1 checks if a given GS1 code is valid.
func IsValidGS1(gs1 string) bool {
	regex := regexp.MustCompile("^[1-9][0-9]{17}$")
	if !regex.MatchString(gs1) {
		return false
	}

	multiplier := 3
	sum := 0

	for i := len(gs1) - 2; i >= 0; i-- {
		digit, _ := strconv.Atoi(string(gs1[i]))
		sum += digit * multiplier
		if multiplier == 3 { //nolint:mnd
			multiplier = 1
		} else {
			multiplier = 3
		}
	}
	expectedCheckDigit := (10 - (sum % 10)) % 10

	checkDigit, _ := strconv.Atoi(string(gs1[len(gs1)-1]))

	return checkDigit == expectedCheckDigit
}
