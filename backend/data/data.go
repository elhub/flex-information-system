package data

import (
	"bytes"
	"encoding/json"
	"flex/data/models"
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

// API holds the data API handlers.
type API struct {
	PathPrefix   string
	postgRESTURL *url.URL
	db           *pgpool.Pool
	ctxKey       string
	mux          *http.ServeMux
}

var _ http.Handler = &API{} //nolint:exhaustruct

// NewAPI creates a new data.API instance.
func NewAPI(
	pathPrefix string,
	postgRESTUpstream string,
	db *pgpool.Pool,
	ctxKey string,
) (*API, error) {
	postgRESTURL, err := url.Parse(postgRESTUpstream)
	if err != nil {
		return nil, fmt.Errorf("invalid PostgREST URL: %w", err)
	}

	mux := http.NewServeMux()

	data := &API{
		PathPrefix:   pathPrefix,
		postgRESTURL: postgRESTURL,
		db:           db,
		ctxKey:       ctxKey,
		mux:          mux,
	}

	// check for controllable unit lookup
	mux.HandleFunc(
		"POST /controllable_unit",
		func(w http.ResponseWriter, req *http.Request) {
			if req.Header.Get("Content-Type") == "application/x-www-form-urlencoded" {
				data.controllableUnitLookupHandler(w, req)
			} else {
				data.postgRESTHandler(w, req)
			}
		},
	)
	// all other requests are forwarded to PostgREST
	mux.HandleFunc("/", data.postgRESTHandler)

	return data, nil
}

func (data *API) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	data.mux.ServeHTTP(w, req)
}

func (data *API) controllableUnitLookupHandler(
	w http.ResponseWriter, req *http.Request,
) {
	endUserIDStr := req.FormValue("end_user_id")
	if endUserIDStr == "" {
		writeErrorToResponseWriter(w, http.StatusBadRequest, errorMessage{ //nolint:exhaustruct
			Message: "missing end user id",
		})
		return
	}
	endUserID, err := strconv.Atoi(endUserIDStr)
	if err != nil {
		writeErrorToResponseWriter(w, http.StatusBadRequest, errorMessage{ //nolint:exhaustruct
			Message: "invalid end user id",
		})
		return
	}

	accountingPointID := req.FormValue("accounting_point_id")
	businessID := req.FormValue("business_id")

	if accountingPointID == "" && businessID == "" {
		writeErrorToResponseWriter(w, http.StatusBadRequest, errorMessage{ //nolint:exhaustruct
			Message: "missing accounting point ID or business ID",
		})
		return
	}

	ctx := req.Context()

	conn, err := data.db.Acquire(ctx)
	if err != nil {
		writeErrorToResponseWriter(w, http.StatusInternalServerError, errorMessage{ //nolint:exhaustruct
			Message: "could not acquire system connection",
		})
		slog.ErrorContext(ctx, "could not acquire system connection", "error", err)
		return
	}
	defer conn.Release()
	tx, err := conn.Begin(ctx)
	if err != nil {
		writeErrorToResponseWriter(w, http.StatusInternalServerError, errorMessage{ //nolint:exhaustruct
			Message: "could not start transaction",
		})
		slog.ErrorContext(ctx, "could not start transaction", "error", err)
		return
	}
	queries := models.New(tx)

	cuLookup, err := queries.ControllableUnitLookup(
		ctx, endUserID, businessID, accountingPointID,
	)
	if err != nil {
		writeErrorToResponseWriter(w, http.StatusNotFound, errorMessage{ //nolint:exhaustruct
			Message: "controllable unit not found",
		})
		return
	}

	slog.InfoContext(ctx, "controllable unit found", "controllable_unit", cuLookup)

	http.Error(w, "Not implemented: CU lookup", http.StatusNotImplemented)
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
func (data *API) postgRESTHandler(w http.ResponseWriter, req *http.Request) {
	// regex for calls targeting a single ID and subresource/history pages,
	// which are not valid formats in PostgREST
	regexIDSubHistory := regexp.MustCompile("^/([a-z_]+)/([0-9]+)(/[a-z_]+)?$")

	ctx := req.Context()
	url := req.URL.Path
	query := req.URL.Query()
	header := req.Header
	authorizationHeader := header.Get("Authorization")
	sessionCookie, err := req.Cookie("__Host-flex_session")

	if authorizationHeader == "" && err == nil {
		header.Set("Authorization", "Bearer "+sessionCookie.Value)
	}

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
