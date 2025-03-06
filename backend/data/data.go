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

	"github.com/gin-gonic/gin"
)

// API holds the data API handlers.
type API struct {
	postgRESTURL *url.URL
	db           *pgpool.Pool
	ctxKey       string
}

// NewAPI creates a new data.API instance.
func NewAPI(
	postgRESTUpstream string,
	db *pgpool.Pool,
	ctxKey string,
) (*API, error) {
	postgRESTURL, err := url.Parse(postgRESTUpstream)
	if err != nil {
		return nil, fmt.Errorf("invalid PostgREST URL: %w", err)
	}

	return &API{
		postgRESTURL: postgRESTURL,
		db:           db,
		ctxKey:       ctxKey,
	}, nil
}

// PostgRESTHandler forwards the request to the PostgREST API.
func (data *API) PostgRESTHandler(ctx *gin.Context) {
	// regex for calls targeting a single ID and subresource/history pages,
	// which are not valid formats in PostgREST
	regexIDSubHistory := regexp.MustCompile("^/([a-z_]+)/([0-9]+)(/[a-z_]+)?$")

	url := ctx.Param("url")
	query := ctx.Request.URL.Query()
	header := ctx.Request.Header

	header.Set("Content-Type", "application/json")

	if ctx.Request.Method == http.MethodPost {
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

	proxy.ServeHTTP(ctx.Writer, ctx.Request)
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
		writeErrorResponse(rsp, errorMessage{ //nolint:exhaustruct
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

	writeErrorResponse(rsp, errorBody)
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

// writeErrorResponse writes an error message as JSON in the response body.
func writeErrorResponse(rsp *http.Response, msg errorMessage) {
	body, _ := json.Marshal(msg)
	rsp.Body = io.NopCloser(bytes.NewReader(body))
	rsp.ContentLength = int64(len(body))
	rsp.Header.Set("Content-Length", strconv.Itoa(len(body)))
}
