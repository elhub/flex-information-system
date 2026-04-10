package no.elhub.flex.accountingpoint.db

import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.model.domain.AccountingPoint
import no.elhub.flex.model.domain.AccountingPointEndUser
import no.elhub.flex.model.domain.AccountingPointEnergySupplier
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.NotFoundError
import no.elhub.flex.util.gs1CheckDigit
import no.elhub.flex.util.toKotlinInstant
import no.elhub.flex.util.toKotlinInstantOrNull
import no.elhub.flex.util.uniqueGsrn
import java.sql.Connection
import java.util.UUID
import java.util.concurrent.atomic.AtomicLong
import kotlin.time.Instant

@Suppress("MagicNumber")
class AccountingPointRepositoryTest : FunSpec({

    val repo = AccountingPointRepositoryImpl()

    val principal = FlexPrincipal(role = "flex_flexibility_information_system_operator", eid = "0")
    val internalDataPrincipal = FlexPrincipal.internalData()

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute("TRUNCATE flex.accounting_point CASCADE")
            }
        }
    }

    context("getAccountingPointByBusinessId") {

        test("returns the accounting point when it exists") {
            // given
            val noiseApBusinessId = uniqueGsrn()
            val targetApBusinessId = uniqueGsrn()
            insertAccountingPoint(noiseApBusinessId)
            val targetApId = insertAccountingPoint(targetApBusinessId)

            // when
            val result = with(principal) {
                repo.getAccountingPointByBusinessId(targetApBusinessId)
            }.shouldBeRight()

            // then
            result shouldBe AccountingPoint(id = targetApId, businessId = targetApBusinessId)
        }

        test("returns NotFoundError when business ID does not exist") {
            // given
            insertAccountingPoint(uniqueGsrn())

            // when
            val result = with(principal) {
                repo.getAccountingPointByBusinessId(uniqueGsrn())
            }

            // then
            result.shouldBeLeft() shouldBe NotFoundError("accounting point does not exist in database")
        }
    }

    context("getCurrentAccountingPoint") {

        test("returns the accounting point for an existing CU") {
            // given
            val targetApBusinessId = uniqueGsrn()
            val targetCuBusinessId = UUID.randomUUID().toString()
            val noiseApId = insertAccountingPoint(uniqueGsrn())
            insertControllableUnit(noiseApId, UUID.randomUUID().toString())
            val targetApId = insertAccountingPoint(targetApBusinessId)
            insertControllableUnit(targetApId, targetCuBusinessId)

            // when
            val result = with(principal) {
                repo.getCurrentAccountingPoint(targetCuBusinessId)
            }.shouldBeRight()

            // then
            result.businessId shouldBe targetApBusinessId
        }

        test("returns NotFoundError when CU does not exist") {
            // given
            val noiseApId = insertAccountingPoint(uniqueGsrn())
            insertControllableUnit(noiseApId, UUID.randomUUID().toString())

            // when
            val result = with(principal) {
                repo.getCurrentAccountingPoint(UUID.randomUUID().toString())
            }

            // then
            result.shouldBeLeft() shouldBe NotFoundError("Current accounting point not found")
        }
    }

    context("checkEndUserMatchesAccountingPoint") {

        test("returns end user ID when end user matches accounting point") {
            // given
            val targetApBusinessId = uniqueGsrn()
            val targetEntityBusinessId = uniquePid()
            val noiseApId = insertAccountingPoint(uniqueGsrn())
            linkApToEndUser(noiseApId, insertEndUserParty(uniquePid()))
            val targetApId = insertAccountingPoint(targetApBusinessId)
            val expectedEndUser = insertEndUserParty(targetEntityBusinessId)
            linkApToEndUser(targetApId, expectedEndUser)

            // when
            val result = with(principal) {
                repo.checkEndUserMatchesAccountingPoint(targetEntityBusinessId, targetApBusinessId)
            }.shouldBeRight()

            // then
            result shouldBe expectedEndUser
        }

        test("returns NotFoundError when end user does not match accounting point") {
            // given
            val targetApBusinessId = uniqueGsrn()
            val linkedEntityBusinessId = uniquePid()
            val otherEntityBusinessId = uniquePid()
            val targetApId = insertAccountingPoint(targetApBusinessId)
            linkApToEndUser(targetApId, insertEndUserParty(linkedEntityBusinessId))
            insertEndUserParty(otherEntityBusinessId)

            // when
            val result = with(principal) {
                repo.checkEndUserMatchesAccountingPoint(otherEntityBusinessId, targetApBusinessId)
            }

            // then
            result.shouldBeLeft() shouldBe NotFoundError("End user does not match accounting point / controllable unit")
        }

        test("returns NotFoundError when accounting point does not exist") {
            // given
            val noiseApId = insertAccountingPoint(uniqueGsrn())
            linkApToEndUser(noiseApId, insertEndUserParty(uniquePid()))

            // when
            val result = with(principal) {
                repo.checkEndUserMatchesAccountingPoint(uniquePid(), uniqueGsrn())
            }

            // then
            result.shouldBeLeft() shouldBe NotFoundError("End user does not match accounting point / controllable unit")
        }
    }

    context("insertAccountingPointIfNotExists") {

        test("inserts a new accounting point and returns its id") {
            // given
            val businessId = uniqueGsrn()

            // when
            val id = with(internalDataPrincipal) {
                repo.insertAccountingPointIfNotExists(AccountingPoint(id = 0, businessId = businessId))
            }.shouldBeRight()

            // then
            val result = with(principal) { repo.getAccountingPointByBusinessId(businessId) }.shouldBeRight()
            result.businessId shouldBe businessId
            result.id shouldBe id
        }

        test("is idempotent on conflict — returns the existing id both times") {
            // given
            val businessId = uniqueGsrn()
            val ap = AccountingPoint(id = 0, businessId = businessId)

            // when — called twice
            val firstId = with(internalDataPrincipal) { repo.insertAccountingPointIfNotExists(ap) }.shouldBeRight()
            val secondId = with(internalDataPrincipal) { repo.insertAccountingPointIfNotExists(ap) }.shouldBeRight()

            // then — same id returned both times, exactly one row exists
            firstId shouldBe secondId
            val count = PostgresTestContainer.withConnection { conn ->
                conn.prepareStatement("SELECT count(*) FROM flex.accounting_point WHERE business_id = ?").use { stmt ->
                    stmt.setString(1, businessId)
                    stmt.executeQuery().use { rs ->
                        rs.next()
                        rs.getLong(1)
                    }
                }
            }
            count shouldBe 1L
        }

        test("does not affect unrelated accounting points") {
            // given
            val noiseBusinessId = uniqueGsrn()
            val noiseId = insertAccountingPoint(noiseBusinessId)
            val newBusinessId = uniqueGsrn()

            // when
            with(internalDataPrincipal) {
                repo.insertAccountingPointIfNotExists(AccountingPoint(id = 0, businessId = newBusinessId))
            }.shouldBeRight()

            // then — noise row still present and unchanged
            val noiseResult = with(principal) { repo.getAccountingPointByBusinessId(noiseBusinessId) }.shouldBeRight()
            noiseResult.id shouldBe noiseId
        }
    }

    context("upsertAccountingPointEndUsers") {

        test("inserts new end-user rows") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())
            val pid = uniquePid()
            val validFrom = Instant.parse("2023-12-31T23:00:00Z")

            // when
            with(internalDataPrincipal) {
                repo.upsertAccountingPointEndUsers(
                    listOf(AccountingPointEndUser(apId, pid, validFrom, null)),
                )
            }.shouldBeRight()

            // then
            val rows = queryEndUserRows(apId)
            rows.size shouldBe 1
            rows[0].validFrom shouldBe validFrom
            rows[0].validTo shouldBe null
        }

        test("creates entity and party on demand for a PID end user") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())
            val pid = uniquePid()

            // when
            with(internalDataPrincipal) {
                repo.upsertAccountingPointEndUsers(
                    listOf(AccountingPointEndUser(apId, pid, Instant.parse("2023-12-31T23:00:00Z"), null)),
                )
            }.shouldBeRight()

            // then — entity and party rows exist
            val entityCount = PostgresTestContainer.withConnection { conn ->
                conn.prepareStatement("SELECT count(*) FROM flex.entity WHERE business_id = ?").use { stmt ->
                    stmt.setString(1, pid)
                    stmt.executeQuery().use { rs ->
                        rs.next()
                        rs.getLong(1)
                    }
                }
            }
            entityCount shouldBe 1L

            val partyCount = PostgresTestContainer.withConnection { conn ->
                conn.prepareStatement(
                    "SELECT count(*) FROM flex.party p JOIN flex.entity e ON e.id = p.entity_id WHERE e.business_id = ? AND p.type = 'end_user'",
                ).use { stmt ->
                    stmt.setString(1, pid)
                    stmt.executeQuery().use { rs ->
                        rs.next()
                        rs.getLong(1)
                    }
                }
            }
            partyCount shouldBe 1L
        }

        test("creates entity and party on demand for an org end user") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())
            val orgNumber = uniqueOrgNumber()

            // when
            with(internalDataPrincipal) {
                repo.upsertAccountingPointEndUsers(
                    listOf(AccountingPointEndUser(apId, orgNumber, Instant.parse("2023-12-31T23:00:00Z"), null)),
                )
            }.shouldBeRight()

            // then
            val entityType = PostgresTestContainer.withConnection { conn ->
                conn.prepareStatement("SELECT type FROM flex.entity WHERE business_id = ?").use { stmt ->
                    stmt.setString(1, orgNumber)
                    stmt.executeQuery().use { rs ->
                        rs.next()
                        rs.getString(1)
                    }
                }
            }
            entityType shouldBe "organisation"
        }

        test("does not create a duplicate party when called twice for the same end user") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())
            val pid = uniquePid()
            val endUsers = listOf(AccountingPointEndUser(apId, pid, Instant.parse("2023-12-31T23:00:00Z"), null))

            // when — called twice with the same end user
            with(internalDataPrincipal) { repo.upsertAccountingPointEndUsers(endUsers) }.shouldBeRight()
            with(internalDataPrincipal) { repo.upsertAccountingPointEndUsers(endUsers) }.shouldBeRight()

            // then — exactly one party row exists for this end user
            val partyCount = PostgresTestContainer.withConnection { conn ->
                conn.prepareStatement(
                    "SELECT count(*) FROM flex.party p JOIN flex.entity e ON e.id = p.entity_id WHERE e.business_id = ? AND p.type = 'end_user'",
                ).use { stmt ->
                    stmt.setString(1, pid)
                    stmt.executeQuery().use { rs ->
                        rs.next()
                        rs.getLong(1)
                    }
                }
            }
            partyCount shouldBe 1L
        }

        test("updates a changed end-user ID (same start, different party)") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())
            val originalPid = uniquePid()
            val newPid = uniquePid()
            val validFrom = Instant.parse("2023-12-31T23:00:00Z")

            with(internalDataPrincipal) {
                repo.upsertAccountingPointEndUsers(
                    listOf(AccountingPointEndUser(apId, originalPid, validFrom, null)),
                )
            }.shouldBeRight()

            // when — same start, different end user
            with(internalDataPrincipal) {
                repo.upsertAccountingPointEndUsers(
                    listOf(AccountingPointEndUser(apId, newPid, validFrom, null)),
                )
            }.shouldBeRight()

            // then — still exactly one row, pointing to the new party
            val rows = queryEndUserRows(apId)
            rows.size shouldBe 1
            rows[0].validFrom shouldBe validFrom

            val newPartyId = PostgresTestContainer.withConnection { conn ->
                conn.prepareStatement(
                    "SELECT p.id FROM flex.party p JOIN flex.entity e ON e.id = p.entity_id WHERE e.business_id = ? AND p.type = 'end_user'",
                ).use { stmt ->
                    stmt.setString(1, newPid)
                    stmt.executeQuery().use { rs ->
                        rs.next()
                        rs.getLong(1)
                    }
                }
            }
            rows[0].endUserPartyId shouldBe newPartyId
        }

        test("updates a changed valid_to (same start + party, different end)") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())
            val pid = uniquePid()
            val validFrom = Instant.parse("2023-12-31T23:00:00Z")
            val originalValidTo = Instant.parse("2024-05-31T22:00:00Z")
            val newValidTo = Instant.parse("2024-12-31T23:00:00Z")

            with(internalDataPrincipal) {
                repo.upsertAccountingPointEndUsers(
                    listOf(AccountingPointEndUser(apId, pid, validFrom, originalValidTo)),
                )
            }.shouldBeRight()

            // when
            with(internalDataPrincipal) {
                repo.upsertAccountingPointEndUsers(
                    listOf(AccountingPointEndUser(apId, pid, validFrom, newValidTo)),
                )
            }.shouldBeRight()

            // then
            val rows = queryEndUserRows(apId)
            rows.size shouldBe 1
            rows[0].validTo shouldBe newValidTo
        }

        test("deletes a stale row (start time absent from incoming)") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())
            val pid = uniquePid()
            val oldStart = Instant.parse("2022-12-31T23:00:00Z")
            val newStart = Instant.parse("2023-12-31T23:00:00Z")

            with(internalDataPrincipal) {
                repo.upsertAccountingPointEndUsers(
                    listOf(AccountingPointEndUser(apId, pid, oldStart, null)),
                )
            }.shouldBeRight()

            // when — incoming only contains newStart; oldStart should be deleted
            with(internalDataPrincipal) {
                repo.upsertAccountingPointEndUsers(
                    listOf(AccountingPointEndUser(apId, pid, newStart, null)),
                )
            }.shouldBeRight()

            // then
            val rows = queryEndUserRows(apId)
            rows.size shouldBe 1
            rows[0].validFrom shouldBe newStart
        }

        test("does not touch rows for a different accounting point") {
            // given
            val noiseApId = insertAccountingPoint(uniqueGsrn())
            val noisePid = uniquePid()
            val noiseStart = Instant.parse("2023-05-31T22:00:00Z")
            val noisePartyId = insertEndUserParty(noisePid)
            linkApToEndUserAt(noiseApId, noisePartyId, noiseStart)

            val targetApId = insertAccountingPoint(uniqueGsrn())
            val targetPid = uniquePid()

            // when
            with(internalDataPrincipal) {
                repo.upsertAccountingPointEndUsers(
                    listOf(AccountingPointEndUser(targetApId, targetPid, Instant.parse("2023-12-31T23:00:00Z"), null)),
                )
            }.shouldBeRight()

            // then — noise AP's row is untouched
            val noiseRows = queryEndUserRows(noiseApId)
            noiseRows.size shouldBe 1
            noiseRows[0].validFrom shouldBe noiseStart
        }
    }

    // -------------------------------------------------------------------------
    // upsertAccountingPointEnergySupplier
    // -------------------------------------------------------------------------

    context("upsertAccountingPointEnergySupplier") {

        test("inserts new energy-supplier rows") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())
            val gln = uniqueGln()
            insertEnergySupplierParty(gln)
            val validFrom = Instant.parse("2023-12-31T23:00:00Z")

            // when
            with(internalDataPrincipal) {
                repo.upsertAccountingPointEnergySupplier(
                    listOf(AccountingPointEnergySupplier(apId, gln, validFrom, null)),
                )
            }.shouldBeRight()

            // then
            val rows = queryEnergySupplierRows(apId)
            rows.size shouldBe 1
            rows[0].validFrom shouldBe validFrom
            rows[0].validTo shouldBe null
        }

        test("updates a changed energy supplier (same start, different party)") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())
            val originalGln = uniqueGln()
            val newGln = uniqueGln()
            insertEnergySupplierParty(originalGln)
            insertEnergySupplierParty(newGln)
            val validFrom = Instant.parse("2023-12-31T23:00:00Z")

            with(internalDataPrincipal) {
                repo.upsertAccountingPointEnergySupplier(
                    listOf(AccountingPointEnergySupplier(apId, originalGln, validFrom, null)),
                )
            }.shouldBeRight()

            // when
            with(internalDataPrincipal) {
                repo.upsertAccountingPointEnergySupplier(
                    listOf(AccountingPointEnergySupplier(apId, newGln, validFrom, null)),
                )
            }.shouldBeRight()

            // then — still exactly one row, pointing to the new party
            val rows = queryEnergySupplierRows(apId)
            rows.size shouldBe 1
            rows[0].validFrom shouldBe validFrom
            val newPartyId = PostgresTestContainer.withConnection { conn ->
                conn.prepareStatement("SELECT id FROM flex.party WHERE business_id = ? AND type = 'energy_supplier'").use { stmt ->
                    stmt.setString(1, newGln)
                    stmt.executeQuery().use { rs ->
                        rs.next()
                        rs.getLong(1)
                    }
                }
            }
            rows[0].energySupplierPartyId shouldBe newPartyId
        }

        test("updates a changed valid_to") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())
            val gln = uniqueGln()
            insertEnergySupplierParty(gln)
            val validFrom = Instant.parse("2023-12-31T23:00:00Z")
            val originalValidTo = Instant.parse("2024-05-31T22:00:00Z")
            val newValidTo = Instant.parse("2024-12-31T23:00:00Z")

            with(internalDataPrincipal) {
                repo.upsertAccountingPointEnergySupplier(
                    listOf(AccountingPointEnergySupplier(apId, gln, validFrom, originalValidTo)),
                )
            }.shouldBeRight()

            // when
            with(internalDataPrincipal) {
                repo.upsertAccountingPointEnergySupplier(
                    listOf(AccountingPointEnergySupplier(apId, gln, validFrom, newValidTo)),
                )
            }.shouldBeRight()

            // then
            val rows = queryEnergySupplierRows(apId)
            rows.size shouldBe 1
            rows[0].validTo shouldBe newValidTo
        }

        test("deletes a stale row") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())
            val gln = uniqueGln()
            insertEnergySupplierParty(gln)
            val oldStart = Instant.parse("2022-12-31T23:00:00Z")
            val newStart = Instant.parse("2023-12-31T23:00:00Z")

            with(internalDataPrincipal) {
                repo.upsertAccountingPointEnergySupplier(
                    listOf(AccountingPointEnergySupplier(apId, gln, oldStart, null)),
                )
            }.shouldBeRight()

            // when
            with(internalDataPrincipal) {
                repo.upsertAccountingPointEnergySupplier(
                    listOf(AccountingPointEnergySupplier(apId, gln, newStart, null)),
                )
            }.shouldBeRight()

            // then
            val rows = queryEnergySupplierRows(apId)
            rows.size shouldBe 1
            rows[0].validFrom shouldBe newStart
        }

        test("does not touch rows for a different accounting point") {
            // given
            val noiseApId = insertAccountingPoint(uniqueGsrn())
            val noiseGln = uniqueGln()
            val noisePartyId = insertEnergySupplierParty(noiseGln)
            val noiseStart = Instant.parse("2023-05-31T22:00:00Z")
            linkApToEnergySupplierAt(noiseApId, noisePartyId, noiseStart)

            val targetApId = insertAccountingPoint(uniqueGsrn())
            val targetGln = uniqueGln()
            insertEnergySupplierParty(targetGln)

            // when
            with(internalDataPrincipal) {
                repo.upsertAccountingPointEnergySupplier(
                    listOf(AccountingPointEnergySupplier(targetApId, targetGln, Instant.parse("2023-12-31T23:00:00Z"), null)),
                )
            }.shouldBeRight()

            // then — noise AP's row is untouched
            val noiseRows = queryEnergySupplierRows(noiseApId)
            noiseRows.size shouldBe 1
            noiseRows[0].validFrom shouldBe noiseStart
        }

        test("returns error when GLN is unknown") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())
            val unknownGln = uniqueGln() // never inserted into flex.party

            // when
            val result = with(internalDataPrincipal) {
                repo.upsertAccountingPointEnergySupplier(
                    listOf(AccountingPointEnergySupplier(apId, unknownGln, Instant.parse("2023-12-31T23:00:00Z"), null)),
                )
            }

            // then
            result.shouldBeLeft() shouldBe DatabaseError("Failed to upsert accounting point energy suppliers")
        }
    }

    context("lockSyncRowAndMarkStart") {

        test("acquires the lock, stamps last_sync_start, and returns Right") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())

            // when
            val result = with(internalDataPrincipal) {
                repo.lockSyncRowAndMarkStart(apId)
            }

            // then
            result.shouldBeRight()
            val row = querySyncRow(apId)
            check(row != null) { "Expected sync row for ap $apId" }
            check(row.lastSyncStart != null) { "Expected last_sync_start to be set after lockSyncRowAndMarkStart" }
        }

        test("returns DatabaseError when no sync row exists for the accounting point") {
            // given — an ID that has no row in flex.accounting_point_sync
            val missingApId = Long.MAX_VALUE

            // when
            val result = with(internalDataPrincipal) {
                repo.lockSyncRowAndMarkStart(missingApId)
            }

            // then
            result.shouldBeLeft() shouldBe
                DatabaseError("Failed to lock sync row for accounting point $missingApId")
        }
    }

    context("markSyncComplete") {

        test("sets last_synced_at, clears last_sync_start, and increments version") {
            // given — insertAccountingPoint triggers accounting_point_insert_sync
            val apId = insertAccountingPoint(uniqueGsrn())

            // when
            with(internalDataPrincipal) {
                repo.markSyncComplete(apId)
            }.shouldBeRight()

            // then
            val row = querySyncRow(apId)
            check(row != null) { "Expected sync row for ap $apId" }
            check(row.lastSyncedAt != null) { "Expected last_synced_at to be set" }
            check(row.lastSyncStart == null) { "Expected last_sync_start to be NULL" }
            row.version shouldBe 1L
        }

        test("increments version on repeated calls") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())

            // when — called twice
            with(internalDataPrincipal) { repo.markSyncComplete(apId) }.shouldBeRight()
            with(internalDataPrincipal) { repo.markSyncComplete(apId) }.shouldBeRight()

            // then
            val row = querySyncRow(apId)
            check(row != null) { "Expected sync row for ap $apId" }
            row.version shouldBe 2L
        }

        test("returns DatabaseError when no sync row exists for the accounting point") {
            // given — use an ID that has no row in flex.accounting_point_sync
            val missingApId = Long.MAX_VALUE

            // when
            val result = with(internalDataPrincipal) {
                repo.markSyncComplete(missingApId)
            }

            // then
            result.shouldBeLeft() shouldBe DatabaseError("No sync row found for accounting point $missingApId")
        }
    }
})

