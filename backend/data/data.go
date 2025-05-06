package data

import (
	"bytes"
	"encoding/json"
	"flex/auth"
	"flex/data/models"
	"flex/pgpool"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"
	"regexp"
	"slices"
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

	// controllable unit lookup
	mux.HandleFunc("POST /controllable_unit/lookup", data.controllableUnitLookupHandler)

	// all other requests are forwarded to PostgREST
	mux.HandleFunc("/accounting_point", data.postgRESTHandler)
	mux.HandleFunc("/accounting_point/{path...}", data.postgRESTHandler)
	mux.HandleFunc("/accounting_point_balance_responsible_party", data.postgRESTHandler)
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
	mux.HandleFunc("/entity_client", data.postgRESTHandler)
	mux.HandleFunc("/entity_client/{path...}", data.postgRESTHandler)
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

//nolint:funlen,cyclop
func (data *api) controllableUnitLookupHandler(
	w http.ResponseWriter, req *http.Request,
) {
	ctx := req.Context()

	rd, err := auth.RequestDetailsFromContext(ctx, data.ctxKey)
	if err != nil {
		slog.ErrorContext(ctx, "no request details in context", "error", err)
		writeErrorToResponseWriter(w, http.StatusInternalServerError, errorMessage{ //nolint:exhaustruct
			Message: "request is not authenticated",
		})
		return
	}

	allowedRoles := []string{
		"flex_service_provider",
		"flex_flexibility_information_system_operator",
	}

	if !slices.Contains(allowedRoles, rd.Role()) {
		writeErrorToResponseWriter(w, http.StatusUnauthorized, errorMessage{ //nolint:exhaustruct
			Message: "user cannot perform this operation",
		})
		return
	}

	var cuLookupRequestBody controllableUnitLookupRequest
	if err = json.NewDecoder(req.Body).Decode(&cuLookupRequestBody); err != nil {
		slog.ErrorContext(ctx, "could not read request body", "error", err)
		writeErrorToResponseWriter(w, http.StatusBadRequest, errorMessage{ //nolint:exhaustruct
			Message: "ill formed request body",
		})
		return
	}

	endUserBusinessID := ""
	if cuLookupRequestBody.EndUserBusinessID != nil {
		endUserBusinessID = *cuLookupRequestBody.EndUserBusinessID
	}

	controllableUnitBusinessID := ""
	if cuLookupRequestBody.ControllableUnitBusinessID != nil {
		controllableUnitBusinessID = *cuLookupRequestBody.ControllableUnitBusinessID
	}

	accountingPointID := ""
	if cuLookupRequestBody.AccountingPointID != nil {
		accountingPointID = *cuLookupRequestBody.AccountingPointID
	}

	if endUserBusinessID == "" {
		writeErrorToResponseWriter(w, http.StatusBadRequest, errorMessage{ //nolint:exhaustruct
			Message: "missing end user business ID",
		})
		return
	}

	if accountingPointID == "" && controllableUnitBusinessID == "" {
		writeErrorToResponseWriter(w, http.StatusBadRequest, errorMessage{ //nolint:exhaustruct
			Message: "missing accounting point ID or business ID",
		})
		return
	}

	slog.InfoContext(
		ctx, "will lookup controllable unit",
		"end_user_business_id", endUserBusinessID,
		"accounting_point_id", accountingPointID,
		"controllable_unit_business_id", controllableUnitBusinessID,
	)

	tx, err := data.db.Begin(ctx)
	if err != nil {
		slog.ErrorContext(ctx, "could not start transaction", "error", err)
		writeErrorToResponseWriter(w, http.StatusInternalServerError, errorMessage{ //nolint:exhaustruct
			Message: "could not start transaction",
		})
		return
	}
	defer tx.Rollback(ctx)
	queries := models.New(tx)

	cuLookup, err := queries.ControllableUnitLookup(
		ctx,
		endUserBusinessID,
		controllableUnitBusinessID,
		accountingPointID,
	)
	if err != nil {
		slog.ErrorContext(ctx, "CU lookup query failed", "error", err)
	}
	if err != nil || len(cuLookup) == 0 {
		writeErrorToResponseWriter(w, http.StatusNotFound, errorMessage{ //nolint:exhaustruct
			Message: "controllable unit not found",
		})
		return
	}
	if err = tx.Commit(ctx); err != nil {
		slog.ErrorContext(ctx, "could not commit CU lookup transaction", "error", err)
		writeErrorToResponseWriter(w, http.StatusInternalServerError, errorMessage{ //nolint:exhaustruct
			Message: "could not notify end user",
		})
		return
	}

	reformattedCULookup, err := ReformatControllableUnitLookupResult(cuLookup)
	if err != nil {
		slog.ErrorContext(
			ctx, "could not reformat controllable unit lookup result", "error", err,
		)
		writeErrorToResponseWriter(w, http.StatusInternalServerError, errorMessage{ //nolint:exhaustruct
			Message: "ill formed controllable unit lookup result",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	body, _ := json.Marshal(reformattedCULookup)
	w.Write(body)
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

// notFoundHandler writes a 404 Not Found response in PostgREST format.
func (data *api) notFoundHandler(w http.ResponseWriter, req *http.Request) {
	writeErrorToResponseWriter(w, http.StatusNotFound, errorMessage{ //nolint:exhaustruct
		Message: "Not Found" + req.URL.Path,
	})
}
