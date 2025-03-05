package server

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

// custom response type

type response struct {
	header     http.Header
	statusCode *int
	body       *bytes.Buffer
}

// response can act as a responsewriter that actually fills itself.
var _ http.ResponseWriter = &response{}

func newResponse() *response {
	return &response{
		header:     make(http.Header),
		statusCode: new(int),
		body:       bytes.NewBufferString(""),
	}
}

func (r *response) Header() http.Header {
	return r.header
}

func (r *response) WriteHeader(statusCode int) {
	*r.statusCode = statusCode
}

func (r *response) Write(b []byte) (int, error) {
	return r.body.Write(b) //nolint:wrapcheck
}

// custom error type for API spec compatibility

type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Detail  string `json:"details,omitempty"`
	Hint    string `json:"hint,omitempty"`
}

// -----------------------------------------------------------------------------

// custom handler type

type handler struct {
	handle func(*http.Request) (response, *apiError)
}

func NewHandler(h func(*http.Request) (response, *apiError)) handler {
	return handler{handle: h}
}

func NewHandlerFromStdHandler(stdH http.Handler) handler {
	return NewHandler(
		func(req *http.Request) (response, *apiError) {
			// fill a custom response with the standard handler and check for errors
			r := newResponse()
			stdH.ServeHTTP(r, req)
			if *r.statusCode >= http.StatusBadRequest {
				return *r, &apiError{
					Code:    fmt.Sprintf("HTTP%d", *r.statusCode),
					Message: r.body.String(),
				}
			}
			return *r, nil
		},
	)
}

// make the handler act as a standard handler.
func (h handler) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	r, e := h.handle(req)

	header := w.Header()
	for k, v := range r.header {
		header[k] = v
	}
	w.WriteHeader(*r.statusCode)

	var body []byte
	if e != nil {
		header.Set("Content-Type", "application/json")
		body, _ = json.Marshal(e)
	} else {
		body = r.body.Bytes()
	}
	w.Write(body)
}

// -----------------------------------------------------------------------------

// custom middleware type

type middleware struct {
	adaptHandler func(handler) handler
}

func NewMiddleware(m func(handler) handler) middleware {
	return middleware{adaptHandler: m}
}

func NewMiddlewareFromStdMiddleware(m func(http.Handler) http.Handler) middleware {
	return NewMiddleware(
		func(h handler) handler {
			// m sees h as a standard handler because it implements the interface
			return NewHandlerFromStdHandler(m(h))
		},
	)
}

// make the middleware act as a standard middleware.
func (m middleware) ToStdMiddleware() func(http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		// the return value can be seen as a standard handler as well
		return m.adaptHandler(NewHandlerFromStdHandler(h))
	}
}

// -----------------------------------------------------------------------------

// TODO
// custom router/server type using custom handler/middleware
