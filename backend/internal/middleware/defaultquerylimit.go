package middleware

import (
	"net/http"
	"strconv"
)

const defaultLimit = 50

// DefaultQueryLimit adds a default limit query parameter to the request if not
// provided by the client, so that we never query a whole resource at once.
func DefaultQueryLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		query := req.URL.Query()
		if query.Get("limit") == "" {
			query.Set("limit", strconv.Itoa(defaultLimit))
			req.URL.RawQuery = query.Encode()
		}

		next.ServeHTTP(w, req)
	})
}
