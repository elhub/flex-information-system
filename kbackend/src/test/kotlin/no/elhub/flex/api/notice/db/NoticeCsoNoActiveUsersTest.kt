package no.elhub.flex.api.notice.db

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import java.time.Instant

private const val NOTICE_TYPE = "no.elhub.flex.party.connecting_system_operator.no_active_users"

private data class SeededCu(val cuId: Long, val csoId: Long, val mgaId: Long)

private data class PersistedCsoNotice(val partyId: Long, val status: String)

/**
 * Notice: a connecting system operator (CSO) with active controllable units but no person member in FIS.
 * The notice has the CSO as source and is targeted at every FISO party.
 */
class NoticeCsoNoActiveUsersTest : FunSpec({

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

        test("CSO with an active CU and no members gives a notice to the FISO") {
            val fiso = seed(Triggers.OFF) { insertFiso() }
            val cu = seed(Triggers.OFF) { seedCuWithCso() }

            detectedPartiesFor(cu.csoId) shouldBe listOf(fiso)
        }

        test("CSO with a person member gives no notice") {
            seed(Triggers.OFF) { insertFiso() }
            val cu = seed(Triggers.OFF) { seedCuWithCso(memberEmail = "user@example.com") }

            detectedPartiesFor(cu.csoId).shouldBeEmpty()
        }

        test("CSO whose only member is an organisation gives a notice") {
            val fiso = seed(Triggers.OFF) { insertFiso() }
            val cu = seed(Triggers.OFF) {
                val cu = seedCuWithCso()
                insertPartyMembership(cu.csoId, insertOrganisationEntity())
                cu
            }

            detectedPartiesFor(cu.csoId) shouldBe listOf(fiso)
        }

        listOf("new", "inactive", "terminated").forEach { status ->
            test("CSO whose only CU is $status gives no notice") {
                seed(Triggers.OFF) { insertFiso() }
                val cu = seed(Triggers.OFF) { seedCuWithCso(status = status) }

                detectedPartiesFor(cu.csoId).shouldBeEmpty()
            }
        }

        test("CSO relation that has ended gives no notice") {
            seed(Triggers.OFF) { insertFiso() }
            val cu = seed(Triggers.OFF) { seedCuWithCso(soValidTo = Instant.parse("2024-06-01T00:00:00Z")) }

            detectedPartiesFor(cu.csoId).shouldBeEmpty()
        }

        test("every FISO gets a notice") {
            val fisos = seed(Triggers.OFF) { listOf(insertFiso("FISO 1"), insertFiso("FISO 2")) }
            val cu = seed(Triggers.OFF) { seedCuWithCso() }

            detectedPartiesFor(cu.csoId) shouldContainExactlyInAnyOrder fisos
        }

        test("several active CUs on one CSO give a single notice") {
            val fiso = seed(Triggers.OFF) { insertFiso() }
            val first = seed(Triggers.OFF) {
                val first = seedCuWithCso()
                seedCu(first.csoId, first.mgaId)
                seedCu(first.csoId, first.mgaId)
                first
            }

            detectedPartiesFor(first.csoId) shouldBe listOf(fiso)
        }

        test("an inactive CU does not hide an active one") {
            val fiso = seed(Triggers.OFF) { insertFiso() }
            val first = seed(Triggers.OFF) {
                val first = seedCuWithCso(status = "inactive")
                seedCu(first.csoId, first.mgaId)
                first
            }

            detectedPartiesFor(first.csoId) shouldBe listOf(fiso)
        }

        test("only the CSO without members gets a notice") {
            seed(Triggers.OFF) { insertFiso() }
            val withoutUsers = seed(Triggers.OFF) { seedCuWithCso() }
            val withUsers = seed(Triggers.OFF) { seedCuWithCso(memberEmail = "user@example.com") }

            detectedPartiesFor(withoutUsers.csoId).size shouldBe 1
            detectedPartiesFor(withUsers.csoId).shouldBeEmpty()
        }
    }

    context("synchronisation") {

        test("notice is created, resolved when a user is added, and reactivated when removed") {
            val fiso = seed(Triggers.OFF) { insertFiso() }
            val cu = seed(Triggers.OFF) { seedCuWithCso() }

            syncNotices()
            persistedNoticesFor(cu.csoId) shouldBe listOf(PersistedCsoNotice(fiso, "active"))

            seed(Triggers.OFF) { insertPartyMember(cu.csoId, "user@example.com") }
            syncNotices()
            persistedNoticesFor(cu.csoId) shouldBe listOf(PersistedCsoNotice(fiso, "resolved"))

            execute("DELETE FROM flex.party_membership WHERE party_id = ${cu.csoId}")
            syncNotices()
            persistedNoticesFor(cu.csoId) shouldBe listOf(PersistedCsoNotice(fiso, "active"))
        }

        test("syncing twice does not duplicate the notice") {
            seed(Triggers.OFF) { insertFiso() }
            val cu = seed(Triggers.OFF) { seedCuWithCso() }

            syncNotices()
            syncNotices()

            persistedNoticesFor(cu.csoId).size shouldBe 1
        }

        test("notice stays the same row when another CU is added") {
            seed(Triggers.OFF) { insertFiso() }
            val cu = seed(Triggers.OFF) { seedCuWithCso() }
            syncNotices()
            val before = persistedNoticeIdsFor(cu.csoId)

            seed(Triggers.OFF) { seedCu(cu.csoId, cu.mgaId) }
            syncNotices()

            persistedNoticeIdsFor(cu.csoId) shouldBe before
        }

        test("notice is resolved when the CSO has no active CU left") {
            val fiso = seed(Triggers.OFF) { insertFiso() }
            val cu = seed(Triggers.OFF) { seedCuWithCso() }
            syncNotices()

            execute("UPDATE flex.controllable_unit SET status = 'inactive' WHERE id = ${cu.cuId}")
            syncNotices()

            persistedNoticesFor(cu.csoId) shouldBe listOf(PersistedCsoNotice(fiso, "resolved"))
        }
    }
})

