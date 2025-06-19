package auth

import (
	_ "embed"
	"flex/internal/openapi"
	"net/http"
)

//go:embed static/openapi.json
var openAPIInput []byte

// OpenAPIHandlerFunc returns an HTTP handler function that serves the OpenAPI document
// with the specified server URL and description.
func OpenAPIHandlerFunc(url string, description string) http.HandlerFunc {
	return openapi.HandlerFunc(openAPIInput, url, description)
}
