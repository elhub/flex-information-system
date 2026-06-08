package no.elhub.flex.controllableunit

import arrow.core.left
import arrow.core.right
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
import io.mockk.clearAllMocks
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.datetime.TimeZone
import kotlinx.datetime.todayIn
import no.elhub.flex.accountingpoint.AccountingPointService
import no.elhub.flex.auth.FlexAuthentication
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureLogging
import no.elhub.flex.config.configureSerialization
import no.elhub.flex.controllableunit.db.ControllableUnitRepository
import no.elhub.flex.event.db.EventRepository
import no.elhub.flex.model.domain.AccountingPoint
import no.elhub.flex.model.domain.ControllableUnit
import no.elhub.flex.model.error.InternalServerError
import no.elhub.flex.model.error.ResourceNotFoundError
import no.elhub.flex.routes.controllableunit.ControllableUnitLookup
import no.elhub.flex.routes.controllableunit.controllableUnitRoutes
import no.elhub.flex.util.TEST_JWT_SECRET
import no.elhub.flex.util.makeJwt
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin
import kotlin.time.Clock

class ControllableUnitLookupTest :
    FunSpec({
        val mockRepo = mockk<ControllableUnitRepository>()
        val mockAccountingPointService = mockk<AccountingPointService>()
        val mockEventRepo = mockk<EventRepository>()

        beforeTest {
            clearAllMocks(answers = false)
            coEvery {
                with(any<FlexPrincipal>()) { mockEventRepo.insertLookupEvent(any(), any(), any()) }
            } returns Unit.right()
        }

        context("POST /controllable_unit/lookup") {

            test("missing Authorization header returns HTTP 401") {
                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    setBody("""{"end_user":"123456789","accounting_point":"133700000000000053"}""")
                }
                response.status shouldBe HttpStatusCode.Unauthorized
                app.stop()
            }

            test("valid session cookie is accepted when no Authorization header") {
                val endUserBusinessId = "123456789"
                val accountingPointBusinessId = "133700000000000053"
                coEvery {
                    with(any<FlexPrincipal>()) { mockAccountingPointService.getCurrentAccountingPoint(any()) }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    mockAccountingPointService.synchronizeAccountingPoint(any(), any())
                } returns Unit.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.checkEndUserMatchesAccountingPoint(endUserBusinessId, accountingPointBusinessId)
                    }
                } returns 7L.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.getAccountingPointByBusinessId(accountingPointBusinessId)
                    }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    with(any<FlexPrincipal>()) { mockRepo.lookupControllableUnits(any(), any()) }
                } returns emptyList<ControllableUnit>().right()

                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Cookie", "__Host-flex_session=${makeJwt()}")
                    setBody("""{"end_user":"$endUserBusinessId","accounting_point":"$accountingPointBusinessId"}""")
                }
                response.status shouldBe HttpStatusCode.OK
                app.stop()
            }

            test("Authorization header takes precedence over invalid session cookie") {
                val endUserBusinessId = "123456789"
                val accountingPointBusinessId = "133700000000000053"
                coEvery {
                    with(any<FlexPrincipal>()) { mockAccountingPointService.getCurrentAccountingPoint(any()) }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    mockAccountingPointService.synchronizeAccountingPoint(any(), any())
                } returns Unit.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.checkEndUserMatchesAccountingPoint(endUserBusinessId, accountingPointBusinessId)
                    }
                } returns 7L.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.getAccountingPointByBusinessId(accountingPointBusinessId)
                    }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    with(any<FlexPrincipal>()) { mockRepo.lookupControllableUnits(any(), any()) }
                } returns emptyList<ControllableUnit>().right()

                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    header("Cookie", "__Host-flex_session=not-a-valid-token")
                    setBody("""{"end_user":"$endUserBusinessId","accounting_point":"$accountingPointBusinessId"}""")
                }
                response.status shouldBe HttpStatusCode.OK
                app.stop()
            }

            test("disallowed role returns HTTP 403") {
                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt(role = "flex_organisation")}")
                    setBody("""{"end_user":"123456789","accounting_point":"133700000000000053"}""")
                }
                response.status shouldBe HttpStatusCode.Forbidden
                app.stop()
            }

            test("insufficient scope returns HTTP 403") {
                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt(scope = "read:data")}")
                    setBody("""{"end_user":"123456789","accounting_point":"133700000000000053"}""")
                }
                response.status shouldBe HttpStatusCode.Forbidden
                app.stop()
            }

            test("broader scope covering the required scope is accepted") {
                val endUserBusinessId = "123456789"
                val accountingPointBusinessId = "133700000000000053"
                coEvery {
                    with(any<FlexPrincipal>()) { mockAccountingPointService.getCurrentAccountingPoint(any()) }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    mockAccountingPointService.synchronizeAccountingPoint(any(), any())
                } returns Unit.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.checkEndUserMatchesAccountingPoint(endUserBusinessId, accountingPointBusinessId)
                    }
                } returns 7L.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.getAccountingPointByBusinessId(accountingPointBusinessId)
                    }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    with(any<FlexPrincipal>()) { mockRepo.lookupControllableUnits(any(), any()) }
                } returns emptyList<ControllableUnit>().right()

                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt(scope = "manage:data")}")
                    setBody("""{"end_user":"$endUserBusinessId","accounting_point":"$accountingPointBusinessId"}""")
                }
                response.status shouldBe HttpStatusCode.OK
                app.stop()
            }

            test("missing end_user returns HTTP 400") {
                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"accounting_point":"133700000000000053"}""")
                }
                response.status shouldBe HttpStatusCode.BadRequest
                app.stop()
            }

            test("ill-formed end_user returns HTTP 400") {
                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"abc","accounting_point":"133700000000000053"}""")
                }
                response.status shouldBe HttpStatusCode.BadRequest
                app.stop()
            }

            test("PID (11-digit fødselsnummer) is rejected as end_user") {
                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"13370000001","accounting_point":"133700000000000053"}""")
                }
                response.status shouldBe HttpStatusCode.BadRequest
                app.stop()
            }

            test("both AP and CU business IDs returns HTTP 400") {
                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
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

            test("birth date as end_user (person) is accepted and returns HTTP 200") {
                val endUserBusinessId = "150190"
                val accountingPointBusinessId = "133700000000000053"
                coEvery {
                    with(any<FlexPrincipal>()) { mockAccountingPointService.getCurrentAccountingPoint(any()) }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    mockAccountingPointService.synchronizeAccountingPoint(any(), any())
                } returns Unit.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.checkEndUserMatchesAccountingPoint(endUserBusinessId, accountingPointBusinessId)
                    }
                } returns 7L.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.getAccountingPointByBusinessId(accountingPointBusinessId)
                    }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    with(any<FlexPrincipal>()) { mockRepo.lookupControllableUnits(any(), any()) }
                } returns emptyList<ControllableUnit>().right()

                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"$endUserBusinessId","accounting_point":"$accountingPointBusinessId"}""")
                }
                response.status shouldBe HttpStatusCode.OK
                app.stop()
            }

            test("missing both AP and CU business IDs returns HTTP 400") {
                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"123456789"}""")
                }
                response.status shouldBe HttpStatusCode.BadRequest
                app.stop()
            }

            test("invalid GSRN accounting point returns HTTP 400") {
                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"123456789","accounting_point":"000000000000000000"}""")
                }
                response.status shouldBe HttpStatusCode.BadRequest
                app.stop()
            }

            test("non-existent current accounting point returns HTTP 404") {
                val endUserBusinessId = "123456789"
                val controllableUnitBusinessId = "550e8400-e29b-41d4-a716-446655440000"
                coEvery {
                    with(any<FlexPrincipal>()) { mockAccountingPointService.getCurrentAccountingPoint(controllableUnitBusinessId) }
                } returns ResourceNotFoundError("controllable unit does not exist").left()

                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"$endUserBusinessId","controllable_unit":"$controllableUnitBusinessId"}""")
                }
                response.status shouldBe HttpStatusCode.NotFound
                app.stop()
            }

            test("end user mismatch returns HTTP 404") {
                val endUserBusinessId = "123456789"
                val accountingPointBusinessId = "133700000000000053"
                coEvery {
                    with(any<FlexPrincipal>()) { mockAccountingPointService.getCurrentAccountingPoint(any()) }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    mockAccountingPointService.synchronizeAccountingPoint(any(), any())
                } returns Unit.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.checkEndUserMatchesAccountingPoint(endUserBusinessId, accountingPointBusinessId)
                    }
                } returns ResourceNotFoundError("end user does not match accounting point / controllable unit").left()
                coEvery {
                    with(any<FlexPrincipal>()) { mockRepo.lookupControllableUnits(any(), any()) }
                } returns emptyList<ControllableUnit>().right()

                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"$endUserBusinessId","accounting_point":"$accountingPointBusinessId"}""")
                }
                response.status shouldBe HttpStatusCode.NotFound
                app.stop()
            }

            test("AP not in adapter or database returns HTTP 404") {
                val endUserBusinessId = "123456789"
                val accountingPointBusinessId = "133700000000000053"
                coEvery {
                    mockAccountingPointService.synchronizeAccountingPoint(any(), any())
                } returns Unit.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.checkEndUserMatchesAccountingPoint(endUserBusinessId, accountingPointBusinessId)
                    }
                } returns 7L.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.getAccountingPointByBusinessId(accountingPointBusinessId)
                    }
                } returns ResourceNotFoundError("AP not found").left()
                coEvery {
                    with(any<FlexPrincipal>()) { mockRepo.lookupControllableUnits(any(), any()) }
                } returns emptyList<ControllableUnit>().right()

                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"$endUserBusinessId","accounting_point":"$accountingPointBusinessId"}""")
                }
                response.status shouldBe HttpStatusCode.NotFound
                app.stop()
            }

            context("adapter sync disabled") {
                val syncDisabledRepo = mockk<ControllableUnitRepository>()
                val syncDisabledAccountingPointService = mockk<AccountingPointService>()

                test("AP absent from database with sync disabled returns HTTP 404 even if adapter would have provided it") {
                    val endUserBusinessId = "123456789"
                    val accountingPointBusinessId = "133700000000000053"
                    coEvery {
                        with(any<FlexPrincipal>()) {
                            syncDisabledAccountingPointService.checkEndUserMatchesAccountingPoint(endUserBusinessId, accountingPointBusinessId)
                        }
                    } returns 7L.right()
                    coEvery {
                        with(any<FlexPrincipal>()) {
                            syncDisabledAccountingPointService.getAccountingPointByBusinessId(accountingPointBusinessId)
                        }
                    } returns ResourceNotFoundError("AP not found").left()
                    coEvery {
                        with(any<FlexPrincipal>()) { syncDisabledRepo.lookupControllableUnits(any(), any()) }
                    } returns emptyList<ControllableUnit>().right()

                    val app = testApp(syncDisabledRepo, syncDisabledAccountingPointService, mockEventRepo, syncEnabled = false)
                    val response = app.client.post("/controllable_unit/lookup") {
                        contentType(ContentType.Application.Json)
                        header("Authorization", "Bearer ${makeJwt()}")
                        setBody("""{"end_user":"$endUserBusinessId","accounting_point":"$accountingPointBusinessId"}""")
                    }
                    response.status shouldBe HttpStatusCode.NotFound
                    coVerify(exactly = 0) { syncDisabledAccountingPointService.synchronizeAccountingPoint(any(), any()) }
                    app.stop()
                }

                test("CU lookup with sync disabled resolves AP from database without calling adapter") {
                    val endUserBusinessId = "123456789"
                    val controllableUnitBusinessId = "550e8400-e29b-41d4-a716-446655440000"
                    val accountingPointBusinessId = "133700000000000053"
                    coEvery {
                        with(any<FlexPrincipal>()) { syncDisabledAccountingPointService.getCurrentAccountingPoint(controllableUnitBusinessId) }
                    } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                    coEvery {
                        with(any<FlexPrincipal>()) {
                            syncDisabledAccountingPointService.checkEndUserMatchesAccountingPoint(endUserBusinessId, accountingPointBusinessId)
                        }
                    } returns 7L.right()
                    coEvery {
                        with(any<FlexPrincipal>()) {
                            syncDisabledAccountingPointService.getAccountingPointByBusinessId(accountingPointBusinessId)
                        }
                    } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                    coEvery {
                        with(any<FlexPrincipal>()) { syncDisabledRepo.lookupControllableUnits(any(), any()) }
                    } returns emptyList<ControllableUnit>().right()

                    val app = testApp(syncDisabledRepo, syncDisabledAccountingPointService, mockEventRepo, syncEnabled = false)
                    val response = app.client.post("/controllable_unit/lookup") {
                        contentType(ContentType.Application.Json)
                        header("Authorization", "Bearer ${makeJwt()}")
                        setBody("""{"end_user":"$endUserBusinessId","controllable_unit":"$controllableUnitBusinessId"}""")
                    }
                    response.status shouldBe HttpStatusCode.OK
                    coVerify(exactly = 0) { syncDisabledAccountingPointService.synchronizeAccountingPoint(any(), any()) }
                    app.stop()
                }
            }

            test("AP not in adapter but in database returns current data from database with HTTP 200") {
                val endUserBusinessId = "123456789"
                val accountingPointBusinessId = "133700000000000053"
                coEvery {
                    with(any<FlexPrincipal>()) { mockAccountingPointService.getCurrentAccountingPoint(any()) }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    mockAccountingPointService.synchronizeAccountingPoint(any(), any())
                } returns Unit.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.checkEndUserMatchesAccountingPoint(endUserBusinessId, accountingPointBusinessId)
                    }
                } returns 7L.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.getAccountingPointByBusinessId(accountingPointBusinessId)
                    }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    with(any<FlexPrincipal>()) { mockRepo.lookupControllableUnits(any(), any()) }
                } returns emptyList<ControllableUnit>().right()

                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"$endUserBusinessId","accounting_point":"$accountingPointBusinessId"}""")
                }
                response.status shouldBe HttpStatusCode.OK
                app.stop()
            }

            test("Request with CU id should use current AP from database and return HTTP 200") {
                val endUserBusinessId = "123456789"
                val controllableUnitBusinessId = "550e8400-e29b-41d4-a716-446655440000"
                val accountingPointBusinessId = "133700000000000053"
                coEvery {
                    with(any<FlexPrincipal>()) { mockAccountingPointService.getCurrentAccountingPoint(any()) }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    mockAccountingPointService.synchronizeAccountingPoint(any(), any())
                } returns Unit.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.checkEndUserMatchesAccountingPoint(endUserBusinessId, accountingPointBusinessId)
                    }
                } returns 7L.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.getAccountingPointByBusinessId(accountingPointBusinessId)
                    }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    with(any<FlexPrincipal>()) { mockRepo.lookupControllableUnits(any(), any()) }
                } returns emptyList<ControllableUnit>().right()

                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"$endUserBusinessId","controllable_unit":"$controllableUnitBusinessId"}""")
                }
                response.status shouldBe HttpStatusCode.OK
                app.stop()
            }

            test("Request with CU id and current AP not in database should return HTTP 404") {
                val endUserBusinessId = "123456789"
                val controllableUnitBusinessId = "550e8400-e29b-41d4-a716-446655440000"
                coEvery {
                    with(any<FlexPrincipal>()) { mockAccountingPointService.getCurrentAccountingPoint(controllableUnitBusinessId) }
                } returns ResourceNotFoundError("Current AP not found").left()

                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"$endUserBusinessId","controllable_unit":"$controllableUnitBusinessId"}""")
                }
                response.status shouldBe HttpStatusCode.NotFound
                app.stop()
            }

            test("happy path returns HTTP 200 with structured response") {
                val endUserBusinessId = "123456789"
                val accountingPointBusinessId = "133700000000000053"
                val controllableUnitBusinessId = "550e8400-e29b-41d4-a716-446655440000"
                coEvery {
                    with(any<FlexPrincipal>()) { mockAccountingPointService.getCurrentAccountingPoint(any()) }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    mockAccountingPointService.synchronizeAccountingPoint(any(), any())
                } returns Unit.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.checkEndUserMatchesAccountingPoint(endUserBusinessId, accountingPointBusinessId)
                    }
                } returns 7L.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.getAccountingPointByBusinessId(accountingPointBusinessId)
                    }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    with(any<FlexPrincipal>()) { mockRepo.lookupControllableUnits(any(), any()) }
                } returns listOf(
                    ControllableUnit(
                        id = 1,
                        businessId = controllableUnitBusinessId,
                        name = "My CU",
                        technicalResources = emptyList(),
                        startDate = Clock.System.todayIn(TimeZone.of("Europe/Oslo")),
                    ),
                ).right()

                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"$endUserBusinessId","accounting_point":"$accountingPointBusinessId"}""")
                }
                response.status shouldBe HttpStatusCode.OK
                val body = response.bodyAsText()
                body.contains("accounting_point") shouldBe true
                body.contains("end_user") shouldBe true
                body.contains("controllable_units") shouldBe true
                app.stop()
            }

            test("InternalServerError returns HTTP 500") {
                val endUserBusinessId = "123456789"
                val accountingPointBusinessId = "133700000000000053"
                coEvery {
                    mockAccountingPointService.synchronizeAccountingPoint(any(), any())
                } returns InternalServerError("traceId").left()

                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                val response = app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"$endUserBusinessId","accounting_point":"$accountingPointBusinessId"}""")
                }
                response.status shouldBe HttpStatusCode.InternalServerError
                app.stop()
            }

            test("AP lookup: one event is inserted with AP business ID and no CU business ID") {
                val endUserBusinessId = "123456789"
                val accountingPointBusinessId = "133700000000000053"
                coEvery {
                    with(any<FlexPrincipal>()) { mockAccountingPointService.getCurrentAccountingPoint(any()) }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    mockAccountingPointService.synchronizeAccountingPoint(any(), any())
                } returns Unit.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.checkEndUserMatchesAccountingPoint(endUserBusinessId, accountingPointBusinessId)
                    }
                } returns 7L.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.getAccountingPointByBusinessId(accountingPointBusinessId)
                    }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    with(any<FlexPrincipal>()) { mockRepo.lookupControllableUnits(any(), any()) }
                } returns listOf(
                    ControllableUnit(id = 10L, businessId = "550e8400-e29b-41d4-a716-446655440000", name = "CU 1", technicalResources = emptyList(), startDate = null),
                    ControllableUnit(id = 20L, businessId = "660e8400-e29b-41d4-a716-446655440001", name = "CU 2", technicalResources = emptyList(), startDate = null),
                ).right()

                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"$endUserBusinessId","accounting_point":"$accountingPointBusinessId"}""")
                }
                coVerify(exactly = 1) {
                    with(any<FlexPrincipal>()) { mockEventRepo.insertLookupEvent(accountingPointBusinessId, null, 1) }
                }
                app.stop()
            }

            test("AP lookup with no CUs found: event is still inserted with AP business ID") {
                val endUserBusinessId = "123456789"
                val accountingPointBusinessId = "133700000000000053"
                coEvery {
                    with(any<FlexPrincipal>()) { mockAccountingPointService.getCurrentAccountingPoint(any()) }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    mockAccountingPointService.synchronizeAccountingPoint(any(), any())
                } returns Unit.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.checkEndUserMatchesAccountingPoint(endUserBusinessId, accountingPointBusinessId)
                    }
                } returns 7L.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.getAccountingPointByBusinessId(accountingPointBusinessId)
                    }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    with(any<FlexPrincipal>()) { mockRepo.lookupControllableUnits(any(), any()) }
                } returns emptyList<ControllableUnit>().right()

                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"$endUserBusinessId","accounting_point":"$accountingPointBusinessId"}""")
                }
                coVerify(exactly = 1) {
                    with(any<FlexPrincipal>()) { mockEventRepo.insertLookupEvent(accountingPointBusinessId, null, 1) }
                }
                app.stop()
            }

            test("CU-specific lookup: event is inserted with AP and CU business IDs") {
                val endUserBusinessId = "123456789"
                val controllableUnitBusinessId = "550e8400-e29b-41d4-a716-446655440000"
                val accountingPointBusinessId = "133700000000000053"
                coEvery {
                    with(any<FlexPrincipal>()) { mockAccountingPointService.getCurrentAccountingPoint(controllableUnitBusinessId) }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    mockAccountingPointService.synchronizeAccountingPoint(any(), any())
                } returns Unit.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.checkEndUserMatchesAccountingPoint(endUserBusinessId, accountingPointBusinessId)
                    }
                } returns 7L.right()
                coEvery {
                    with(any<FlexPrincipal>()) {
                        mockAccountingPointService.getAccountingPointByBusinessId(accountingPointBusinessId)
                    }
                } returns AccountingPoint(id = 1, businessId = accountingPointBusinessId).right()
                coEvery {
                    with(any<FlexPrincipal>()) { mockRepo.lookupControllableUnits(any(), any()) }
                } returns listOf(
                    ControllableUnit(id = 10L, businessId = controllableUnitBusinessId, name = "CU 1", technicalResources = emptyList(), startDate = null),
                ).right()

                val app = testApp(mockRepo, mockAccountingPointService, mockEventRepo)
                app.client.post("/controllable_unit/lookup") {
                    contentType(ContentType.Application.Json)
                    header("Authorization", "Bearer ${makeJwt()}")
                    setBody("""{"end_user":"$endUserBusinessId","controllable_unit":"$controllableUnitBusinessId"}""")
                }
                coVerify(exactly = 1) {
                    with(any<FlexPrincipal>()) { mockEventRepo.insertLookupEvent(accountingPointBusinessId, controllableUnitBusinessId, 1) }
                }
                app.stop()
            }
        }
    })

private fun testApp(
    repo: ControllableUnitRepository,
    accountingPointService: AccountingPointService,
    eventRepo: EventRepository,
    syncEnabled: Boolean = true,
): TestApplication =
    TestApplication {
        application {
            install(Tracing.plugin)
            install(FlexAuthentication) { jwtSecret = TEST_JWT_SECRET }
            configureSerialization()
            configureLogging()
            install(Koin) {
                modules(
                    module {
                        single<ControllableUnitRepository> { repo }
                        single<AccountingPointService> { accountingPointService }
                        single<EventRepository> { eventRepo }
                        single { ControllableUnitLookup(get(), get(), get(), syncEnabled) }
                    },
                )
            }
            controllableUnitRoutes()
        }
    }
