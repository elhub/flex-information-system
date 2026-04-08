package no.elhub.flex.accountingpoint.db

import arrow.core.Either
import arrow.core.flatMap
import arrow.core.left
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.model.domain.AccountingPoint
import no.elhub.flex.model.domain.AccountingPointEndUser
import no.elhub.flex.model.domain.AccountingPointEnergySupplier
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.LockTimeoutError
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
     * Returns the end-user ID, or [NotFoundError] when the check fails.
     */
    context(principal: FlexPrincipal)
    suspend fun checkEndUserMatchesAccountingPoint(
        endUserBusinessId: String,
        accountingPointBusinessId: String
    ): Either<RepositoryError, Long>

    /**
     * Upserts a single accounting point into flex.accounting_point.
     *
     * Inserts by business ID, ignoring conflicts. Returns the id of the inserted row,
     * or the id of the already-existing row if the business ID was already present.
     */
    context(principal: FlexPrincipal)
    suspend fun upsertAccountingPoint(
        accountingPoint: AccountingPoint
    ): Either<RepositoryError, Long>

    /**
     * Upserts end-user timeline entries for accounting points into flex.accounting_point_end_user.
     *
     * For each unique accounting point in the list, applies a 3-step ESBR-style merge keyed on
     * (accounting_point_id, lower(valid_time_range)):
     * 1. Delete rows whose valid_time_range start is no longer present in the incoming data.
     * 2. Update rows whose start time matches but whose end_user_id or valid_to has changed.
     * 3. Insert rows whose start time is not yet present in the target table.
     *
     * The flex.entity and flex.party (type='end_user') rows for each end user are created
     * on demand if they do not already exist, mirroring the behaviour of
     * api.controllable_unit_lookup_sync_accounting_point.
     */
    context(principal: FlexPrincipal)
    suspend fun upsertAccountingPointEndUsers(
        accountingPointEndUsers: List<AccountingPointEndUser>
    ): Either<RepositoryError, Unit>

    /**
     * Upserts energy-supplier timeline entries for accounting points into
     * flex.accounting_point_energy_supplier.
     *
     * Applies the same 3-step merge as [upsertAccountingPointEndUsers], keyed on
     * (accounting_point_id, lower(valid_time_range)).
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
            Either.catch {
                conn.prepareStatement(CURRENT_CONTROLLABLE_UNIT_ACCOUNTING_POINT).use { stmt ->
                    stmt.setString(1, controllableUnitBusinessId)
                    stmt.executeQuery().use { rs ->
                        if (rs.next()) AccountingPoint(id = rs.getLong(1), businessId = rs.getString(2)) else null
                    }
                }
            }.mapLeft { e ->
                logger.error { "getCurrentAccountingPoint failed: ${e.message}" }
                DatabaseError("Failed to read Accounting Point data")
            }.flatMap { row ->
                row?.right() ?: run {
                    logger.info { "Current AP not found for CU $controllableUnitBusinessId." }
                    NotFoundError("Current accounting point not found").left()
                }
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun getAccountingPointByBusinessId(
        accountingPointBusinessId: String,
    ): Either<RepositoryError, AccountingPoint> =
        flexTransaction { conn ->
            Either.catch {
                conn.prepareStatement(GET_ACCOUNTING_POINT_BY_BUSINESS_ID).use { stmt ->
                    stmt.setString(1, accountingPointBusinessId)
                    stmt.executeQuery().use { rs ->
                        if (rs.next()) AccountingPoint(id = rs.getLong(1), businessId = rs.getString(2)) else null
                    }
                }
            }.mapLeft { e ->
                logger.error { "getAccountingPointIdByBusinessId($accountingPointBusinessId) failed: ${e.message}" }
                DatabaseError("Failed to read accounting point by business ID $accountingPointBusinessId")
            }.flatMap { row ->
                row?.right() ?: run {
                    logger.info { "Accounting point $accountingPointBusinessId not found." }
                    NotFoundError("accounting point does not exist in database").left()
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
                conn.prepareStatement(CHECK_END_USER_MATCHES_ACCOUNTING_POINT).use { stmt ->
                    stmt.setString(1, endUserBusinessId)
                    stmt.setString(2, accountingPointBusinessId)
                    stmt.executeQuery().use { rs -> if (rs.next()) rs.getLong(1) else null }
                }
            }.mapLeft { e ->
                logger.error { "checkEndUserMatchesAccountingPoint failed: ${e.message}" }
                DatabaseError("Failed to check end user")
            }.flatMap { id ->
                id?.right() ?: run {
                    logger.info { "No match for end user $endUserBusinessId and accounting point $accountingPointBusinessId" }
                    NotFoundError("End user does not match accounting point / controllable unit").left()
                }
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun upsertAccountingPoint(
        accountingPoint: AccountingPoint
    ): Either<RepositoryError, Long> =
        flexTransaction { conn ->
            Either.catch {
                conn.prepareStatement(UPSERT_ACCOUNTING_POINT).use { stmt ->
                    stmt.setString(1, accountingPoint.businessId)
                    stmt.setString(2, accountingPoint.businessId)
                    stmt.executeQuery().use { rs ->
                        check(rs.next()) { "No id returned from upsert for business_id=${accountingPoint.businessId}" }
                        rs.getLong(1)
                    }
                }
            }.mapLeft { e ->
                logger.error { "upsertAccountingPoint failed: ${e.message}" }
                DatabaseError("Failed to upsert accounting point")
            }
        }

    context(principal: FlexPrincipal)
    override suspend fun upsertAccountingPointEndUsers(
        accountingPointEndUsers: List<AccountingPointEndUser>
    ): Either<RepositoryError, Unit> =
        flexTransaction { conn ->
            Either.catch {
                conn.prepareStatement("SET CONSTRAINTS ALL DEFERRED").use { it.execute() }

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
                    conn.prepareStatement(DELETE_STALE_AP_END_USERS).use { stmt ->
                        stmt.setLong(1, accountingPointId)
                        stmt.setArray(2, validFromDates)
                        stmt.execute()
                    }

                    for (endUser in endUsers) {
                        val endUserPartyId = partyIdByBusinessId.getValue(endUser.endUserBusinessId)
                        val validFrom = endUser.validFrom.toSqlTimestamp()
                        val validTo = endUser.validTo.toSqlTimestampOrNull()

                        // Update changed records (same start, different end_user or valid_to).
                        conn.prepareStatement(UPDATE_CHANGED_AP_END_USER).use { stmt ->
                            stmt.setLong(1, endUserPartyId)
                            stmt.setTimestamp(2, validFrom)
                            stmt.setTimestamp(3, validTo)
                            stmt.setLong(4, accountingPointId)
                            stmt.setTimestamp(5, validFrom)
                            stmt.setLong(6, endUserPartyId)
                            stmt.setTimestamp(7, validTo)
                            stmt.execute()
                        }

                        // Insert new records (start time not yet in target table).
                        conn.prepareStatement(INSERT_NEW_AP_END_USER).use { stmt ->
                            stmt.setLong(1, accountingPointId)
                            stmt.setLong(2, endUserPartyId)
                            stmt.setTimestamp(3, validFrom)
                            stmt.setTimestamp(4, validTo)
                            stmt.setLong(5, accountingPointId)
                            stmt.setTimestamp(6, validFrom)
                            stmt.execute()
                        }
                    }
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
                conn.prepareStatement("SET CONSTRAINTS ALL DEFERRED").use { it.execute() }

                val byAccountingPoint = accountingPointEnergySuppliers.groupBy { it.accountingPointId }

                for ((accountingPointId, energySuppliers) in byAccountingPoint) {
                    val glns = energySuppliers.map { it.energySupplierBusinessId }.distinct()
                    val partyIdByBusinessId = conn.fetchEnergySupplierPartyIds(glns)

                    val incomingStarts = energySuppliers.map { it.validFrom }
                    val pgArray = conn.createTimestampArray(incomingStarts)

                    // Delete stale records
                    conn.prepareStatement(DELETE_STALE_AP_ENERGY_SUPPLIERS).use { stmt ->
                        stmt.setLong(1, accountingPointId)
                        stmt.setArray(2, pgArray)
                        stmt.execute()
                    }

                    for (energySupplier in energySuppliers) {
                        val energySupplierPartyId = partyIdByBusinessId.getValue(energySupplier.energySupplierBusinessId)
                        val validFrom = energySupplier.validFrom.toSqlTimestamp()
                        val validTo = energySupplier.validTo.toSqlTimestampOrNull()

                        // Update changed records
                        conn.prepareStatement(UPDATE_CHANGED_AP_ENERGY_SUPPLIER).use { stmt ->
                            stmt.setLong(1, energySupplierPartyId)
                            stmt.setTimestamp(2, validFrom)
                            stmt.setTimestamp(3, validTo)
                            stmt.setLong(4, accountingPointId)
                            stmt.setTimestamp(5, validFrom)
                            stmt.setLong(6, energySupplierPartyId)
                            stmt.setTimestamp(7, validTo)
                            stmt.execute()
                        }

                        // Insert new records.
                        conn.prepareStatement(INSERT_NEW_AP_ENERGY_SUPPLIER).use { stmt ->
                            stmt.setLong(1, accountingPointId)
                            stmt.setLong(2, energySupplierPartyId)
                            stmt.setTimestamp(3, validFrom)
                            stmt.setTimestamp(4, validTo)
                            stmt.setLong(5, accountingPointId)
                            stmt.setTimestamp(6, validFrom)
                            stmt.execute()
                        }
                    }
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
                conn.prepareStatement(SET_LOCK_TIMEOUT_1S).use { it.execute() }
                conn.prepareStatement(LOCK_SYNC_ROW_AND_MARK_START).use { stmt ->
                    stmt.setLong(1, accountingPointId)
                    stmt.setLong(2, accountingPointId)
                    stmt.executeQuery().use { rs ->
                        if (!rs.next()) error("No sync row found for accounting point $accountingPointId")
                    }
                }
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
                conn.prepareStatement(MARK_SYNC_COMPLETE).use { stmt ->
                    stmt.setLong(1, accountingPointId)
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
        else -> error("Cannot determine entity type for end user business ID: $endUserBusinessId")
    }

    conn.prepareStatement(INSERT_ENTITY).use { stmt ->
        stmt.setString(1, "$endUserBusinessId - ENT")
        stmt.setString(2, entityType)
        stmt.setString(3, endUserBusinessId)
        stmt.setString(4, businessIdType)
        stmt.execute()
    }

    return conn.prepareStatement(SELECT_ENTITY_BY_BUSINESS_ID).use { stmt ->
        stmt.setString(1, endUserBusinessId)
        stmt.executeQuery().use { rs ->
            check(rs.next()) { "Entity not found after upsert for business_id=$endUserBusinessId" }
            rs.getLong(1)
        }
    }
}

/**
 * Resolves or creates the flex.party row (type='end_user') for the given entity, returning its ID.
 *
 * If a new party is inserted it is immediately activated (status 'new' → 'active')
 */
