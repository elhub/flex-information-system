package no.elhub.flex.meteringgridarea.db

import arrow.core.Either
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.db.prepareNamed
import no.elhub.flex.db.query
import no.elhub.flex.model.domain.MeteringGridArea
import no.elhub.flex.model.domain.MeteringGridAreaStatus
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.NotFoundError
import no.elhub.flex.model.domain.db.RepositoryError
import no.elhub.flex.util.createNullableTimestampArray
import no.elhub.flex.util.createTimestampArray
import org.koin.core.annotation.Single
import java.sql.Connection
import no.elhub.flex.integration.adapter.generated.models.MeteringGridArea as AdapterMeteringGridArea

interface MeteringGridAreaRepository {
    /**
     * Looks up metering grid areas by their EIC business IDs.
     *
     * Returns a map keyed by business ID containing all requested [MeteringGridArea] entries.
     * Returns an empty map when [businessIds] is empty.
     *
     * Returns [NotFoundError] if any of the requested business IDs is not present in the database.
     */
    context(principal: FlexPrincipal)
    suspend fun getMeteringGridAreasByBusinessIds(
        businessIds: List<String>,
    ): Either<RepositoryError, Map<String, MeteringGridArea>>

    /**
     * Empties the three `staging.metering_grid_area*` tables (MGA, MGA system operator, MGA price area),
     * ready for a new load.
     */
    context(principal: FlexPrincipal)
    suspend fun prepareStaging(): Either<RepositoryError, Unit>

    /** Inserts [areas] into `staging.metering_grid_area`. */
    context(principal: FlexPrincipal)
    suspend fun batchInsertStagingMeteringGridAreas(areas: List<AdapterMeteringGridArea>): Either<RepositoryError, Unit>

    /** Inserts the system operators of [areas] into `staging.metering_grid_area_system_operator`. */
    context(principal: FlexPrincipal)
    suspend fun batchInsertStagingMeteringGridAreaSystemOperators(
        areas: List<AdapterMeteringGridArea>,
    ): Either<RepositoryError, Unit>

    /** Inserts the price areas of [areas] into `staging.metering_grid_area_price_area`. */
    context(principal: FlexPrincipal)
    suspend fun batchInsertStagingMeteringGridAreaPriceAreas(
        areas: List<AdapterMeteringGridArea>,
    ): Either<RepositoryError, Unit>