/** A CSO that owns a metering grid area. */
private data class SeededCso(val csoId: Long, val mgaId: Long)

/** Seeds a CSO that owns a new metering grid area. */
private fun SeedScope.seedCso(memberEmail: String? = null, soValidTo: Instant? = null): SeededCso {
    val so = insertSystemOperator("CSO")
    val mga = insertMeteringGridArea()
    insertMeteringGridAreaSystemOperator(mga, so.partyId, validTo = soValidTo)
    if (memberEmail != null) insertPartyMember(so.partyId, memberEmail)
    return SeededCso(so.partyId, mga)
}

/** Seeds a CU on a new accounting point in the metering grid area [mgaId], so its CSO is the owner of [mgaId]. */
private fun SeedScope.seedCu(csoId: Long, mgaId: Long, status: String = "active"): SeededCu {
    val ap = insertAccountingPoint()
    insertAccountingPointMeteringGridArea(ap, mgaId)
    return SeededCu(insertControllableUnit(ap, status = status), csoId, mgaId)
}

/** Seeds a new CSO with one CU. */
private fun SeedScope.seedCuWithCso(
    memberEmail: String? = null,
    status: String = "active",
    soValidTo: Instant? = null,
): SeededCu {
    val cso = seedCso(memberEmail, soValidTo)
    return seedCu(cso.csoId, cso.mgaId, status)
}

private fun syncNotices() = execute("SELECT flex.notice_sync()")

private fun execute(sql: String) {
    PostgresTestContainer.withConnection { conn -> conn.createStatement().use { it.execute(sql) } }
}

private fun detectedPartiesFor(csoId: Long): List<Long> =
    query(
        "SELECT party_id FROM flex.notice_cso_no_active_users " +
            "WHERE source_resource = 'party' AND type = '$NOTICE_TYPE'::ltree AND source_id = $csoId",
    ) { it.getLong(1) }

private fun persistedNoticesFor(csoId: Long): List<PersistedCsoNotice> =
    query(
        "SELECT party_id, status FROM flex.notice WHERE source_resource = 'party' AND type = '$NOTICE_TYPE'::ltree AND source_id = $csoId",
    ) { PersistedCsoNotice(it.getLong(1), it.getString(2)) }

private fun persistedNoticeIdsFor(csoId: Long): List<Long> =
    query("SELECT id FROM flex.notice WHERE type = '$NOTICE_TYPE'::ltree AND source_id = $csoId") { it.getLong(1) }

private fun <T> query(sql: String, map: (java.sql.ResultSet) -> T): List<T> =
    PostgresTestContainer.withConnection { conn ->
        conn.createStatement().use { stmt ->
            stmt.executeQuery(sql).use { rs -> buildList { while (rs.next()) add(map(rs)) } }
        }
    }
