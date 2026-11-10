package no.elhub.flex.api.postgrest

import arrow.core.raise.Raise
import arrow.core.raise.ensure
import arrow.core.raise.withError
import io.ktor.http.HttpStatusCode
import io.ktor.http.ParametersBuilder
import no.elhub.flex.auth.plugin.BearerChallenge
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.ScopeVerb
import no.elhub.flex.auth.scope.covers

/**
 * Maps (parent resource -> embed name -> actual resource name).
 *
 * Used for the `?embed` query parameter, a convenience layer on top of PostgREST's `?select`.
 * It allows callers to request related resources by name without knowing PostgREST's embedding syntax,
 * and lets us verify that the caller may read every embedded resource.
 */
typealias EmbedRelations = Map<String, Map<String, String>>

/** A parsed node of an embed expression. */
internal data class EmbedNode(
    val name: String,
    val joinHint: Boolean,
    val children: List<EmbedNode>,
)

/**
 * Parses `?embed`, checks that [scopes] cover reading each embedded resource under [asset]
 * (for example `data`), and rewrites `?embed` into the equivalent PostgREST `?select` in-place.
 *
 * Raises a [RequestRejection] if the request must be rejected.
 */
fun Raise<RequestRejection>.applyEmbed(
    query: ParametersBuilder,
    mainResource: String,
    asset: String,
    relations: EmbedRelations,
    scopes: List<Scope>,
) {
    val nodes = withError({ RequestRejection(HttpStatusCode.BadRequest, "malformed embed parameter: $it") }) {
        parseEmbed(query["embed"])
    }
    withError({ RequestRejection(HttpStatusCode.BadRequest, it) }) {
        validateRelations(mainResource, nodes, relations)
    }

    for (resource in embeddedResources(mainResource, nodes, relations)) {
        val required = Scope(ScopeVerb.Read, "$asset:$resource")
        ensure(scopes.covers(required)) {
            RequestRejection(
                HttpStatusCode.Forbidden,
                "insufficient scope for embedded resource: $resource",
                wwwAuthenticate = BearerChallenge.insufficientScope(required),
            )
        }
    }

    rewriteEmbedAsSelect(query, nodes)
}

/**
 * Parses the embed parameter, e.g. `related_table!(subrelation1!,subrelation2(subsubrelation))`.
 * An absent or empty parameter gives an empty list.
 */
internal fun Raise<String>.parseEmbed(value: String?): List<EmbedNode> {
    if (value.isNullOrEmpty()) return emptyList()

    val normalized = value.lowercase().replace(" ", "")
    val (nodes, rest) = parseEmbedList(normalized)
    if (rest.isNotEmpty()) raise("unexpected characters after embed expression: \"$rest\"")
    return nodes
}

/** Replaces `select` by the PostgREST expression for [nodes], e.g. `*,related_table!inner(*)`. */
internal fun rewriteEmbedAsSelect(query: ParametersBuilder, nodes: List<EmbedNode>) {
    query.remove("select")
    if (nodes.isEmpty()) return

    query.set("select", "*," + emitEmbedList(nodes))
    query.remove("embed")
}

/** Checks that every node exists as a relation of its parent resource. */
internal fun Raise<String>.validateRelations(parentResource: String, nodes: List<EmbedNode>, relations: EmbedRelations) {
    for (node in nodes) {
        val actual = relations[parentResource]?.get(node.name)
            ?: raise("unknown embed relation: \"${node.name}\" is not embeddable from \"$parentResource\"")

        if (node.children.isNotEmpty()) validateRelations(actual, node.children, relations)
    }
}

/** All distinct resources appearing in the embed tree, resolved through [relations]. */
internal fun embeddedResources(parentResource: String, nodes: List<EmbedNode>, relations: EmbedRelations): Set<String> {
    val seen = linkedSetOf<String>()

    fun collect(parent: String, level: List<EmbedNode>) {
        for (node in level) {
            val actual = relations[parent]?.get(node.name) ?: node.name
            seen += actual
            collect(actual, node.children)
        }
    }

    collect(parentResource, nodes)
    return seen
}

private fun Raise<String>.parseEmbedList(input: String): Pair<List<EmbedNode>, String> {
    if (input.isEmpty()) raise("expected embed expression, got empty string")

    val nodes = mutableListOf<EmbedNode>()
    val (first, afterFirst) = parseEmbedNode(input)
    nodes += first
    var rest = afterFirst

    while (rest.startsWith(",")) {
        rest = rest.substring(1)
        ensure(rest.isNotEmpty() && rest[0] != ')') { "expected embed node after comma" }

        val (next, afterNext) = parseEmbedNode(rest)
        nodes += next
        rest = afterNext
    }

    return nodes to rest
}

/** Parses `identifier ('!')? ('(' node_list ')')?`. */
private fun Raise<String>.parseEmbedNode(input: String): Pair<EmbedNode, String> {
    val (name, afterName) = parseIdentifier(input)
    var rest = afterName

    val joinHint = rest.startsWith("!")
    if (joinHint) rest = rest.substring(1)

    if (!rest.startsWith("(")) return EmbedNode(name, joinHint, emptyList()) to rest

    val (children, afterChildren) = parseEmbedList(rest.substring(1))
    ensure(afterChildren.startsWith(")")) {
        "expected ')' to close embed sub-expression, got \"$afterChildren\""
    }

    return EmbedNode(name, joinHint, children) to afterChildren.substring(1)
}

private fun Raise<String>.parseIdentifier(input: String): Pair<String, String> {
    ensure(input.isNotEmpty()) { "expected identifier, got empty string" }

    val name = input.takeWhile { it in 'a'..'z' || it == '_' }
    ensure(name.isNotEmpty()) { "unexpected character at start of identifier: \"${input[0]}\"" }

    return name to input.removePrefix(name)
}

private fun emitEmbedList(nodes: List<EmbedNode>): String = nodes.joinToString(",") { emitEmbedNode(it) }

/**
 * The join hint (`!inner`) and the sub-relations are emitted independently:
 * no hint, no children -> `name(*)`; hint -> `name!inner(*)`; children -> `name(*,children)`.
 */
private fun emitEmbedNode(node: EmbedNode): String {
    val hint = if (node.joinHint) "!inner" else ""
    val body = if (node.children.isEmpty()) "(*)" else "(*,${emitEmbedList(node.children)})"
    return node.name + hint + body
}
