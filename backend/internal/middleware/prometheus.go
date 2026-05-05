package middleware

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

//nolint:gochecknoglobals
var (
	httpRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{ //nolint:exhaustruct
			Name: "http_requests_total",
			Help: "Total number of HTTP requests by method, path and status code.",
		},
		[]string{"method", "path", "status"},
	)

	httpRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{ //nolint:exhaustruct
			Name:    "http_request_duration_seconds",
			Help:    "HTTP request duration in seconds by method, path and status code.",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path", "status"},
	)
)

// Prometheus is a Gin middleware that records HTTP request metrics.
// It records http_requests_total and http_request_duration_seconds
// labelled by method, matched route pattern and status code.
// Requests to /metrics and /api/v0/* are skipped — the former to avoid
// self-referential noise, the latter because PrometheusDataAPI records
// per-route metrics for the data API at a finer granularity.
func Prometheus(ctx *gin.Context) {
	path := ctx.FullPath()

	// Skip /metrics scrapes and data API routes (instrumented by PrometheusDataAPI).
	if path == "/metrics" || path == "/api/v0/*url" {
		ctx.Next()
		return
	}

	start := time.Now()

	ctx.Next()

	status := strconv.Itoa(ctx.Writer.Status())
	elapsed := time.Since(start).Seconds()
	method := ctx.Request.Method
	path = ctx.FullPath()

	// FullPath returns "" for unmatched routes (404s); label them explicitly.
	if path == "" {
		path = "unmatched"
	}

	httpRequestsTotal.WithLabelValues(method, path, status).Inc()
	httpRequestDuration.WithLabelValues(method, path, status).Observe(elapsed)
}

// recordingResponseWriter wraps http.ResponseWriter to capture the status code
// written by the handler.
type recordingResponseWriter struct {
	http.ResponseWriter

	statusCode int
}

func (rw *recordingResponseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

// Write overrides the default Write to ensure the status code is captured
// even when WriteHeader is never called explicitly (implicit 200).
func (rw *recordingResponseWriter) Write(b []byte) (int, error) {
	if !rw.wroteHeader() {
		rw.statusCode = http.StatusOK
	}

	return rw.ResponseWriter.Write(b) //nolint:wrapcheck
}

// wroteHeader reports whether WriteHeader has been called explicitly.
func (rw *recordingResponseWriter) wroteHeader() bool {
	return rw.statusCode != 0
}

// PrometheusMuxInstrumentation wraps a stdlib http.Handler backed by an
// http.ServeMux and records per-route metrics.
func PrometheusMuxInstrumentation(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		rw := &recordingResponseWriter{ResponseWriter: w, statusCode: 0}
		start := time.Now()

		next.ServeHTTP(rw, req)

		// req.Pattern is set by http.ServeMux after routing.
		// It contains only the path portion, e.g. "GET /controllable_unit/{id}".
		// We strip the method prefix and prepend the Gin mount point.
		pattern := req.Pattern
		path := "/api/v0" + stripMethod(pattern)
		if pattern == "" {
			path = "/api/v0/unmatched"
		}

		status := strconv.Itoa(rw.statusCode)
		elapsed := time.Since(start).Seconds()

		httpRequestsTotal.WithLabelValues(req.Method, path, status).Inc()
		httpRequestDuration.WithLabelValues(req.Method, path, status).Observe(elapsed)
	})
}

// stripMethod removes the "METHOD " prefix from a ServeMux pattern such as
// "GET /controllable_unit/{id}", returning "/controllable_unit/{id}".
func stripMethod(pattern string) string {
	for _, method := range []string{"GET ", "POST ", "PATCH ", "DELETE ", "PUT ", "HEAD ", "OPTIONS "} {
		if len(pattern) >= len(method) && pattern[:len(method)] == method {
			return pattern[len(method):]
		}
	}

	return pattern
}
