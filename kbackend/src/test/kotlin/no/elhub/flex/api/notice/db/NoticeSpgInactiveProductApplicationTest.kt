package no.elhub.flex.api.notice.db

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.shouldBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationStatus
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationStatus.INACTIVE
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationStatus.PREQUALIFICATION
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationStatus.PREQUALIFIED
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationStatus.REJECTED
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationStatus.REQUESTED
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationStatus.TEMPORARY_QUALIFIED
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationStatus.VERIFIED
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupStatus
import no.elhub.flex.api.util.Triggers
import no.elhub.flex.api.util.seed

private const val NOTICE_TYPE =
    "no.elhub.flex.service_providing_group_product_application.service_providing_group.inactive"

/** A notice as computed by the detection view, without any stored state. */
private data class DetectedNotice(val partyId: Long, val sourceResource: String, val sourceId: Long)

/** A notice as stored in the notice table by the synchronisation. */
private data class PersistedNotice(val partyId: Long, val sourceId: Long, val status: String)

private data class SeededSpg(val serviceProviderId: Long, val spgId: Long, val applicationIds: List<Long>)

/**
 * Notice: an inactive SPG that still has product applications which are neither inactive nor rejected.
 * The notice is targeted at the service provider that owns the SPG.
 */
class NoticeSpgInactiveProductApplicationTest : FunSpec({

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute("TRUNCATE flex.notice, flex.party, flex.entity, flex.product_type CASCADE")
            }
        }
    }

    context("detection") {

        test("inactive SPG with a requested application gives a notice to the SP") {
            // given
            val spg = seedSpg(ServiceProvidingGroupStatus.INACTIVE, REQUESTED)

            // when
            val notice = detectedNoticeFor(spg.spgId)

            // then
            notice shouldBe DetectedNotice(spg.serviceProviderId, "service_providing_group", spg.spgId)
        }

        test("inactive SPG with one application in each live status gives a single notice") {
            // given
            val spg = seedSpg(
                ServiceProvidingGroupStatus.INACTIVE,
                REQUESTED,
                PREQUALIFICATION,
                TEMPORARY_QUALIFIED,
                PREQUALIFIED,
                VERIFIED,
            )

            // when
            val count = detectedNoticeCountFor(spg.spgId)

            // then
            count shouldBe 1
        }

        listOf(
            ServiceProvidingGroupStatus.NEW,
            ServiceProvidingGroupStatus.ACTIVE,
            ServiceProvidingGroupStatus.TERMINATED,
        ).forEach { spgStatus ->
            test("$spgStatus SPG with a live application gives no notice") {
                // given
                val spg = seedSpg(spgStatus, REQUESTED)

                // when / then
                detectedNoticeFor(spg.spgId).shouldBeNull()
            }
        }

        test("inactive SPG with only inactive applications gives no notice") {
            // given
            val spg = seedSpg(ServiceProvidingGroupStatus.INACTIVE, INACTIVE, INACTIVE)

            // when / then
            detectedNoticeFor(spg.spgId).shouldBeNull()
        }

        test("inactive SPG with only rejected applications gives no notice") {
            // given
            val spg = seedSpg(ServiceProvidingGroupStatus.INACTIVE, REJECTED)

            // when / then
            detectedNoticeFor(spg.spgId).shouldBeNull()
        }

        test("inactive SPG with a rejected and a live application gives a notice") {
            // given
            val spg = seedSpg(ServiceProvidingGroupStatus.INACTIVE, REJECTED, REQUESTED)

            // when / then
            detectedNoticeFor(spg.spgId)?.sourceId shouldBe spg.spgId
        }

        test("inactive SPG without applications gives no notice") {
            // given
            val spg = seedSpg(ServiceProvidingGroupStatus.INACTIVE)

            // when / then
            detectedNoticeFor(spg.spgId).shouldBeNull()
        }

        test("only the inactive SPG gets a notice when there are several") {
            // given
            val inactiveSpg = seedSpg(ServiceProvidingGroupStatus.INACTIVE, VERIFIED)
            val activeSpg = seedSpg(ServiceProvidingGroupStatus.ACTIVE, VERIFIED)

            // when / then
            detectedNoticeFor(inactiveSpg.spgId)?.sourceId shouldBe inactiveSpg.spgId
            detectedNoticeFor(activeSpg.spgId).shouldBeNull()
        }
    }

    context("synchronisation") {

        test("notice is created, resolved when the application is deactivated, and reactivated") {
            // given
            val spg = seedSpg(ServiceProvidingGroupStatus.INACTIVE, REQUESTED)
            val applicationId = spg.applicationIds.single()

            // when
            syncNotices()

            // then
            persistedNoticeFor(spg.spgId) shouldBe PersistedNotice(spg.serviceProviderId, spg.spgId, "active")

            // when
            setApplicationStatus(applicationId, INACTIVE)
            syncNotices()

            // then
            persistedNoticeFor(spg.spgId)?.status shouldBe "resolved"

            // when
            setApplicationStatus(applicationId, REQUESTED)
            syncNotices()

            // then
            persistedNoticeFor(spg.spgId)?.status shouldBe "active"
            persistedNoticeCountFor(spg.spgId) shouldBe 1
        }

        test("notice is resolved when the last live application is rejected") {
            // given
            val spg = seedSpg(ServiceProvidingGroupStatus.INACTIVE, REQUESTED, INACTIVE)
            syncNotices()
            persistedNoticeFor(spg.spgId)?.status shouldBe "active"

            // when
            setApplicationStatus(spg.applicationIds.first(), REJECTED)
            syncNotices()

            // then
            persistedNoticeFor(spg.spgId)?.status shouldBe "resolved"
        }
    }
})

