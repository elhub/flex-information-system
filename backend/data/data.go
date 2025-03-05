package data

import (
	"bytes"
	"encoding/json"
	"flex/pgpool"
	"fmt"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"
	"regexp"
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

	proxy.ServeHTTP(ctx.Writer, ctx.Request)
}

// Custom implementation of ResponseWriter. This allows us to have access to the
// headers and response body before they are written, and possibly change them.
type captureResponseWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func newCaptureResponseWriter(w gin.ResponseWriter) captureResponseWriter {
	return captureResponseWriter{
		ResponseWriter: w,
		body:           bytes.NewBufferString(""),
	}
}

// This override writes the body to the buffer instead of the response. All the
// other methods are left untouched, so the other parts of the response are
// written normally.
func (crw captureResponseWriter) Write(b []byte) (int, error) {
	return crw.body.Write(b) //nolint:wrapcheck
}

func (crw captureResponseWriter) WriteHeaderNow() {
	// turn WriteHeaderNow into a no-op so that headers remain changeable until
	// the end of the middleware where the body is ready to be written
}

// errorMessage is the format of PostgREST error messages.
type errorMessage struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Detail  string `json:"details,omitempty"`
	Hint    string `json:"hint,omitempty"`
}

// PostgRESTResponseMiddleware returns a middleware that logs the error
// messages, and possibly rewrites them when not informative enough. It also
// makes sure the responses abide by our OpenAPI specification.
func (data *API) PostgRESTResponseMiddleware(ctx *gin.Context) {
	// change the writer to capture the response body while the handler runs
	rw := ctx.Writer
	crw := newCaptureResponseWriter(rw)
	ctx.Writer = crw

	ctx.Header("Content-Type", "application/json")

	// ↑ before the handler

	ctx.Next()

	// ↓ after the handler

	ctx.Writer = rw
	// NB: so far, the actual response body is still empty

	if ctx.Writer.Status() >= http.StatusBadRequest { //nolint:nestif
		// error => parse the body, modify it, and write it to the actual response
		var errorBody errorMessage
		if err := json.Unmarshal(crw.body.Bytes(), &errorBody); err != nil || errorBody.Code == "" {
			slog.InfoContext(
				ctx,
				"data API failure (not in PostgREST format)",
				"error", crw.body.String(),
			)
			errorBody.Code = fmt.Sprintf("HTTP%d", ctx.Writer.Status())
			errorBody.Message = http.StatusText(ctx.Writer.Status())
		}

		// general error message rewrites to hide the default PostgREST ones
		switch ctx.Request.Method {
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

		ctx.JSON(ctx.Writer.Status(), errorBody)
		slog.InfoContext(
			ctx,
			"data API failure",
			"code", errorBody.Code,
			"message", errorBody.Message,
			"detail", errorBody.Detail,
			"hint", errorBody.Hint,
		)
	} else {
		// no error => just write the body to the actual response
		ctx.Writer.WriteHeaderNow()
		ctx.Writer.Write(crw.body.Bytes()) //nolint:errcheck,gosec
	}
}
