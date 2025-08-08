package auth

import (
	"encoding/json"
	"flex/auth/scope"
	"log/slog"
	"net/http"
)

// CheckScope is a middleware that checks if the request context
// has the required scope to proceed.
func CheckScope(
	scope scope.Scope, next http.Handler,
) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
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

		if !requestScope.Covers(scope) {
			slog.DebugContext(ctx, "insufficient scope", "required_scope", scope.String(), "scope", requestScope.String())
			w.WriteHeader(http.StatusForbidden)
			body, _ := json.Marshal(newErrorMessage(http.StatusForbidden, "insufficient scope", nil))
			w.Write(body)

			return
		}

		slog.DebugContext(ctx, "scope check passed", "required_scope", scope.String(), "scope", requestScope.String())
		next.ServeHTTP(w, req)
	})
}

// CheckScopeMethod is a middleware that checks if the request context
// has the required scope for the resource to proceed.
// It is similar to CheckScope but uses the http method to determine the required scope.
//
// Use it when you want to reuse a middleware for resource endpoints.
func CheckScopeMethod(asset string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		ctx := req.Context()

		rd, err := RequestDetailsFromContext(ctx)
		if err != nil {
			slog.ErrorContext(ctx, "no request details in context", "error", err)
			w.WriteHeader(http.StatusInternalServerError)
			body, _ := json.Marshal(newErrorMessage(http.StatusInternalServerError, "missing data in context", err))
			w.Write(body)

			return
		}

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

		requestScope := rd.Scope()

		requiredScope := scope.Scope{Verb: verb, Asset: asset}

		if !requestScope.Covers(requiredScope) {
			slog.DebugContext(ctx, "insufficient scope", "required_scope", requiredScope.String(), "scopes", requestScope.String())
			w.WriteHeader(http.StatusForbidden)
			body, _ := json.Marshal(newErrorMessage(http.StatusForbidden, "insufficient scope", nil))
			w.Write(body)

			return
		}

		next.ServeHTTP(w, req)
	})
}
