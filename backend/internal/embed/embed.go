// Package embed provides helpers for handling the ?embed query parameter.
//
// The ?embed parameter is a convenience layer on top of PostgREST's ?select
// mechanism. It allows callers to request related resources by name without
// having to know the PostgREST embedding syntax, and gives the backend a place
// to verify that the caller holds the required scopes for every embedded resource.
//
// Usage:
//
//	ok := embed.Handle(ctx, w, query, mainResource, "grid", embed.Relations(embedRelations), writeError)
package embed

import (
	"context"
	"errors"
	"flex/auth"
	"flex/auth/scope"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"strings"
)

// Relations maps (parent resource → embed name → actual resource name).
// It is generated from the resources YAML by openapi_to_embed_relations.py.
type Relations map[string]map[string]string

// WriteErrorFunc writes an HTTP error response to w with the given status and message.
type WriteErrorFunc func(w http.ResponseWriter, status int, message string)

// Handle is the single entry point for embed processing. It:
//  1. Parses the ?embed parameter from query.
//  2. Checks that the caller's scopes cover every embedded resource
//     (using asset as the scope asset prefix, e.g. "data" or "grid").
//  3. Rewrites ?embed into the equivalent PostgREST ?select expression in-place.
//
// Returns true if processing succeeded (or there was nothing to embed).
// Returns false if an error was already written to w.
func Handle(
	ctx context.Context,
	w http.ResponseWriter,
	query url.Values,
	mainResource string,
	asset string,
	relations Relations,
	writeError WriteErrorFunc,
) bool {
	nodes, err := parseEmbed(query)
	if err != nil {
		slog.WarnContext(ctx, "malformed embed query parameter", "error", err)
		writeError(w, http.StatusBadRequest, "malformed embed parameter: "+err.Error())
		return false
	}

	if err := validateRelations(mainResource, nodes, relations); err != nil {
		slog.WarnContext(ctx, "unknown embed relation", "error", err)
		writeError(w, http.StatusBadRequest, err.Error())
		return false
	}

	if !checkScopes(ctx, w, nodes, mainResource, asset, relations, writeError) {
		return false
	}

	applyRewrite(query, nodes)
	return true
}

// --- unexported types and helpers ---

// embedNode represents a parsed node in an embed expression.
type embedNode struct {
	name     string
	joinHint bool // true when '!' appeared after the identifier
	children []embedNode
}

var (
	errEmptyEmbed            = errors.New("expected embed expression, got empty string")
	errMissingNodeAfterComma = errors.New("expected embed node after comma")
	errMissingCloseParen     = errors.New("expected ')' to close embed sub-expression")
	errEmptyIdentifier       = errors.New("expected identifier, got empty string")
	errUnexpectedChars       = errors.New("unexpected characters after embed expression")
	errInvalidIdentChar      = errors.New("unexpected character at start of identifier")
	errUnknownEmbed          = errors.New("unknown embed relation")
)

// parseEmbed parses the embed query parameter into a list of embed nodes.
// It returns an empty list if the embed parameter is empty or absent.
//
// The input format should be like
//
//	?embed=related_table!(subrelation1!,subrelation2(subsubrelation))
//
// and it will be parsed to
//
//	[]embedNode{
//		{
//			name: "related_table",
//			joinHint: true,
//			children: []embedNode{
//				{
//					name: "subrelation1",
//					joinHint: true,
//				},
//				{
//					name: "subrelation2",
//					children: []embedNode{
//						{name: "subsubrelation"},
//					},
//				},
//			},
//		},
//	}
func parseEmbed(query url.Values) ([]embedNode, error) {
	embedVal := query.Get("embed")
	if embedVal == "" {
		return []embedNode{}, nil
	}

	embedVal = strings.ToLower(embedVal)
	embedVal = strings.ReplaceAll(embedVal, " ", "")

	nodes, rest, err := parseEmbedList(embedVal)
	if err != nil {
		return nil, err
	}

	if rest != "" {
		return nil, fmt.Errorf("%w: %q", errUnexpectedChars, rest)
	}

	return nodes, nil
}

// applyRewrite rewrites the select query parameter into the PostgREST format,
// using the parsed embed nodes.
//
// For example, given the embed nodes corresponding to
//
//	?embed=related_table!(subrelation1!,subrelation2(subsubrelation))
//
// it will set the select parameter to
//
//	?select=*,related_table!inner(*,subrelation1!inner(*),subrelation2(*,subsubrelation(*)))
func applyRewrite(query url.Values, nodes []embedNode) {
	query.Del("select")

	if len(nodes) == 0 {
		return
	}

	query.Set("select", "*,"+emitEmbedList(nodes))
	query.Del("embed")
}

// validateRelations checks that every embed node name exists in the relations map for its parent resource.
func validateRelations(parentResource string, nodes []embedNode, relations Relations) error {
	for _, node := range nodes {
		parentRelations, ok := relations[parentResource]
		if !ok {
			return fmt.Errorf("%w: %q is not embeddable from %q", errUnknownEmbed, node.name, parentResource)
		}

		actual, ok := parentRelations[node.name]
		if !ok {
			return fmt.Errorf("%w: %q is not embeddable from %q", errUnknownEmbed, node.name, parentResource)
		}

		if len(node.children) > 0 {
			if err := validateRelations(actual, node.children, relations); err != nil {
				return err
			}
		}
	}

	return nil
}

