// Package oidc provides an OpenID Connect functionality on top of golang.org/x/oauth2.
// The main purpose of the package is to handle provider discovery and token validation.
//
// Another intent of having this package is that our mock and production providers have slightly different support.
// By having this package, we "restrict" usage to the usage supported by the production provider, IDPorten.
//
// One of the key feature we are after is to do pushed authorization requests, which is currently not by other implementations.
//
// The package is heavily inspired by:
//
//   - https://github.com/zitadel/oidc
//   - https://github.com/coreos/go-oidc
//   - https://github.com/kubernetes/client-go/blob/master/plugin/pkg/client/auth/oidc/oidc.go
package oidc

import (
	"strings"

	"github.com/lestrrat-go/jwx/v4/jwt"
	"github.com/lestrrat-go/jwx/v4/jwt/openid"
)

// GetUserData returns the identifier, type, and name from the token.
// Type is either "pid" (for person id) or "email".
// This is just a convenience method since different OIDC providers have
// different claims for the identifier.
func GetUserData(token openid.Token) (string, string, string) {
	// IDPorten uses the `pid` claim, and since we request the `profile` scope,
	// we also get `given_name` and `family_name`.
	// cf https://docs.digdir.no/docs/idporten/oidc/oidc_protocol_id_token.html
	if pid, err := jwt.Get[string](token, "pid"); err == nil {
		firstName, _ := jwt.Get[string](token, "given_name")
		lastName, _ := jwt.Get[string](token, "family_name")
		name := strings.TrimSpace(firstName + " " + lastName)
		if name == "" {
			name = pid
		}
		return pid, "pid", name
	}

	// Entra and Authelia use the `preferred_username` claim, with `name`
	// available when the `profile` scope is requested.
	// cf https://learn.microsoft.com/en-us/entra/identity-platform/id-token-claims-reference
	// for Entra and the local config for Authelia.
	var id string
	if username, ok := token.PreferredUsername(); ok {
		id = username
	} else {
		// Fall back to the `sub` claim for other providers.
		id, _ = token.Subject()
	}

	idType := "pid"
	if strings.Contains(id, "@") {
		idType = "email"
		id = strings.ToLower(id)
	}

	name, ok := token.Name()
	if !ok || name == "" {
		name = id
	}

	return id, idType, name
}
