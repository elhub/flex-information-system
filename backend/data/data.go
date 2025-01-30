package data

import (
	"flex/pgpool"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// API holds the data API handlers.
type API struct {
	baseURL      string
	postgRESTURL *url.URL
	db           *pgpool.Pool
	ctxKey       string
}

// NewAPI creates a new data.API instance.
func NewAPI(baseURL string, postgRESTUpstream string, db *pgpool.Pool, ctxKey string) *API {
	postgRESTURL, err := url.Parse(postgRESTUpstream)
	if err != nil {
		panic(err)
	}

	return &API{
		baseURL:      baseURL,
		postgRESTURL: postgRESTURL,
		db:           db,
		ctxKey:       ctxKey,
	}
}

// TODO: put in common with auth.
type errorMessage struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Detail  string `json:"details,omitempty"`
	Hint    string `json:"hint,omitempty"`
}

func newErrorMessage(httpStatusCode int, detail string, err error) errorMessage {
	hint := ""
	if err != nil {
		hint = err.Error()
	}
	return errorMessage{
		Code:    "HTTP" + strconv.Itoa(httpStatusCode),
		Message: http.StatusText(httpStatusCode),
		Detail:  detail,
		Hint:    hint,
	}
}

// PostgRESTHandler forwards the request to the PostgREST API.
func (data *API) PostgRESTHandler(ctx *gin.Context) {
	url, hasPrefix := strings.CutPrefix(ctx.Request.URL.Path, "/api/v0")
	if !hasPrefix {
		ctx.AbortWithStatusJSON(http.StatusNotFound, newErrorMessage(
			http.StatusNotFound, "Not Found", nil,
		))
	}

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
