package no.elhub.flex.accountingpoint.db

import arrow.core.Either
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.model.domain.AccountingPointGridLocationSource
import no.elhub.flex.model.dto.generated.models.ServiceProvidingGroupGridPrequalificationStatus
import no.elhub.flex.util.Triggers
import no.elhub.flex.util.seed
import java.time.Instant

/**
 * Row level security for `flex.accounting_point_grid_location` as a system operator (SO).
 *
 * - APGL-SO001: a connecting SO (CSO) or procuring SO (PSO) can read and update the grid location
 * - APGL-SO003: an impacted SO (ISO) can read the grid location, but not modify it
 *
 * The seeding runs with triggers off, since the tests only need the rows to exist. This also means that
 * a product application does not create grid prequalifications, so the PSO tests do not get access
 * through the ISO path.
 */
class AccountingPointGridLocationRlsTest : FunSpec({

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute(
                    "TRUNCATE flex.accounting_point, flex.party, flex.entity, " +
                        "flex.metering_grid_area, flex.product_type CASCADE",
                )
            }
        }
    }

    context("APGL-SO001 (CSO)") {

        test("CSO can read the grid location") {
            // given
            val (apId, cso) = seed(Triggers.OFF) {
                val apId = insertAccountingPoint()
                insertGridLocation(apId)
                val cso = insertSystemOperator("CSO")
                val mgaId = insertMeteringGridArea()
                insertAccountingPointMeteringGridArea(apId, mgaId)
                insertMeteringGridAreaSystemOperator(mgaId, cso.partyId)
                apId to cso
            }

            // when
            val count = with(cso.principal) { countGridLocations(apId) }

            // then
            count shouldBe 1
        }

        test("CSO can update the grid location") {
            // given
            val (apId, cso) = seed(Triggers.OFF) {
                val apId = insertAccountingPoint()
                insertGridLocation(apId, name = "Original name")
                val cso = insertSystemOperator("CSO")
                val mgaId = insertMeteringGridArea()
                insertAccountingPointMeteringGridArea(apId, mgaId)
                insertMeteringGridAreaSystemOperator(mgaId, cso.partyId)
                apId to cso
            }

            // when
            val updated = with(cso.principal) { renameGridLocations(apId, "Changed by CSO") }

            // then
            updated shouldBe 1
            gridLocationName(apId) shouldBe "Changed by CSO"
        }

        test("SO cannot read the grid location when its metering grid area ownership has ended") {
            // given
            val (apId, formerCso) = seed(Triggers.OFF) {
                val apId = insertAccountingPoint()
                insertGridLocation(apId)
                val formerCso = insertSystemOperator("Former CSO")
                val mgaId = insertMeteringGridArea()
                insertAccountingPointMeteringGridArea(apId, mgaId)
                insertMeteringGridAreaSystemOperator(
                    mgaId,
                    formerCso.partyId,
                    validFrom = Instant.parse("2024-01-01T00:00:00Z"),
                    validTo = Instant.parse("2024-06-01T00:00:00Z"),
                )
                apId to formerCso
            }

            // when
            val count = with(formerCso.principal) { countGridLocations(apId) }

            // then
            count shouldBe 0
        }
    }

    context("APGL-SO001 (PSO)") {

        test("PSO can read the grid location when it has a product application on the SPG") {
            // given
            val (apId, pso) = seed(Triggers.OFF) {
                val apId = insertAccountingPoint()
                insertGridLocation(apId)
                val cuId = insertControllableUnit(apId)
                val spgId = insertServiceProvidingGroup()
                insertMembership(cuId, spgId)
                val pso = insertSystemOperator("PSO")
                val productTypeId = insertProductType()
                insertServiceProvidingGroupProductApplication(spgId, pso.partyId, listOf(productTypeId))
                apId to pso
            }

            // when
            val count = with(pso.principal) { countGridLocations(apId) }

            // then
            count shouldBe 1
        }

        test("PSO can update the grid location") {
            // given
            val (apId, pso) = seed(Triggers.OFF) {
                val apId = insertAccountingPoint()
                // an update by a non-CSO sets the source to 'so', which is not allowed from 'cso' (APGL-VAL001)
                insertGridLocation(apId, name = "Original name", source = AccountingPointGridLocationSource.SO)
                val cuId = insertControllableUnit(apId)
                val spgId = insertServiceProvidingGroup()
                insertMembership(cuId, spgId)
                val pso = insertSystemOperator("PSO")
                val productTypeId = insertProductType()
                insertServiceProvidingGroupProductApplication(spgId, pso.partyId, listOf(productTypeId))
                apId to pso
            }

            // when
            val updated = with(pso.principal) { renameGridLocations(apId, "Changed by PSO") }

            // then
            updated shouldBe 1
            gridLocationName(apId) shouldBe "Changed by PSO"
        }
    }

    context("APGL-SO003 (ISO)") {

        test("ISO can read the grid location when impacted through a grid prequalification") {
            // given
            val (apId, iso) = seed(Triggers.OFF) {
                val apId = insertAccountingPoint()
                insertGridLocation(apId)
                val cuId = insertControllableUnit(apId)
                val spgId = insertServiceProvidingGroup()
                insertMembership(cuId, spgId)
                val iso = insertSystemOperator("ISO")
                insertGridPrequalification(spgId, iso.partyId)
                apId to iso
            }

            // when
            val count = with(iso.principal) { countGridLocations(apId) }

            // then
            count shouldBe 1
        }

        test("SO cannot read the grid location when the grid prequalification is inactive") {
            // given
            val (apId, iso) = seed(Triggers.OFF) {
                val apId = insertAccountingPoint()
                insertGridLocation(apId)
                val cuId = insertControllableUnit(apId)
                val spgId = insertServiceProvidingGroup()
                insertMembership(cuId, spgId)
                val iso = insertSystemOperator("ISO")
                insertGridPrequalification(
                    spgId,
                    iso.partyId,
                    status = ServiceProvidingGroupGridPrequalificationStatus.INACTIVE,
                )
                apId to iso
            }

            // when
            val count = with(iso.principal) { countGridLocations(apId) }

            // then
            count shouldBe 0
        }

        test("ISO cannot update the grid location") {
            // given
            val (apId, iso) = seed(Triggers.OFF) {
                val apId = insertAccountingPoint()
                insertGridLocation(apId, name = "Original name")
                val cuId = insertControllableUnit(apId)
                val spgId = insertServiceProvidingGroup()
                insertMembership(cuId, spgId)
                val iso = insertSystemOperator("ISO")
                insertGridPrequalification(spgId, iso.partyId)
                apId to iso
            }

            // when
            val updated = with(iso.principal) { renameGridLocations(apId, "Changed by ISO") }

            // then
            updated shouldBe 0
            gridLocationName(apId) shouldBe "Original name"
        }
    }

    context("no relation to the accounting point") {

        test("SO cannot read the grid location") {
            // given
            val (apId, unrelatedSo) = seed(Triggers.OFF) {
                val apId = insertAccountingPoint()
                insertGridLocation(apId)
                val cuId = insertControllableUnit(apId)
                val spgId = insertServiceProvidingGroup()
                insertMembership(cuId, spgId)
                apId to insertSystemOperator("Unrelated SO")
            }

            // when
            val count = with(unrelatedSo.principal) { countGridLocations(apId) }

            // then
            count shouldBe 0
        }
    }
})

