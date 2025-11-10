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
func Tracer(name string) trace.Tracer {
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

	return func(ginCtx *gin.Context) {
		ctx, span := tracer.Start(ginCtx.Request.Context(), "gin")
		if sc := span.SpanContext(); sc.IsValid() {
			// The `traceresponse` header is defined in W3C Trace Context
			// https://w3c.github.io/trace-context/
			// It is using the same format as the `traceparent` header.
			//
			// We are not trusting any incoming traceparent headers. We consider all calls to be untrusted third party calls.
			// So we always restart a trace and return it to enable better support requests.
			//
			// The last part of the traceresponse are trace flags. There are two defined flags:
			// "00000001" sets the `sampled` flag - but since we are not really sampling we are not setting it.
			// "00000010" sets the `random-trace-id` flag - which is true we are generating a new random trace id.
			// So we set the flags to "02" (hex).

			traceresponse := "00-" + sc.TraceID().String() + "-" + sc.SpanID().String() + "-02"
			ginCtx.Writer.Header().Set("traceresponse", traceresponse)
		}
		defer span.End()

		ginCtx.Request = ginCtx.Request.WithContext(ctx)
		ginCtx.Next()
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
