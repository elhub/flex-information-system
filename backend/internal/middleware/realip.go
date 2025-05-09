package middleware

import "net/http"

// RealIP reads the X-Real-IP header set by the reverse proxy / load balancer
// and sets the client IP as the remote address of the request.
func RealIP(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		if realIP := req.Header.Get("X-Real-IP"); realIP != "" {
			req.RemoteAddr = realIP
		}
		next.ServeHTTP(w, req)
	})
}
