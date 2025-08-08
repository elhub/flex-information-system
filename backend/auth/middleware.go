package auth

import (
	"encoding/json"
	"flex/auth/scope"
	"log/slog"
	"net/http"
	"strings"
)

// checkScopeWithHandler is a helper function that checks if the request has the required scope.
// It handles all the common error handling and logging.
func checkScopeWithHandler(w http.ResponseWriter, req *http.Request, requiredScope scope.Scope, next http.Handler) {
	ctx := req.Context()

	rd, err := RequestDetailsFromContext(ctx)
	if err != nil {
		slog.ErrorContext(ctx, "no request details in context", "error", err)
		w.WriteHeader(http.StatusInternalServerError)
		body, _ := json.Marshal(newErrorMessage(http.StatusInternalServerError, "missing data in context", err))
		w.Write(body)
		return
	}

	requestScope := rd.Scope()

	if !requestScope.Covers(requiredScope) {
		slog.DebugContext(ctx, "insufficient scope", "required_scope", requiredScope.String(), "scope", requestScope.String())
		w.WriteHeader(http.StatusForbidden)
		body, _ := json.Marshal(newErrorMessage(http.StatusForbidden, "insufficient scope", nil))
		w.Write(body)
		return
	}

	slog.DebugContext(ctx, "scope check passed", "required_scope", requiredScope.String(), "scope", requestScope.String())
	next.ServeHTTP(w, req)
}

// CheckScope is a middleware that checks if the request context
// has the required scope to proceed.
func CheckScope(
	scope scope.Scope, next http.Handler,
) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		checkScopeWithHandler(w, req, scope, next)
	})
}

// CheckScopeForRequest is a middleware that checks if the request context
// has the required scope for the resource to proceed.
// It is similar to CheckScope but uses the http method and path to determine
// the required scope.
//
// Verb:
// GET - Read
// POST - Manage
// PATCH - Manage
// DELETE - Manage
//
// The path is used as the asset for the scope, with the module as prefix.
// If the module is "data", and the request is "GET /foo/bar", the required scope
// would be "read:foo:bar".
//
// Use it when you want to reuse a middleware for resource endpoints.
func CheckScopeForRequest(module string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		var verb scope.Verb

		switch req.Method {
		case http.MethodPost:
			verb = scope.Manage
		case http.MethodGet:
			verb = scope.Read
		case http.MethodPatch:
			verb = scope.Manage
		case http.MethodDelete:
			verb = scope.Manage
		}

		requestPath := req.URL.Path
		requestPath = strings.TrimPrefix(requestPath, "/")
		requestPath = strings.TrimSuffix(requestPath, "/") // Remove trailing slash if present
		requestParts := strings.Split(requestPath, "/")

		requiredScope := scope.Scope{Verb: verb, Asset: strings.Join(append([]string{module}, requestParts...), ":")}

		checkScopeWithHandler(w, req, requiredScope, next)
	})
}
