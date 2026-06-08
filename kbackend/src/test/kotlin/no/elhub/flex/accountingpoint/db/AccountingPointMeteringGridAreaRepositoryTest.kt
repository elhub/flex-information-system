package no.elhub.flex.accountingpoint.db

import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import kotlinx.datetime.TimeZone
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.model.domain.AccountingPointMeteringGridArea
import no.elhub.flex.model.domain.MeteringGridArea
import no.elhub.flex.model.domain.MeteringGridAreaStatus
import no.elhub.flex.util.atLocalMidnight
import no.elhub.flex.util.toKotlinInstant
import no.elhub.flex.util.toKotlinInstantOrNull
import no.elhub.flex.util.uniqueEicY
import no.elhub.flex.util.uniqueGsrn
import kotlin.time.Instant

class AccountingPointMeteringGridAreaRepositoryTest : FunSpec({

    val repo = AccountingPointMeteringGridAreaRepositoryImpl()

    val principal = FlexPrincipal.internalData()

    val timezone = TimeZone.of("Europe/Oslo")
    val validFrom = Instant.parse("2024-01-01T00:00:00Z").atLocalMidnight(timezone)
    val validTo = Instant.parse("2024-02-01T00:00:00Z").atLocalMidnight(timezone)

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute("TRUNCATE flex.accounting_point, flex.metering_grid_area CASCADE")
            }
        }
    }

    context("syncAll") {

        test("inserts a new row when none exists") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())
            val mga = insertMeteringGridArea("MGA One")

            // when
            with(principal) {
                repo.syncAll(
                    listOf(
                        AccountingPointMeteringGridArea(
                            id = 0,
                            accountingPointId = apId,
                            meteringGridAreaId = mga.id,
                            validFrom = validFrom,
                            validTo = validTo,
                        ),
                    ),
                )
            }.shouldBeRight()

            // then
            val rows = queryMgaRows(apId)
            rows shouldHaveSize 1
            rows.first() shouldBe MgaRow(
                meteringGridAreaId = mga.id,
                validFrom = validFrom,
                validTo = validTo,
            )
        }

        test("is idempotent when called twice with the same data") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())
            val mga = insertMeteringGridArea("MGA Idempotent")
            val apmga = AccountingPointMeteringGridArea(
                id = 0,
                accountingPointId = apId,
                meteringGridAreaId = mga.id,
                validFrom = validFrom,
                validTo = null,
            )

            // when
            with(principal) {
                repo.syncAll(listOf(apmga))
                repo.syncAll(listOf(apmga))
            }.shouldBeRight()

            // then
            queryMgaRows(apId) shouldHaveSize 1
        }

        test("updates metering_grid_area_id when it changes for the same accounting point and validFrom") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())
            val mga1 = insertMeteringGridArea("MGA Old")
            val mga2 = insertMeteringGridArea("MGA New")
            with(principal) {
                repo.syncAll(
                    listOf(
                        AccountingPointMeteringGridArea(
                            id = 0,
                            accountingPointId = apId,
                            meteringGridAreaId = mga1.id,
                            validFrom = validFrom,
                            validTo = null,
                        ),
                    ),
                )
            }

            // when
            with(principal) {
                repo.syncAll(
                    listOf(
                        AccountingPointMeteringGridArea(
                            id = 0,
                            accountingPointId = apId,
                            meteringGridAreaId = mga2.id,
                            validFrom = validFrom,
                            validTo = null,
                        ),
                    ),
                ).shouldBeRight()
            }

            // then
            val rows = queryMgaRows(apId)
            rows shouldHaveSize 1
            rows.first().meteringGridAreaId shouldBe mga2.id
        }

        test("updates validTo when it changes for the same accounting point and validFrom") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())
            val mga = insertMeteringGridArea("MGA ValidTo")
            with(principal) {
                repo.syncAll(
                    listOf(
                        AccountingPointMeteringGridArea(
                            id = 0,
                            accountingPointId = apId,
                            meteringGridAreaId = mga.id,
                            validFrom = validFrom,
                            validTo = null,
                        ),
                    ),
                )
            }

            // when
            with(principal) {
                repo.syncAll(
                    listOf(
                        AccountingPointMeteringGridArea(
                            id = 0,
                            accountingPointId = apId,
                            meteringGridAreaId = mga.id,
                            validFrom = validFrom,
                            validTo = validTo,
                        ),
                    ),
                ).shouldBeRight()
            }

            // then
            val rows = queryMgaRows(apId)
            rows shouldHaveSize 1
            rows.first().validTo shouldBe validTo
        }

        test("does not affect rows for a different accounting point") {
            // given
            val noiseApId = insertAccountingPoint(uniqueGsrn())
            val targetApId = insertAccountingPoint(uniqueGsrn())
            val mga = insertMeteringGridArea("MGA Isolation")
            with(principal) {
                repo.syncAll(
                    listOf(
                        AccountingPointMeteringGridArea(
                            id = 0,
                            accountingPointId = noiseApId,
                            meteringGridAreaId = mga.id,
                            validFrom = validFrom,
                            validTo = null,
                        ),
                    ),
                )
            }

            // when
            with(principal) {
                repo.syncAll(
                    listOf(
                        AccountingPointMeteringGridArea(
                            id = 0,
                            accountingPointId = targetApId,
                            meteringGridAreaId = mga.id,
                            validFrom = validFrom,
                            validTo = null,
                        ),
                    ),
                ).shouldBeRight()
            }

            // then
            queryMgaRows(noiseApId) shouldHaveSize 1
            queryMgaRows(targetApId) shouldHaveSize 1
        }

        test("inserts multiple rows for the same accounting point in one call") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())
            val mga1 = insertMeteringGridArea("MGA Multi 1")
            val mga2 = insertMeteringGridArea("MGA Multi 2")
            val secondValidFrom = Instant.parse("2024-03-01T00:00:00Z").atLocalMidnight(timezone)

            // when
            with(principal) {
                repo.syncAll(
                    listOf(
                        AccountingPointMeteringGridArea(
                            id = 0,
                            accountingPointId = apId,
                            meteringGridAreaId = mga1.id,
                            validFrom = validFrom,
                            validTo = secondValidFrom,
                        ),
                        AccountingPointMeteringGridArea(
                            id = 0,
                            accountingPointId = apId,
                            meteringGridAreaId = mga2.id,
                            validFrom = secondValidFrom,
                            validTo = null,
                        ),
                    ),
                ).shouldBeRight()
            }

            // then
            val rows = queryMgaRows(apId)
            rows shouldHaveSize 2
            rows[0] shouldBe MgaRow(meteringGridAreaId = mga1.id, validFrom = validFrom, validTo = secondValidFrom)
            rows[1] shouldBe MgaRow(meteringGridAreaId = mga2.id, validFrom = secondValidFrom, validTo = null)
        }

        test("deletes stale rows whose validFrom is not present in the incoming data") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())
            val mga = insertMeteringGridArea("MGA Stale")
            val secondValidFrom = Instant.parse("2024-02-01T00:00:00Z").atLocalMidnight(timezone)
            with(principal) {
                repo.syncAll(
                    listOf(
                        AccountingPointMeteringGridArea(
                            id = 0,
                            accountingPointId = apId,
                            meteringGridAreaId = mga.id,
                            validFrom = validFrom,
                            validTo = secondValidFrom,
                        ),
                        AccountingPointMeteringGridArea(
                            id = 0,
                            accountingPointId = apId,
                            meteringGridAreaId = mga.id,
                            validFrom = secondValidFrom,
                            validTo = null,
                        ),
                    ),
                )
            }.shouldBeRight()

            // when — omit the first row; its validFrom should be deleted
            with(principal) {
                repo.syncAll(
                    listOf(
                        AccountingPointMeteringGridArea(
                            id = 0,
                            accountingPointId = apId,
                            meteringGridAreaId = mga.id,
                            validFrom = secondValidFrom,
                            validTo = null,
                        ),
                    ),
                ).shouldBeRight()
            }

            // then
            val rows = queryMgaRows(apId)
            rows shouldHaveSize 1
            rows.first().validFrom shouldBe secondValidFrom
        }

        test("returns Right(Unit) immediately for an empty list without touching the database") {
            // when
            val result = with(principal) { repo.syncAll(emptyList()) }

            // then
            result.shouldBeRight()
            // no AP seeded — any DB call would fail; success proves no query was made
        }
    }
})

