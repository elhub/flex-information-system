package data_test

import (
	"flex/data"
	"flex/internal/kbackend"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
)

type upstreamCall struct {
	method string
	path   string
	query  string
}

// Mixed mode: the Go backend serves the data API itself (the prefix is
// stripped, like in flex.go), but some routes are proxied to kbackend, which
// serves the API under its prefix.
func TestKbackendProxiedRoutesKeepThePrefix(t *testing.T) {
	t.Parallel()

	var (
		mutex sync.Mutex
		calls []upstreamCall
	)

	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		mutex.Lock()
		defer mutex.Unlock()

		calls = append(calls, upstreamCall{r.Method, r.URL.Path, r.URL.RawQuery})

		w.WriteHeader(http.StatusNoContent)
	}))
	defer upstream.Close()

	handler := newHandler(t, upstream.URL)

	// as in flex.go
	router := http.StripPrefix("/api/v1", handler)

	const attachment = "/api/v1/service_providing_group_product_application_attachment"

	tests := []struct {
		method string
		url    string
	}{
		{http.MethodPost, "/api/v1/controllable_unit/lookup"},
		{http.MethodPost, attachment},
		{http.MethodDelete, attachment + "/12"},
		{http.MethodGet, attachment + "/12/download?inline=true"},
	}

	for _, test := range tests {
		mutex.Lock()
		calls = nil
		mutex.Unlock()

		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, httptest.NewRequestWithContext(t.Context(), test.method, test.url, nil))

		mutex.Lock()
		got := append([]upstreamCall(nil), calls...)
		mutex.Unlock()

		if len(got) != 1 {
			t.Fatalf("%s %s: expected 1 request to kbackend, got %d", test.method, test.url, len(got))
		}

		wantPath, wantQuery, _ := strings.Cut(test.url, "?")
		if got[0].method != test.method || got[0].path != wantPath || got[0].query != wantQuery {
			t.Errorf("%s %s: kbackend got %+v, want path %q and query %q", test.method, test.url, got[0], wantPath, wantQuery)
		}
	}
}

func newHandler(t *testing.T, kbackendURL string) http.Handler {
	t.Helper()

	proxy, err := kbackend.NewProxy(kbackendURL)
	if err != nil {
		t.Fatal(err)
	}

	handler, err := data.NewAPIHandler(
		"http://localhost/api/v1/", "http://localhost:3000", proxy, nil, "ctx",
	)
	if err != nil {
		t.Fatal(err)
	}

	return handler
}

func TestGoServedRoutesAreStillStripped(t *testing.T) {
	t.Parallel()

	upstream := httptest.NewServer(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		t.Errorf("unexpected request to kbackend: %s %s", r.Method, r.URL.Path)
	}))
	defer upstream.Close()

	handler := newHandler(t, upstream.URL)

	router := http.StripPrefix("/api/v1", handler)

	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, httptest.NewRequestWithContext(t.Context(), http.MethodGet, "/api/v1/openapi.json", nil))

	if rec.Code != http.StatusOK {
		t.Errorf("GET /api/v1/openapi.json: got status %d, want %d", rec.Code, http.StatusOK)
	}
}
