package no.elhub.flex.api.serviceprovidinggroup.db

import arrow.core.Either
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.comparables.shouldBeGreaterThan
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import kotlinx.coroutines.runBlocking
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationStatus
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationStatus.REJECTED
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationStatus.REQUESTED
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import java.sql.SQLException
import java.time.Instant
import java.time.OffsetDateTime

private const val SP_ROLE = "flex_service_provider"
private const val FISO_ROLE = "flex_flexibility_information_system_operator"

private val OLD_REQUESTED_AT = OffsetDateTime.parse("2020-01-01T10:00:00Z")
private val MANUAL_REQUESTED_AT = OffsetDateTime.parse("2021-06-15T12:30:00Z")

private data class SeededApplication(val applicationId: Long, val serviceProviderId: Long, val fisoId: Long, val psoId: Long, val productTypeId: Long)

/**
 * `requested_at` follows the status `requested`: it is reset by the system when the application is set (back) to
 * requested, and it can only be edited manually by FISO/PSO.
 */
class ServiceProvidingGroupProductApplicationRequestedAtTest : FunSpec({

    test("requested_at is set when the SP sets a rejected application back to requested") {
        // given
        val seeded = seedApplication(REJECTED)
        val before = Instant.now()

        // when
        updateAs(SP_ROLE, seeded.serviceProviderId, seeded.applicationId, "status = 'requested'")

        // then
        val requestedAt = requestedAt(seeded.applicationId).toInstant()
        requestedAt shouldBeGreaterThan OLD_REQUESTED_AT.toInstant()
        requestedAt shouldBeGreaterThan before.minusSeconds(60)
    }

    test("the SP cannot set requested_at manually") {
        // given
        val seeded = seedApplication(REQUESTED)

        // when
        val error = shouldThrow<SQLException> {
            updateAs(SP_ROLE, seeded.serviceProviderId, seeded.applicationId, "requested_at = '$MANUAL_REQUESTED_AT'")
        }

        // then
        error.sqlState shouldBe "PT403"
        error.message shouldContain "Only FISO or PSO can edit requested_at"
        requestedAt(seeded.applicationId) shouldBe OLD_REQUESTED_AT
    }

    test("the SP cannot set requested_at manually when setting the status back to requested") {
        // given
        val seeded = seedApplication(REJECTED)

        // when
        val error = shouldThrow<SQLException> {
            updateAs(
                SP_ROLE,
                seeded.serviceProviderId,
                seeded.applicationId,
                "status = 'requested', requested_at = '$MANUAL_REQUESTED_AT'",
            )
        }

        // then
        error.sqlState shouldBe "PT403"
        requestedAt(seeded.applicationId) shouldBe OLD_REQUESTED_AT
    }

    test("FISO can set requested_at manually, overriding the existing value") {
        // given
        val seeded = seedApplication(REJECTED)

        // when
        updateAs(FISO_ROLE, seeded.fisoId, seeded.applicationId, "requested_at = '$MANUAL_REQUESTED_AT'")

        // then
        requestedAt(seeded.applicationId) shouldBe MANUAL_REQUESTED_AT
    }
})

/** An application with an old `requested_at`. Seeded without triggers, so the value is set explicitly. */
private fun seedApplication(status: ServiceProvidingGroupProductApplicationStatus): SeededApplication =
    seed(Triggers.OFF) {
        val serviceProviderId = insertServiceProvider()
        val spgId = insertServiceProvidingGroup(serviceProviderId = serviceProviderId)
        val pso = insertSystemOperator("PSO")
        val productTypeId = insertProductType()
        val applicationId = insertServiceProvidingGroupProductApplication(
            spgId,
            pso.partyId,
            listOf(productTypeId),
            status,
        )
        val fisoId = insertFiso()
        SeededApplication(applicationId, serviceProviderId, fisoId, pso.partyId, productTypeId)
    }.also { setOldRequestedAt(it) }

/** Sets the old `requested_at`, and sets up the product type and SP qualification that the update triggers require. */
private fun setOldRequestedAt(seeded: SeededApplication) {
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use {
            it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)")
            it.execute("SELECT public.disable_triggers()")
        }
        conn.prepareStatement(
            "UPDATE flex.service_providing_group_product_application SET requested_at = ? WHERE id = ?",
        ).use { stmt ->
            stmt.setObject(1, OLD_REQUESTED_AT)
            stmt.setLong(2, seeded.applicationId)
            stmt.executeUpdate()
        }
        conn.prepareStatement(
            "INSERT INTO flex.system_operator_product_type (system_operator_id, product_type_id) VALUES (?, ?)",
        ).use { stmt ->
            stmt.setLong(1, seeded.psoId)
            stmt.setLong(2, seeded.productTypeId)
            stmt.executeUpdate()
        }
        conn.prepareStatement(
            "INSERT INTO flex.service_provider_product_application " +
                "(service_provider_id, system_operator_id, product_type_ids, status, qualified_at) " +
                "VALUES (?, ?, ARRAY[?]::bigint[], 'qualified', current_timestamp)",
        ).use { stmt ->
            stmt.setLong(1, seeded.serviceProviderId)
            stmt.setLong(2, seeded.psoId)
            stmt.setLong(3, seeded.productTypeId)
            stmt.executeUpdate()
        }
        conn.commit()
    }
}

/**
 * Runs the update as the given role and party, with triggers and RLS active. Failures are rethrown as the
 * underlying [SQLException].
 */
private fun updateAs(role: String, partyId: Long, applicationId: Long, setClause: String) {
    try {
        runBlocking {
            with(FlexPrincipal(role = role, eid = "0")) {
                flexTransaction { conn ->
                    conn.prepareStatement("SELECT set_config('flex.current_party', ?, true)").use { stmt ->
                        stmt.setString(1, partyId.toString())
                        stmt.execute()
                    }
                    conn.createStatement().use {
                        // the SPGPA triggers refer to tables without schema
                        it.execute("SET LOCAL search_path TO flex, public")
                        it.executeUpdate(
                            "UPDATE flex.service_providing_group_product_application " +
                                "SET $setClause WHERE id = $applicationId",
                        )
                    }
                    Either.Right(Unit)
                }
            }
        }.shouldBeRight()
    } catch (e: Exception) {
        throw generateSequence<Throwable>(e) { it.cause }.filterIsInstance<SQLException>().firstOrNull() ?: e
    }
}

private fun requestedAt(applicationId: Long): OffsetDateTime =
    PostgresTestContainer.withConnection { conn ->
        conn.prepareStatement(
            "SELECT requested_at FROM flex.service_providing_group_product_application WHERE id = ?",
        ).use { stmt ->
            stmt.setLong(1, applicationId)
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getObject(1, OffsetDateTime::class.java)
            }
        }
    }
