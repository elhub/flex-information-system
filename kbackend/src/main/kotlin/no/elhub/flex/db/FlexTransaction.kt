package no.elhub.flex.db

import arrow.core.Either
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.withContext
import no.elhub.flex.auth.FlexPrincipal
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.transactions.suspendTransaction
import java.sql.Connection
import kotlin.coroutines.CoroutineContext

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
     * A coroutine context element used to mark that a [flexTransaction] is already active on
     * the current coroutine. Nested [flexTransaction] calls detect this marker to skip the RLS
     * preamble and join the existing transaction instead.
     */
    private object InFlexTransaction : CoroutineContext.Element {
        override val key: CoroutineContext.Key<*> = Key
        object Key : CoroutineContext.Key<InFlexTransaction>
    }

    /**
     * Runs [block] inside an Exposed transaction, applying the RLS preamble only when opening
     * a top-level transaction. When called from within an existing [flexTransaction] the preamble
     * is skipped and the block participates in the outer transaction on the same connection.
     *
     * Nesting is detected via a coroutine context marker ([InFlexTransaction]) set by the
     * outermost [flexTransaction] call. Exposed itself joins the outer transaction when
     * `useNestedTransactions` is false (the default).
     *
     * When the principal's [FlexPrincipal.eid] is `"0"` the caller is a system role and all
     * entity IDs are set to `0`. Otherwise `auth.eid_details($eid)` is called to resolve them
     * from the identity table.
     *
     * @param block the transactional work; receives the raw [java.sql.Connection]
     */
    context(principal: FlexPrincipal)
    suspend fun <L, R> flexTransaction(block: suspend (Connection) -> Either<L, R>): Either<L, R> {
        val isNested = currentCoroutineContext()[InFlexTransaction.Key] != null
        return withContext(InFlexTransaction) {
            suspendTransaction(db) {
                val conn = this.connection.connection as Connection
                if (!isNested) {
                    applyPreamble(conn, principal)
                }
                block(conn)
            }
        }
    }

    private fun applyPreamble(conn: Connection, principal: FlexPrincipal) {
        conn.prepareStatement("SET LOCAL ROLE \"${principal.role}\"").use { it.execute() }

        if (principal.eid == "0") {
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
                stmt.setString(1, principal.eid)
                stmt.execute()
            }
        }
    }
}
