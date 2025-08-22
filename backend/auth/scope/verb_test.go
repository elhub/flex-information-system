package scope_test

import (
	"flex/auth/scope"
	"testing"
)

func TestVerbCovers(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		v, p scope.Verb
		want bool
	}{
		{"Read covers Read", scope.Read, scope.Read, true},
		{"Read does not cover Use", scope.Read, scope.Use, false},
		{"Use covers Read", scope.Use, scope.Read, true},
		{"Use covers Use", scope.Use, scope.Use, true},
		{"Manage covers Use", scope.Manage, scope.Use, true},
		{"Manage covers Read", scope.Manage, scope.Read, true},
		{"Use does not cover Manage", scope.Use, scope.Manage, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := tt.v.Covers(tt.p)
			if got != tt.want {
				t.Errorf("Verb %v covers %v returned %v; want %v", tt.v, tt.p, got, tt.want)
			}
		})
	}
}