context(principal: FlexPrincipal)
private suspend fun countGridLocations(apId: Long): Int =
    flexTransaction { conn ->
        Either.Right(
            conn.prepareStatement(
                "SELECT count(*) FROM flex.accounting_point_grid_location WHERE accounting_point_id = ?",
            ).use { stmt ->
                stmt.setLong(1, apId)
                stmt.executeQuery().use { rs ->
                    rs.next()
                    rs.getInt(1)
                }
            },
        )
    }.shouldBeRight()

/** Returns the number of rows updated. */
context(principal: FlexPrincipal)
private suspend fun renameGridLocations(apId: Long, name: String) =
    flexTransaction { conn ->
        Either.Right(
            conn.prepareStatement(
                "UPDATE flex.accounting_point_grid_location SET name = ? WHERE accounting_point_id = ?",
            ).use { stmt ->
                stmt.setString(1, name)
                stmt.setLong(2, apId)
                stmt.executeUpdate()
            },
        )
    }.shouldBeRight()

private fun gridLocationName(apId: Long): String =
    PostgresTestContainer.withConnection { conn ->
        conn.prepareStatement("SELECT name FROM flex.accounting_point_grid_location WHERE accounting_point_id = ?")
            .use { stmt ->
                stmt.setLong(1, apId)
                stmt.executeQuery().use { rs ->
                    rs.next()
                    rs.getString(1)
                }
            }
    }
