package middleware

import (
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
func Prometheus(ctx *gin.Context) {
	// Requests to /metrics are skipped to avoid self-referential noise.
	if ctx.FullPath() == "/metrics" {
		ctx.Next()
		return
	}

	start := time.Now()

	ctx.Next()

	status := strconv.Itoa(ctx.Writer.Status())
	elapsed := time.Since(start).Seconds()
	method := ctx.Request.Method
	path := ctx.FullPath()

	// FullPath returns "" for unmatched routes (404s); label them explicitly.
	if path == "" {
		path = "unmatched"
	}

	httpRequestsTotal.WithLabelValues(method, path, status).Inc()
	httpRequestDuration.WithLabelValues(method, path, status).Observe(elapsed)
}