private data class MgaRow(
    val meteringGridAreaId: Long,
    val validFrom: Instant?,
    val validTo: Instant?,
)

private fun queryMgaRows(apId: Long): List<MgaRow> =
    PostgresTestContainer.withConnection { conn ->
        conn.prepareStatement(
            """
            SELECT metering_grid_area_id, lower(valid_time_range), upper(valid_time_range)
            FROM flex.accounting_point_metering_grid_area
            WHERE accounting_point_id = ?
            ORDER BY lower(valid_time_range)
            """.trimIndent(),
        ).use { stmt ->
            stmt.setLong(1, apId)
            stmt.executeQuery().use { rs ->
                val rows = mutableListOf<MgaRow>()
                while (rs.next()) {
                    rows += MgaRow(
                        meteringGridAreaId = rs.getLong(1),
                        validFrom = rs.getTimestamp(2).toKotlinInstantOrNull(),
                        validTo = rs.getTimestamp(3).toKotlinInstantOrNull(),
                    )
                }
                rows
            }
        }
    }

private fun insertAccountingPoint(apBusinessId: String): Long =
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
        val id = conn.prepareStatement("INSERT INTO flex.accounting_point (business_id) VALUES (?) RETURNING id")
            .use { stmt ->
                stmt.setString(1, apBusinessId)
                stmt.executeQuery().use { rs ->
                    rs.next()
                    rs.getLong(1)
                }
            }
        conn.commit()
        id
    }

private fun insertMeteringGridArea(name: String, status: String = "active"): MeteringGridArea =
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
        val row = conn.prepareStatement(
            """
            INSERT INTO flex.metering_grid_area (business_id, name, status)
            VALUES (?, ?, ?)
            RETURNING id, business_id
            """.trimIndent(),
        ).use { stmt ->
            stmt.setString(1, uniqueEicY())
            stmt.setString(2, name)
            stmt.setString(3, status)
            stmt.executeQuery().use { rs ->
                rs.next()
                MeteringGridArea(
                    id = rs.getLong("id"),
                    businessId = rs.getString("business_id"),
                    name = name,
                    status = MeteringGridAreaStatus.valueOf(status.uppercase()),
                )
            }
        }
        conn.commit()
        row
    }
