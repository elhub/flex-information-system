package no.elhub.flex.controllableunit

import com.github.tomakehurst.wiremock.client.WireMock.aResponse
import com.github.tomakehurst.wiremock.client.WireMock.equalTo
import com.github.tomakehurst.wiremock.client.WireMock.get
import com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.server.application.install
import io.ktor.server.routing.post
import io.ktor.server.routing.routing
import io.ktor.server.testing.TestApplication
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.atStartOfDayIn
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.accountingpoint.AccountingPointServiceImpl
import no.elhub.flex.accountingpoint.db.AccountingPointMeteringGridAreaRepositoryImpl
import no.elhub.flex.accountingpoint.db.AccountingPointRepositoryImpl
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureSerialization
import no.elhub.flex.controllableunit.db.ControllableUnitRepositoryImpl
import no.elhub.flex.integration.accountingpointadapter.AccountingPointAdapterHttpService
import no.elhub.flex.integration.accountingpointadapter.AccountingPointAdapterWireMockServer
import no.elhub.flex.meteringgridarea.db.MeteringGridAreaRepositoryImpl
import no.elhub.flex.routes.controllableunit.ControllableUnitLookup
import no.elhub.flex.util.todayLocalMidnight
import no.elhub.flex.util.uniqueEicY
import no.elhub.flex.util.uniqueGsrn
import java.util.UUID
import kotlin.time.Instant

/**
 * Integration tests verifying that the validFrom timestamps sent and received to/from the
 * accounting point adapter are always midnight aligned in the Norwegian timezone.
 *
 * When an AP has at least one CU, validFrom must be midnight in Norway for its start date.
 * When it does not have a CU, validFrom must be midnight in Norway today as a fallback.
 *
 * In both cases the test asserts that the lookup call succeeds and that the DB accepted the change.
 */
