package scope

//go:generate enumer -type=Verb -transform=lower

// Verb represents the type of access or privilege in a scope.
type Verb int

const (
	// iota + 1 to make room for "Inspect" at some point.

	// Read is the lowest level of access, allowing read-only operations.
	Read Verb = iota + 1
	// Use allows read and calling procedures.
	Use
	// Manage allows full access.
	Manage
)

// Covers checks if the current Verb covers the provided Verb.
// E.g. use also covers read.
func (v Verb) Covers(other Verb) bool {
	return v >= other
}