private val pidCounter = AtomicLong(10_000_000_000L)
private val orgCounter = AtomicLong(100_000_000L)
private val glnCounter = AtomicLong(10_000_000L)

private fun uniquePid(): String = pidCounter.getAndIncrement().toString()

private fun uniqueOrgNumber(): String {
    val next = orgCounter.getAndIncrement()
    require(next <= 999_999_999L) { "Exhausted unique org number values in this JVM" }
    return next.toString()
}

private fun uniqueGln(): String {
    val next = glnCounter.getAndIncrement()
    require(next <= 99_999_999L) { "Exhausted unique GLN values in this JVM" }
    // Build a 12-digit prefix: "7080" + 8-digit suffix, then append GS1 check digit → 13 digits total.
    val prefix = "7080" + next.toString().padStart(8, '0')
    return prefix + gs1CheckDigit(prefix)
}

private data class EndUserRow(val endUserPartyId: Long, val validFrom: Instant, val validTo: Instant?)

private data class EnergySupplierRow(val energySupplierPartyId: Long, val validFrom: Instant, val validTo: Instant?)

private data class SyncRow(val lastSyncedAt: java.sql.Timestamp?, val lastSyncStart: java.sql.Timestamp?, val version: Long)

private fun querySyncRow(apId: Long): SyncRow? =
    PostgresTestContainer.withConnection { conn ->
        conn.prepareStatement(
            "SELECT last_synced_at, last_sync_start, version FROM flex.accounting_point_sync WHERE accounting_point_id = ?"
        ).use { stmt ->
            stmt.setLong(1, apId)
            stmt.executeQuery().use { rs ->
                if (rs.next()) {
                    SyncRow(
                        lastSyncedAt = rs.getTimestamp(1),
                        lastSyncStart = rs.getTimestamp(2),
                        version = rs.getLong(3),
                    )
                } else {
                    null
                }
            }
        }
    }

