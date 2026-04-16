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
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.LockTimeoutError
import no.elhub.flex.model.domain.db.NoMatchError
import no.elhub.flex.model.domain.db.NotFoundError
import no.elhub.flex.model.domain.db.RepositoryError
import no.elhub.flex.util.toSqlTimestamp
import no.elhub.flex.util.toSqlTimestampOrNull
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
     * Upserts end-user timeline entries for accounting points into flex.accounting_point_end_user.
     *
     * The flex.entity and flex.party (type='end_user') rows for each end user are created
     * on demand if they do not already exist.
     */
    context(principal: FlexPrincipal)
    suspend fun upsertAccountingPointEndUsers(
        accountingPointEndUsers: List<AccountingPointEndUser>
    ): Either<RepositoryError, Unit>

    /**
     * Upserts energy-supplier timeline entries for accounting points into
     * flex.accounting_point_energy_supplier.
     *
     * Energy supplier parties (type='energy_supplier') are looked up by GLN business_id and
     * must already exist in flex.party; a [DatabaseError] is returned if any GLN is unknown.
     */
    context(principal: FlexPrincipal)
    suspend fun upsertAccountingPointEnergySupplier(
        accountingPointEnergySuppliers: List<AccountingPointEnergySupplier>
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
    override suspend fun upsertAccountingPointEndUsers(
        accountingPointEndUsers: List<AccountingPointEndUser>
    ): Either<RepositoryError, Unit> =
        flexTransaction { conn ->
            Either.catch {
                val byAccountingPoint = accountingPointEndUsers.groupBy { it.accountingPointId }

                for ((accountingPointId, endUsers) in byAccountingPoint) {
                    // Resolve or create flex.entity + flex.party for each distinct end user.
                    val partyIdByBusinessId = endUsers
                        .map { it.endUserBusinessId }
                        .distinct()
                        .associateWith { businessId ->
                            val entityId = resolveOrCreateEntity(conn, businessId)
                            resolveOrCreateEndUserParty(conn, entityId, businessId)
                        }

                    val incomingStarts = endUsers.map { it.validFrom }
                    val validFromDates = conn.createTimestampArray(incomingStarts)

                    // Delete stale records (start time no longer present in incoming data).
                    conn.prepareNamed(
                        """
                        DELETE FROM flex.accounting_point_end_user
                        WHERE accounting_point_id = :accountingPointId
                        AND lower(valid_time_range) != ALL(:validFromDates::timestamptz[])
                        """,
                        mapOf(
                            "accountingPointId" to accountingPointId,
                            "validFromDates" to validFromDates,
                        ),
                    ).use { stmt -> stmt.execute() }

                    conn.prepareNamed(
                        """
                        MERGE INTO flex.accounting_point_end_user AS apeu
                        USING (
                            SELECT
                                unnest(:accountingPointId::bigint[])   AS accounting_point_id,
                                unnest(:endUserId::bigint[])            AS end_user_id,
                                unnest(:validFrom::timestamptz[])       AS valid_from,
                                unnest(:validTo::timestamptz[])         AS valid_to
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
                        WHEN NOT MATCHED
                        THEN INSERT (accounting_point_id, end_user_id, valid_time_range)
                        VALUES (src.accounting_point_id, src.end_user_id, tstzrange(src.valid_from, src.valid_to, '[)'))
                        """,
                        endUsers.map { endUser ->
                            mapOf(
                                "accountingPointId" to accountingPointId,
                                "endUserId" to partyIdByBusinessId.getValue(endUser.endUserBusinessId),
                                "validFrom" to endUser.validFrom.toSqlTimestamp(),
                                "validTo" to endUser.validTo.toSqlTimestampOrNull(),
                            )
                        },
                    ).use { stmt -> stmt.execute() }
                }
            }.mapLeft { e ->
                logger.error { "upsertAccountingPointEndUsers failed: ${e.message}" }
                DatabaseError("Failed to upsert accounting point end users")
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun upsertAccountingPointEnergySupplier(
        accountingPointEnergySuppliers: List<AccountingPointEnergySupplier>
    ): Either<RepositoryError, Unit> =
        flexTransaction { conn ->
            Either.catch {
                val byAccountingPoint = accountingPointEnergySuppliers.groupBy { it.accountingPointId }

                for ((accountingPointId, energySuppliers) in byAccountingPoint) {
                    val glns = energySuppliers.map { it.energySupplierBusinessId }.distinct()
                    val partyIdByBusinessId = conn.fetchEnergySupplierPartyIds(glns)

                    val incomingStarts = energySuppliers.map { it.validFrom }
                    val pgArray = conn.createTimestampArray(incomingStarts)

                    // Delete stale records
                    conn.prepareNamed(
                        """
                        DELETE FROM flex.accounting_point_energy_supplier
                        WHERE accounting_point_id = :accountingPointId
                        AND lower(valid_time_range) != ALL(:validFromDates::timestamptz[])
                        """,
                        mapOf(
                            "accountingPointId" to accountingPointId,
                            "validFromDates" to pgArray,
                        ),
                    ).use { stmt -> stmt.execute() }

                    conn.prepareNamed(
                        """
                        MERGE INTO flex.accounting_point_energy_supplier AS apes
                        USING (
                            SELECT
                                unnest(:accountingPointId::bigint[])   AS accounting_point_id,
                                unnest(:energySupplierId::bigint[])    AS energy_supplier_id,
                                unnest(:validFrom::timestamptz[])      AS valid_from,
                                unnest(:validTo::timestamptz[])        AS valid_to
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
                        WHEN NOT MATCHED
                        THEN INSERT (accounting_point_id, energy_supplier_id, valid_time_range)
                        VALUES (src.accounting_point_id, src.energy_supplier_id, tstzrange(src.valid_from, src.valid_to, '[)'))
                        """,
                        energySuppliers.map { energySupplier ->
                            mapOf(
                                "accountingPointId" to accountingPointId,
                                "energySupplierId" to partyIdByBusinessId.getValue(energySupplier.energySupplierBusinessId),
                                "validFrom" to energySupplier.validFrom.toSqlTimestamp(),
                                "validTo" to energySupplier.validTo.toSqlTimestampOrNull(),
                            )
                        },
                    ).use { stmt -> stmt.execute() }
                }
            }.mapLeft { e ->
                logger.error { "upsertAccountingPointEnergySupplier failed: ${e.message}" }
                DatabaseError("Failed to upsert accounting point energy suppliers")
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

/**
 * Builds a PostgreSQL timestamptz array from a list of Instants representing valid_from values.
 * Used for the `!= ALL(?::timestamptz[])` clause in the stale-record DELETE.
 */
private fun Connection.createTimestampArray(instants: List<Instant>): Array =
    createArrayOf("timestamptz", instants.map { it.toString() }.toTypedArray())

private fun resolveOrCreateEntity(conn: Connection, endUserBusinessId: String): Long {
    val (entityType, businessIdType) = when {
        endUserBusinessId.matches(Regex("^[1-9][0-9]{10}$")) -> "person" to "pid"
        endUserBusinessId.matches(Regex("^[1-9][0-9]{8}$")) -> "organisation" to "org"
        else -> error("Cannot determine entity type for end user business ID")
    }

    conn.prepareNamed(
        "INSERT INTO flex.entity (name, type, business_id, business_id_type) VALUES (:name, :type, :businessId, :businessIdType) ON CONFLICT (business_id) DO NOTHING",
        mapOf(
            "name" to "$endUserBusinessId - ENT",
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
    conn.prepareNamed(
        """
        INSERT INTO flex.party (entity_id, name, type, role)
        VALUES (:entityId, :name, 'end_user', 'flex_end_user')
        ON CONFLICT (entity_id) WHERE type = 'end_user' DO NOTHING
        RETURNING id
        """,
        mapOf(
            "entityId" to entityId,
            "name" to "$endUserBusinessId - EU",
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
