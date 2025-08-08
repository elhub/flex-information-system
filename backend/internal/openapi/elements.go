package openapi

import (
	_ "embed"
	"html/template"
	"net/http"
)

//go:embed templates/index.tmpl
var indexTemplate string

// ElementsHandlerFunc returns an HTTP handler that serves the elements page with the given title.
func ElementsHandlerFunc(title string) http.HandlerFunc {
	indexHTML := template.Must(template.New("index").Parse(indexTemplate))

	return func(w http.ResponseWriter, _ *http.Request) {
		data := struct {
			Title string
		}{
			Title: title,
		}
		err := indexHTML.Execute(w, data)
		if err != nil {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
	}
}
