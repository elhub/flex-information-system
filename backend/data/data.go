package data

import (
	"bytes"
	"flex/pgpool"
	"fmt"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"

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

// Custom implementation of ResponseWriter keeping a copy of the response body.
type responseWriterWithBody struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (rw responseWriterWithBody) Write(b []byte) (int, error) {
	rw.body.Write(b)
	return rw.ResponseWriter.Write(b) //nolint:wrapcheck
}

// ErrorMessageMiddleware returns a middleware that logs the error messages, and
// possibly rewrites them when not informative enough.
func (data *API) ErrorMessageMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// change the writer to capture the response body while the handler runs
		rwb := &responseWriterWithBody{
			body:           bytes.NewBufferString(""),
			ResponseWriter: ctx.Writer,
		}
		ctx.Writer = rwb

		// ↑ before the handler

		ctx.Next()

		// ↓ after the handler

		if ctx.Writer.Status() >= http.StatusBadRequest { // 400+
			slog.InfoContext(ctx, "data API failure: "+rwb.body.String())
		}
	}
}