// resourceNames returns the list of all unique resource names appearing in the embed node tree.
// This allows checking that the caller has the required scopes to read every embedded resource.
//
// Based on the embedRelations mapping generated from the resources YAML.
func resourceNames(parentResource string, nodes []embedNode, relations Relations) []string {
	seen := make(map[string]struct{})

	var collect func(parent string, nodes []embedNode)
	collect = func(parent string, nodes []embedNode) {
		// embedding name -> actual resource
		for _, node := range nodes {
			actual := node.name
			if resolved, ok := relations[parent][node.name]; ok {
				actual = resolved
			}
			seen[actual] = struct{}{}
			collect(actual, node.children)
		}
	}

	collect(parentResource, nodes)

	names := make([]string, 0, len(seen))
	for name := range seen {
		names = append(names, name)
	}

	return names
}

func checkScopes(
	ctx context.Context,
	w http.ResponseWriter,
	embedNodes []embedNode,
	mainResource string,
	asset string,
	relations Relations,
	writeError WriteErrorFunc,
) bool {
	if len(embedNodes) == 0 {
		return true
	}

	rd, err := auth.RequestDetailsFromContext(ctx)
	if err != nil {
		slog.ErrorContext(ctx, "no request details in context", "error", err)
		writeError(w, http.StatusInternalServerError, "internal server error")
		return false
	}

	requestScope := rd.Scope()

	for _, resource := range resourceNames(mainResource, embedNodes, relations) {
		requiredScope := scope.Scope{Verb: scope.Read, Asset: asset + ":" + resource}
		if !requestScope.Covers(requiredScope) {
			slog.DebugContext(ctx, "insufficient scope for embedded resource",
				"required_scope", requiredScope.String(),
				"scope", requestScope.String(),
				"embedded_resource", resource,
			)
			writeError(w, http.StatusForbidden, "insufficient scope for embedded resource: "+resource)
			return false
		}
	}

	return true
}

// parseEmbedList parses a comma-separated list of embed nodes from input.
// It returns the parsed nodes and the remaining (unconsumed) string.
func parseEmbedList(input string) ([]embedNode, string, error) {
	if input == "" {
		return nil, input, errEmptyEmbed
	}

	var nodes []embedNode

	node, rest, err := parseEmbedNode(input)
	if err != nil {
		return nil, input, err
	}

	nodes = append(nodes, node)

	for strings.HasPrefix(rest, ",") {
		rest = rest[1:]
		if rest == "" || rest[0] == ')' {
			return nil, rest, errMissingNodeAfterComma
		}

		node, rest, err = parseEmbedNode(rest)
		if err != nil {
			return nil, rest, err
		}

		nodes = append(nodes, node)
	}

	return nodes, rest, nil
}

// parseEmbedNode parses a single embed node from input. The syntax is:
//
//	node = identifier ('!')? ('(' node_list ')')?
//
// The '!' join hint and the '(' sub-relation list are independent optional parts.
func parseEmbedNode(input string) (embedNode, string, error) {
	name, rest, err := parseIdentifier(input)
	if err != nil {
		return embedNode{}, input, err
	}

	var joinHint bool
	if strings.HasPrefix(rest, "!") {
		joinHint = true
		rest = rest[1:]
	}

	if !strings.HasPrefix(rest, "(") {
		return embedNode{name: name, joinHint: joinHint}, rest, nil //nolint:exhaustruct
	}

	rest = rest[1:]

	// consume the '('
	children, rest, err := parseEmbedList(rest)
	if err != nil {
		return embedNode{}, rest, err
	}

	if !strings.HasPrefix(rest, ")") {
		return embedNode{}, rest, fmt.Errorf("%w, got %q", errMissingCloseParen, rest)
	}

	// consume the ')'
	rest = rest[1:]

	return embedNode{name: name, joinHint: joinHint, children: children}, rest, nil
}

// parseIdentifier reads a valid identifier ([a-z_]*) from the
// start of input and returns it together with the remaining string.
func parseIdentifier(input string) (string, string, error) {
	if input == "" {
		return "", input, errEmptyIdentifier
	}

	pos := 0
	for pos < len(input) {
		if isIdentChar(input[pos]) {
			pos++
		} else {
			break
		}
	}

	if pos == 0 {
		return "", input, fmt.Errorf("%w: %q", errInvalidIdentChar, string(input[0]))
	}

	return input[:pos], input[pos:], nil
}

func isIdentChar(c byte) bool {
	return (c >= 'a' && c <= 'z') || c == '_'
}

// emitEmbedList converts a list of embed nodes into a PostgREST select expression.
func emitEmbedList(nodes []embedNode) string {
	parts := make([]string, len(nodes))
	for idx, node := range nodes {
		parts[idx] = emitEmbedNode(node)
	}

	return strings.Join(parts, ",")
}

// emitEmbedNode converts a single embed node into a PostgREST select expression.
// The join hint (!inner) and the sub-relation list ((*,...)) are emitted independently:
//
//	no hint, no children  → name(*)
//	hint only             → name!inner(*)
//	children only         → name(*,children)
//	hint and children     → name!inner(*,children)
func emitEmbedNode(node embedNode) string {
	result := node.name

	if node.joinHint {
		result += "!inner"
	}

	if len(node.children) > 0 {
		result += "(*," + emitEmbedList(node.children) + ")"
	} else {
		result += "(*)"
	}

	return result
}