private fun queryEndUserRows(apId: Long): List<EndUserRow> =
    PostgresTestContainer.withConnection { conn ->
        conn.prepareStatement(
            """
            SELECT end_user_id, lower(valid_time_range), upper(valid_time_range)
            FROM flex.accounting_point_end_user
            WHERE accounting_point_id = ?
            ORDER BY lower(valid_time_range)
            """.trimIndent()
        ).use { stmt ->
            stmt.setLong(1, apId)
            stmt.executeQuery().use { rs ->
                val rows = mutableListOf<EndUserRow>()
                while (rs.next()) {
                    rows += EndUserRow(
                        endUserPartyId = rs.getLong(1),
                        validFrom = rs.getTimestamp(2).toKotlinInstant(),
                        validTo = rs.getTimestamp(3).toKotlinInstantOrNull(),
                    )
                }
                rows
            }
        }
    }

private fun queryEnergySupplierRows(apId: Long): List<EnergySupplierRow> =
    PostgresTestContainer.withConnection { conn ->
        conn.prepareStatement(
            """
            SELECT energy_supplier_id, lower(valid_time_range), upper(valid_time_range)
            FROM flex.accounting_point_energy_supplier
            WHERE accounting_point_id = ?
            ORDER BY lower(valid_time_range)
            """.trimIndent()
        ).use { stmt ->
            stmt.setLong(1, apId)
            stmt.executeQuery().use { rs ->
                val rows = mutableListOf<EnergySupplierRow>()
                while (rs.next()) {
                    rows += EnergySupplierRow(
                        energySupplierPartyId = rs.getLong(1),
                        validFrom = rs.getTimestamp(2).toKotlinInstant(),
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

private fun insertControllableUnit(apId: Long, cuBusinessId: String): Long =
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
        val id = conn.prepareStatement(
            """
            INSERT INTO flex.controllable_unit (business_id, name, start_date, regulation_direction, maximum_active_power, accounting_point_id)
            VALUES (?::uuid, ?, current_date, 'up', 100.0, ?)
            RETURNING id
            """.trimIndent(),
        ).use { stmt ->
            stmt.setString(1, cuBusinessId)
            stmt.setString(2, "CU $cuBusinessId")
            stmt.setLong(3, apId)
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getLong(1)
            }
        }
        conn.commit()
        id
    }

private fun insertEndUserParty(entityBusinessId: String): Long =
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }

        val entityId = conn.prepareStatement(
            "INSERT INTO flex.entity (name, type, business_id, business_id_type) VALUES (?, 'person', ?, 'pid') RETURNING id",
        ).use { stmt ->
            stmt.setString(1, "End User $entityBusinessId")
            stmt.setString(2, entityBusinessId)
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getLong(1)
            }
        }

        val partyId = conn.prepareStatement(
            "INSERT INTO flex.party (entity_id, name, type, role) VALUES (?, ?, 'end_user', 'flex_end_user') RETURNING id",
        ).use { stmt ->
            stmt.setLong(1, entityId)
            stmt.setString(2, "End User Party $entityBusinessId")
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getLong(1)
            }
        }

        conn.prepareStatement("UPDATE flex.party SET status = 'active' WHERE id = ?").use { stmt ->
            stmt.setLong(1, partyId)
            stmt.executeUpdate()
        }

        conn.commit()
        partyId
    }

