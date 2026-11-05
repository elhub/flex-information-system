package no.elhub.flex.api.postgrest

import io.ktor.http.HttpStatusCode
import no.elhub.flex.api.auth.BearerChallenge
import no.elhub.flex.api.auth.Scope
import no.elhub.flex.api.auth.ScopeVerb
import no.elhub.flex.api.auth.covers

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

internal class EmbedException(message: String) : Exception(message)

/**
 * Parses `?embed`, checks that [scopes] cover reading each embedded resource under [asset]
 * (for example `data`), and rewrites `?embed` into the equivalent PostgREST `?select` in-place.
 *
 * Returns a [RequestRejection] if the request must be rejected, `null` otherwise.
 */
fun applyEmbed(
    query: Query,
    mainResource: String,
    asset: String,
    relations: EmbedRelations,
    scopes: List<Scope>,
): RequestRejection? {
    val nodes = try {
        parseEmbed(query.first("embed"))
    } catch (e: EmbedException) {
        return RequestRejection(HttpStatusCode.BadRequest, "malformed embed parameter: ${e.message}")
    }

    try {
        validateRelations(mainResource, nodes, relations)
    } catch (e: EmbedException) {
        return RequestRejection(HttpStatusCode.BadRequest, e.message.orEmpty())
    }

    for (resource in resourceNames(mainResource, nodes, relations)) {
        val required = Scope(ScopeVerb.Read, "$asset:$resource")
        if (!scopes.covers(required)) {
            return RequestRejection(
                HttpStatusCode.Forbidden,
                "insufficient scope for embedded resource: $resource",
                wwwAuthenticate = BearerChallenge.insufficientScope(required),
            )
        }
    }

    applyRewrite(query, nodes)
    return null
}

/**
 * Parses the embed parameter, e.g. `related_table!(subrelation1!,subrelation2(subsubrelation))`.
 * An absent or empty parameter gives an empty list.
 */
internal fun parseEmbed(value: String?): List<EmbedNode> {
    if (value.isNullOrEmpty()) return emptyList()

    val normalized = value.lowercase().replace(" ", "")
    val (nodes, rest) = parseEmbedList(normalized)
    if (rest.isNotEmpty()) throw EmbedException("unexpected characters after embed expression: \"$rest\"")
    return nodes
}

/** Replaces `select` by the PostgREST expression for [nodes], e.g. `*,related_table!inner(*)`. */
internal fun applyRewrite(query: Query, nodes: List<EmbedNode>) {
    query.remove("select")
    if (nodes.isEmpty()) return

    query.set("select", "*," + emitEmbedList(nodes))
    query.remove("embed")
}

/** Checks that every node exists as a relation of its parent resource. */
internal fun validateRelations(parentResource: String, nodes: List<EmbedNode>, relations: EmbedRelations) {
    for (node in nodes) {
        val actual = relations[parentResource]?.get(node.name)
            ?: throw EmbedException("unknown embed relation: \"${node.name}\" is not embeddable from \"$parentResource\"")

        if (node.children.isNotEmpty()) validateRelations(actual, node.children, relations)
    }
}

/** All distinct resources appearing in the embed tree, resolved through [relations]. */
internal fun resourceNames(parentResource: String, nodes: List<EmbedNode>, relations: EmbedRelations): Set<String> {
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

private fun parseEmbedList(input: String): Pair<List<EmbedNode>, String> {
    if (input.isEmpty()) throw EmbedException("expected embed expression, got empty string")

    val nodes = mutableListOf<EmbedNode>()
    val first = parseEmbedNode(input)
    nodes += first.first
    var rest = first.second

    while (rest.startsWith(",")) {
        rest = rest.substring(1)
        if (rest.isEmpty() || rest[0] == ')') throw EmbedException("expected embed node after comma")

        val next = parseEmbedNode(rest)
        nodes += next.first
        rest = next.second
    }

    return nodes to rest
}

/** Parses `identifier ('!')? ('(' node_list ')')?`. */
private fun parseEmbedNode(input: String): Pair<EmbedNode, String> {
    val (name, afterName) = parseIdentifier(input)
    var rest = afterName

    val joinHint = rest.startsWith("!")
    if (joinHint) rest = rest.substring(1)

    if (!rest.startsWith("(")) return EmbedNode(name, joinHint, emptyList()) to rest

    val (children, afterChildren) = parseEmbedList(rest.substring(1))
    if (!afterChildren.startsWith(")")) {
        throw EmbedException("expected ')' to close embed sub-expression, got \"$afterChildren\"")
    }

    return EmbedNode(name, joinHint, children) to afterChildren.substring(1)
}

private fun parseIdentifier(input: String): Pair<String, String> {
    if (input.isEmpty()) throw EmbedException("expected identifier, got empty string")

    val length = input.takeWhile { it in 'a'..'z' || it == '_' }.length
    if (length == 0) throw EmbedException("unexpected character at start of identifier: \"${input[0]}\"")

    return input.substring(0, length) to input.substring(length)
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