private fun seedSpg(
    spgStatus: ServiceProvidingGroupStatus,
    vararg applicationStatuses: ServiceProvidingGroupProductApplicationStatus,
): SeededSpg =
    seed(Triggers.OFF) {
        val serviceProviderId = insertServiceProvider()
        val spgId = insertServiceProvidingGroup(serviceProviderId = serviceProviderId, status = spgStatus)
        val pso = insertSystemOperator("PSO")
        val productTypeId = insertProductType()
        val applicationIds = applicationStatuses.map {
            insertServiceProvidingGroupProductApplication(spgId, pso.partyId, listOf(productTypeId), it)
        }
        SeededSpg(serviceProviderId, spgId, applicationIds)
    }

private fun setApplicationStatus(applicationId: Long, status: ServiceProvidingGroupProductApplicationStatus) {
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use {
            it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)")
            it.execute("SELECT public.disable_triggers()")
        }
        conn.prepareStatement("UPDATE flex.service_providing_group_product_application SET status = ? WHERE id = ?")
            .use { stmt ->
                stmt.setString(1, status.value)
                stmt.setLong(2, applicationId)
                stmt.executeUpdate()
            }
        conn.commit()
    }
}

private fun syncNotices() {
    PostgresTestContainer.withConnection { conn ->
        conn.createStatement().use { it.execute("SELECT flex.notice_sync()") }
    }
}

private fun detectedNoticeFor(spgId: Long): DetectedNotice? =
    queryNotices(
        "SELECT party_id, source_resource, source_id FROM flex.notice_spgpa_spg_inactive " +
            "WHERE type = '$NOTICE_TYPE'::ltree AND source_id = $spgId",
    ) { DetectedNotice(it.getLong(1), it.getString(2), it.getLong(3)) }.singleOrNull()

private fun detectedNoticeCountFor(spgId: Long): Int =
    queryNotices(
        "SELECT source_id FROM flex.notice_spgpa_spg_inactive " +
            "WHERE type = '$NOTICE_TYPE'::ltree AND source_id = $spgId",
    ) { it.getLong(1) }.size

private fun persistedNoticeFor(spgId: Long): PersistedNotice? =
    queryNotices(
        "SELECT party_id, source_id, status FROM flex.notice " +
            "WHERE type = '$NOTICE_TYPE'::ltree AND source_id = $spgId",
    ) { PersistedNotice(it.getLong(1), it.getLong(2), it.getString(3)) }.singleOrNull()

private fun persistedNoticeCountFor(spgId: Long): Int =
    queryNotices(
        "SELECT id FROM flex.notice WHERE type = '$NOTICE_TYPE'::ltree AND source_id = $spgId",
    ) { it.getLong(1) }.size

private fun <T> queryNotices(sql: String, map: (java.sql.ResultSet) -> T): List<T> =
    PostgresTestContainer.withConnection { conn ->
        conn.createStatement().use { stmt ->
            stmt.executeQuery(sql).use { rs ->
                buildList { while (rs.next()) add(map(rs)) }
            }
        }
    }
