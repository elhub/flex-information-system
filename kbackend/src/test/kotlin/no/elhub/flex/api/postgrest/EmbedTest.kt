package no.elhub.flex.api.postgrest

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.datatest.withData
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.api.auth.Scope
import no.elhub.flex.api.auth.ScopeVerb

private val testRelations: EmbedRelations = mapOf(
    "controllable_unit" to mapOf(
        "accounting_point" to "accounting_point",
        "technical_resource" to "technical_resource",
    ),
    "controllable_unit_service_provider" to mapOf(
        "controllable_unit" to "controllable_unit",
        "service_provider" to "party",
        "end_user" to "party",
    ),
    "accounting_point" to mapOf(
        "metering_grid_area" to "accounting_point_metering_grid_area",
    ),
)

private fun node(name: String, joinHint: Boolean = false, vararg children: EmbedNode) =
    EmbedNode(name, joinHint, children.toList())

private fun queryOf(vararg pairs: Pair<String, String>): Query =
    newQuery().also { q -> pairs.forEach { (k, v) -> q.add(k, v) } }

class EmbedTest :
    FunSpec({
        context("parseEmbed") {
            withData(
                nameFn = { it.first },
                "empty" to ("" to emptyList()),
                "single resource" to ("a" to listOf(node("a"))),
                "join hint with sub-relation" to ("a!(b)" to listOf(node("a", true, node("b")))),
                "multiple top-level" to ("a,b" to listOf(node("a"), node("b"))),
                "bare join hint" to ("a!" to listOf(node("a", true))),
                "sub-relation without hint" to ("a(b)" to listOf(node("a", false, node("b")))),
                "combined" to ("a!,b(c)" to listOf(node("a", true), node("b", false, node("c")))),
                "whitespace and case are ignored" to (" A , B " to listOf(node("a"), node("b"))),
                "deeply nested" to (
                    "a!(b!(c!(d)))" to
                        listOf(node("a", true, node("b", true, node("c", true, node("d")))))
                    ),
            ) { (_, case) ->
                parseEmbed(case.first) shouldBe case.second
            }

            withData(
                nameFn = { "rejects '$it'" },
                "a!b",
                "a!(b",
                "a!(b,)",
                ",a",
                "a-a",
                "a!!(",
                "!(a)",
                "a!(b))",
            ) { input ->
                shouldThrow<EmbedException> { parseEmbed(input) }
            }
        }

        context("applyRewrite") {
            withData(
                nameFn = { it.first },
                "no nodes leaves no select" to ("" to ""),
                "simple" to ("related_table" to "*,related_table(*)"),
                "join hint and sub-relation" to ("order!(line_item)" to "*,order!inner(*,line_item(*))"),
                "multiple" to ("table_a,table_b" to "*,table_a(*),table_b(*)"),
                "deeply nested" to ("a!(b!(c!(d)))" to "*,a!inner(*,b!inner(*,c!inner(*,d(*))))"),
                "bare join hint" to ("table!" to "*,table!inner(*)"),
                "sub-relation without hint" to ("table(sub)" to "*,table(*,sub(*))"),
                "mixed" to ("table_a!,table_b(sub)" to "*,table_a!inner(*),table_b(*,sub(*))"),
            ) { (_, case) ->
                val query = queryOf("select" to "name,id", "embed" to case.first)
                applyRewrite(query, parseEmbed(case.first))

                query.first("select").orEmpty() shouldBe case.second
                // an empty embed parameter is left alone, otherwise it is consumed
                query.first("embed") shouldBe if (case.first.isEmpty()) "" else null
            }
        }

        context("resourceNames") {
            test("resolves embed names to resources at every level, without duplicates") {
                val nodes = listOf(
                    node("accounting_point", false, node("metering_grid_area")),
                    node("technical_resource"),
                )
                resourceNames("controllable_unit", nodes, testRelations)
                    .shouldContainExactly("accounting_point", "accounting_point_metering_grid_area", "technical_resource")
            }

            test("embeds resolving to the same resource are deduplicated") {
                resourceNames(
                    "controllable_unit_service_provider",
                    listOf(node("end_user"), node("service_provider")),
                    testRelations,
                ).shouldContainExactly("party")
            }
        }

        context("validateRelations") {
            test("accepts known nested relations") {
                validateRelations(
                    "controllable_unit",
                    listOf(node("accounting_point", false, node("metering_grid_area"))),
                    testRelations,
                )
            }

            test("rejects an unknown relation") {
                shouldThrow<EmbedException> {
                    validateRelations("controllable_unit", listOf(node("nonexistent")), testRelations)
                }.message shouldBe "unknown embed relation: \"nonexistent\" is not embeddable from \"controllable_unit\""
            }

            test("rejects an unknown nested relation") {
                shouldThrow<EmbedException> {
                    validateRelations(
                        "controllable_unit",
                        listOf(node("accounting_point", false, node("nonexistent"))),
                        testRelations,
                    )
                }
            }
        }

        context("applyEmbed") {
            val readData = listOf(Scope(ScopeVerb.Read, "data"))

            test("rewrites embed to select when scopes cover the embedded resources") {
                val query = queryOf("embed" to "accounting_point")
                applyEmbed(query, "controllable_unit", "data", testRelations, readData).shouldBeNull()
                query.first("select") shouldBe "*,accounting_point(*)"
            }

            test("rejects when an embedded resource is not covered, naming the resolved resource") {
                val query = queryOf("embed" to "service_provider")
                val failure = applyEmbed(
                    query,
                    "controllable_unit_service_provider",
                    "data",
                    testRelations,
                    listOf(Scope(ScopeVerb.Read, "data:controllable_unit_service_provider")),
                ).shouldNotBeNull()

                failure.status shouldBe HttpStatusCode.Forbidden
                failure.message shouldBe "insufficient scope for embedded resource: party"
            }

            test("rejects malformed embed") {
                val failure = applyEmbed(queryOf("embed" to "a!("), "controllable_unit", "data", testRelations, readData)
                    .shouldNotBeNull()

                failure.status shouldBe HttpStatusCode.BadRequest
                failure.message.startsWith("malformed embed parameter: ") shouldBe true
            }

            test("rejects unknown relation") {
                val failure = applyEmbed(queryOf("embed" to "nope"), "controllable_unit", "data", testRelations, readData)
                    .shouldNotBeNull()

                failure.status shouldBe HttpStatusCode.BadRequest
            }
        }
    })
