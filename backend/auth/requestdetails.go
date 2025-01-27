package auth

import (
	"context"
	"errors"
	"flex/pgpool"
	"fmt"
)

var errMissingRequestDetails = errors.New("missing request details")

// Ensure that the requestDetails struct implements the UserDetails interface.
var _ pgpool.UserDetails = &RequestDetails{} //nolint:exhaustruct

// RequestDetails is a struct that holds our custom request details.
type RequestDetails struct {
	role       string
	externalID string
}

// ExternalID returns the external ID of the request.
func (r *RequestDetails) ExternalID() string {
	return r.externalID
}

// Role returns the role of the request.
func (r *RequestDetails) Role() string {
	return r.role
}

// RequestDetailsFromContext returns the RequestDetails value stored in ctx.
func RequestDetailsFromContext(ctx context.Context, key string) (*RequestDetails, error) {
	value := ctx.Value(key)
	if value == nil {
		return nil, fmt.Errorf("%w: context value %s is empty", errMissingRequestDetails, key)
	}
	requestDetails, ok := value.(*RequestDetails)
	if !ok {
		return nil, fmt.Errorf("%w: not of type RequestDetails", errMissingRequestDetails)
	}
	return requestDetails, nil
}
