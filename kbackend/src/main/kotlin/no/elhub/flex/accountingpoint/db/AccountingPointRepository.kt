package no.elhub.flex.accountingpoint.db

import arrow.core.Either
import arrow.core.flatMap
import arrow.core.left
import arrow.core.raise.either
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.db.prepareNamed
import no.elhub.flex.db.query
import no.elhub.flex.db.queryRequiredSingle
import no.elhub.flex.db.querySingle
import no.elhub.flex.model.domain.AccountingPoint
import no.elhub.flex.model.domain.AccountingPointEndUser
import no.elhub.flex.model.domain.AccountingPointEnergySupplier
import no.elhub.flex.model.domain.Location
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.LockTimeoutError
import no.elhub.flex.model.domain.db.NoMatchError
import no.elhub.flex.model.domain.db.NotFoundError
import no.elhub.flex.model.domain.db.RepositoryError
import no.elhub.flex.util.createBigintArray
import no.elhub.flex.util.createNullableTimestampArray
import no.elhub.flex.util.createTimestampArray
import org.koin.core.annotation.Single
import java.sql.Array
import java.sql.Connection
import java.sql.SQLException
import kotlin.time.Instant

interface AccountingPointRepository {
    /**
     * Calls `api.current_controllable_unit_accounting_point($controllableUnitBusinessId)`.
     *
     * Returns an [AccountingPoint] or [NotFoundError] when the controllable unit does not exist.
     */
    context(principal: FlexPrincipal)
    suspend fun getCurrentAccountingPoint(
        controllableUnitBusinessId: String
    ): Either<RepositoryError, AccountingPoint>

    /**
     * Looks up an accounting point by its business ID.
     *
     * Returns [NotFoundError] when no row matches.
     */
    context(principal: FlexPrincipal)
    suspend fun getAccountingPointByBusinessId(
        accountingPointBusinessId: String
    ): Either<RepositoryError, AccountingPoint>

    /**
     * Calls `api.controllable_unit_lookup_check_end_user_matches_accounting_point`.
     *
     * Returns the end-user ID, or [NoMatchError] when the check fails.
     */
    context(principal: FlexPrincipal)
    suspend fun checkEndUserMatchesAccountingPoint(
        endUserBusinessId: String,
        accountingPointBusinessId: String
    ): Either<RepositoryError, Long>

    /**
     * Inserts a single accounting point into flex.accounting_point if it does not already exist.
     *
     * Inserts by business ID, ignoring conflicts. Returns the id of the inserted row,
     * or the id of the already-existing row if the business ID was already present.
     */
    context(principal: FlexPrincipal)
    suspend fun insertAccountingPointIfNotExists(
        accountingPoint: AccountingPoint
    ): Either<RepositoryError, Long>

    /**
     * Replaces the end-user timeline for each accounting point present in
     * [accountingPointEndUsers] by synchronising flex.accounting_point_end_user to exactly
     * match the incoming data for those accounting points.
     *
     * The flex.entity and flex.party (type='end_user') rows for each end user are created
     * on demand if they do not already exist.
     *
     * Matches on (accounting_point_id, lower(valid_time_range)):
     * - Updates end_user_id and valid_time_range when they differ.
     * - Inserts new rows when no match is found.
     * - Deletes existing rows whose start time is not present in the incoming data.
     *
     * Accounting points not present in [accountingPointEndUsers] are not affected.
     */
    context(principal: FlexPrincipal)
    suspend fun replaceAllAccountingPointEndUsers(
        accountingPointEndUsers: List<AccountingPointEndUser>
    ): Either<RepositoryError, Unit>

    /**
     * Replaces the energy-supplier timeline for each accounting point present in
     * [accountingPointEnergySuppliers] by synchronising flex.accounting_point_energy_supplier
     * to exactly match the incoming data for those accounting points.
     *
     * Energy supplier parties (type='energy_supplier') are looked up by GLN business_id and
     * must already exist in flex.party; a [DatabaseError] is returned if any GLN is unknown.
     *
     * Matches on (accounting_point_id, lower(valid_time_range)):
     * - Updates energy_supplier_id and valid_time_range when they differ.
     * - Inserts new rows when no match is found.
     * - Deletes existing rows whose start time is not present in the incoming data.
     *
     * Accounting points not present in [accountingPointEnergySuppliers] are not affected.
     */
    context(principal: FlexPrincipal)
    suspend fun replaceAllAccountingPointEnergySupplier(
        accountingPointEnergySuppliers: List<AccountingPointEnergySupplier>
    ): Either<RepositoryError, Unit>

