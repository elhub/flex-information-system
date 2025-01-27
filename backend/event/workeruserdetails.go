package event

import "flex/pgpool"

// Ensure that the WorkerUserDetails struct implements the UserDetails
// interface.
var _ pgpool.UserDetails = &WorkerUserDetails{} //nolint:exhaustruct

// WorkerUserDetails is a struct that holds the role to be used in the
// event worker.
type WorkerUserDetails struct {
	role string
}

// NewWorkerUserDetails returns a default WorkerUserDetails.
func NewWorkerUserDetails() *WorkerUserDetails {
	return &WorkerUserDetails{
		role: "flex_internal_event_notification",
	}
}

// ExternalID returns a system ID because the transaction scoped settings must
// correspond to the system acting on the database.
func (r *WorkerUserDetails) ExternalID() string {
	return "0"
}

// Role returns the role used in the event worker.
func (r *WorkerUserDetails) Role() string {
	return r.role
}
