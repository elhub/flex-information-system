package no.elhub.flex.accountingpoint.db

import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.datatest.withData
import io.kotest.matchers.shouldBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.model.domain.AccountingPointGridLocation
import no.elhub.flex.model.domain.AccountingPointGridLocationObjectType
import no.elhub.flex.model.domain.AccountingPointGridLocationQuality
import no.elhub.flex.model.domain.AccountingPointGridLocationSource
import no.elhub.flex.util.uniqueGsrn
import java.util.UUID

@Suppress("MagicNumber")
class AccountingPointGridLocationRepositoryTest : FunSpec({

    val repo = AccountingPointGridLocationRepositoryImpl()

    val internalDataPrincipal = FlexPrincipal.internalData()

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute("TRUNCATE flex.accounting_point, flex.substation, flex.substation_cluster CASCADE")
            }
        }
    }

    context("getByAccountingPointId") {

        test("returns null when no grid location row exists") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())

            // when
            val result = with(internalDataPrincipal) { repo.getByAccountingPointId(apId) }.shouldBeRight()

            // then
            result shouldBe null
        }

        test("returns the current grid location when a row exists") {
            // given
            val apId = insertAccountingPoint(uniqueGsrn())
            val substationId = UUID.randomUUID()
            insertSubstation(substationId, name = "Some Substation")
            insertGridLocationRow(
                apId = apId,
                businessId = substationId,
                name = "Some Substation",
                nominalVoltage = 22.0,
                source = "cso",
                quality = "confirmed",
                additionalInformation = "Manually confirmed",
            )

            // when
            val result = with(internalDataPrincipal) { repo.getByAccountingPointId(apId) }.shouldBeRight()

            // then
            checkNotNull(result)
            result.accountingPointId shouldBe apId
            result.objectType shouldBe AccountingPointGridLocationObjectType.SUBSTATION
            result.businessId shouldBe substationId
            result.name shouldBe "Some Substation"
            result.nominalVoltage shouldBe 22.0
            result.source shouldBe AccountingPointGridLocationSource.CSO
            result.quality shouldBe AccountingPointGridLocationQuality.CONFIRMED
            result.additionalInformation shouldBe "Manually confirmed"
        }
    }

    context("upsert") {

        withData(
            nameFn = { it.description },
            listOf(
                GridLocationSyncScenario(
                    description = "inserts a new grid location row when none exists",
                    outcome = GridLocationOutcome.SyncedToTarget,
                ),
                GridLocationSyncScenario(
                    description = "updates an existing row to point at a new substation",
                    existing = ExistingGridLocationSeed(
                        name = "Old Substation",
                        nominalVoltage = 0.0,
                        source = "grid_model",
                        quality = "guessed",
                        additionalInformation = null,
                    ),
                    outcome = GridLocationOutcome.SyncedToTarget,
                ),
                GridLocationSyncScenario(
                    description = "unconditionally overwrites an existing confirmed row",
                    existing = ExistingGridLocationSeed(
                        name = "CSO Confirmed Substation",
                        nominalVoltage = 22.0,
                        source = "cso",
                        quality = "confirmed",
                        additionalInformation = "Manually confirmed by the CSO",
                    ),
                    outcome = GridLocationOutcome.SyncedToTarget,
                ),
                GridLocationSyncScenario(
                    description = "re-syncing the same substation that is already stored is a no-op",
                    existing = ExistingGridLocationSeed(
                        name = "Stable Substation",
                        nominalVoltage = 0.0,
                        source = "grid_model",
                        quality = "guessed",
                        additionalInformation = null,
                    ),
                    targetIsExistingSubstation = true,
                    outcome = GridLocationOutcome.SyncedToTarget,
                ),
                GridLocationSyncScenario(
                    description = "returns DatabaseError and creates no row when the substation does not exist",
                    targetSubstationExists = false,
                    outcome = GridLocationOutcome.RepositoryError,
                ),
                GridLocationSyncScenario(
                    description = "returns DatabaseError when the accounting point does not exist",
                    apExists = false,
                    outcome = GridLocationOutcome.RepositoryError,
                ),
            ),
        ) { scenario ->
            // given
            val apId = if (scenario.apExists) insertAccountingPoint(uniqueGsrn()) else Long.MAX_VALUE
            val targetSubstationId = UUID.randomUUID()
            if (scenario.targetSubstationExists) insertSubstation(targetSubstationId, name = "Target Substation")

            val existingSubstationId = scenario.existing?.let { seed ->
                val id = if (scenario.targetIsExistingSubstation) targetSubstationId else UUID.randomUUID()
                if (!scenario.targetIsExistingSubstation) insertSubstation(id, name = seed.name)
                insertGridLocationRow(
                    apId = apId,
                    businessId = id,
                    name = seed.name,
                    nominalVoltage = seed.nominalVoltage,
                    source = seed.source,
                    quality = seed.quality,
                    additionalInformation = seed.additionalInformation,
                )
                id
            }

            val effectiveTargetId = if (scenario.targetIsExistingSubstation) {
                checkNotNull(existingSubstationId) { "targetIsExistingSubstation requires an existing seed" }
            } else {
                targetSubstationId
            }

            // when
            val result = with(internalDataPrincipal) {
                repo.upsert(
                    AccountingPointGridLocation(
                        accountingPointId = apId,
                        objectType = AccountingPointGridLocationObjectType.SUBSTATION,
                        businessId = effectiveTargetId,
                        name = "Target Substation",
                        nominalVoltage = 0.0,
                        additionalInformation = null,
                        source = AccountingPointGridLocationSource.GRID_MODEL,
                        quality = AccountingPointGridLocationQuality.GUESSED,
                    ),
                )
            }

            // then
            when (scenario.outcome) {
                GridLocationOutcome.RepositoryError -> {
                    result.shouldBeLeft()
                    queryGridLocation(apId) shouldBe null
                }

                GridLocationOutcome.SyncedToTarget -> {
                    result.shouldBeRight()
                    val row = checkNotNull(queryGridLocation(apId))
                    row.businessId shouldBe effectiveTargetId.toString()
                    row.name shouldBe "Target Substation"
                    row.nominalVoltage shouldBe 0.0
                    row.source shouldBe "grid_model"
                    row.quality shouldBe "guessed"
                }
            }
        }
    }
})

