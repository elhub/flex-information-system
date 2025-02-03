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
	url := ctx.Param("url")

	proxy := httputil.NewSingleHostReverseProxy(data.postgRESTURL)
	proxy.Director = func(req *http.Request) {
		req.Header = ctx.Request.Header
		req.Host = data.postgRESTURL.Host
		req.URL.Scheme = data.postgRESTURL.Scheme
		req.URL.Host = data.postgRESTURL.Host
		req.URL.Path = url
	}

	proxy.ServeHTTP(ctx.Writer, ctx.Request)
}

// Custom implementation of ResponseWriter. This allows us to have access to the
// response body before it is written, and possibly change it.
type bodyResponseWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

// This override writes the body to the buffer instead of the response. All the
// other methods are left untouched, so the other parts of the response are
// written normally.
func (brw bodyResponseWriter) Write(b []byte) (int, error) {
	return brw.body.Write(b) //nolint:wrapcheck
}

// ErrorMessageMiddleware returns a middleware that logs the error messages, and
// possibly rewrites them when not informative enough.
func (data *API) ErrorMessageMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// change the writer to capture the response body while the handler runs
		rw := ctx.Writer
		brw := &bodyResponseWriter{
			body:           bytes.NewBufferString(""),
			ResponseWriter: rw,
		}
		ctx.Writer = brw

		// ↑ before the handler

		ctx.Next()

		// ↓ after the handler

		ctx.Writer = rw
		// NB: so far, the actual response body is still empty

		if ctx.Writer.Status() >= http.StatusBadRequest { //nolint:nestif
			// error => parse the body, modify it, and write it to the actual response
			var jsonBody gin.H
			if err := json.Unmarshal(brw.body.Bytes(), &jsonBody); err != nil {
				slog.InfoContext(ctx, "data API failure (not a JSON): "+brw.body.String())
				ctx.Writer.Write(brw.body.Bytes()) //nolint:errcheck,gosec
				return
			}

			// general error message rewrites to hide the default PostgREST ones
			errorMessage, _ := jsonBody["message"].(string)
			switch ctx.Request.Method {
			case http.MethodPatch:
				if strings.HasPrefix(errorMessage, "JSON object requested") {
					errorMessage = "User cannot update this resource"
				}
			case http.MethodPost:
				if strings.HasPrefix(errorMessage, "new row violates row-level security") {
					errorMessage = "User cannot create this resource"
				} else if strings.HasPrefix(errorMessage, "duplicate key value") {
					errorMessage = "Duplicate found, please try to update the existing resource instead"
				}
			}

			jsonBody["message"] = errorMessage
			ctx.JSON(ctx.Writer.Status(), jsonBody)
			slog.InfoContext(ctx, "data API failure: "+errorMessage)
		} else {
			// no error => just write the body to the actual response
			ctx.Writer.Write(brw.body.Bytes()) //nolint:errcheck,gosec
		}
	}
}
