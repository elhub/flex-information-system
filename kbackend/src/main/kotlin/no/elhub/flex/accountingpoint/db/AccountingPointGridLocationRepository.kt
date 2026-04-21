package no.elhub.flex.accountingpoint.db

import arrow.core.Either
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.db.prepareNamed
import no.elhub.flex.db.querySingle
import no.elhub.flex.model.domain.AccountingPointGridLocation
import no.elhub.flex.model.domain.GridLocationObjectType
import no.elhub.flex.model.domain.GridLocationQuality
import no.elhub.flex.model.domain.GridLocationSource
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.NotFoundError
import no.elhub.flex.model.domain.db.RepositoryError
import no.elhub.flex.util.toKotlinInstantOrNull
import org.koin.core.annotation.Single
import java.math.BigDecimal
import java.sql.ResultSet

interface AccountingPointGridLocationRepository {
    /**
     * Returns the current grid location for the given accounting point, or null if none exists.
     */
    context(principal: FlexPrincipal)
    suspend fun getByAccountingPointId(
        accountingPointId: Long,
    ): Either<RepositoryError, AccountingPointGridLocation?>

    /**
     * Inserts a new grid location and returns the persisted record.
     */
    context(principal: FlexPrincipal)
    suspend fun insert(
        gridLocation: AccountingPointGridLocation,
    ): Either<RepositoryError, AccountingPointGridLocation>

    /**
     * Updates an existing grid location (matched by accounting_point_id) and returns the
     * updated record. Returns [NotFoundError] if no record exists for the accounting point.
     */
    context(principal: FlexPrincipal)
    suspend fun update(
        gridLocation: AccountingPointGridLocation,
    ): Either<RepositoryError, AccountingPointGridLocation>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class AccountingPointGridLocationRepositoryImpl : AccountingPointGridLocationRepository {

    context(principal: FlexPrincipal)
    override suspend fun getByAccountingPointId(
        accountingPointId: Long,
    ): Either<RepositoryError, AccountingPointGridLocation?> =
        flexTransaction { conn ->
            Either.catch {
                conn.prepareNamed(
                    """
                    SELECT
                        id,
                        accounting_point_id,
                        object_type,
                        business_id,
                        name,
                        nominal_voltage,
                        additional_information,
                        source,
                        quality,
                        lower(record_time_range) AS recorded_at,
                        recorded_by
                    FROM flex.accounting_point_grid_location
                    WHERE accounting_point_id = :accountingPointId
                    """,
                    mapOf("accountingPointId" to accountingPointId),
                ).querySingle { rs -> mapRow(rs) }
            }.mapLeft { e ->
                logger.error { "getByAccountingPointId($accountingPointId) failed: ${e.message}" }
                DatabaseError("Failed to read accounting point grid location")
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun insert(
        gridLocation: AccountingPointGridLocation,
    ): Either<RepositoryError, AccountingPointGridLocation> =
        flexTransaction { conn ->
            either {
                val row = runCatching {
                    conn.prepareNamed(
                        """
                        INSERT INTO flex.accounting_point_grid_location (
                            accounting_point_id,
                            object_type,
                            business_id,
                            name,
                            nominal_voltage,
                            additional_information,
                            source,
                            quality
                        ) VALUES (
                            :accountingPointId,
                            :objectType,
                            :businessId,
                            :name,
                            :nominalVoltage,
                            :additionalInformation,
                            :source,
                            :quality
                        )
                        RETURNING
                            id,
                            accounting_point_id,
                            object_type,
                            business_id,
                            name,
                            nominal_voltage,
                            additional_information,
                            source,
                            quality,
                            lower(record_time_range) AS recorded_at,
                            recorded_by
                        """,
                        mapOf(
                            "accountingPointId" to gridLocation.accountingPointId,
                            "objectType" to gridLocation.objectType.value,
                            "businessId" to gridLocation.businessId,
                            "name" to gridLocation.name,
                            "nominalVoltage" to gridLocation.nominalVoltage,
                            "additionalInformation" to gridLocation.additionalInformation,
                            "source" to gridLocation.source.value,
                            "quality" to gridLocation.quality.value,
                        ),
                    ).querySingle { rs -> mapRow(rs) }
                }.getOrElse { e ->
                    logger.error { "insert failed: ${e.message}" }
                    raise(DatabaseError("Failed to insert accounting point grid location"))
                }

                row ?: run {
                    logger.error { "insert returned no row for accounting_point_id=${gridLocation.accountingPointId}" }
                    raise(DatabaseError("Insert did not return a row"))
                }
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun update(
        gridLocation: AccountingPointGridLocation,
    ): Either<RepositoryError, AccountingPointGridLocation> =
        flexTransaction { conn ->
            either {
                val row = runCatching {
                    conn.prepareNamed(
                        """
                        UPDATE flex.accounting_point_grid_location
                        SET
                            object_type          = :objectType,
                            business_id          = :businessId,
                            name                 = :name,
                            nominal_voltage      = :nominalVoltage,
                            additional_information = :additionalInformation,
                            source               = :source,
                            quality              = :quality
                        WHERE accounting_point_id = :accountingPointId
                        RETURNING
                            id,
                            accounting_point_id,
                            object_type,
                            business_id,
                            name,
                            nominal_voltage,
                            additional_information,
                            source,
                            quality,
                            lower(record_time_range) AS recorded_at,
                            recorded_by
                        """,
                        mapOf(
                            "accountingPointId" to gridLocation.accountingPointId,
                            "objectType" to gridLocation.objectType.value,
                            "businessId" to gridLocation.businessId,
                            "name" to gridLocation.name,
                            "nominalVoltage" to gridLocation.nominalVoltage,
                            "additionalInformation" to gridLocation.additionalInformation,
                            "source" to gridLocation.source.value,
                            "quality" to gridLocation.quality.value,
                        ),
                    ).querySingle { rs -> mapRow(rs) }
                }.getOrElse { e ->
                    logger.error { "update failed: ${e.message}" }
                    raise(DatabaseError("Failed to update accounting point grid location"))
                }

                row ?: run {
                    logger.info { "No grid location found for accounting_point_id=${gridLocation.accountingPointId} on update" }
                    raise(NotFoundError("accounting point grid location does not exist"))
                }
            }
        }
}

private fun mapRow(rs: ResultSet): AccountingPointGridLocation =
    AccountingPointGridLocation(
        id = rs.getLong("id"),
        accountingPointId = rs.getLong("accounting_point_id"),
        objectType = GridLocationObjectType.entries.first { it.value == rs.getString("object_type") },
        businessId = rs.getString("business_id"),
        name = rs.getString("name"),
        nominalVoltage = rs.getBigDecimal("nominal_voltage"),
        additionalInformation = rs.getString("additional_information"),
        source = GridLocationSource.entries.first { it.value == rs.getString("source") },
        quality = GridLocationQuality.entries.first { it.value == rs.getString("quality") },
        recordedAt = rs.getTimestamp("recorded_at").toKotlinInstantOrNull(),
        recordedBy = rs.getLong("recorded_by").takeIf { !rs.wasNull() },
    )