private data class GridLocationRow(
    val objectType: String,
    val businessId: String,
    val name: String,
    val nominalVoltage: Double,
    val source: String,
    val quality: String,
    val additionalInformation: String?,
)

private fun queryGridLocation(apId: Long): GridLocationRow? =
    PostgresTestContainer.withConnection { conn ->
        conn.prepareStatement(
            """
            SELECT object_type, business_id, name, nominal_voltage, source, quality, additional_information
            FROM flex.accounting_point_grid_location
            WHERE accounting_point_id = ?
            """.trimIndent(),
        ).use { stmt ->
            stmt.setLong(1, apId)
            stmt.executeQuery().use { rs ->
                if (rs.next()) {
                    GridLocationRow(
                        objectType = rs.getString(1),
                        businessId = rs.getString(2),
                        name = rs.getString(3),
                        nominalVoltage = rs.getBigDecimal(4).toDouble(),
                        source = rs.getString(5),
                        quality = rs.getString(6),
                        additionalInformation = rs.getString(7),
                    )
                } else {
                    null
                }
            }
        }
    }

/**
 * A pre-existing `flex.accounting_point_grid_location` row to seed before exercising
 * `upsert`, describing its prior state.
 */
private data class ExistingGridLocationSeed(
    val name: String,
    val nominalVoltage: Double,
    val source: String,
    val quality: String,
    val additionalInformation: String?,
)

private enum class GridLocationOutcome {
    /** The row ends up pointing at the target substation, with `source=grid_model`/`quality=guessed`. */
    SyncedToTarget,

    /** The repository call returns `Left`, and no row is created. */
    RepositoryError,
}

private data class GridLocationSyncScenario(
    val description: String,
    val apExists: Boolean = true,
    val existing: ExistingGridLocationSeed? = null,
    val targetSubstationExists: Boolean = true,
    /** If true, the substation we sync to is the same one referenced by [existing] (idempotent re-sync case). */
    val targetIsExistingSubstation: Boolean = false,
    val outcome: GridLocationOutcome,
)

private fun insertGridLocationRow(
    apId: Long,
    businessId: UUID,
    name: String,
    nominalVoltage: Double,
    source: String,
    quality: String,
    additionalInformation: String?,
): Long =
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
        val id = conn.prepareStatement(
            """
            INSERT INTO flex.accounting_point_grid_location (
                accounting_point_id, object_type, business_id, name, nominal_voltage,
                additional_information, source, quality
            )
            VALUES (?, 'substation', ?, ?, ?, ?, ?, ?)
            RETURNING id
            """.trimIndent(),
        ).use { stmt ->
            stmt.setLong(1, apId)
            stmt.setString(2, businessId.toString())
            stmt.setString(3, name)
            stmt.setBigDecimal(4, java.math.BigDecimal.valueOf(nominalVoltage))
            if (additionalInformation != null) stmt.setString(5, additionalInformation) else stmt.setNull(5, java.sql.Types.VARCHAR)
            stmt.setString(6, source)
            stmt.setString(7, quality)
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getLong(1)
            }
        }
        conn.commit()
        id
    }

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
