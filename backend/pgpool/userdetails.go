package pgpool

import (
	"context"
	"errors"
	"fmt"
)

var errMissingUserDetails = errors.New("missing user details")

// UserDetails are expected to be found in the context so the pool
// can set role and transaction settings.
type UserDetails interface {
	// ExternalID returns the external ID for current user.
	ExternalID() string
	// Role returns the role for current user.
	Role() string
}

// UserDetailsFromContext returns the UserDetails value stored in ctx.
// Errors if no UserDetails is found.
//
//nolint:ireturn
func UserDetailsFromContext(ctx context.Context, key string) (UserDetails, error) {
	value := ctx.Value(key)
	if value == nil {
		return nil, fmt.Errorf("%w: context value for %s is empty", errMissingUserDetails, key)
	}

	userDetails, ok := value.(UserDetails)
	if !ok {
		return nil, fmt.Errorf("%w: not of type UserDetails", errMissingUserDetails)
	}

	return userDetails, nil
}
