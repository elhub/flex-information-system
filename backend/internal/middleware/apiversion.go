package middleware

import (
	"context"
	"net/http"
	"slices"
)

type contextKey string

const apiVersionKey contextKey = "api-version"

// RequireAPIVersion enforces the presence of a valid Api-Version request
// header. It responds with 400 Bad Request if the header is missing or
// contains an unsupported version. On success it echoes the latest version
// back in the response and stores the requested version in the context.
// Add a new entry to knownVersions when a breaking change ships. Remove old entries at sunset.
// The OpenAPI endpoints (/ and /openapi.json) are exempt.
func RequireAPIVersion(next http.Handler) http.Handler {
	knownVersions := []string{
		"2026-06-08",
	}
	currentVersion := knownVersions[len(knownVersions)-1]
	exempt := map[string]bool{
		"/":             true,
		"/openapi.json": true,
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if exempt[r.URL.Path] {
			next.ServeHTTP(w, r)
			return
		}
		apiVersion := r.Header.Get("Api-Version")
		if apiVersion == "" || !slices.Contains(knownVersions, apiVersion) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"message":"Api-Version header is required and must be a supported version"}`))
			return
		}
		w.Header().Set("Api-Version", currentVersion)
		ctx := context.WithValue(r.Context(), apiVersionKey, apiVersion)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// APIVersionFromContext retrieves the Api-Version value stored in the context
// by RequireAPIVersion. Returns an empty string if not set.
func APIVersionFromContext(ctx context.Context) string {
	apiVersion, _ := ctx.Value(apiVersionKey).(string)
	return apiVersion
}
