package data

import (
	"bytes"
	"encoding/json"
	"flex/pgpool"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"
	"regexp"
	"strconv"
	"strings"
)

// api gathers handlers for all endpoints of the data API.
type api struct {
	postgRESTURL *url.URL
	db           *pgpool.Pool
	ctxKey       string
	mux          *http.ServeMux
}

var _ http.Handler = &api{} //nolint:exhaustruct

// NewAPIHandler returns a handler for all the data API endpoints.
//
//nolint:funlen
func NewAPIHandler(
	postgRESTUpstream string,
	db *pgpool.Pool,
	ctxKey string,
) (http.Handler, error) {
	postgRESTURL, err := url.Parse(postgRESTUpstream)
	if err != nil {
		return nil, fmt.Errorf("invalid PostgREST URL: %w", err)
	}

	mux := http.NewServeMux()

	data := &api{
		postgRESTURL: postgRESTURL,
		db:           db,
		mux:          mux,
		ctxKey:       ctxKey,
	}

	// all other requests are forwarded to PostgREST
	mux.HandleFunc("/accounting_point", data.postgRESTHandler)
	mux.HandleFunc("/accounting_point/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/controllable_unit", data.postgRESTHandler)
	mux.HandleFunc("/controllable_unit/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/controllable_unit_history", data.postgRESTHandler)
	mux.HandleFunc("/controllable_unit_history/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/controllable_unit_service_provider", data.postgRESTHandler)
	mux.HandleFunc("/controllable_unit_service_provider/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/controllable_unit_service_provider_history", data.postgRESTHandler)
	mux.HandleFunc("/controllable_unit_service_provider_history/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/entity", data.postgRESTHandler)
	mux.HandleFunc("/entity/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/event", data.postgRESTHandler)
	mux.HandleFunc("/event/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/identity", data.postgRESTHandler)
	mux.HandleFunc("/identity/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/notice", data.postgRESTHandler)
	mux.HandleFunc("/notice/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/notification", data.postgRESTHandler)
	mux.HandleFunc("/notification/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/party", data.postgRESTHandler)
	mux.HandleFunc("/party/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/party_history", data.postgRESTHandler)
	mux.HandleFunc("/party_history/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/party_membership", data.postgRESTHandler)
	mux.HandleFunc("/party_membership/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/party_membership_history", data.postgRESTHandler)
	mux.HandleFunc("/party_membership_history/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/product_type", data.postgRESTHandler)
	mux.HandleFunc("/product_type/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/service_provider_product_application", data.postgRESTHandler)
	mux.HandleFunc("/service_provider_product_application/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/service_provider_product_application_history", data.postgRESTHandler)
	mux.HandleFunc("/service_provider_product_application_history/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/service_provider_product_application_comment", data.postgRESTHandler)
	mux.HandleFunc("/service_provider_product_application_comment/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/service_provider_product_application_comment_history", data.postgRESTHandler)
	mux.HandleFunc("/service_provider_product_application_comment_history/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/service_providing_group", data.postgRESTHandler)
	mux.HandleFunc("/service_providing_group/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/service_providing_group_history", data.postgRESTHandler)
	mux.HandleFunc("/service_providing_group_history/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/service_providing_group_grid_prequalification", data.postgRESTHandler)
	mux.HandleFunc("/service_providing_group_grid_prequalification/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/service_providing_group_grid_prequalification_history", data.postgRESTHandler)
	mux.HandleFunc("/service_providing_group_grid_prequalification_history/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/service_providing_group_membership", data.postgRESTHandler)
	mux.HandleFunc("/service_providing_group_membership/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/service_providing_group_membership_history", data.postgRESTHandler)
	mux.HandleFunc("/service_providing_group_membership_history/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/service_providing_group_product_application", data.postgRESTHandler)
	mux.HandleFunc("/service_providing_group_product_application/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/service_providing_group_product_application_history", data.postgRESTHandler)
	mux.HandleFunc("/service_providing_group_product_application_history/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/system_operator_product_type", data.postgRESTHandler)
	mux.HandleFunc("/system_operator_product_type/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/system_operator_product_type_history", data.postgRESTHandler)
	mux.HandleFunc("/system_operator_product_type_history/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/technical_resource", data.postgRESTHandler)
	mux.HandleFunc("/technical_resource/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/technical_resource_history", data.postgRESTHandler)
	mux.HandleFunc("/technical_resource_history/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/", data.notFoundHandler)

	return data, nil
}

func (data *api) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	data.mux.ServeHTTP(w, req)
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

// postgRESTHandler forwards the request to the PostgREST API.
func (data *api) postgRESTHandler(w http.ResponseWriter, req *http.Request) {
	// regex for calls targeting a single ID and subresource/history pages,
	// which are not valid formats in PostgREST
	regexIDSubHistory := regexp.MustCompile("^/([a-z_]+)/([0-9]+)(/[a-z_]+)?$")

	ctx := req.Context()
	url := req.URL.Path
	query := req.URL.Query()
	header := req.Header

	header.Set("Content-Type", "application/json")

	if req.Method == http.MethodPost {
		// ensure singular when object is created
		// https://postgrest.org/en/v11/references/resource_representation.html#singular-or-plural
		header.Set("Accept", "application/vnd.pgrst.object+json")

		// ensure that object is returned on insert and update
		// https://postgrest.org/en/latest/references/preferences.html#prefer-return
		header.Set("Prefer", "return=representation")
	}

	// rewrite the URL and query to match the PostgREST format
	if match := regexIDSubHistory.FindStringSubmatch(url); match != nil {
		if match[3] != "" { // subresource or history
			url = fmt.Sprintf("/%s_%s", match[1], match[3][1:])
			query.Set(match[1]+"_id", "eq."+match[2])
			slog.InfoContext(
				ctx,
				"API call targeting a subresource or history resource. "+
					"Rewriting into PostgREST format.",
				"new url", url, "new query", query.Encode(),
			)
		} else { // single ID
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
	}

	proxy := httputil.NewSingleHostReverseProxy(data.postgRESTURL)
	proxy.Director = func(req *http.Request) {
		req.Header = header
		req.Host = data.postgRESTURL.Host
		req.URL.Scheme = data.postgRESTURL.Scheme
		req.URL.Host = data.postgRESTURL.Host
		req.URL.Path = url
		req.URL.RawQuery = query.Encode()
	}
	proxy.ModifyResponse = fixPostgRESTResponse

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
			"data API failure (not in PostgREST format)",
			"error", body,
		)
		errorBody.Code = fmt.Sprintf("HTTP%d", rsp.StatusCode)
		errorBody.Message = rsp.Status
	}

	// general error message rewrites to hide the default PostgREST ones
	switch rsp.Request.Method {
	case http.MethodPatch:
		if strings.HasPrefix(errorBody.Message, "JSON object requested") {
			errorBody.Message = "User cannot update this resource"
		}
	case http.MethodPost:
		if strings.HasPrefix(
			errorBody.Message, "new row violates row-level security",
		) {
			errorBody.Message = "User cannot create this resource"
		} else if strings.HasPrefix(errorBody.Message, "duplicate key value") {
			errorBody.Message = "Duplicate found, " +
				"please try to update the existing resource instead"
		}
	}

	writeErrorToResponse(rsp, errorBody)
	slog.InfoContext(
		rsp.Request.Context(),
		"data API failure",
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

func (data *api) notFoundHandler(w http.ResponseWriter, req *http.Request) {
	writeErrorToResponseWriter(w, http.StatusNotFound, errorMessage{ //nolint:exhaustruct
		Message: "Not Found" + req.URL.Path,
	})
}
