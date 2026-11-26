package no.elhub.flex.api.routes.entity

import arrow.core.left
import arrow.core.right
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.server.application.install
import io.ktor.server.testing.TestApplication
import io.mockk.clearMocks
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import no.elhub.flex.api.entity.db.EntityLookupResult
import no.elhub.flex.api.entity.db.EntityRepository
import no.elhub.flex.auth.plugin.configureAuthentication
import no.elhub.flex.auth.util.TEST_JWT_SECRET
import no.elhub.flex.auth.util.makeJwt
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureSerialization
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin

private fun body(
    type: String = "person",
    businessIdType: String = "email",
    businessId: String = "someone@example.com",
    name: String = "Some One",
) = """{"type":"$type","business_id_type":"$businessIdType","business_id":"$businessId","name":"$name"}"""

class EntityLookupTest :
    FunSpec({
        val repo = mockk<EntityRepository>()
        lateinit var app: TestApplication

        fun jwt(role: String = "flex_organisation", scope: String = "use:data:entity:lookup") =
            makeJwt(role = role, scope = scope)

        suspend fun lookup(token: String?, json: String) =
            app.client.post("/api/v1/entity/lookup") {
                token?.let { header("Authorization", "Bearer $it") }
                contentType(ContentType.Application.Json)
                setBody(json)
            }

        beforeSpec {
            app = TestApplication {
                application {
                    install(Tracing.plugin)
                    configureSerialization()
                    configureAuthentication(TEST_JWT_SECRET)
                    install(Koin) {
                        modules(
                            module {
                                single<EntityRepository> { repo }
                                single { EntityLookup(get()) }
                            }
                        )
                    }
                    entityRoutes()
                }
            }
        }

        afterSpec { app.stop() }

        beforeTest {
            clearMocks(repo)
            coEvery { with(any<FlexPrincipal>()) { repo.lookup(any(), any(), any(), any()) } } returns
                EntityLookupResult(entityId = 7, found = true).right()
        }

        test("an existing entity gives 200") {
            val response = lookup(jwt(), body())

            response.status shouldBe HttpStatusCode.OK
            response.bodyAsText() shouldBe """{"entity_id":7}"""
            coVerify {
                with(any<FlexPrincipal>()) { repo.lookup("someone@example.com", "Some One", "person", "email") }
            }
        }

        test("a created entity gives 201") {
            coEvery { with(any<FlexPrincipal>()) { repo.lookup(any(), any(), any(), any()) } } returns
                EntityLookupResult(entityId = 8, found = false).right()

            val response = lookup(jwt(role = "flex_flexibility_information_system_operator"), body())

            response.status shouldBe HttpStatusCode.Created
            response.bodyAsText() shouldBe """{"entity_id":8}"""
        }

        test("organisations are looked up by organisation number") {
            lookup(jwt(), body("organisation", "org", "123456789", "Org AS")).status shouldBe HttpStatusCode.OK
        }

        test("no token is unauthorized") {
            lookup(null, body()).status shouldBe HttpStatusCode.Unauthorized
        }

        test("a token without the scope is forbidden") {
            lookup(jwt(scope = "read:data"), body()).status shouldBe HttpStatusCode.Forbidden
        }

        test("roles other than organisation and operator are unauthorized") {
            val response = lookup(jwt(role = "flex_service_provider"), body())

            response.status shouldBe HttpStatusCode.Unauthorized
            response.bodyAsText() shouldContain "user cannot perform this operation"
            coVerify(exactly = 0) { with(any<FlexPrincipal>()) { repo.lookup(any(), any(), any(), any()) } }
        }

        context("validation") {
            listOf(
                body(type = "organisation") to "business_id_type 'email' is not valid for entity type 'organisation'",
                body(businessId = "not-an-email") to "email address is not valid",
                body(businessId = "Someone@Example.com") to "email address must be lowercase",
                body("organisation", "org", "12345", "Org") to "organisation number must be 9 digits long",
                body("organisation", "org", "023456789", "Org") to "organisation number must be 9 digits long",
                body(name = "") to "missing entity name",
            ).forEach { (json, message) ->
                test(message) {
                    val response = lookup(jwt(), json)

                    response.status shouldBe HttpStatusCode.BadRequest
                    response.bodyAsText() shouldContain message
                }
            }

            test("problems are reported together") {
                lookup(jwt(), body(businessId = "NOPE", name = "")).bodyAsText() shouldContain
                    "email address is not valid, email address must be lowercase, missing entity name"
            }

            test("unknown types and malformed bodies are bad requests") {
                lookup(jwt(), body(type = "robot")).status shouldBe HttpStatusCode.BadRequest
                lookup(jwt(), "not json").status shouldBe HttpStatusCode.BadRequest
            }
        }

        test("database failures are an internal server error") {
            coEvery { with(any<FlexPrincipal>()) { repo.lookup(any(), any(), any(), any()) } } returns
                DatabaseError("boom").left()

            val response = lookup(jwt(), body())

            response.status shouldBe HttpStatusCode.InternalServerError
            response.bodyAsText() shouldContain "An unexpected error occurred"
        }
    })
