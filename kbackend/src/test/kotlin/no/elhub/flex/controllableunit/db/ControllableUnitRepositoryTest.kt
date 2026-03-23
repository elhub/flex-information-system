package no.elhub.flex.controllableunit.db

import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import kotlinx.datetime.LocalDate
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.model.domain.ControllableUnit
import no.elhub.flex.model.domain.TechnicalResource
import no.elhub.flex.util.now
import no.elhub.flex.util.uniqueGsrn
import java.sql.Connection
import java.util.UUID

@Suppress("MagicNumber")
class ControllableUnitRepositoryTest : FunSpec({

    val repo = ControllableUnitRepositoryImpl()
    // flex_internal lacks SELECT on flex.controllable_unit (direct table queries).
    // flex_flexibility_information_system_operator has USING(true) RLS on both
    // controllable_unit and technical_resource, and is granted to flex_authenticator.
    val principal = FlexPrincipal(role = "flex_flexibility_information_system_operator", eid = "0")

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute("TRUNCATE flex.accounting_point CASCADE")
            }
        }
    }

    context("lookupControllableUnits") {

        test("returns expected CUs when queried by CU business ID") {
            // given
            val apBusinessId = uniqueGsrn()
            val expected = seedControllableUnits(
                apBusinessId = apBusinessId,
                cus = listOf(
                    ControllableUnit(
                        id = 0,
                        businessId = uniqueUuid(),
                        name = "CU Beta",
                        startDate = LocalDate.now(),
                        technicalResources = listOf(
                            TechnicalResource(id = 0, name = "TR One"),
                            TechnicalResource(id = 0, name = "TR Two"),
                        ),
                    ),
                ),
            )
            seedControllableUnits(
                apBusinessId = uniqueGsrn(),
                cus = listOf(ControllableUnit(id = 0, businessId = uniqueUuid(), name = "Noise CU", startDate = LocalDate.now(), technicalResources = emptyList())),
            )

            // when
            val result = with(principal) {
                repo.lookupControllableUnits(
                    controllableUnitBusinessId = expected.first().businessId,
                    accountingPointBusinessId = "",
                )
            }.shouldBeRight()

            // then
            result shouldBe expected
        }

        test("returns expected CUs when queried by accounting point") {
            // given
            val apBusinessId = uniqueGsrn()
            val expected = seedControllableUnits(
                apBusinessId = apBusinessId,
                cus = listOf(
                    ControllableUnit(id = 0, businessId = uniqueUuid(), name = "CU One", startDate = LocalDate.now(), technicalResources = emptyList()),
                    ControllableUnit(id = 0, businessId = uniqueUuid(), name = "CU Two", startDate = LocalDate.now(), technicalResources = emptyList()),
                ),
            )
            seedControllableUnits(
                apBusinessId = uniqueGsrn(),
                cus = listOf(ControllableUnit(id = 0, businessId = uniqueUuid(), name = "Noise CU", startDate = LocalDate.now(), technicalResources = emptyList())),
            )

            // when
            val result = with(principal) {
                repo.lookupControllableUnits(controllableUnitBusinessId = "", accountingPointBusinessId = apBusinessId)
            }.shouldBeRight()

            // then
            result shouldHaveSize 2
            result.toSet() shouldBe expected.toSet()
        }

        test("returns empty list when CU business ID does not exist") {
            // when
            val result = with(principal) {
                repo.lookupControllableUnits(
                    controllableUnitBusinessId = uniqueUuid(),
                    accountingPointBusinessId = "",
                )
            }.shouldBeRight()

            // then
            result shouldHaveSize 0
        }
    }
})

private fun uniqueUuid(): String = UUID.randomUUID().toString()

private fun seedControllableUnits(
    apBusinessId: String,
    cus: List<ControllableUnit>,
): List<ControllableUnit> =
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }

        conn.prepareStatement("INSERT INTO flex.accounting_point (business_id) VALUES (?) ON CONFLICT DO NOTHING")
            .use { stmt ->
                stmt.setString(1, apBusinessId)
                stmt.execute()
            }

        val apId = conn.prepareStatement("SELECT id FROM flex.accounting_point WHERE business_id = ?")
            .use { stmt ->
                stmt.setString(1, apBusinessId)
                stmt.executeQuery().use { rs ->
                    rs.next()
                    rs.getLong(1)
                }
            }

        val result = cus.map { cu ->
            val cuId = insertControllableUnit(conn, cu, apId)
            val trs = cu.technicalResources.map { tr -> insertTechnicalResource(conn, tr, cuId) }
            cu.copy(id = cuId.toInt(), technicalResources = trs)
        }

        conn.commit()
        result
    }

private fun insertControllableUnit(conn: Connection, cu: ControllableUnit, apId: Long): Long =
    conn.prepareStatement(
        """
        INSERT INTO flex.controllable_unit (business_id, name, start_date, regulation_direction, maximum_active_power, accounting_point_id)
        VALUES (?::uuid, ?, ?::date, 'up', 100.0, ?)
        RETURNING id
        """.trimIndent(),
    ).use { stmt ->
        stmt.setString(1, cu.businessId)
        stmt.setString(2, cu.name)
        stmt.setString(3, cu.startDate.toString())
        stmt.setLong(4, apId)
        stmt.executeQuery().use { rs ->
            rs.next()
            rs.getLong(1)
        }
    }

private fun insertTechnicalResource(conn: Connection, tr: TechnicalResource, cuId: Long): TechnicalResource =
    conn.prepareStatement(
        "INSERT INTO flex.technical_resource (name, controllable_unit_id) VALUES (?, ?) RETURNING id",
    ).use { stmt ->
        stmt.setString(1, tr.name)
        stmt.setLong(2, cuId)
        stmt.executeQuery().use { rs ->
            rs.next()
            tr.copy(id = rs.getInt(1))
        }
    }
