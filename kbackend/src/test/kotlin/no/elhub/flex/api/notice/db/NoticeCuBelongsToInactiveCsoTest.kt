package no.elhub.flex.api.notice.db

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.api.util.SeedScope
import no.elhub.flex.api.util.Triggers
import no.elhub.flex.api.util.eicComputeCheckChar
import no.elhub.flex.api.util.seed
import java.time.Instant
import java.util.concurrent.atomic.AtomicLong

private const val NOTICE_TYPE = "no.elhub.flex.controllable_unit.cso.no_active_users"

private data class SeededCu(val cuId: Long, val csoId: Long)

private data class PersistedCuNotice(val partyId: Long, val status: String)

/**
 * Notice: a controllable unit whose connecting system operator has no person member in FIS.
 * The notice is targeted at every FISO party.
 */
class NoticeCuBelongsToInactiveCsoTest : FunSpec({

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute(
                    "TRUNCATE flex.notice, flex.controllable_unit, flex.accounting_point, " +
                        "flex.metering_grid_area, flex.party, flex.entity CASCADE",
                )
            }
        }
    }

    context("detection") {

        test("CSO without members gives a notice to the FISO") {
            val fiso = seed(Triggers.OFF) { insertFiso() }
            val cu = seed(Triggers.OFF) { seedCu() }

            detectedPartiesFor(cu.cuId) shouldBe listOf(fiso)
        }

        test("CSO with a person member gives no notice") {
            seed(Triggers.OFF) { insertFiso() }
            val cu = seed(Triggers.OFF) { seedCu(memberEmail = "user@example.com") }

            detectedPartiesFor(cu.cuId).shouldBeEmpty()
        }

        test("CSO whose only member is an organisation gives a notice") {
            val fiso = seed(Triggers.OFF) { insertFiso() }
            val cu = seed(Triggers.OFF) {
                val cu = seedCu()
                val orgEntity = insertOrganisationEntity()
                insertPartyMembership(cu.csoId, orgEntity)
                cu
            }

            detectedPartiesFor(cu.cuId) shouldBe listOf(fiso)
        }

        test("terminated CU gives no notice") {
            seed(Triggers.OFF) { insertFiso() }
            val cu = seed(Triggers.OFF) { seedCu(status = "terminated") }

            detectedPartiesFor(cu.cuId).shouldBeEmpty()
        }

        test("CSO relation that has ended gives no notice") {
            seed(Triggers.OFF) { insertFiso() }
            val cu = seed(Triggers.OFF) { seedCu(soValidTo = Instant.parse("2024-06-01T00:00:00Z")) }

            detectedPartiesFor(cu.cuId).shouldBeEmpty()
        }

        test("every FISO gets a notice") {
            val fisos = seed(Triggers.OFF) { listOf(insertFiso("FISO 1"), insertFiso("FISO 2")) }
            val cu = seed(Triggers.OFF) { seedCu() }

            detectedPartiesFor(cu.cuId) shouldContainExactlyInAnyOrder fisos
        }

        test("only CUs of a CSO without members get a notice") {
            seed(Triggers.OFF) { insertFiso() }
            val withoutUsers = seed(Triggers.OFF) { seedCu() }
            val withUsers = seed(Triggers.OFF) { seedCu(memberEmail = "user@example.com") }

            detectedPartiesFor(withoutUsers.cuId).size shouldBe 1
            detectedPartiesFor(withUsers.cuId).shouldBeEmpty()
        }
    }

    context("synchronisation") {

        test("notice is created, resolved when a user is added, and reactivated when removed") {
            val fiso = seed(Triggers.OFF) { insertFiso() }
            val cu = seed(Triggers.OFF) { seedCu() }

            syncNotices()
            persistedNoticesFor(cu.cuId) shouldBe listOf(PersistedCuNotice(fiso, "active"))

            seed(Triggers.OFF) { insertPartyMember(cu.csoId, "user@example.com") }
            syncNotices()
            persistedNoticesFor(cu.cuId) shouldBe listOf(PersistedCuNotice(fiso, "resolved"))

            execute("DELETE FROM flex.party_membership WHERE party_id = ${cu.csoId}")
            syncNotices()
            persistedNoticesFor(cu.cuId) shouldBe listOf(PersistedCuNotice(fiso, "active"))
        }

        test("syncing twice does not duplicate the notice") {
            seed(Triggers.OFF) { insertFiso() }
            val cu = seed(Triggers.OFF) { seedCu() }

            syncNotices()
            syncNotices()

            persistedNoticesFor(cu.cuId).size shouldBe 1
        }
    }
})

private fun SeedScope.seedCu(
    memberEmail: String? = null,
    status: String = "new",
    soValidTo: Instant? = null,
): SeededCu {
    val so = insertSystemOperator("CSO")
    val mga = insertMeteringGridArea(businessId = nextLocalMgaEic())
    insertMeteringGridAreaSystemOperator(mga, so.partyId, validTo = soValidTo)
    val ap = insertAccountingPoint()
    insertAccountingPointMeteringGridArea(ap, mga)
    val cuId = insertControllableUnit(ap, status = status)
    if (memberEmail != null) insertPartyMember(so.partyId, memberEmail)
    return SeededCu(cuId, so.partyId)
}

// Own EIC-Y sequence so this test does not consume the shared uniqueEicY() counter, which would
// shift the ids other test classes get. Counters with a '-' check character are rejected by the DB.
private val localMgaCounter = AtomicLong(500_000_000_000L)

private fun nextLocalMgaEic(): String {
    while (true) {
        val prefix = "10Y" + localMgaCounter.getAndIncrement().toString().padStart(12, '0')
        val check = eicComputeCheckChar(prefix)
        if (check != '-') return prefix + check
    }
}

private fun syncNotices() = execute("SELECT flex.notice_sync()")

private fun execute(sql: String) {
    PostgresTestContainer.withConnection { conn -> conn.createStatement().use { it.execute(sql) } }
}

private fun detectedPartiesFor(cuId: Long): List<Long> =
    query(
        "SELECT party_id FROM flex.notice_cu_belongs_to_inactive_cso " +
            "WHERE type = '$NOTICE_TYPE'::ltree AND source_id = $cuId",
    ) { it.getLong(1) }

private fun persistedNoticesFor(cuId: Long): List<PersistedCuNotice> =
    query(
        "SELECT party_id, status FROM flex.notice WHERE type = '$NOTICE_TYPE'::ltree AND source_id = $cuId",
    ) { PersistedCuNotice(it.getLong(1), it.getString(2)) }

private fun <T> query(sql: String, map: (java.sql.ResultSet) -> T): List<T> =
    PostgresTestContainer.withConnection { conn ->
        conn.createStatement().use { stmt ->
            stmt.executeQuery(sql).use { rs -> buildList { while (rs.next()) add(map(rs)) } }
        }
    }
