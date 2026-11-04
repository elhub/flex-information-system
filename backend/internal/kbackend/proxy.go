// Package kbackend provides a reverse proxy to the Kotlin backend. Used to
// forward requests so that the Kotlin backend can gradually take over.
package kbackend

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"
)

// Proxy is an http.Handler that reverse proxies requests to the Kotlin backend.
type Proxy struct {
	proxy *httputil.ReverseProxy
}

var _ http.Handler = &Proxy{} //nolint:exhaustruct_v5

// NewProxy creates a Proxy for the Kotlin backend at the given upstream URL.
func NewProxy(upstream string) (*Proxy, error) {
	target, err := url.Parse(upstream)
	if err != nil {
		return nil, fmt.Errorf("invalid kbackend URL: %w", err)
	}

	return &Proxy{
		proxy: &httputil.ReverseProxy{ //nolint:exhaustruct_v5
			Rewrite: func(pr *httputil.ProxyRequest) {
				pr.Out.URL.Scheme = target.Scheme
				pr.Out.URL.Host = target.Host
				pr.Out.URL.Path = pr.In.URL.Path
				pr.Out.Host = target.Host
			},
			ModifyResponse: func(resp *http.Response) error {
				// the Go trace middleware already sets this header, so we need to drop
				// the Kotlin one to make sure we don't send two to the client
				resp.Header.Del("Traceresponse")
				return nil
			},
			ErrorHandler: func(w http.ResponseWriter, r *http.Request, err error) {
				slog.ErrorContext(r.Context(), "kbackend proxy error", "error", err)
				writeInternalServerError(w)
			},
		},
	}, nil
}

// ServeHTTP implements http.Handler.
func (p *Proxy) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	p.proxy.ServeHTTP(w, req)
}

// errorMessage is the format of error messages in our APIs.
type errorMessage struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// writeInternalServerError writes a generic HTTP 500 response.
func writeInternalServerError(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusInternalServerError)

	body, _ := json.Marshal(errorMessage{
		Code:    fmt.Sprintf("HTTP%d", http.StatusInternalServerError),
		Message: "Try again later",
	})
	w.Write(body)
}
