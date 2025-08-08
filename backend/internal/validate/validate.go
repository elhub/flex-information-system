// Package validate is a barebones validation library that reduces the
// boilerplate when writing validations on structs.
//
// It allows you to write stuff like:
//
//	func (cc clientCredentialsPayload) Validate() error {
//		val := validate.New()
//
//		val.Check(cc.GrantType == grantTypeClientCredentials, "invalid grant type")
//		val.Check(cc.ClientID != "", "client_id is required")
//		val.Check(cc.ClientSecret != "", "client_secret is required")
//
//	 	return val.Error()
//	}
package validate

import (
	"errors"
	"fmt"
	"strings"
)

// Validate collects error messages from checks and returns them as a single error.
type Validate struct {
	errormsgs []string
}

// New creates a new Validate instance.
func New() *Validate {
	var v Validate
	return &v
}

// Check adds an error message to the list of error messages if the condition c is false.
// Format and a are passed directly to fmt.Sprintf.
func (v *Validate) Check(c bool, format string, a ...any) {
	if !c {
		v.errormsgs = append(v.errormsgs, fmt.Sprintf(format, a...))
	}
}

func (v *Validate) String() string {
	return strings.Join(v.errormsgs, ", ")
}

// Error returns a single error containing all error messages.
func (v *Validate) Error() error {
	if len(v.errormsgs) == 0 {
		return nil
	}

	return errors.New(v.String()) //nolint:err113
}
