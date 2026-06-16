package no.elhub.flex.accountingpoint.db

import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.util.uniqueGsrn
import java.sql.Timestamp
import kotlin.time.Clock
import kotlin.time.Duration.Companion.hours
import kotlin.time.Duration.Companion.minutes
import kotlin.time.Instant
import kotlin.time.toJavaInstant

@Suppress("MagicNumber")
class AccountingPointSyncRepositoryTest : FunSpec({

    val repo = AccountingPointSyncRepositoryImpl()
    val principal = FlexPrincipal.internalData()

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute("TRUNCATE flex.accounting_point CASCADE")
            }
        }
    }

    context("getBatchForSync") {

        test("selects rows where both timestamps are NULL (newly inserted)") {
            // given — trigger auto-inserts sync row with NULLs
            val apId = insertSyncTestAccountingPoint(uniqueGsrn())

            // when
            val result = with(principal) { repo.getBatchForSync(10) }.shouldBeRight()

            // then
            result shouldContainExactlyInAnyOrder listOf(apId)
        }

        test("selects rows where last_synced_at is older than 23 hours") {
            // given
            val apId = insertSyncTestAccountingPoint(uniqueGsrn())
            setSyncTimestamps(apId, lastSyncedAt = Clock.System.now() - 24.hours, lastSyncStart = null)

            // when
            val result = with(principal) { repo.getBatchForSync(10) }.shouldBeRight()

            // then
            result shouldContainExactlyInAnyOrder listOf(apId)
        }

        test("selects rows where last_sync_start is older than 5 minutes (stale lock)") {
            // given — overdue for sync, and previous sync attempt timed out
            val apId = insertSyncTestAccountingPoint(uniqueGsrn())
            setSyncTimestamps(apId, lastSyncedAt = Clock.System.now() - 24.hours, lastSyncStart = Clock.System.now() - 10.minutes)

            // when
            val result = with(principal) { repo.getBatchForSync(10) }.shouldBeRight()

            // then
            result shouldContainExactlyInAnyOrder listOf(apId)
        }

        test("skips rows synced within last 23 hours") {
            // given
            val apId = insertSyncTestAccountingPoint(uniqueGsrn())
            setSyncTimestamps(apId, lastSyncedAt = Clock.System.now() - 1.hours, lastSyncStart = null)

            // when
            val result = with(principal) { repo.getBatchForSync(10) }.shouldBeRight()

            // then — row is fresh, should not be selected
            result shouldHaveSize 0
        }

        test("skips rows with recent last_sync_start (sync in progress)") {
            // given — overdue for sync, but a sync was recently started
            val apId = insertSyncTestAccountingPoint(uniqueGsrn())
            setSyncTimestamps(apId, lastSyncedAt = Clock.System.now() - 24.hours, lastSyncStart = Clock.System.now() - 1.minutes)

            // when
            val result = with(principal) { repo.getBatchForSync(10) }.shouldBeRight()

            // then — sync started recently, should be skipped
            result shouldHaveSize 0
        }

        test("updates last_sync_start to NOW() for selected rows") {
            // given
            val apId = insertSyncTestAccountingPoint(uniqueGsrn())
            val syncRowBefore = querySyncRow(apId)
            syncRowBefore?.lastSyncStart shouldBe null

            // when
            with(principal) { repo.getBatchForSync(10) }.shouldBeRight()

            // then
            val syncRowAfter = querySyncRow(apId)
            syncRowAfter?.lastSyncStart shouldNotBe null
        }

        test("respects batch size limit") {
            // given — 5 eligible rows
            repeat(5) { insertSyncTestAccountingPoint(uniqueGsrn()) }

            // when — ask for 3
            val result = with(principal) { repo.getBatchForSync(3) }.shouldBeRight()

            // then
            result shouldHaveSize 3
        }

        test("returns empty list when no rows are eligible") {
            // given — one fresh row
            val apId = insertSyncTestAccountingPoint(uniqueGsrn())
            setSyncTimestamps(apId, lastSyncedAt = Clock.System.now() - 1.hours, lastSyncStart = null)

            // when
            val result = with(principal) { repo.getBatchForSync(10) }.shouldBeRight()

            // then
            result shouldHaveSize 0
        }

        test("returns only eligible rows when mix of eligible and non-eligible exist") {
            // given
            val eligibleId = insertSyncTestAccountingPoint(uniqueGsrn())
            val freshId = insertSyncTestAccountingPoint(uniqueGsrn())
            setSyncTimestamps(freshId, lastSyncedAt = Clock.System.now() - 1.hours, lastSyncStart = null)

            // when
            val result = with(principal) { repo.getBatchForSync(10) }.shouldBeRight()

            // then
            result shouldContainExactlyInAnyOrder listOf(eligibleId)
        }
    }
})

private data class SyncTimestamps(val lastSyncedAt: Timestamp?, val lastSyncStart: Timestamp?)

private fun insertSyncTestAccountingPoint(apBusinessId: String): Long =
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

private fun querySyncRow(apId: Long): SyncTimestamps? =
    PostgresTestContainer.withConnection { conn ->
        conn.prepareStatement(
            "SELECT last_synced_at, last_sync_start FROM flex.accounting_point_sync WHERE accounting_point_id = ?"
        ).use { stmt ->
            stmt.setLong(1, apId)
            stmt.executeQuery().use { rs ->
                if (rs.next()) SyncTimestamps(rs.getTimestamp(1), rs.getTimestamp(2)) else null
            }
        }
    }

private fun setSyncTimestamps(apId: Long, lastSyncedAt: Instant?, lastSyncStart: Instant?) =
    PostgresTestContainer.withConnection { conn ->
        conn.prepareStatement(
            "UPDATE flex.accounting_point_sync SET last_synced_at = ?, last_sync_start = ? WHERE accounting_point_id = ?"
        ).use { stmt ->
            stmt.setTimestamp(1, lastSyncedAt?.let { Timestamp.from(it.toJavaInstant()) })
            stmt.setTimestamp(2, lastSyncStart?.let { Timestamp.from(it.toJavaInstant()) })
            stmt.setLong(3, apId)
            stmt.executeUpdate()
        }
    }