    /**
     * Updates the location of an accounting point with the given coordinates.
     *
     * Returns [DatabaseError] if no row exists for [accountingPointId].
     */
    context(principal: FlexPrincipal)
    suspend fun updateAccountingPointLocation(
        accountingPointId: Long,
        location: Location,
    ): Either<RepositoryError, Unit>

    /**
     * Acquires a row-level lock on the sync row for [accountingPointId], waiting up to 1 second.
     *
     * On acquiring the lock, stamps [last_sync_start] with the current time so that in-progress
     * syncs are visible to observers.
     *
     * Returns [LockTimeoutError] if the lock cannot be acquired within 1 second (another sync is
     * already running), [DatabaseError] if no sync row exists for [accountingPointId].
     *
     * Must be called within an existing [no.elhub.flex.db.FlexTransaction.flexTransaction] so
     * that the lock is held until the outer transaction commits.
     */
    context(principal: FlexPrincipal)
    suspend fun lockSyncRowAndMarkStart(accountingPointId: Long): Either<RepositoryError, Unit>

    /**
     * Marks a sync as complete for the given accounting point.
     *
     * Returns [DatabaseError] if no sync row exists for the given accounting point ID,
     * which indicates a data inconsistency.
     */
    context(principal: FlexPrincipal)
    suspend fun markSyncComplete(accountingPointId: Long): Either<RepositoryError, Unit>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class AccountingPointRepositoryImpl : AccountingPointRepository {

    context(principal: FlexPrincipal)
    override suspend fun getCurrentAccountingPoint(
        controllableUnitBusinessId: String,
    ): Either<RepositoryError, AccountingPoint> =
        flexTransaction { conn ->
            either {
                val row = runCatching {
                    conn.prepareNamed(
                        """
                        SELECT accounting_point_id::bigint, accounting_point_business_id::text
                        FROM api.current_controllable_unit_accounting_point(:controllableUnitBusinessId::text)
                        """,
                        mapOf("controllableUnitBusinessId" to controllableUnitBusinessId),
                    ).querySingle { rs ->
                        AccountingPoint(
                            id = rs.getLong("accounting_point_id"),
                            businessId = rs.getString("accounting_point_business_id")
                        )
                    }
                }.getOrElse { e ->
                    logger.error { "getCurrentAccountingPoint failed: ${e.message}" }
                    raise(DatabaseError("Failed to read Accounting Point data"))
                }

                row ?: run {
                    logger.info { "Current AP not found for CU $controllableUnitBusinessId." }
                    raise(NotFoundError("Current accounting point not found"))
                }
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun getAccountingPointByBusinessId(
        accountingPointBusinessId: String,
    ): Either<RepositoryError, AccountingPoint> =
        flexTransaction { conn ->
            either {
                val row = runCatching {
                    conn.prepareNamed(
                        "SELECT id, business_id FROM flex.accounting_point WHERE business_id = :businessId",
                        mapOf("businessId" to accountingPointBusinessId),
                    ).querySingle { rs ->
                        AccountingPoint(
                            id = rs.getLong("id"),
                            businessId = rs.getString("business_id")
                        )
                    }
                }.getOrElse { e ->
                    logger.error { "getAccountingPointIdByBusinessId($accountingPointBusinessId) failed: ${e.message}" }
                    raise(DatabaseError("Failed to read accounting point by business ID $accountingPointBusinessId"))
                }

                row ?: run {
                    logger.info { "Accounting point $accountingPointBusinessId not found." }
                    raise(NotFoundError("accounting point does not exist in database"))
                }
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun checkEndUserMatchesAccountingPoint(
        endUserBusinessId: String,
        accountingPointBusinessId: String,
    ): Either<RepositoryError, Long> =
        flexTransaction { conn ->
            Either.catch {
                conn.prepareNamed(
                    """
                    SELECT end_user_id::bigint
                    FROM api.controllable_unit_lookup_check_end_user_matches_accounting_point(
                        :endUserBusinessId::text,
                        :accountingPointBusinessId::text
                    )
                    """,
                    mapOf(
                        "endUserBusinessId" to endUserBusinessId,
                        "accountingPointBusinessId" to accountingPointBusinessId,
                    ),
                ).querySingle { rs -> rs.getLong("end_user_id") }
            }.mapLeft { e ->
                logger.error { "checkEndUserMatchesAccountingPoint failed: ${e.message}" }
                DatabaseError("Failed to check end user")
            }.flatMap { id ->
                id?.right() ?: run {
                    logger.info { "No match between end user and accounting point $accountingPointBusinessId" }
                    NoMatchError("End user does not match accounting point / controllable unit").left()
                }
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun insertAccountingPointIfNotExists(
        accountingPoint: AccountingPoint
    ): Either<RepositoryError, Long> =
        flexTransaction { conn ->
            Either.catch {
                conn.prepareNamed(
                    """
                    WITH ins AS (
                        INSERT INTO flex.accounting_point (business_id)
                        VALUES (:businessId)
                        ON CONFLICT (business_id) DO NOTHING
                        RETURNING id
                    )
                    SELECT id FROM ins
                    UNION ALL
                    SELECT id FROM flex.accounting_point WHERE business_id = :businessId AND NOT EXISTS (SELECT 1 FROM ins)
                    """,
                    mapOf("businessId" to accountingPoint.businessId),
                ).queryRequiredSingle { rs -> rs.getLong("id") }
            }.mapLeft { e ->
                logger.error { "insertAccountingPointIfNotExists failed: ${e.message}" }
                DatabaseError("Failed to upsert accounting point")
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun updateAccountingPointLocation(
        accountingPointId: Long,
        location: Location,
    ): Either<RepositoryError, Unit> =
        flexTransaction { conn ->
            Either.catch {
                conn.prepareNamed(
                    """
                    UPDATE flex.accounting_point
                    SET location = public.ST_SetSRID(public.ST_MakePoint(:longitude, :latitude), 4326)
                    WHERE id = :accountingPointId
                    """,
                    mapOf(
                        "longitude" to location.longitude,
                        "latitude" to location.latitude,
                        "accountingPointId" to accountingPointId,
                    ),
                ).use { stmt ->
                    val updated = stmt.executeUpdate()
                    if (updated == 0) error("No accounting point found with id $accountingPointId")
                }
            }.mapLeft { e ->
                logger.error { "updateAccountingPointLocation failed: ${e.message}" }
                DatabaseError("Failed to update accounting point location")
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun replaceAllAccountingPointEndUsers(
        accountingPointEndUsers: List<AccountingPointEndUser>
    ): Either<RepositoryError, Unit> =
        flexTransaction { conn ->
            Either.catch {
                // Resolve or create flex.entity + flex.party for each distinct end user.
                val partyIdByBusinessId = accountingPointEndUsers
                    .map { it.endUserBusinessId }
                    .distinct()
                    .associateWith { businessId ->
                        val entityId = resolveOrCreateEntity(conn, businessId)
                        resolveOrCreateEndUserParty(conn, entityId, businessId)
                    }

                conn.prepareNamed(
                    """
                    MERGE INTO flex.accounting_point_end_user AS apeu
                    USING (
                        SELECT
                            unnest(:accountingPointId::bigint[]) AS accounting_point_id,
                            unnest(:endUserId::bigint[])         AS end_user_id,
                            unnest(:validFrom::timestamptz[])    AS valid_from,
                            unnest(:validTo::timestamptz[])      AS valid_to
                    ) AS src
                    ON (
                        apeu.accounting_point_id = src.accounting_point_id
                        AND lower(apeu.valid_time_range) = src.valid_from
                    )
                    WHEN MATCHED AND (
                        apeu.end_user_id IS DISTINCT FROM src.end_user_id
                        OR upper(apeu.valid_time_range) IS DISTINCT FROM src.valid_to
                    ) THEN UPDATE SET
                        end_user_id      = src.end_user_id,
                        valid_time_range = tstzrange(src.valid_from, src.valid_to, '[)')
                    WHEN NOT MATCHED BY TARGET
                        THEN INSERT (accounting_point_id, end_user_id, valid_time_range)
                        VALUES (src.accounting_point_id, src.end_user_id, tstzrange(src.valid_from, src.valid_to, '[)'))
                    WHEN NOT MATCHED BY SOURCE
                        AND apeu.accounting_point_id = ANY(:accountingPointIds::bigint[])
                        THEN DELETE
                    """,
                    mapOf(
                        "accountingPointId" to conn.createBigintArray(accountingPointEndUsers.map { it.accountingPointId }),
                        "endUserId" to conn.createBigintArray(accountingPointEndUsers.map { partyIdByBusinessId.getValue(it.endUserBusinessId) }),
                        "validFrom" to conn.createTimestampArray(accountingPointEndUsers.map { it.validFrom }),
                        "validTo" to conn.createNullableTimestampArray(accountingPointEndUsers.map { it.validTo }),
                        "accountingPointIds" to conn.createBigintArray(accountingPointEndUsers.map { it.accountingPointId }.distinct()),
                    ),
                ).use { stmt -> stmt.execute() }
                Unit
            }.mapLeft { e ->
                logger.error { "replaceAllAccountingPointEndUsers failed: ${e.message}" }
                DatabaseError("Failed to replace accounting point end users")
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun replaceAllAccountingPointEnergySupplier(
        accountingPointEnergySuppliers: List<AccountingPointEnergySupplier>
    ): Either<RepositoryError, Unit> =
        flexTransaction { conn ->
            Either.catch {
                val glns = accountingPointEnergySuppliers.map { it.energySupplierBusinessId }.distinct()
                val partyIdByBusinessId = conn.fetchEnergySupplierPartyIds(glns)

                conn.prepareNamed(
                    """
                    MERGE INTO flex.accounting_point_energy_supplier AS apes
                    USING (
                        SELECT
                            unnest(:accountingPointId::bigint[])  AS accounting_point_id,
                            unnest(:energySupplierId::bigint[])   AS energy_supplier_id,
                            unnest(:validFrom::timestamptz[])     AS valid_from,
                            unnest(:validTo::timestamptz[])       AS valid_to
                    ) AS src
                    ON (
                        apes.accounting_point_id = src.accounting_point_id
                        AND lower(apes.valid_time_range) = src.valid_from
                    )
                    WHEN MATCHED AND (
                        apes.energy_supplier_id IS DISTINCT FROM src.energy_supplier_id
                        OR upper(apes.valid_time_range) IS DISTINCT FROM src.valid_to
                    ) THEN UPDATE SET
                        energy_supplier_id = src.energy_supplier_id,
                        valid_time_range   = tstzrange(src.valid_from, src.valid_to, '[)')
                    WHEN NOT MATCHED BY TARGET
                        THEN INSERT (accounting_point_id, energy_supplier_id, valid_time_range)
                        VALUES (src.accounting_point_id, src.energy_supplier_id, tstzrange(src.valid_from, src.valid_to, '[)'))
                    WHEN NOT MATCHED BY SOURCE
                        AND apes.accounting_point_id = ANY(:accountingPointIds::bigint[])
                        THEN DELETE
                    """,
                    mapOf(
                        "accountingPointId" to conn.createBigintArray(accountingPointEnergySuppliers.map { it.accountingPointId }),
                        "energySupplierId" to conn.createBigintArray(accountingPointEnergySuppliers.map { partyIdByBusinessId.getValue(it.energySupplierBusinessId) }),
                        "validFrom" to conn.createTimestampArray(accountingPointEnergySuppliers.map { it.validFrom }),
                        "validTo" to conn.createNullableTimestampArray(accountingPointEnergySuppliers.map { it.validTo }),
                        "accountingPointIds" to conn.createBigintArray(accountingPointEnergySuppliers.map { it.accountingPointId }.distinct()),
                    ),
                ).use { stmt -> stmt.execute() }
                Unit
            }.mapLeft { e ->
                logger.error { "replaceAllAccountingPointEnergySupplier failed: ${e.message}" }
                DatabaseError("Failed to replace accounting point energy suppliers")
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun lockSyncRowAndMarkStart(accountingPointId: Long): Either<RepositoryError, Unit> =
        flexTransaction { conn ->
            Either.catch {
                conn.prepareStatement("SET LOCAL lock_timeout = '1s'").use { it.execute() }
                conn.prepareNamed(
                    """
                    WITH lock AS (
                        SELECT accounting_point_id FROM flex.accounting_point_sync
                        WHERE accounting_point_id = :accountingPointId FOR UPDATE
                    )
                    UPDATE flex.accounting_point_sync
                    SET last_sync_start = now()
                    WHERE accounting_point_id = :accountingPointId AND EXISTS (SELECT 1 FROM lock)
                    RETURNING accounting_point_id
                    """,
                    mapOf("accountingPointId" to accountingPointId),
                ).querySingle { } ?: error("No sync row found for accounting point $accountingPointId")
            }.mapLeft { e ->
                val sqlState = (e as? SQLException)?.sqlState
                if (sqlState == "55P03") {
                    LockTimeoutError("Lock timeout acquiring sync row for accounting point $accountingPointId")
                } else {
                    logger.error { "lockSyncRowAndMarkStart failed: ${e.message}" }
                    DatabaseError("Failed to lock sync row for accounting point $accountingPointId")
                }
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun markSyncComplete(accountingPointId: Long): Either<RepositoryError, Unit> =
        flexTransaction { conn ->
            Either.catch {
                conn.prepareNamed(
                    """
                    UPDATE flex.accounting_point_sync
                    SET last_synced_at = now(), last_sync_start = NULL, version = version + 1
                    WHERE accounting_point_id = :accountingPointId
                    """,
                    mapOf("accountingPointId" to accountingPointId),
                ).use { stmt ->
                    val updated = stmt.executeUpdate()
                    if (updated == 0) error("No sync row found for accounting point $accountingPointId")
                }
            }.mapLeft { e ->
                logger.error { "markSyncComplete failed: ${e.message}" }
                DatabaseError("No sync row found for accounting point $accountingPointId")
            }
        }
}

internal fun entityTypeFor(businessId: String): String = when {
    businessId.matches(Regex("^[0-9]{11}$")) -> "person"
    businessId.matches(Regex("^[1-9][0-9]{8}$")) -> "organisation"
    else -> error("Cannot determine entity type for end user business ID")
}

internal fun anonymizePersonId(businessId: String): String = businessId.take(6)

private fun resolveOrCreateEntity(conn: Connection, endUserBusinessId: String): Long {
    val entityType = entityTypeFor(endUserBusinessId)
    val businessIdType = if (entityType == "person") "pid" else "org"
    val name = if (entityType == "person") anonymizePersonId(endUserBusinessId) else endUserBusinessId

    conn.prepareNamed(
        "INSERT INTO flex.entity (name, type, business_id, business_id_type) VALUES (:name, :type, :businessId, :businessIdType) ON CONFLICT (business_id) DO NOTHING",
        mapOf(
            "name" to "$name - ENT",
            "type" to entityType,
            "businessId" to endUserBusinessId,
            "businessIdType" to businessIdType,
        ),
    ).use { stmt -> stmt.execute() }

    return conn.prepareNamed(
        "SELECT id FROM flex.entity WHERE business_id = :businessId",
        mapOf("businessId" to endUserBusinessId),
    ).queryRequiredSingle { rs -> rs.getLong("id") }
}

/**
 * Resolves or creates the flex.party row (type='end_user') for the given entity, returning its ID.
 *
 * If a new party is inserted it is immediately activated (status 'new' → 'active')
 */
private fun resolveOrCreateEndUserParty(conn: Connection, entityId: Long, endUserBusinessId: String): Long {
    val entityType = entityTypeFor(endUserBusinessId)
    val name = if (entityType == "person") anonymizePersonId(endUserBusinessId) else endUserBusinessId
    conn.prepareNamed(
        """
        INSERT INTO flex.party (entity_id, name, type, role)
        VALUES (:entityId, :name, 'end_user', 'flex_end_user')
        ON CONFLICT (entity_id) WHERE type = 'end_user' DO NOTHING
        RETURNING id
        """,
        mapOf(
            "entityId" to entityId,
            "name" to "$name - EU",
        ),
    ).querySingle { rs -> rs.getLong("id") }?.let { newPartyId ->
        conn.prepareNamed(
            "UPDATE flex.party SET status = 'active' WHERE id = :partyId AND status = 'new'",
            mapOf("partyId" to newPartyId),
        ).use { activate -> activate.execute() }
        return newPartyId
    }

    // Party already existed — fetch its ID.
    return conn.prepareNamed(
        "SELECT id FROM flex.party WHERE entity_id = :entityId AND type = 'end_user'",
        mapOf("entityId" to entityId),
    ).queryRequiredSingle { rs -> rs.getLong("id") }
}

/**
 * Fetches the flex.party IDs for a list of energy supplier GLNs in a single query.
 *
 * Returns a map of GLN → party ID. Errors if any GLN has no matching party row.
 */
private fun Connection.fetchEnergySupplierPartyIds(glns: List<String>): Map<String, Long> {
    val pgArray = createArrayOf("text", glns.toTypedArray())
    val result = prepareNamed(
        "SELECT business_id, id FROM flex.party WHERE business_id = ANY(:glns) AND type = 'energy_supplier'",
        mapOf("glns" to pgArray),
    ).query { rs ->
        rs.getString("business_id") to rs.getLong("id")
    }.toMap()
    val missing = glns - result.keys
    check(missing.isEmpty()) { "Energy supplier party not found for business_id(s): $missing" }
    return result
}
