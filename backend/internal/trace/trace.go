// Package trace hides some OpenTelemetry setup and provides a middleware for Gin and a handler for slog.
package trace

import (
	"context"
	"log/slog"

	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/otel"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/trace"
)

// Init sest up the default global tracer provider.
func Init() {
	tp := sdktrace.NewTracerProvider()
	otel.SetTracerProvider(tp)
}

// Tracer returns the global otel tracer.
func Tracer(name string) trace.Tracer { //nolint:ireturn
	return otel.Tracer(name)
}

// WithNewRoot specifies that the Span should be treated as a root Span.
// Any existing parent span context will be ignored when defining the Span's trace identifiers.
//
//nolint:gochecknoglobals
var WithNewRoot = trace.WithNewRoot

// Middleware returns a gin middleware that adds trace/span context to the request context.
//
// This is a barebones implementation of
// https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin#Middleware
func Middleware() gin.HandlerFunc {
	tracer := otel.Tracer("gin")

	return func(c *gin.Context) {
		ctx, span := tracer.Start(c.Request.Context(), "gin")
		defer span.End()

		c.Request = c.Request.WithContext(ctx)
		c.Next()
	}
}

// SlogHandler is a handler for slog that adds trace/span context to the logs.
type SlogHandler struct {
	slog.Handler
}

// Handle adds trace/span context to the log record and passes it along to the wrapped handler.
func (h SlogHandler) Handle(ctx context.Context, record slog.Record) error {
	if ctx == nil {
		return h.Handler.Handle(ctx, record) //nolint:wrapcheck
	}

	span := trace.SpanFromContext(ctx)
	if span == nil || !span.IsRecording() {
		return h.Handler.Handle(ctx, record) //nolint:wrapcheck
	}

	spanCtx := span.SpanContext()
	if spanCtx.HasTraceID() {
		record.AddAttrs(slog.String("trace_id", spanCtx.TraceID().String()))
	}
	if spanCtx.HasSpanID() {
		record.AddAttrs(slog.String("span_id", spanCtx.SpanID().String()))
	}

	return h.Handler.Handle(ctx, record) //nolint:wrapcheck
}

// WithAttrs returns a new handler with the given attributes added to the log record.
func (h SlogHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	return SlogHandler{h.Handler.WithAttrs(attrs)}
}

// WithGroup returns a new handler with the given group name added to the log record.
func (h SlogHandler) WithGroup(name string) slog.Handler {
	return SlogHandler{h.Handler.WithGroup(name)}
}

// Enabled returns true if the given level is enabled.
func (h SlogHandler) Enabled(ctx context.Context, level slog.Level) bool {
	return h.Handler.Enabled(ctx, level)
}
