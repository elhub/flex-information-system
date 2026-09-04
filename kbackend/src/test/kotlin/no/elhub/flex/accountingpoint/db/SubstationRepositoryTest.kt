package no.elhub.flex.accountingpoint.db

import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.model.domain.db.NotFoundError
import java.util.UUID

class SubstationRepositoryTest : FunSpec({

    val repo = SubstationRepositoryImpl()

    val internalDataPrincipal = FlexPrincipal.internalData()

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute("TRUNCATE flex.substation, flex.substation_cluster CASCADE")
            }
        }
    }

    context("getNameByBusinessId") {

        test("returns the substation name when it exists") {
            // given
            val substationId = UUID.randomUUID()
            insertSubstation(substationId, name = "Some Substation")

            // when
            val result = with(internalDataPrincipal) { repo.getNameByBusinessId(substationId) }.shouldBeRight()

            // then
            result shouldBe "Some Substation"
        }

        test("returns NotFoundError when business ID does not exist") {
            // when
            val result = with(internalDataPrincipal) { repo.getNameByBusinessId(UUID.randomUUID()) }

            // then
            result.shouldBeLeft() shouldBe NotFoundError("substation does not exist in database")
        }
    }
})

private fun insertSubstation(businessId: UUID, name: String): Long =
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
        val clusterId = conn.prepareStatement(
            """
            INSERT INTO flex.substation_cluster (name, business_id, averaged_position, area)
            VALUES (
                ?,
                ?,
                ST_SetSRID(ST_MakePoint(10.0, 60.0), 4326),
                ST_SetSRID(ST_GeomFromText('POLYGON((9 59, 11 59, 11 61, 9 61, 9 59))'), 4326)
            )
            RETURNING id
            """.trimIndent(),
        ).use { stmt ->
            stmt.setString(1, "$name cluster")
            stmt.setString(2, UUID.randomUUID().toString())
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getLong(1)
            }
        }
        val id = conn.prepareStatement(
            """
            INSERT INTO flex.substation (
                name, business_id, kind, primary_concessionaire, substation_cluster_id, voltage_levels, position
            )
            VALUES (?, ?, 'transformer', 'concessionaire', ?, ARRAY[132.0], ST_SetSRID(ST_MakePoint(10.0, 60.0), 4326))
            RETURNING id
            """.trimIndent(),
        ).use { stmt ->
            stmt.setString(1, name)
            stmt.setString(2, businessId.toString())
            stmt.setLong(3, clusterId)
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getLong(1)
            }
        }
        conn.commit()
        id
    }
