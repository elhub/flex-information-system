package middleware

import (
	"net/http"
	"regexp"
	"strconv"
)

const defaultLimit = 50

// Limit adds a default limit query parameter to requests on list endpoints if
// not provided by the client, so that we never query a whole resource at once.
func Limit(next http.Handler) http.Handler {
	regexSingleID := regexp.MustCompile("/[0-9]+$")

	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		if req.Method == http.MethodGet && !regexSingleID.MatchString(req.URL.Path) {
			query := req.URL.Query()
			if query.Get("limit") == "" {
				query.Set("limit", strconv.Itoa(defaultLimit))
				req.URL.RawQuery = query.Encode()
			}
		}
		next.ServeHTTP(w, req)
	})
}