/** Inserts an organisation entity + energy_supplier party with the given GLN, activates it. Returns the party ID. */
private fun insertEnergySupplierParty(gln: String): Long =
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }

        val orgNumber = uniqueOrgNumber()
        val entityId = conn.prepareStatement(
            "INSERT INTO flex.entity (name, type, business_id, business_id_type) VALUES (?, 'organisation', ?, 'org') RETURNING id",
        ).use { stmt ->
            stmt.setString(1, "Energy Supplier $gln")
            stmt.setString(2, orgNumber)
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getLong(1)
            }
        }

        // flex.party holds the GLN as business_id with business_id_type='gln'.
        val partyId = conn.prepareStatement(
            "INSERT INTO flex.party (entity_id, name, type, role, business_id, business_id_type) VALUES (?, ?, 'energy_supplier', 'flex_energy_supplier', ?, 'gln') RETURNING id",
        ).use { stmt ->
            stmt.setLong(1, entityId)
            stmt.setString(2, "Energy Supplier Party $gln")
            stmt.setString(3, gln)
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getLong(1)
            }
        }

        conn.prepareStatement("UPDATE flex.party SET status = 'active' WHERE id = ?").use { stmt ->
            stmt.setLong(1, partyId)
            stmt.executeUpdate()
        }

        conn.commit()
        partyId
    }