    /**
     * Runs the safety checks and merges all three `staging.metering_grid_area*` tables into the
     * `flex` schema.
     */
    context(principal: FlexPrincipal)
    suspend fun finaliseStaging(): Either<RepositoryError, Unit>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class MeteringGridAreaRepositoryImpl : MeteringGridAreaRepository {
    context(principal: FlexPrincipal)
    override suspend fun getMeteringGridAreasByBusinessIds(
        businessIds: List<String>,
    ): Either<RepositoryError, Map<String, MeteringGridArea>> {
        if (businessIds.isEmpty()) return Either.Right(emptyMap())
        return flexTransaction { conn ->
            either {
                val found = runCatching {
                    val pgArray = conn.createArrayOf("text", businessIds.toTypedArray())
                    conn.prepareNamed(
                        "SELECT id, business_id, name, status FROM flex.metering_grid_area WHERE business_id = ANY(:businessIds)",
                        mapOf("businessIds" to pgArray),
                    ).query { rs ->
                        MeteringGridArea(
                            id = rs.getLong("id"),
                            businessId = rs.getString("business_id"),
                            name = rs.getString("name"),
                            status = MeteringGridAreaStatus.valueOf(rs.getString("status").uppercase()),
                        )
                    }
                }.getOrElse { e ->
                    logger.error { "getMeteringGridAreasByBusinessIds failed: ${e.message}" }
                    raise(DatabaseError("Failed to read metering grid areas by business IDs"))
                }

                val foundMap = found.associateBy { it.businessId }
                val missing = businessIds.filter { it !in foundMap }
                if (missing.isNotEmpty()) {
                    raise(NotFoundError("Metering grid areas not found: ${missing.joinToString()}"))
                }
                foundMap
            }
        }
    }

    context(principal: FlexPrincipal)
    override suspend fun prepareStaging(): Either<RepositoryError, Unit> =
        inStagingTransaction("prepare metering grid area staging tables") { conn ->
            conn.prepareStatement("SELECT staging.metering_grid_area_prepare()").use { it.execute() }
        }

    context(principal: FlexPrincipal)
    override suspend fun batchInsertStagingMeteringGridAreas(
        areas: List<AdapterMeteringGridArea>,
    ): Either<RepositoryError, Unit> =
        inStagingTransaction("insert metering grid areas into staging") { conn ->
            logger.info { "Inserting ${areas.size} rows into staging.metering_grid_area" }
            conn.prepareNamed(
                """
                INSERT INTO staging.metering_grid_area (business_id, name, status)
                SELECT * FROM unnest(:businessId::text[], :name::text[], :status::text[])
                """,
                mapOf(
                    "businessId" to conn.createArrayOf("text", areas.map { it.businessId }.toTypedArray()),
                    "name" to conn.createArrayOf("text", areas.map { it.name }.toTypedArray()),
                    "status" to conn.createArrayOf(
                        "text",
                        areas.map { if (it.isActive) "active" else "inactive" }.toTypedArray(),
                    ),
                ),
            ).use { it.execute() }
        }

    context(principal: FlexPrincipal)
    override suspend fun batchInsertStagingMeteringGridAreaSystemOperators(
        areas: List<AdapterMeteringGridArea>,
    ): Either<RepositoryError, Unit> =
        inStagingTransaction("insert metering grid area system operators into staging") { conn ->
            val rows = areas.flatMap { area -> area.systemOperator.map { area.businessId to it } }
            logger.info { "Inserting ${rows.size} rows into staging.metering_grid_area_system_operator" }
            conn.prepareNamed(
                """
                INSERT INTO staging.metering_grid_area_system_operator (
                    metering_grid_area_business_id, system_operator_business_id, valid_time_range
                )
                SELECT mga_business_id, so_business_id, tstzrange(valid_from, valid_to, '[)')
                FROM unnest(:mgaBusinessId::text[], :soBusinessId::text[], :validFrom::timestamptz[], :validTo::timestamptz[])
                    AS src(mga_business_id, so_business_id, valid_from, valid_to)
                """,
                mapOf(
                    "mgaBusinessId" to conn.createArrayOf("text", rows.map { it.first }.toTypedArray()),
                    "soBusinessId" to conn.createArrayOf("text", rows.map { it.second.businessId }.toTypedArray()),
                    "validFrom" to conn.createTimestampArray(rows.map { it.second.validFrom }),
                    "validTo" to conn.createNullableTimestampArray(rows.map { it.second.validTo }),
                ),
            ).use { it.execute() }
        }

    context(principal: FlexPrincipal)
    override suspend fun batchInsertStagingMeteringGridAreaPriceAreas(
        areas: List<AdapterMeteringGridArea>,
    ): Either<RepositoryError, Unit> =
        inStagingTransaction("insert metering grid area price areas into staging") { conn ->
            val rows = areas.flatMap { area -> area.priceArea.map { area.businessId to it } }
            logger.info { "Inserting ${rows.size} rows into staging.metering_grid_area_price_area" }
            conn.prepareNamed(
                """
                INSERT INTO staging.metering_grid_area_price_area (
                    metering_grid_area_business_id, price_area, valid_time_range
                )
                SELECT mga_business_id, price_area, tstzrange(valid_from, valid_to, '[)')
                FROM unnest(:mgaBusinessId::text[], :priceArea::text[], :validFrom::timestamptz[], :validTo::timestamptz[])
                    AS src(mga_business_id, price_area, valid_from, valid_to)
                """,
                mapOf(
                    "mgaBusinessId" to conn.createArrayOf("text", rows.map { it.first }.toTypedArray()),
                    "priceArea" to conn.createArrayOf("text", rows.map { it.second.priceArea.value }.toTypedArray()),
                    "validFrom" to conn.createTimestampArray(rows.map { it.second.validFrom }),
                    "validTo" to conn.createNullableTimestampArray(rows.map { it.second.validTo }),
                ),
            ).use { it.execute() }
        }

    context(principal: FlexPrincipal)
    override suspend fun finaliseStaging(): Either<RepositoryError, Unit> =
        inStagingTransaction("finalise metering grid area staging") { conn ->
            logger.info { "Finalising metering grid area staging — running sanity checks and merge" }
            conn.prepareStatement("SELECT staging.metering_grid_area_finalise()").use { it.execute() }
        }

    context(principal: FlexPrincipal)
    private suspend fun inStagingTransaction(
        description: String,
        block: (Connection) -> Unit,
    ): Either<RepositoryError, Unit> = flexTransaction<RepositoryError, Unit> { conn ->
        Either.catch { block(conn) }.mapLeft { e ->
            logger.error { "Failed to $description: ${e.message}" }
            DatabaseError("Failed to $description")
        }
    }
}
