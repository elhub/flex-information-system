package no.elhub.flex.accountingpoint.db

import arrow.core.Either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.db.prepareNamed
import no.elhub.flex.db.querySingle
import no.elhub.flex.model.domain.AccountingPointGridLocation
import no.elhub.flex.model.domain.AccountingPointGridLocationObjectType
import no.elhub.flex.model.domain.AccountingPointGridLocationQuality
import no.elhub.flex.model.domain.AccountingPointGridLocationSource
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.RepositoryError
import org.koin.core.annotation.Single
import java.util.UUID

interface AccountingPointGridLocationRepository {
    /** Looks up the possible current grid location for an accounting point. */
    context(principal: FlexPrincipal)
    suspend fun getByAccountingPointId(
        accountingPointId: Long,
    ): Either<RepositoryError, AccountingPointGridLocation?>

    /**
     * Upserts the given grid location, matching the existing row (if any) on
     * [AccountingPointGridLocation.accountingPointId].
     */
    context(principal: FlexPrincipal)
    suspend fun upsert(
        accountingPointGridLocation: AccountingPointGridLocation,
    ): Either<RepositoryError, Unit>
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
                        accounting_point_id,
                        object_type,
                        business_id,
                        name,
                        nominal_voltage,
                        additional_information,
                        source,
                        quality
                    FROM flex.accounting_point_grid_location
                    WHERE accounting_point_id = :accountingPointId
                    """,
                    mapOf("accountingPointId" to accountingPointId),
                ).querySingle { rs ->
                    AccountingPointGridLocation(
                        accountingPointId = rs.getLong("accounting_point_id"),
                        objectType = AccountingPointGridLocationObjectType.valueOf(rs.getString("object_type").uppercase()),
                        businessId = UUID.fromString(rs.getString("business_id")),
                        name = rs.getString("name"),
                        nominalVoltage = rs.getBigDecimal("nominal_voltage").toDouble(),
                        additionalInformation = rs.getString("additional_information"),
                        source = AccountingPointGridLocationSource.valueOf(rs.getString("source").uppercase()),
                        quality = AccountingPointGridLocationQuality.valueOf(rs.getString("quality").uppercase()),
                    )
                }
            }.mapLeft { e ->
                logger.error { "getByAccountingPointId failed: ${e.message}" }
                DatabaseError("Failed to read grid location for accounting point $accountingPointId")
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun upsert(
        accountingPointGridLocation: AccountingPointGridLocation,
    ): Either<RepositoryError, Unit> =
        flexTransaction { conn ->
            Either.catch {
                conn.prepareNamed(
                    """
                    MERGE INTO flex.accounting_point_grid_location AS apgl
                    USING (
                        SELECT :accountingPointId::bigint AS accounting_point_id
                    ) AS src
                    ON apgl.accounting_point_id = src.accounting_point_id
                    WHEN MATCHED THEN UPDATE SET
                        object_type = :objectType,
                        business_id = :businessId,
                        name = :name,
                        nominal_voltage = :nominalVoltage,
                        additional_information = :additionalInformation,
                        source = :source,
                        quality = :quality
                    WHEN NOT MATCHED THEN INSERT (
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
                    """,
                    mapOf(
                        "accountingPointId" to accountingPointGridLocation.accountingPointId,
                        "objectType" to accountingPointGridLocation.objectType.name.lowercase(),
                        "businessId" to accountingPointGridLocation.businessId.toString(),
                        "name" to accountingPointGridLocation.name,
                        "nominalVoltage" to accountingPointGridLocation.nominalVoltage,
                        "additionalInformation" to accountingPointGridLocation.additionalInformation,
                        "source" to accountingPointGridLocation.source.name.lowercase(),
                        "quality" to accountingPointGridLocation.quality.name.lowercase(),
                    ),
                ).use { stmt ->
                    stmt.executeUpdate()
                    Unit
                }
            }.mapLeft { e ->
                logger.warn { "upsert failed: ${e.message}" }
                DatabaseError("Failed to upsert grid location for accounting point ${accountingPointGridLocation.accountingPointId}")
            }
        }
}