class ControllableUnitLookupTimezoneTest : FunSpec({

    extensions(AccountingPointAdapterWireMockServer)

    @Suppress("UnusedPrivateProperty")
    val db = PostgresTestContainer // ensure FlexTransaction is initialised

    val osloTz = TimeZone.of("Europe/Oslo")

    lateinit var lookup: ControllableUnitLookup
    lateinit var mgaBusinessId: String

    beforeSpec {
        val adapterService = AccountingPointAdapterHttpService(
            baseUrl = AccountingPointAdapterWireMockServer.baseUrl(),
            apiKey = "test-api-key",
        )
        lookup = ControllableUnitLookup(
            repo = ControllableUnitRepositoryImpl(),
            accountingPointService = AccountingPointServiceImpl(
                AccountingPointRepositoryImpl(),
                MeteringGridAreaRepositoryImpl(),
                AccountingPointMeteringGridAreaRepositoryImpl(),
                adapterService,
            ),
            // keep enabled so that we check that checks in the DB pass
            accountingPointAdapterSyncEnabled = true,
            timezone = osloTz,
        )
    }

    beforeTest {
        AccountingPointAdapterWireMockServer.resetAll()
        PostgresTestContainer.withConnection { conn ->
            conn.autoCommit = false
            conn.createStatement().use { stmt ->
                stmt.execute("SELECT flex.set_entity_party_identity(0, 0, 0)")
                stmt.execute("TRUNCATE flex.metering_grid_area CASCADE")
                stmt.execute("TRUNCATE flex.accounting_point CASCADE")
            }
            mgaBusinessId = uniqueEicY()
            conn.prepareStatement(
                "INSERT INTO flex.metering_grid_area (business_id, name, status) VALUES (?, 'Test MGA', 'active')",
            ).use { stmt ->
                stmt.setString(1, mgaBusinessId)
                stmt.execute()
            }
            conn.commit()
        }
    }

    // minimal app just calling the raw handler
    // (we avoid auth and other stuff we don't need to have in the test)
    fun testApp() = TestApplication {
        application {
            install(Tracing.plugin)
            configureSerialization()
            routing {
                post("/controllable_unit/lookup") { lookup.handle(call) }
            }
        }
    }

    /** Inserts an accounting point (and optionally a CU behind it) into the database. */
    fun seedAccountingPoint(gsrn: String, cuStartDate: LocalDate? = null): Unit =
        PostgresTestContainer.withConnection { conn ->
            conn.autoCommit = false
            conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }

            conn.prepareStatement("INSERT INTO flex.accounting_point (business_id) VALUES (?)").use { stmt ->
                stmt.setString(1, gsrn)
                stmt.execute()
            }

            if (cuStartDate != null) {
                val apID = conn.prepareStatement("SELECT id FROM flex.accounting_point WHERE business_id = ?")
                    .use { stmt ->
                        stmt.setString(1, gsrn)
                        stmt.executeQuery().use { rs ->
                            rs.next()
                            rs.getLong(1)
                        }
                    }

                conn.prepareStatement(
                    """
                    INSERT INTO flex.controllable_unit
                        (business_id, name, start_date, regulation_direction, maximum_active_power, accounting_point_id)
                    VALUES (?::uuid, ?, ?::date, 'up', 100.0, ?)
                    """.trimIndent(),
                ).use { stmt ->
                    stmt.setString(1, UUID.randomUUID().toString())
                    stmt.setString(2, "Test CU")
                    stmt.setString(3, cuStartDate.toString())
                    stmt.setLong(4, apID)
                    stmt.execute()
                }
            }

            conn.commit()
        }

    /**
     * Stubs the adapter so that, when looking up the accounting point identified by [gsrn] with end user identified by
     * [endUserID], it responds with an end user contract whose starting date is [validFrom].
     */
    fun stubAdapter(gsrn: String, endUserID: String, validFrom: Instant, mgaId: String) {
        AccountingPointAdapterWireMockServer.stubFor(
            get(urlPathEqualTo("/accounting_point/$gsrn"))
                .willReturn(
                    aResponse()
                        .withStatus(HttpStatusCode.OK.value)
                        .withHeader("Content-Type", "application/json")
                        .withBody(
                            """
                            {
                                "gsrn": "$gsrn",
                                "end_user": [
                                    {
                                        "business_id": "$endUserID",
                                        "entity_type": "organisation",
                                        "valid_from": "$validFrom"
                                    }
                                ],
                                "energy_supplier": [],
                                "metering_grid_area": [
                                    {
                                        "business_id": "$mgaId",
                                        "valid_from": "$validFrom"
                                    }
                                ]
                            }
                            """.trimIndent(),
                        ),
                ),
        )
    }

    /**
     * Queries the start date of one end user contract on a given AP. We only insert one in the tests so we do not have
     * to filter more carefully: this is just to check that contracts were inserted normally.
     */
    fun query1EndUserValidFrom(apGsrn: String): Instant? =
        PostgresTestContainer.withConnection { conn ->
            conn.prepareStatement(
                """
                SELECT lower(apeu.valid_time_range)
                FROM flex.accounting_point_end_user AS apeu
                    INNER JOIN flex.accounting_point AS ap ON ap.id = apeu.accounting_point_id
                WHERE ap.business_id = ?
                """.trimIndent(),
            ).use { stmt ->
                stmt.setString(1, apGsrn)
                stmt.executeQuery().use { rs ->
                    if (rs.next()) {
                        rs.getTimestamp(1)?.toInstant()
                            ?.let { Instant.fromEpochSeconds(it.epochSecond, it.nano) }
                    } else {
                        null
                    }
                }
            }
        }

    context("validFrom is midnight in the Norwegian timezone (Europe/Oslo)") {

        test("AP has a CU") {
            val endUserOrg = "123456001"
            val gsrn = uniqueGsrn()
            val cuStartDate = LocalDate(2024, 1, 15)
            val expectedValidFrom = cuStartDate.atStartOfDayIn(osloTz) // 2024-01-14T23:00:00Z

            seedAccountingPoint(gsrn, cuStartDate)
            stubAdapter(gsrn, endUserOrg, expectedValidFrom, mgaBusinessId)

            testApp().client.post("/controllable_unit/lookup") {
                contentType(ContentType.Application.Json)
                setBody("""{"end_user":"$endUserOrg","accounting_point":"$gsrn"}""")
            }.status shouldBe HttpStatusCode.OK

            // HTTP OK means the DB has done the upsert as intended, but we will still check the exact valid_from that
            // was used to ensure Norwegian midnight was inserted
            query1EndUserValidFrom(gsrn) shouldBe expectedValidFrom
        }

        test("AP has no CU") {
            val endUserOrg = "123456002"
            val gsrn = uniqueGsrn()
            val expectedValidFrom = Instant.todayLocalMidnight(osloTz) // should be the default used when no CU

            seedAccountingPoint(gsrn, cuStartDate = null)
            stubAdapter(gsrn, endUserOrg, expectedValidFrom, mgaBusinessId)

            testApp().client.post("/controllable_unit/lookup") {
                contentType(ContentType.Application.Json)
                setBody("""{"end_user":"$endUserOrg","accounting_point":"$gsrn"}""")
            }.status shouldBe HttpStatusCode.OK

            // the DB must have accepted the correct upsert here as well
            query1EndUserValidFrom(gsrn) shouldBe expectedValidFrom
        }
    }
})
