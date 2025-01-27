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
	"github.com/lestrrat-go/jwx/v3/jwt/openid"
)

// GetIdentifier returns the identifier from the token.
// This is just a convenience method since different OIDC providers have different claims for the identifier.
func GetIdentifier(token openid.Token) string {
	var id string
	// iporten uses the pid claim
	err := token.Get("pid", &id)
	if err == nil {
		return id
	}

	// authelia uses the preferred_username claim
	id, ok := token.PreferredUsername()
	if ok {
		return id
	}

	// oidcs uses the sub claim
	id, _ = token.Subject()

	return id
}
