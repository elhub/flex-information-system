package middleware

import "net/http"

// StripFinalSlash is a middleware that strips the final character from the request
// URL path, if it is a forward slash.
func StripFinalSlash(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		if len(path) > 1 && path[len(path)-1] == '/' {
			r.URL.Path = path[:len(path)-1]
		}

		next.ServeHTTP(w, r)
	})
}