private fun linkApToEndUser(apId: Long, euPartyId: Long) {
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
        conn.prepareStatement(
            """
            INSERT INTO flex.accounting_point_end_user (accounting_point_id, end_user_id, valid_time_range)
            VALUES (?, ?, tstzrange(date_trunc('day', now() AT TIME ZONE 'Europe/Oslo') AT TIME ZONE 'Europe/Oslo', null, '[)'))
            """.trimIndent(),
        ).use { stmt ->
            stmt.setLong(1, apId)
            stmt.setLong(2, euPartyId)
            stmt.executeUpdate()
        }
        conn.commit()
    }
}

/** Inserts an end-user link with an explicit valid_from timestamp (for isolation/noise tests). */
private fun linkApToEndUserAt(apId: Long, euPartyId: Long, validFrom: Instant) {
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
        conn.prepareStatement(
            "INSERT INTO flex.accounting_point_end_user (accounting_point_id, end_user_id, valid_time_range) VALUES (?, ?, tstzrange(?::timestamptz, null, '[)'))",
        ).use { stmt ->
            stmt.setLong(1, apId)
            stmt.setLong(2, euPartyId)
            stmt.setString(3, validFrom.toString())
            stmt.executeUpdate()
        }
        conn.commit()
    }
}

/** Inserts an energy-supplier link with an explicit valid_from timestamp (for isolation/noise tests). */
private fun linkApToEnergySupplierAt(apId: Long, esPartyId: Long, validFrom: Instant) {
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
        conn.prepareStatement(
            "INSERT INTO flex.accounting_point_energy_supplier (accounting_point_id, energy_supplier_id, valid_time_range) VALUES (?, ?, tstzrange(?::timestamptz, null, '[)'))",
        ).use { stmt ->
            stmt.setLong(1, apId)
            stmt.setLong(2, esPartyId)
            stmt.setString(3, validFrom.toString())
            stmt.executeUpdate()
        }
        conn.commit()
    }
}
