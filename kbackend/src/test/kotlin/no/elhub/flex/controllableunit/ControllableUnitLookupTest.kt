package no.elhub.flex.controllableunit

import arrow.core.left
import arrow.core.right
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.server.application.install
import io.ktor.server.testing.TestApplication
import io.mockk.coEvery
import io.mockk.every
import io.mockk.mockk
import no.elhub.flex.auth.AccessToken
import no.elhub.flex.auth.FlexAuthentication
import no.elhub.flex.config.configureSerialization
import no.elhub.flex.controllableunit.db.ControllableUnitRepository
import no.elhub.flex.controllableunit.db.NotFoundError
import no.elhub.flex.controllableunit.lookup.ControllableUnitLookup
import no.elhub.flex.flexprivate.FlexPrivateService
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin
import java.util.Date

private const val TEST_SECRET = "test-secret-key-at-least-256-bits-long-for-hs256"

@Suppress("MagicNumber")
private fun makeJwt(role: String = "flex_service_provider", eid: String = "12345678901"): String =
    JWT.create()
        .withClaim("entity_id", 1)
        .withClaim("eid", eid)
        .withClaim("party_id", 1)
        .withClaim("role", role)
        .withArrayClaim("scope", arrayOf("use:data:controllable_unit:lookup"))
        .withExpiresAt(Date(System.currentTimeMillis() + 60_000))
        .sign(Algorithm.HMAC256(TEST_SECRET))

private fun testApp(repo: ControllableUnitRepository, flexPrivate: FlexPrivateService): TestApplication =
    TestApplication {
        application {
            install(FlexAuthentication) { jwtSecret = TEST_SECRET }
            configureSerialization()
            install(Koin) {
                modules(
                    module {
                        single<FlexPrivateService> { flexPrivate }
                        single<ControllableUnitRepository> { repo }
                        single { ControllableUnitLookup(get(), get()) }
                    },
                )
            }
            controllableUnitRoutes()
        }
    }

class ControllableUnitLookupTest :
    FunSpec({
        val mockRepo = mockk<ControllableUnitRepository>()
        val mockFlexPrivate = mockk<FlexPrivateService>()

        context("POST /controllable_unit/lookup") {

            test("missing Authorization header returns HTTP 401") {
                val app = testApp(mockRepo, mockFlexPrivate)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"end_user":"123456789","accounting_point":"133700000000000053"}""")
                }
                response.status shouldBe HttpStatusCode.Unauthorized
                app.stop()
            }

            test("disallowed role returns HTTP 401") {
                val app = testApp(mockRepo, mockFlexPrivate)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt(role = "flex_organisation")}")
                    setBody("""{"end_user":"123456789","accounting_point":"133700000000000053"}""")
                }
                response.status shouldBe HttpStatusCode.Unauthorized
                app.stop()
            }

            test("missing end_user returns HTTP 400") {
                val app = testApp(mockRepo, mockFlexPrivate)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"accounting_point":"133700000000000053"}""")
                }
                response.status shouldBe HttpStatusCode.BadRequest
                app.stop()
            }

            test("ill-formed end_user returns HTTP 400") {
                val app = testApp(mockRepo, mockFlexPrivate)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"abc","accounting_point":"133700000000000053"}""")
                }
                response.status shouldBe HttpStatusCode.BadRequest
                app.stop()
            }

            test("both AP and CU business IDs returns HTTP 400") {
                val app = testApp(mockRepo, mockFlexPrivate)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody(
                        """{"end_user":"123456789",
                          "accounting_point":"133700000000000053",
                          "controllable_unit":"550e8400-e29b-41d4-a716-446655440000"}""",
                    )
                }
                response.status shouldBe HttpStatusCode.BadRequest
                app.stop()
            }

            test("missing both AP and CU business IDs returns HTTP 400") {
                val app = testApp(mockRepo, mockFlexPrivate)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"123456789"}""")
                }
                response.status shouldBe HttpStatusCode.BadRequest
                app.stop()
            }

            test("invalid GSRN accounting point returns HTTP 400") {
                val app = testApp(mockRepo, mockFlexPrivate)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"123456789","accounting_point":"000000000000000000"}""")
                }
                response.status shouldBe HttpStatusCode.BadRequest
                app.stop()
            }

            test("non-existent CU returns HTTP 404") {
                every {
                    with(any<AccessToken>()) { mockRepo.getCurrentAccountingPoint(any()) }
                } returns NotFoundError("controllable unit does not exist").left()

                val app = testApp(mockRepo, mockFlexPrivate)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"123456789","controllable_unit":"550e8400-e29b-41d4-a716-446655440000"}""")
                }
                response.status shouldBe HttpStatusCode.NotFound
                app.stop()
            }

            test("end user mismatch returns HTTP 403") {
                every {
                    with(any<AccessToken>()) { mockRepo.getAccountingPointIdByBusinessId(any()) }
                } returns 42.right()
                every {
                    with(any<AccessToken>()) { mockRepo.checkEndUserMatchesAccountingPoint(any(), any()) }
                } returns NotFoundError("end user does not match accounting point / controllable unit").left()

                val app = testApp(mockRepo, mockFlexPrivate)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"123456789","accounting_point":"133700000000000053"}""")
                }
                response.status shouldBe HttpStatusCode.Forbidden
                app.stop()
            }

            test("AP not in DB and not in datahub returns HTTP 404") {
                every {
                    with(any<AccessToken>()) { mockRepo.getAccountingPointIdByBusinessId(any()) }
                } returns NotFoundError("accounting point not found").left()
                coEvery { mockFlexPrivate.fetchMeteringGridArea(any()) } returns "datahub returned HTTP 404".left()

                val app = testApp(mockRepo, mockFlexPrivate)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"123456789","accounting_point":"133700000000000053"}""")
                }
                response.status shouldBe HttpStatusCode.NotFound
                app.stop()
            }

            test("happy path returns HTTP 200 with structured response") {
                every {
                    with(any<AccessToken>()) { mockRepo.getAccountingPointIdByBusinessId(any()) }
                } returns 42.right()
                every {
                    with(any<AccessToken>()) { mockRepo.checkEndUserMatchesAccountingPoint(any(), any()) }
                } returns 7.right()
                every {
                    with(any<AccessToken>()) { mockRepo.lookupControllableUnits(any(), any()) }
                } returns listOf(
                    ControllableUnit(
                        id = 1,
                        businessId = "550e8400-e29b-41d4-a716-446655440000",
                        name = "My CU",
                        technicalResources = emptyList(),
                    ),
                ).right()

                val app = testApp(mockRepo, mockFlexPrivate)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"123456789","accounting_point":"133700000000000053"}""")
                }
                response.status shouldBe HttpStatusCode.OK
                val body = response.bodyAsText()
                body.contains("accounting_point") shouldBe true
                body.contains("end_user") shouldBe true
                body.contains("controllable_units") shouldBe true
                app.stop()
            }
        }
    })
