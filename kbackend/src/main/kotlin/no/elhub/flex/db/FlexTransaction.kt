package no.elhub.flex.db

import arrow.core.Either
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.transactions.transaction

/**
 * Holds the Exposed [Database] reference and provides [flexTransaction] —
 * a transaction wrapper that applies the per-request RLS preamble.
 *
 * - `SET LOCAL ROLE <role>` — switches to the caller's Postgres role
 * - `set_config('flex.current_entity', ...)` — sets the entity/party/identity
 *   session variables used by row-level security policies
 *
 * Initialised once at startup by [no.elhub.flex.config.configureDatabase].
 */
object FlexTransaction {
    private lateinit var db: Database

    /** Called by [no.elhub.flex.config.configureDatabase] after the pool is connected. */
    fun init(database: Database) {
        db = database
    }

    /**
     * Runs [block] inside an Exposed transaction after applying the RLS preamble.
     *
     * When [extId] is `"0"` the user is a system role and all entity IDs are set to `0`.
     * Otherwise `auth.eid_details($eid)` is called to resolve them from the identity table.
     *
     * @param role the Postgres role name from the JWT
     * @param extId the external identity ID (`eid`) from the JWT
     * @param block the transactional work; receives the raw [java.sql.Connection]
     */
    fun <L, R> flexTransaction(role: String, extId: String, block: (java.sql.Connection) -> Either<L, R>): Either<L, R> =
        transaction(db) {
            val conn = this.connection.connection as java.sql.Connection

            if (extId == "0") {
                conn.prepareStatement(
                    """
                    SELECT
                        set_config('flex.current_entity',   '0', true),
                        set_config('flex.current_party',    '0', true),
                        set_config('flex.current_identity', '0', true)
                    """.trimIndent(),
                ).use { it.execute() }
            } else {
                conn.prepareStatement(
                    """
                    SELECT
                        set_config('flex.current_entity',   entity_id::text, true),
                        set_config('flex.current_party',    party_id::text,  true),
                        set_config('flex.current_identity', id::text,        true)
                    FROM auth.eid_details(?)
                    """.trimIndent(),
                ).use { stmt ->
                    stmt.setString(1, extId)
                    stmt.execute()
                }
            }

            conn.prepareStatement("SET LOCAL ROLE \"$role\"").use { it.execute() }

            block(conn)
        }
}
