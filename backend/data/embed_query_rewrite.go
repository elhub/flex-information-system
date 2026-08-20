package data

import (
	"context"
	"flex/internal/embed"
	"net/http"
	"net/url"
	"strings"
)

// handleEmbed parses ?embed, checks scopes for the data asset, and rewrites
// ?embed into a PostgREST ?select expression. Returns false if an error was
// already written to w.
func handleEmbed(ctx context.Context, w http.ResponseWriter, query url.Values, rawURL string) bool {
	mainResource := strings.TrimPrefix(rawURL, "/")
	if idx := strings.Index(mainResource, "/"); idx != -1 {
		mainResource = mainResource[:idx]
	}

	if mainResource == "rpc/event_source" {
		mainResource = "event" //nolint:goconst
	}

	return embed.Handle(
		ctx, w, query, mainResource, "data",
		embed.Relations(embedRelations),
		func(w http.ResponseWriter, status int, msg string) {
			writeErrorToResponseWriter(w, status, errorMessage{Message: msg}) //nolint:exhaustruct
		},
	)
}
