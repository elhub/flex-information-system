package auth

import (
	"context"
	"encoding/json"
	"flex/auth/scope"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	"github.com/lestrrat-go/jwx/v4/jwa"
	"github.com/lestrrat-go/jwx/v4/jws"
)

const sessionCookieKey = "__Host-flex_session"

// API holds the authentication middleware.
// The authentication endpoints are served by kbackend.
type API struct {
	jwtSecret              []byte
	ctxKey                 string
	defaultAnonymousScopes scope.List // default scopes for an anonymous user
}

// NewAPI creates a new auth.API instance.
func NewAPI(
	jwtSecret string,
	ctxKey string,
) *API {
	return &API{
		jwtSecret: []byte(jwtSecret),
		ctxKey:    ctxKey,
		defaultAnonymousScopes: scope.List{
			// TODO limit the scope a bit?
			scope.Scope{Verb: scope.Use, Asset: "auth"},  // to be able to log in
			scope.Scope{Verb: scope.Read, Asset: "data"}, // to be able to access open data (if any)
		},
	}
}

// TokenDecodingMiddleware decodes the token and sets it as RequestDetails in the context.
//
//nolint:funlen
func (auth *API) TokenDecodingMiddleware(
	next http.Handler,
) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		authHeader := req.Header.Get("Authorization")
		sessionCookie, err := req.Cookie(sessionCookieKey)

		ctx := req.Context()

		if authHeader == "" && err != nil {
			// Empty auth header and missing cookie means anonymous user.
			rd := &RequestDetails{
				role:       "flex_anonymous",
				externalID: "",
				scope:      auth.defaultAnonymousScopes,
			}
			authenticatedCtx := context.WithValue(ctx, auth.ctxKey, rd) //nolint:revive,staticcheck
			slog.InfoContext(ctx, "no auth header/cookie: user will be anonymous")
			next.ServeHTTP(w, req.WithContext(authenticatedCtx))

			return
		}

		// the authorization header takes precedence over the cookie
		var tokenStr string

		if authHeader != "" {
			var found bool

			tokenStr, found = strings.CutPrefix(authHeader, "Bearer ")
			if !found {
				w.Header().Set(
					wwwAuthenticateKey,
					wwwAuthenticate{
						Error:            wwwInvalidRequest,
						ErrorDescription: "missing Bearer in Authorization header",
					}.String(),
				)
				writeJSON(w, http.StatusBadRequest, oauthErrorMessage{
					Error:            oauthErrorInvalidRequest,
					ErrorDescription: "missing Bearer in Authorization header",
				})

				return
			}

			slog.DebugContext(ctx, "found token in auth header")
		} else { // no authorization header means we must use the cookie
			tokenStr = sessionCookie.Value

			slog.DebugContext(ctx, "found token in cookie")

			// we set the header for cases where the request is proxied or forwarded
			// to another upstream service
			req.Header.Set("Authorization", "Bearer "+tokenStr)
		}

		token, err := auth.decodeTokenString(tokenStr)
		if err != nil {
			w.Header().Set(
				wwwAuthenticateKey,
				wwwAuthenticate{
					Error: wwwInvalidToken,
					// TODO the error messages here is incorrect if we are using a session
					ErrorDescription: "invalid bearer token",
				}.String(),
			)
			writeJSON(w, http.StatusBadRequest, oauthErrorMessage{
				Error:            oauthErrorInvalidRequest,
				ErrorDescription: "unable to verify and validate token",
			})
			slog.InfoContext(ctx, "invalid token")

			return
		}

		rd := &RequestDetails{
			role:       token.Role,
			externalID: token.ExternalID,
			scope:      token.Scope,
		}
		authenticatedCtx := context.WithValue(ctx, auth.ctxKey, rd) //nolint:revive,staticcheck
		slog.InfoContext(
			ctx, "token-validated user",
			"role", token.Role,
			"externalID", token.ExternalID,
			"scope", token.Scope,
		)
		next.ServeHTTP(w, req.WithContext(authenticatedCtx))
	})
}

// writeJSON writes a JSON response with the given object as body.
func writeJSON(w http.ResponseWriter, statusCode int, obj any) {
	w.Header().Set("Content-Type", "application/json")

	body, _ := json.Marshal(obj) //nolint:errchkjson

	w.WriteHeader(statusCode)
	w.Write(body)
}

// decodeTokenString decodes the token string and returns the claims.
// Returns an error if the token was not verified or validated.
func (auth *API) decodeTokenString(tokenStr string) (*accessToken, error) {
	token := new(accessToken)

	err := verifyTokenString(tokenStr, token, jws.WithKey(jwa.HS256(), auth.jwtSecret))
	if err != nil {
		return nil, fmt.Errorf("error in verifying access token: %w", err)
	}

	if err := token.Validate(); err != nil {
		return nil, fmt.Errorf("error in validating access token: %w", err)
	}

	return token, nil
}
