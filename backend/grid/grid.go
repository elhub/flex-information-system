package grid

import (
	"bytes"
	"encoding/json"
	"flex/auth"
	"flex/internal/middleware"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"
	"regexp"
	"strconv"
)

// grid gathers handlers for all endpoints of the grid API.
type grid struct {
	postgRESTURL *url.URL
	mux          *http.ServeMux
}

var _ http.Handler = &grid{} //nolint:exhaustruct

// NewAPIHandler returns a handler for all the grid API endpoints.
func NewAPIHandler(postgRESTUpstream string) (http.Handler, error) {
	postgRESTURL, err := url.Parse(postgRESTUpstream)
	if err != nil {
		return nil, fmt.Errorf("invalid PostgREST URL: %w", err)
	}

	mux := http.NewServeMux()

	grid := &grid{
		postgRESTURL: postgRESTURL,
		mux:          mux,
	}

	listPostgRESTHandler := middleware.DefaultQueryLimit(
		auth.CheckScopeForRequest("data", http.HandlerFunc(grid.postgRESTHandler)),
	)
	postgRESTHandler := auth.CheckScopeForRequest(
		"data", http.HandlerFunc(grid.postgRESTHandler),
	)
	substationHandler := auth.CheckScopeForRequest(
		"data", http.HandlerFunc(grid.substationHandler),
	)

	mux.Handle("GET /line", listPostgRESTHandler)
	mux.Handle("GET /line/{id}", postgRESTHandler)

	mux.Handle("GET /line_history", listPostgRESTHandler)
	mux.Handle("GET /line_history/{id}", postgRESTHandler)

	mux.Handle("GET /substation", substationHandler)
	mux.Handle("GET /substation/{id}", postgRESTHandler)

	mux.Handle("GET /substation_history", listPostgRESTHandler)
	mux.Handle("GET /substation_history/{id}", postgRESTHandler)

	mux.Handle("GET /substation_cluster", listPostgRESTHandler)
	mux.Handle("GET /substation_cluster/{id}", postgRESTHandler)

	mux.Handle("GET /substation_cluster_history", listPostgRESTHandler)
	mux.Handle("GET /substation_cluster_history/{id}", postgRESTHandler)

	mux.Handle("GET /accounting_point_near_transformer", listPostgRESTHandler)

	mux.HandleFunc("/", grid.notFoundHandler)

	return grid, nil
}

func (grid *grid) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	grid.mux.ServeHTTP(w, req)
}

// handler for /substation.
func (grid *grid) substationHandler(w http.ResponseWriter, req *http.Request) {
	query := req.URL.Query()

	if query.Get("order") == "proximity" {
		query.Del("order")

		// target the function instead of the table, so we can use the geographical
		// filtering mechanism
		req.URL.Path = "/rpc/substation_distance"
		req.URL.RawQuery = query.Encode()

		// set a limit to max 10 if not set, so we do not return the whole dataset
		_, err := strconv.Atoi(query.Get("limit"))
		if err != nil {
			query.Set("limit", "10")
		}
	}

	grid.postgRESTHandler(w, req)
}

// postgRESTHandler forwards the request to the PostgREST API.
func (grid *grid) postgRESTHandler(w http.ResponseWriter, req *http.Request) {
	// regex for calls targeting single ID pages, not a valid format in PostgREST
	regexSingleID := regexp.MustCompile("^/([a-z_]+)/([0-9]+)$")

	ctx := req.Context()
	url := req.URL.Path
	query := req.URL.Query()
	header := req.Header

	header.Set("Content-Type", "application/json")

	// grid schema only
	header.Set("Accept-Profile", "grid")

	// rewrite the URL and query to match the PostgREST format
	if match := regexSingleID.FindStringSubmatch(url); match != nil {
		url = "/" + match[1]
		query.Set("id", "eq."+match[2])
		// force PostgREST to return a single object
		header.Set("Accept", "application/vnd.pgrst.object+json")
		slog.InfoContext(
			ctx,
			"API call targeting a single-ID record. Rewriting into PostgREST format.",
			"new url", url, "new query", query.Encode(),
		)
	}

	proxy := &httputil.ReverseProxy{ //nolint:exhaustruct
		Rewrite: func(req *httputil.ProxyRequest) {
			req.Out.Header = header
			req.Out.Host = grid.postgRESTURL.Host
			req.Out.URL.Scheme = grid.postgRESTURL.Scheme
			req.Out.URL.Host = grid.postgRESTURL.Host
			req.Out.URL.Path = url
			req.Out.URL.RawQuery = query.Encode()
		},
		ModifyResponse: fixPostgRESTResponse,
	}

	proxy.ServeHTTP(w, req)
}

// errorMessage is the format of PostgREST error messages.
type errorMessage struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Detail  string `json:"details,omitempty"`
	Hint    string `json:"hint,omitempty"`
}

// fixPostgRESTResponse logs the error message from PostgREST and possibly
// rewrites it when not informative enough. It also makes sure the responses
// abide by our OpenAPI specification.
func fixPostgRESTResponse(rsp *http.Response) error {
	rsp.Header.Set("Content-Type", "application/json")

	if rsp.StatusCode < http.StatusBadRequest {
		return nil
	}

	// error => parse the body, modify it, and write it to the actual response
	body, err := io.ReadAll(rsp.Body)
	if err != nil {
		writeErrorToResponse(rsp, errorMessage{ //nolint:exhaustruct
			Code:    fmt.Sprintf("HTTP%d", http.StatusInternalServerError),
			Message: "could not read PostgREST response body",
		})

		return nil
	}
	defer rsp.Body.Close()

	var errorBody errorMessage
	if err := json.Unmarshal(body, &errorBody); err != nil || errorBody.Code == "" {
		slog.InfoContext(
			rsp.Request.Context(),
			"grid API failure (not in PostgREST format)",
			"error", body,
		)
		errorBody.Code = fmt.Sprintf("HTTP%d", rsp.StatusCode)
		errorBody.Message = rsp.Status
	}

	writeErrorToResponse(rsp, errorBody)
	slog.InfoContext(
		rsp.Request.Context(),
		"grid API failure",
		"code", errorBody.Code,
		"message", errorBody.Message,
		"detail", errorBody.Detail,
		"hint", errorBody.Hint,
	)

	return nil
}

// writeErrorToResponse writes an error message as JSON in the response body.
func writeErrorToResponse(rsp *http.Response, msg errorMessage) {
	body, _ := json.Marshal(msg)
	rsp.Body = io.NopCloser(bytes.NewReader(body))
	rsp.ContentLength = int64(len(body))
	rsp.Header.Set("Content-Length", strconv.Itoa(len(body)))
}

// notFoundHandler writes a 404 Not Found response in PostgREST format.
func (grid *grid) notFoundHandler(w http.ResponseWriter, req *http.Request) {
	writeErrorToResponseWriter(w, http.StatusNotFound, errorMessage{ //nolint:exhaustruct
		Message: "Not Found: " + req.Method + " " + req.URL.Path,
	})
}

// writeErrorToResponseWriter writes an error message as JSON in the response
// writer.
func writeErrorToResponseWriter(
	w http.ResponseWriter, statusCode int, msg errorMessage,
) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	if msg.Code == "" {
		msg.Code = fmt.Sprintf("HTTP%d", statusCode)
	}

	body, _ := json.Marshal(msg)
	w.Write(body)
}
