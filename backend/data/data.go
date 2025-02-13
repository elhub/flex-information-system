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
	// regexes for calls targeting a single ID and history pages, which are not
	// valid formats in PostgREST
	regexID := regexp.MustCompile("^/([a-z_]+)/([0-9]+)$")
	regexHistory := regexp.MustCompile("^/([a-z_]+)/([0-9]+)/history$")

	url := ctx.Param("url")
	query := ctx.Request.URL.Query()
	header := ctx.Request.Header

	// rewrite the URL and query to match the PostgREST format
	matchID := regexID.FindStringSubmatch(url)
	if matchID != nil {
		url = "/" + matchID[1]
		query.Set("id", "eq."+matchID[2])
		header.Set("Accept", "application/vnd.pgrst.object+json")
		slog.InfoContext(
			ctx,
			"API call targeting a single-ID record. Rewriting into PostgREST format.",
			"new url", url, "new query", query.Encode(),
		)
	} else {
		matchHistory := regexHistory.FindStringSubmatch(url)
		if matchHistory != nil {
			url = "/" + matchHistory[1] + "_history"
			query.Set(matchHistory[1]+"_id", "eq."+matchHistory[2])
			slog.InfoContext(
				ctx,
				"API call targeting a history resource. Rewriting into PostgREST format.",
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

// errorMessage is the format of PostgREST error messages.
type errorMessage struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Detail  string `json:"details,omitempty"`
	Hint    string `json:"hint,omitempty"`
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
			var errorBody errorMessage
			if err := json.Unmarshal(brw.body.Bytes(), &errorBody); err != nil {
				slog.InfoContext(
					ctx,
					"data API failure (not in PostgREST format)",
					"error", brw.body.String(),
				)
				ctx.Writer.Write(brw.body.Bytes()) //nolint:errcheck,gosec
				return
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
			ctx.Writer.Write(brw.body.Bytes()) //nolint:errcheck,gosec
		}
	}
}