private fun resolveOrCreateEndUserParty(conn: Connection, entityId: Long, endUserBusinessId: String): Long {
    conn.prepareStatement(INSERT_END_USER_PARTY).use { stmt ->
        stmt.setLong(1, entityId)
        stmt.setString(2, "$endUserBusinessId - EU")
        stmt.setLong(3, entityId)
        stmt.executeQuery().use { rs ->
            if (rs.next()) {
                val newPartyId = rs.getLong(1)
                conn.prepareStatement(ACTIVATE_PARTY).use { activate ->
                    activate.setLong(1, newPartyId)
                    activate.execute()
                }
                return newPartyId
            }
        }
    }

    // Party already existed — fetch its ID.
    return conn.prepareStatement(SELECT_END_USER_PARTY_BY_ENTITY).use { stmt ->
        stmt.setLong(1, entityId)
        stmt.executeQuery().use { rs ->
            check(rs.next()) { "End-user party not found after upsert for entity_id=$entityId" }
            rs.getLong(1)
        }
    }
}

/**
 * Fetches the flex.party IDs for a list of energy supplier GLNs in a single query.
 *
 * Returns a map of GLN → party ID. Errors if any GLN has no matching party row.
 */
private fun Connection.fetchEnergySupplierPartyIds(glns: List<String>): Map<String, Long> {
    val pgArray = createArrayOf("text", glns.toTypedArray())
    val result = prepareStatement(SELECT_ENERGY_SUPPLIER_PARTY_IDS_BY_BUSINESS_IDS).use { stmt ->
        stmt.setArray(1, pgArray)
        stmt.executeQuery().use { rs ->
            val map = mutableMapOf<String, Long>()
            while (rs.next()) map[rs.getString(1)] = rs.getLong(2)
            map
        }
    }
    val missing = glns - result.keys
    check(missing.isEmpty()) { "Energy supplier party not found for business_id(s): $missing" }
    return result
}
