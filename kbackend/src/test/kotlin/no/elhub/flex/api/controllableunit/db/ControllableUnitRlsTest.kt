package no.elhub.flex.api.controllableunit.db

import arrow.core.Either
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.api.util.SeededSystemOperator
import no.elhub.flex.api.util.Triggers
import no.elhub.flex.api.util.seed
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import java.time.Instant

/**
 * Row level security for `flex.controllable_unit` and its history as a system operator (SO).
 *
 * - CU-SO002: a procuring SO (PSO) can read the CUs that are, or have been, in a SPG with a product
 *   application for the PSO. A deleted membership is moved to the history table, so the access must
 *   not depend on the current memberships only.
 * - CU-SO003: the history of a CU can be read when the CU can be read
 *
 * The seeding runs with triggers off, since the tests only need the rows to exist.
 * The membership is deleted, and the CU is updated, with triggers on, so that the old versions are moved
 * to the history tables.
 */
class ControllableUnitRlsTest : FunSpec({

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute(
                    "TRUNCATE flex.accounting_point, flex.party, flex.entity, flex.metering_grid_area, " +
                        "flex.product_type, flex.service_providing_group_membership_history, " +
                        "flex.controllable_unit_history CASCADE",
                )
            }
        }
    }

    context("CU-SO002 (PSO)") {

        test("PSO can read a CU that is a member of the SPG") {
            // given
            val (cuId, pso) = seedCuInGroupOfPso().let { it.cuId to it.pso }

            // when
            val count = with(pso.principal) { countControllableUnits(cuId) }

            // then
            count shouldBe 1
        }

        test("PSO can read a CU after its membership is deleted") {
            // given
            val seeded = seedCuInGroupOfPso()
            seed(Triggers.ON) { deleteMembership(seeded.membershipId) }

            // when
            val count = with(seeded.pso.principal) { countControllableUnits(seeded.cuId) }

            // then
            count shouldBe 1
        }

        test("PSO can read the history of a CU after its membership is deleted") {
            // given
            val seeded = seedCuInGroupOfPso()
            updateControllableUnitMaximumActivePower(seeded.cuId, 2.0)
            seed(Triggers.ON) { deleteMembership(seeded.membershipId) }

            // when
            val count = with(seeded.pso.principal) { countControllableUnitHistory(seeded.cuId) }

            // then
            count shouldBe 1
        }

        test("PSO can read a CU after its membership has ended") {
            // given
            val seeded = seedCuInGroupOfPso(validTo = Instant.parse("2024-06-01T00:00:00Z"))

            // when
            val count = with(seeded.pso.principal) { countControllableUnits(seeded.cuId) }

            // then
            count shouldBe 1
        }

        test("PSO of another SPG cannot read the CU after its membership is deleted") {
            // given
            val seeded = seedCuInGroupOfPso()
            val otherPso = seed(Triggers.OFF) {
                val otherSpgId = insertServiceProvidingGroup()
                val otherPso = insertSystemOperator("Other PSO")
                insertServiceProvidingGroupProductApplication(otherSpgId, otherPso.partyId, listOf(insertProductType()))
                otherPso
            }
            seed(Triggers.ON) { deleteMembership(seeded.membershipId) }

            // when
            val count = with(otherPso.principal) { countControllableUnits(seeded.cuId) }

            // then
            count shouldBe 0
        }
    }

    context("no relation to the CU") {

        test("SO cannot read the CU or its history after its membership is deleted") {
            // given
            val seeded = seedCuInGroupOfPso()
            updateControllableUnitMaximumActivePower(seeded.cuId, 2.0)
            val unrelatedSo = seed(Triggers.OFF) { insertSystemOperator("Unrelated SO") }
            seed(Triggers.ON) { deleteMembership(seeded.membershipId) }

            // when
            val (cus, history) = with(unrelatedSo.principal) {
                countControllableUnits(seeded.cuId) to countControllableUnitHistory(seeded.cuId)
            }

            // then
            cus shouldBe 0
            history shouldBe 0
        }
    }
})

private data class SeededCuInGroup(val cuId: Long, val membershipId: Long, val pso: SeededSystemOperator)

/** A CU in a SPG with a product application for a PSO, where the PSO is not the CSO of the CU. */
private fun seedCuInGroupOfPso(validTo: Instant? = null): SeededCuInGroup =
    seed(Triggers.OFF) {
        val apId = insertAccountingPoint()
        val cuId = insertControllableUnit(apId)
        val spgId = insertServiceProvidingGroup()
        val membershipId = insertMembership(cuId, spgId, validTo = validTo)
        val pso = insertSystemOperator("PSO")
        insertServiceProvidingGroupProductApplication(spgId, pso.partyId, listOf(insertProductType()))
        SeededCuInGroup(cuId, membershipId, pso)
    }

/** Updates the CU with triggers on, so that the previous version of the CU is moved to the history table. */
private fun updateControllableUnitMaximumActivePower(cuId: Long, maximumActivePower: Double) =
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
        conn.prepareStatement("UPDATE flex.controllable_unit SET maximum_active_power = ? WHERE id = ?").use { stmt ->
            stmt.setDouble(1, maximumActivePower)
            stmt.setLong(2, cuId)
            stmt.executeUpdate()
        }
        conn.commit()
    }

context(principal: FlexPrincipal)
private suspend fun countControllableUnits(cuId: Long): Int = count("flex.controllable_unit", "id", cuId)

context(principal: FlexPrincipal)
private suspend fun countControllableUnitHistory(cuId: Long): Int = count("flex.controllable_unit_history", "id", cuId)

context(principal: FlexPrincipal)
private suspend fun count(table: String, column: String, id: Long): Int =
    flexTransaction { conn ->
        Either.Right(
            conn.prepareStatement("SELECT count(*) FROM $table WHERE $column = ?").use { stmt ->
                stmt.setLong(1, id)
                stmt.executeQuery().use { rs ->
                    rs.next()
                    rs.getInt(1)
                }
            },
        )
    }.shouldBeRight()
