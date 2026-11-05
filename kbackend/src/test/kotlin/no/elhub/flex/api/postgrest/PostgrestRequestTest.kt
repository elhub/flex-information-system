package no.elhub.flex.api.postgrest

import arrow.core.Either
import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import no.elhub.flex.api.auth.AnonymousScopes
import no.elhub.flex.api.auth.Scope
import no.elhub.flex.api.auth.ScopeVerb

private val relations: EmbedRelations = mapOf(
    "controllable_unit" to mapOf("accounting_point" to "accounting_point"),
    "event" to mapOf("accounting_point" to "accounting_point"),
)

private val manageData = listOf(Scope(ScopeVerb.Manage, "data"))

private fun build(
    method: HttpMethod,
    path: String,
    query: Query = newQuery(),
    scopes: List<Scope> = manageData,
    extraHeaders: Map<String, String> = emptyMap(),
): Either<RequestRejection, PostgrestRequest> =
    buildPostgrestRequest(method, path, query, scopes, extraHeaders, relations)

class PostgrestRequestTest :
    FunSpec({
        context("defaultRequiredScope") {
            test("GET requires read on the path") {
                defaultRequiredScope(HttpMethod.Get, "/controllable_unit/12") shouldBe
                    Scope(ScopeVerb.Read, "data:controllable_unit:12")
            }

            test("other methods require manage") {
                defaultRequiredScope(HttpMethod.Patch, "/controllable_unit/12") shouldBe
                    Scope(ScopeVerb.Manage, "data:controllable_unit:12")
                defaultRequiredScope(HttpMethod.Post, "/controllable_unit/") shouldBe
                    Scope(ScopeVerb.Manage, "data:controllable_unit")
                defaultRequiredScope(HttpMethod.Delete, "/party_membership/3") shouldBe
                    Scope(ScopeVerb.Manage, "data:party_membership:3")
            }

            test("anonymous callers can read data but not manage it") {
                AnonymousScopes.any { it.covers(defaultRequiredScope(HttpMethod.Get, "/product_type")) } shouldBe true
                AnonymousScopes.any { it.covers(defaultRequiredScope(HttpMethod.Post, "/party")) } shouldBe false
            }
        }

        context("buildPostgrestRequest") {
            test("a plain list request is passed on as is") {
                val request = build(HttpMethod.Get, "/controllable_unit", newQuery().also { it.add("name", "eq.x") })
                    .shouldBeRight()

                request.path shouldBe "/controllable_unit"
                request.query shouldBe mapOf("name" to listOf("eq.x"))
                request.headers shouldBe emptyMap()
            }

            test("a single-id request becomes a filter on id asking for one object") {
                val request = build(HttpMethod.Get, "/controllable_unit/12").shouldBeRight()

                request.path shouldBe "/controllable_unit"
                request.query shouldBe mapOf("id" to listOf("eq.12"))
                request.headers shouldBe mapOf("Accept" to "application/vnd.pgrst.object+json")
            }

            test("a non-numeric id is not rewritten") {
                val request = build(HttpMethod.Get, "/controllable_unit/abc").shouldBeRight()

                request.path shouldBe "/controllable_unit/abc"
                request.query shouldBe emptyMap()
            }

            test("POST and PATCH ask for the created or updated object") {
                for (method in listOf(HttpMethod.Post, HttpMethod.Patch)) {
                    build(method, "/controllable_unit").shouldBeRight().headers shouldBe mapOf(
                        "Accept" to "application/vnd.pgrst.object+json",
                        "Prefer" to "return=representation",
                    )
                }
            }

            test("DELETE by id asks for one object but no representation") {
                build(HttpMethod.Delete, "/party_membership/3").shouldBeRight().let {
                    it.path shouldBe "/party_membership"
                    it.query shouldBe mapOf("id" to listOf("eq.3"))
                    it.headers shouldBe mapOf("Accept" to "application/vnd.pgrst.object+json")
                }
            }

            test("embed becomes select") {
                val request = build(
                    HttpMethod.Get,
                    "/controllable_unit/12",
                    newQuery().also { it.add("embed", "accounting_point") },
                    listOf(Scope(ScopeVerb.Read, "data")),
                ).shouldBeRight()

                request.query["select"] shouldBe listOf("*,accounting_point(*)")
            }

            test("embed needs read scope on the embedded resource") {
                val failure = build(
                    HttpMethod.Get,
                    "/controllable_unit",
                    newQuery().also { it.add("embed", "accounting_point") },
                    listOf(Scope(ScopeVerb.Read, "data:controllable_unit")),
                ).shouldBeLeft()

                failure.status shouldBe HttpStatusCode.Forbidden
            }

            test("valid_at and as_of are rewritten, also with an invalid value rejected") {
                val query = newQuery().also {
                    it.add("valid_at", "2024-01-15T10:30:00Z")
                    it.add("as_of", "2024-01-16T10:30:00Z")
                }
                build(HttpMethod.Get, "/controllable_unit", query).shouldBeRight().query["and"]?.size shouldBe 2

                build(HttpMethod.Get, "/controllable_unit", newQuery().also { it.add("valid_at", "yesterday") })
                    .shouldBeLeft().status shouldBe HttpStatusCode.BadRequest
            }

            test("extra headers are added") {
                build(HttpMethod.Get, "/x", extraHeaders = mapOf("Accept-Profile" to "attachment"))
                    .shouldBeRight().headers shouldBe mapOf("Accept-Profile" to "attachment")
            }

            test("event functions embed from event") {
                val request = build(
                    HttpMethod.Get,
                    "/rpc/event_source",
                    newQuery().also { it.add("embed", "accounting_point") },
                    listOf(Scope(ScopeVerb.Read, "data")),
                ).shouldBeRight()

                request.query["select"] shouldBe listOf("*,accounting_point(*)")
            }
        }

        context("variants") {
            test("event source and subject filters are rewritten to the functions") {
                val query = newQuery().also {
                    it.add("source", "eq./controllable_unit/5")
                    it.add("type", "eq.x")
                }
                val (path, _) = EventListVariant.prepare("/event", query)

                path shouldBe "/rpc/event_source"
                query shouldBe mapOf(
                    "type" to listOf("eq.x"),
                    "source_resource" to listOf("controllable_unit"),
                    "source_id" to listOf("5"),
                )

                val subjectQuery = newQuery().also { it.add("subject", "eq./party/9") }
                EventListVariant.prepare("/event", subjectQuery).first shouldBe "/rpc/event_subject"
                subjectQuery shouldBe mapOf("subject_resource" to listOf("party"), "subject_id" to listOf("9"))
            }

            test("other event filters pass through") {
                val query = newQuery().also { it.add("source", "eq.something") }
                EventListVariant.prepare("/event", query).first shouldBe "/event"
                query shouldBe mapOf("source" to listOf("eq.something"))
            }

            test("attachment listing requires the application") {
                val variant = AttachmentReadVariant("a_attachment", "application_id")

                variant.validate(newQuery())?.status shouldBe HttpStatusCode.BadRequest
                variant.validate(newQuery().also { it.add("application_id", "eq.1") }) shouldBe null
                variant.requiredScope(HttpMethod.Get, "/a_attachment") shouldBe
                    Scope(ScopeVerb.Read, "attachment:a_attachment")
                variant.prepare("/a_attachment", newQuery()).second shouldBe mapOf("Accept-Profile" to "attachment")
            }
        }
    })
