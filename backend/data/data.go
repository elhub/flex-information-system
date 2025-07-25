package data

import (
	"bytes"
	_ "embed"
	"encoding/json"
	"flex/auth"
	"flex/data/models"
	"flex/internal/middleware"
	"flex/internal/openapi"
	"flex/internal/validate"
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

//go:embed static/openapi.json
var openapiInput []byte

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
	baseURL string,
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

	// OpenAPI documentation handlers
	mux.HandleFunc("GET /", openapi.ElementsHandlerFunc("Flex Data API"))

	mux.HandleFunc("GET /openapi.json", openapi.HandlerFunc(
		openapiInput,
		baseURL,
		"Flex Data API",
	))

	// controllable unit lookup
	mux.HandleFunc("POST /controllable_unit/lookup", data.controllableUnitLookupHandler)

	// entity lookup
	mux.HandleFunc("POST /entity/lookup", data.entityLookupHandler)

	listPostgRESTHandler := middleware.DefaultQueryLimit(http.HandlerFunc(data.postgRESTHandler))

	// all other requests are forwarded to PostgREST
	mux.Handle("GET /accounting_point", listPostgRESTHandler)
	mux.HandleFunc("GET /accounting_point/{id}", data.postgRESTHandler)

	mux.Handle("GET /accounting_point_balance_responsible_party", listPostgRESTHandler)

	mux.Handle("GET /accounting_point_energy_supplier", listPostgRESTHandler)

	mux.Handle("GET /controllable_unit", listPostgRESTHandler)
	mux.HandleFunc("POST /controllable_unit", data.postgRESTHandler)
	mux.HandleFunc("GET /controllable_unit/{id}", data.postgRESTHandler)
	mux.HandleFunc("PATCH /controllable_unit/{id}", data.postgRESTHandler)

	mux.Handle("GET /controllable_unit_history", listPostgRESTHandler)
	mux.HandleFunc("GET /controllable_unit_history/{id}", data.postgRESTHandler)

	mux.Handle("GET /controllable_unit_service_provider", listPostgRESTHandler)
	mux.HandleFunc("POST /controllable_unit_service_provider", data.postgRESTHandler)
	mux.HandleFunc("GET /controllable_unit_service_provider/{id}", data.postgRESTHandler)
	mux.HandleFunc("PATCH /controllable_unit_service_provider/{id}", data.postgRESTHandler)
	mux.HandleFunc("DELETE /controllable_unit_service_provider/{id}", data.postgRESTHandler)

	mux.Handle("GET /controllable_unit_service_provider_history", listPostgRESTHandler)
	mux.HandleFunc("GET /controllable_unit_service_provider_history/{id}", data.postgRESTHandler)

	mux.Handle("GET /entity", listPostgRESTHandler)
	mux.HandleFunc("POST /entity", data.postgRESTHandler)
	mux.HandleFunc("GET /entity/{id}", data.postgRESTHandler)
	mux.HandleFunc("PATCH /entity/{id}", data.postgRESTHandler)

	mux.Handle("GET /entity_client", listPostgRESTHandler)
	mux.HandleFunc("POST /entity_client", data.postgRESTHandler)
	mux.HandleFunc("GET /entity_client/{id}", data.postgRESTHandler)
	mux.HandleFunc("PATCH /entity_client/{id}", data.postgRESTHandler)
	mux.HandleFunc("DELETE /entity_client/{id}", data.postgRESTHandler)

	mux.Handle("GET /event", listPostgRESTHandler)
	mux.HandleFunc("GET /event/{id}", data.postgRESTHandler)

	mux.Handle("GET /identity", listPostgRESTHandler)
	mux.HandleFunc("GET /identity/{id}", data.postgRESTHandler)

	mux.Handle("GET /notice", listPostgRESTHandler)

	mux.Handle("GET /notification", listPostgRESTHandler)
	mux.HandleFunc("GET /notification/{id}", data.postgRESTHandler)
	mux.HandleFunc("PATCH /notification/{id}", data.postgRESTHandler)

	mux.Handle("GET /party", listPostgRESTHandler)
	mux.HandleFunc("POST /party", data.postgRESTHandler)
	mux.HandleFunc("GET /party/{id}", data.postgRESTHandler)
	mux.HandleFunc("PATCH /party/{id}", data.postgRESTHandler)

	mux.Handle("GET /party_history", listPostgRESTHandler)
	mux.HandleFunc("GET /party_history/{id}", data.postgRESTHandler)

	mux.Handle("GET /party_membership", listPostgRESTHandler)
	mux.HandleFunc("POST /party_membership", data.postgRESTHandler)
	mux.HandleFunc("GET /party_membership/{id}", data.postgRESTHandler)
	mux.HandleFunc("DELETE /party_membership/{id}", data.postgRESTHandler)

	mux.Handle("GET /party_membership_history", listPostgRESTHandler)
	mux.HandleFunc("GET /party_membership_history/{id}", data.postgRESTHandler)

	mux.Handle("GET /product_type", listPostgRESTHandler)
	mux.HandleFunc("GET /product_type/{id}", data.postgRESTHandler)

	mux.Handle("GET /service_provider_product_application", listPostgRESTHandler)
	mux.HandleFunc("POST /service_provider_product_application", data.postgRESTHandler)
	mux.HandleFunc("GET /service_provider_product_application/{id}", data.postgRESTHandler)
	mux.HandleFunc("PATCH /service_provider_product_application/{id}", data.postgRESTHandler)

	mux.Handle("GET /service_provider_product_application_history", listPostgRESTHandler)
	mux.HandleFunc("GET /service_provider_product_application_history/{id}", data.postgRESTHandler)

	mux.Handle("GET /service_provider_product_application_comment", listPostgRESTHandler)
	mux.HandleFunc("POST /service_provider_product_application_comment", data.postgRESTHandler)
	mux.HandleFunc("GET /service_provider_product_application_comment/{id}", data.postgRESTHandler)
	mux.HandleFunc("PATCH /service_provider_product_application_comment/{id}", data.postgRESTHandler)

	mux.Handle("GET /service_provider_product_application_comment_history", listPostgRESTHandler)
	mux.HandleFunc("GET /service_provider_product_application_comment_history/{id}", data.postgRESTHandler)

	mux.Handle("GET /service_providing_group", listPostgRESTHandler)
	mux.HandleFunc("POST /service_providing_group", data.postgRESTHandler)
	mux.HandleFunc("GET /service_providing_group/{id}", data.postgRESTHandler)
	mux.HandleFunc("PATCH /service_providing_group/{id}", data.postgRESTHandler)

	mux.Handle("GET /service_providing_group_history", listPostgRESTHandler)
	mux.HandleFunc("GET /service_providing_group_history/{id}", data.postgRESTHandler)

	mux.Handle("GET /service_providing_group_grid_prequalification", listPostgRESTHandler)
	mux.HandleFunc("POST /service_providing_group_grid_prequalification", data.postgRESTHandler)
	mux.HandleFunc("GET /service_providing_group_grid_prequalification/{id}", data.postgRESTHandler)
	mux.HandleFunc("PATCH /service_providing_group_grid_prequalification/{id}", data.postgRESTHandler)

	mux.Handle("GET /service_providing_group_grid_prequalification_history", listPostgRESTHandler)
	mux.HandleFunc("GET /service_providing_group_grid_prequalification_history/{id}", data.postgRESTHandler)

	mux.Handle("GET /service_providing_group_membership", listPostgRESTHandler)
	mux.HandleFunc("POST /service_providing_group_membership", data.postgRESTHandler)
	mux.HandleFunc("GET /service_providing_group_membership/{id}", data.postgRESTHandler)
	mux.HandleFunc("PATCH /service_providing_group_membership/{id}", data.postgRESTHandler)
	mux.HandleFunc("DELETE /service_providing_group_membership/{id}", data.postgRESTHandler)

	mux.Handle("GET /service_providing_group_membership_history", listPostgRESTHandler)
	mux.HandleFunc("GET /service_providing_group_membership_history/{id}", data.postgRESTHandler)

	mux.Handle("GET /service_providing_group_product_application", listPostgRESTHandler)
	mux.HandleFunc("POST /service_providing_group_product_application", data.postgRESTHandler)
	mux.HandleFunc("GET /service_providing_group_product_application/{id}", data.postgRESTHandler)
	mux.HandleFunc("PATCH /service_providing_group_product_application/{id}", data.postgRESTHandler)

	mux.Handle("GET /service_providing_group_product_application_history", listPostgRESTHandler)
	mux.HandleFunc("GET /service_providing_group_product_application_history/{id}", data.postgRESTHandler)

	mux.Handle("GET /system_operator_product_type", listPostgRESTHandler)
	mux.HandleFunc("POST /system_operator_product_type", data.postgRESTHandler)
	mux.HandleFunc("GET /system_operator_product_type/{id}", data.postgRESTHandler)
	mux.HandleFunc("PATCH /system_operator_product_type/{id}", data.postgRESTHandler)

	mux.Handle("GET /system_operator_product_type_history", listPostgRESTHandler)
	mux.HandleFunc("GET /system_operator_product_type_history/{id}", data.postgRESTHandler)

	mux.Handle("GET /technical_resource", listPostgRESTHandler)
	mux.HandleFunc("POST /technical_resource", data.postgRESTHandler)
	mux.HandleFunc("GET /technical_resource/{id}", data.postgRESTHandler)
	mux.HandleFunc("PATCH /technical_resource/{id}", data.postgRESTHandler)
	mux.HandleFunc("DELETE /technical_resource/{id}", data.postgRESTHandler)

	mux.Handle("GET /technical_resource_history", listPostgRESTHandler)
	mux.HandleFunc("GET /technical_resource_history/{id}", data.postgRESTHandler)

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
		writeInternalServerError(w)
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

	errorMsg := controllableUnitLookupValidateInput(&cuLookupRequestBody)
	if errorMsg != nil {
		writeErrorToResponseWriter(w, http.StatusBadRequest, *errorMsg)
		return
	}

	endUserBusinessID := *cuLookupRequestBody.EndUserBusinessID
	controllableUnitBusinessID := *cuLookupRequestBody.ControllableUnitBusinessID
	accountingPointBusinessID := *cuLookupRequestBody.AccountingPointBusinessID

	tx, err := data.db.Begin(ctx)
	if err != nil {
		slog.ErrorContext(ctx, "could not start transaction", "error", err)
		writeInternalServerError(w)
		return
	}
	defer tx.Rollback(ctx)
	queries := models.New(tx)

	// get accounting point data

	var accountingPointID int
	if controllableUnitBusinessID != "" {
		currentAP, err := queries.GetCurrentControllableUnitAccountingPoint(
			ctx, controllableUnitBusinessID,
		)
		if err != nil {
			slog.InfoContext(
				ctx, "controllable unit does not exist",
				"business_id", controllableUnitBusinessID,
			)
			writeErrorToResponseWriter(w, http.StatusNotFound, errorMessage{ //nolint:exhaustruct
				Message: "controllable unit does not exist",
			})
			return
		}

		accountingPointID = currentAP.AccountingPointID
		accountingPointBusinessID = currentAP.AccountingPointBusinessID
	} else {
		accountingPointID, err = queries.GetAccountingPointIDFromBusinessID(
			ctx, accountingPointBusinessID,
		)
		if err != nil {
			slog.InfoContext(
				ctx, "accounting point does not exist",
				"business_id", accountingPointBusinessID,
			)
			writeErrorToResponseWriter(w, http.StatusNotFound, errorMessage{ //nolint:exhaustruct
				Message: "accounting point does not exist",
			})
			return
		}
	}

	// check end user matches and get their ID

	endUserID, err := queries.ControllableUnitLookupCheckEndUserMatchesAccountingPoint(
		ctx, endUserBusinessID, accountingPointBusinessID,
	)
	if err != nil {
		writeErrorToResponseWriter(w, http.StatusForbidden, errorMessage{ //nolint:exhaustruct
			Message: "end user does not match accounting point / controllable unit",
		})
		return
	}

	// get controllable unit(s)

	controllableUnits, err := queries.ControllableUnitLookup(
		ctx,
		controllableUnitBusinessID,
		accountingPointBusinessID,
	)
	if err != nil {
		slog.ErrorContext(ctx, "CU lookup query failed", "error", err)
		writeInternalServerError(w)
		return
	}
	if err = tx.Commit(ctx); err != nil {
		slog.ErrorContext(ctx, "could not commit CU lookup transaction", "error", err)
		writeInternalServerError(w)
		return
	}

	// build response from all the data

	reformattedCULookup, err := ReformatControllableUnitLookupResult(
		accountingPointID, accountingPointBusinessID, endUserID, controllableUnits,
	)
	if err != nil {
		slog.ErrorContext(
			ctx, "could not reformat controllable unit lookup result", "error", err,
		)
		writeInternalServerError(w)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	body, _ := json.Marshal(reformattedCULookup)
	w.Write(body)
}

// controllableUnitLookupValidateInput checks that the given fields in the CU
// lookup request body respect the OpenAPI specification of fields. At this
// point, we just check the general format for HTTP 400 errors, regardless of
// whether the values have meaning in the database.
func controllableUnitLookupValidateInput( //nolint:cyclop
	cuLookupRequestBody *controllableUnitLookupRequest,
) *errorMessage {
	endUserBusinessID := ""
	if cuLookupRequestBody.EndUserBusinessID != nil {
		endUserBusinessID = *cuLookupRequestBody.EndUserBusinessID
	}

	if endUserBusinessID == "" {
		return &errorMessage{Message: "missing end user business ID"} //nolint:exhaustruct
	}

	regexEndUserBusinessID := regexp.MustCompile("^[1-9]([0-9]{8}|[0-9]{10})$")
	if !regexEndUserBusinessID.MatchString(endUserBusinessID) {
		return &errorMessage{Message: "ill formed end user business ID"} //nolint:exhaustruct
	}

	controllableUnitBusinessID := ""
	if cuLookupRequestBody.ControllableUnitBusinessID != nil {
		controllableUnitBusinessID = *cuLookupRequestBody.ControllableUnitBusinessID

		regexControllableUnitBusinessID := regexp.MustCompile("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")
		if !regexControllableUnitBusinessID.MatchString(controllableUnitBusinessID) {
			return &errorMessage{Message: "ill formed controllable unit business ID"} //nolint:exhaustruct
		}
	}

	accountingPointBusinessID := ""
	if cuLookupRequestBody.AccountingPointBusinessID != nil {
		accountingPointBusinessID = *cuLookupRequestBody.AccountingPointBusinessID

		regexAccountingPointBusinessID := regexp.MustCompile("^[1-9][0-9]{17}$")
		if !regexAccountingPointBusinessID.MatchString(accountingPointBusinessID) {
			return &errorMessage{Message: "ill formed accounting point business ID"} //nolint:exhaustruct
		}
	}

	if accountingPointBusinessID == "" && controllableUnitBusinessID == "" {
		return &errorMessage{ //nolint:exhaustruct
			Message: "missing business ID for accounting point or controllable unit",
		}
	}

	if accountingPointBusinessID != "" && controllableUnitBusinessID != "" {
		return &errorMessage{ //nolint:exhaustruct
			Message: "request contains business IDs for both accounting point and controllable unit",
		}
	}

	// no nil pointers so we can trust the (now validated) input for the rest of
	// the CU lookup process
	cuLookupRequestBody.EndUserBusinessID = &endUserBusinessID
	cuLookupRequestBody.ControllableUnitBusinessID = &controllableUnitBusinessID
	cuLookupRequestBody.AccountingPointBusinessID = &accountingPointBusinessID

	return nil
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

//nolint:funlen,cyclop
func (data *api) entityLookupHandler(
	w http.ResponseWriter, req *http.Request,
) {
	ctx := req.Context()

	rd, err := auth.RequestDetailsFromContext(ctx, data.ctxKey)
	if err != nil {
		slog.ErrorContext(ctx, "no request details in context", "error", err)
		writeInternalServerError(w)
		return
	}

	if rd.Role() != "flex_flexibility_information_system_operator" {
		writeErrorToResponseWriter(w, http.StatusUnauthorized, errorMessage{ //nolint:exhaustruct
			Message: "user cannot perform this operation",
		})
		return
	}

	var entityLookupRequestBody entityLookupRequest
	err = json.NewDecoder(req.Body).Decode(&entityLookupRequestBody)
	if err != nil {
		slog.ErrorContext(ctx, "could not read request body", "error", err)
		writeErrorToResponseWriter(w, http.StatusBadRequest, errorMessage{ //nolint:exhaustruct
			Message: "ill formed request body",
		})
		return
	}

	entityLookupValidator := validate.New()

	entityLookupValidator.Check(
		entityLookupRequestBody.Type == "person" ||
			entityLookupRequestBody.Type == "organisation",
		"entity type must be either 'person' or 'organisation'",
	)

	regexPersonBusinessID := regexp.MustCompile("^[1-9][0-9]{10}$")
	if entityLookupRequestBody.Type == "person" {
		entityLookupValidator.Check(
			regexPersonBusinessID.MatchString(entityLookupRequestBody.BusinessID),
			"person number must be 11 digit long",
		)
	}

	regexOrganisationBusinessID := regexp.MustCompile("^[1-9][0-9]{8}$")
	if entityLookupRequestBody.Type == "organisation" {
		entityLookupValidator.Check(
			regexOrganisationBusinessID.MatchString(entityLookupRequestBody.BusinessID),
			"organisation number must be 9 digit long",
		)
	}

	entityLookupValidator.Check(
		entityLookupRequestBody.Name != "",
		"missing entity name",
	)

	if err = entityLookupValidator.Error(); err != nil {
		writeErrorToResponseWriter(w, http.StatusBadRequest, errorMessage{ //nolint:exhaustruct
			Message: err.Error(),
		})
		return
	}

	tx, err := data.db.Begin(ctx)
	if err != nil {
		slog.ErrorContext(ctx, "could not start transaction", "error", err)
		writeInternalServerError(w)
		return
	}
	defer tx.Rollback(ctx)
	queries := models.New(tx)

	entityLookupRow, err := queries.EntityLookup(
		ctx,
		entityLookupRequestBody.BusinessID,
		entityLookupRequestBody.Name,
		entityLookupRequestBody.Type,
	)
	if err != nil {
		slog.ErrorContext(ctx, "entity lookup query failed", "error", err)
		writeInternalServerError(w)
		return
	}
	if err = tx.Commit(ctx); err != nil {
		slog.ErrorContext(
			ctx, "could not commit entity lookup transaction", "error", err,
		)
		writeInternalServerError(w)
		return
	}

	entityLookup := EntityLookupResponse{
		EntityID: entityLookupRow.EntityID,
	}

	var httpStatusCode int
	if entityLookupRow.EntityFound {
		httpStatusCode = http.StatusOK
	} else {
		httpStatusCode = http.StatusCreated
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(httpStatusCode)
	body, _ := json.Marshal(entityLookup)
	w.Write(body)
}

// postgRESTHandler forwards the request to the PostgREST API.
func (data *api) postgRESTHandler(w http.ResponseWriter, req *http.Request) {
	// regex for calls targeting single ID pages, not a valid format in PostgREST
	regexSingleID := regexp.MustCompile("^/([a-z_]+)/([0-9]+)$")

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
		Message: "Not Found " + req.URL.Path,
	})
}

// writeInternalServerError writes a generic HTTP 500 response.
func writeInternalServerError(w http.ResponseWriter) {
	writeErrorToResponseWriter(w, http.StatusInternalServerError, errorMessage{ //nolint:exhaustruct
		Message: "Try again later",
	})
}
