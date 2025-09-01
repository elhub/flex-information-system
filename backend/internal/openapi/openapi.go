package openapi

import (
	"encoding/json"
	"net/http"
)

type openAPIserver struct {
	// URL is the URL of the server.
	URL string `json:"url"`
	// Description is an optional description of the server.
	Description string `json:"description,omitempty"`
}

// ReplaceServers replaces the "servers" field in the given JSON data with a single server.
func replaceServers(jsonData []byte, server openAPIserver) []byte {
	// We are not checking for errors here since we assume the input JSON is well-formed.
	var data map[string]any
	json.Unmarshal(jsonData, &data) //nolint:errcheck
	data["servers"] = []openAPIserver{server}

	updatedJSON, _ := json.Marshal(data) //nolint:errchkjson

	return updatedJSON
}

// HandlerFunc returns an HTTP handlerfunc that serves the OpenAPI document with the specified server URL and description.
func HandlerFunc(openAPIInput []byte, url string, description string) http.HandlerFunc {
	return func(w http.ResponseWriter, _ *http.Request) {
		server := openAPIserver{
			URL:         url,
			Description: description,
		}
		document := replaceServers(openAPIInput, server)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(document)
	}
}
