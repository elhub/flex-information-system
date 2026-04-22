package data

import (
	"errors"
	"fmt"
	"net/url"
	"strings"
)

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
)

// embedQueryRewrite rewrites the query parameters of the request to match the PostgREST format.
// the input format should be like
//
//	?embed=related_table!(subrelation1!,subrelation2(subsubrelation))
//
// and it will be rewritten into
//
//	?select=*,related_table!inner(*,subrelation1!inner,subrelation2(*,subsubrelation))
func embedQueryRewrite(query url.Values) error {
	query.Del("select")

	embed := query.Get("embed")
	if embed == "" {
		return nil
	}

	// strip all whitespace before parsing
	embed = strings.ReplaceAll(embed, " ", "")

	nodes, rest, err := parseEmbedList(embed)
	if err != nil {
		return err
	}

	if rest != "" {
		return fmt.Errorf("%w: %q", errUnexpectedChars, rest)
	}

	query.Set("select", "*,"+emitEmbedList(nodes))
	query.Del("embed")

	return nil
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

	// consume the '('
	rest = rest[1:]

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

// parseIdentifier reads a valid identifier ([a-zA-Z_][a-zA-Z0-9_]*) from the
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
	return (c >= 'a' && c <= 'z') ||
		(c >= 'A' && c <= 'Z') ||
		(c >= '0' && c <= '9') ||
		c == '_'
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
//	no hint, no children  → name
//	hint only             → name!inner
//	children only         → name(*,children)
//	hint and children     → name!inner(*,children)
func emitEmbedNode(node embedNode) string {
	result := node.name

	if node.joinHint {
		result += "!inner"
	}

	if len(node.children) > 0 {
		result += "(*," + emitEmbedList(node.children) + ")"
	}

	return result
}
