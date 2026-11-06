// Package kbackend provides a reverse proxy to the Kotlin backend.
package kbackend

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"
)

// NewProxy returns a handler that forwards every request, unchanged, to the
// Kotlin backend. All request headers (including Authorization, Cookie,
// Api-Version, Accept and Prefer), the path and the raw query string are
// preserved, and request and response bodies are streamed.
//
// Callers are expected to strip any API prefix (e.g. /api/v1) before the
// request reaches the proxy, since the Kotlin backend serves APIs without it.
func NewProxy(upstream string) (http.Handler, error) {
	target, err := url.Parse(upstream)
	if err != nil {
		return nil, fmt.Errorf("invalid kbackend URL: %w", err)
	}

	proxy := &httputil.ReverseProxy{ //nolint:exhaustruct,exhaustruct_v5
		Rewrite: func(pr *httputil.ProxyRequest) {
			pr.SetURL(target)
			pr.SetXForwarded()
		},
		ModifyResponse: func(resp *http.Response) error {
			// the Go trace middleware already sets this header, so we need to drop
			// the Kotlin one to make sure we don't send two to the client
			resp.Header.Del("Traceresponse")

			return nil
		},
		ErrorHandler: func(w http.ResponseWriter, r *http.Request, err error) {
			slog.ErrorContext(r.Context(), "kbackend proxy error", "error", err)

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)

			body, _ := json.Marshal(map[string]string{
				"code":    fmt.Sprintf("HTTP%d", http.StatusInternalServerError),
				"message": "Try again later",
			})
			w.Write(body)
		},
	}

	return proxy, nil
}
