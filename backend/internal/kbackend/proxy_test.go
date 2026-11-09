package kbackend_test

import (
	"flex/internal/kbackend"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"go.opentelemetry.io/otel/trace"
)

func assertEqual(t *testing.T, name, got, want string) {
	t.Helper()

	if got != want {
		t.Errorf("%s = %q, want %q", name, got, want)
	}
}

func assertUpstreamRequest(t *testing.T, req *http.Request) {
	t.Helper()

	body, _ := io.ReadAll(req.Body)

	assertEqual(t, "method", req.Method, http.MethodPatch)
	assertEqual(t, "path", req.URL.Path, "/controllable_unit/12")
	assertEqual(t, "query", req.URL.RawQuery, "embed=suspension&valid_at=2024-01-15T10:30:00Z")
	assertEqual(t, "body", string(body), `{"name":"x"}`)

	for key, want := range map[string]string{
		"Authorization": "Bearer abc",
		"Api-Version":   "2026-06-08",
		"Prefer":        "return=representation",
		"Cookie":        "__Host-flex_session=abc",
	} {
		assertEqual(t, "header "+key, req.Header.Get(key), want)
	}
}

func TestProxyForwardsRequestUnchanged(t *testing.T) {
	t.Parallel()

	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assertUpstreamRequest(t, r)

		w.Header().Set("Traceresponse", "00-abc")
		w.Header().Set("Api-Version", "2026-06-08")
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte(`{"id":12}`))
	}))
	defer upstream.Close()

	proxy, err := kbackend.NewProxy(upstream.URL)
	if err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequestWithContext(
		t.Context(),
		http.MethodPatch,
		"/controllable_unit/12?embed=suspension&valid_at=2024-01-15T10:30:00Z",
		strings.NewReader(`{"name":"x"}`),
	)
	req.Header.Set("Authorization", "Bearer abc")
	req.Header.Set("Api-Version", "2026-06-08")
	req.Header.Set("Prefer", "return=representation")
	req.Header.Set("Cookie", "__Host-flex_session=abc")

	rec := httptest.NewRecorder()
	proxy.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Errorf("status = %d, want 201", rec.Code)
	}

	assertEqual(t, "Traceresponse", rec.Header().Get("Traceresponse"), "")
	assertEqual(t, "Api-Version", rec.Header().Get("Api-Version"), "2026-06-08")
	assertEqual(t, "body", rec.Body.String(), `{"id":12}`)
}

func TestProxyUpstreamDown(t *testing.T) {
	t.Parallel()

	proxy, err := kbackend.NewProxy("http://127.0.0.1:1")
	if err != nil {
		t.Fatal(err)
	}

	rec := httptest.NewRecorder()
	proxy.ServeHTTP(rec, httptest.NewRequestWithContext(t.Context(), http.MethodGet, "/x", nil))

	if rec.Code != http.StatusInternalServerError {
		t.Errorf("status = %d, want 500", rec.Code)
	}

	assertEqual(t, "Content-Type", rec.Header().Get("Content-Type"), "application/json")
}

func TestNewProxyInvalidURL(t *testing.T) {
	t.Parallel()

	if _, err := kbackend.NewProxy("://bad"); err == nil {
		t.Error("expected error")
	}
}

func TestProxyReplacesTraceparentWithGoSpan(t *testing.T) {
	t.Parallel()

	var got string

	upstream := httptest.NewServer(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		got = r.Header.Get("Traceparent")
	}))
	defer upstream.Close()

	proxy, err := kbackend.NewProxy(upstream.URL)
	if err != nil {
		t.Fatal(err)
	}

	traceID, _ := trace.TraceIDFromHex("0af7651916cd43dd8448eb211c80319c")
	spanID, _ := trace.SpanIDFromHex("b7ad6b7169203331")
	ctx := trace.ContextWithSpanContext(t.Context(), trace.NewSpanContext(trace.SpanContextConfig{ //nolint:exhaustruct,exhaustruct_v5
		TraceID: traceID,
		SpanID:  spanID,
	}))

	req := httptest.NewRequestWithContext(ctx, http.MethodGet, "/x", nil)
	// a client-supplied traceparent must not reach Kotlin
	req.Header.Set("Traceparent", "00-11111111111111111111111111111111-2222222222222222-01")

	proxy.ServeHTTP(httptest.NewRecorder(), req)

	assertEqual(t, "Traceparent", got, "00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-00")
}

func TestProxyDropsClientTraceparentWithoutSpan(t *testing.T) {
	t.Parallel()

	var got string

	upstream := httptest.NewServer(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		got = r.Header.Get("Traceparent")
	}))
	defer upstream.Close()

	proxy, err := kbackend.NewProxy(upstream.URL)
	if err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequestWithContext(t.Context(), http.MethodGet, "/x", nil)
	req.Header.Set("Traceparent", "00-11111111111111111111111111111111-2222222222222222-01")

	proxy.ServeHTTP(httptest.NewRecorder(), req)

	assertEqual(t, "Traceparent", got, "")
}
