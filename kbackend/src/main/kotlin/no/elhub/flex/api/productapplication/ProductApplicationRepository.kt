package no.elhub.flex.api.productapplication

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.http.HttpStatusCode
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject
import no.elhub.flex.shared.db.prepareNamed
import no.elhub.flex.shared.db.querySingle
import no.elhub.flex.shared.http.AppError
import no.elhub.flex.shared.http.DatabaseRejection
import no.elhub.flex.shared.http.ForbiddenError
import no.elhub.flex.shared.http.InternalServerError
import no.elhub.flex.shared.tracing.TraceIdUtil.Companion.traceIdOrUnknown
import org.postgresql.util.PSQLException
import java.sql.Connection
import java.sql.SQLException

private val logger = KotlinLogging.logger {}

private const val VIEW = "api.service_providing_group_product_application"

/** SQL access of the writes of service providing group product applications, within the transaction of [Connection]. */
object ProductApplicationRepository {
    /** The `business_id` of the product type, or `null` if there is none. */
    fun productTypeKind(conn: Connection, id: Long): Either<AppError, String?> =
        sql {
            conn.prepareNamed("SELECT business_id FROM api.product_type WHERE id = :id", mapOf("id" to id))
                .querySingle { it.getString(1) }
        }

    /** The application as JSON, with the shape of the API response, or `null` if the caller cannot see it. */
    fun read(conn: Connection, id: Long): Either<AppError, JsonObject?> =
        sql {
            conn.prepareNamed("SELECT to_jsonb(v)::text FROM $VIEW AS v WHERE id = :id", mapOf("id" to id))
                .querySingle { strictJson.parseToJsonElement(it.getString(1)).jsonObject }
        }

    /** Inserts an application and returns it as JSON. */
    fun insert(conn: Connection, columns: Map<String, Column>): Either<AppError, JsonObject> =
        sql {
            val names = columns.keys.toList()
            val id = conn.prepareNamed(
                """
                INSERT INTO $VIEW (${names.joinToString()})
                VALUES (${names.joinToString { ":$it::${columns.getValue(it).cast}" }})
                RETURNING id
                """,
                columns.mapValues { it.value.value },
            ).querySingle { it.getLong(1) }
            checkNotNull(id) { "insert returned no row" }
        }.flatMap { id -> read(conn, id).map { it ?: error("created application $id is not readable") } }

    /** Updates the columns of an application, returning `false` when the caller cannot update it. */
    fun update(conn: Connection, id: Long, columns: Map<String, Column>): Either<AppError, Boolean> =
        sql {
            val names = columns.keys.toList()
            conn.prepareNamed(
                """
                UPDATE $VIEW
                SET ${names.joinToString { "$it = :$it::${columns.getValue(it).cast}" }}
                WHERE id = :row_id
                RETURNING id
                """,
                columns.mapValues { it.value.value } + ("row_id" to id),
            ).querySingle { it.getLong(1) } != null
        }

    private inline fun <T> sql(block: () -> T): Either<AppError, T> =
        try {
            block().right()
        } catch (e: SQLException) {
            e.toAppError().left()
        }
}

private fun <A, B, C> Either<A, B>.flatMap(f: (B) -> Either<A, C>): Either<A, C> = fold({ it.left() }, f)

/** Translates a database error to the status and code that PostgREST gave. */
internal fun SQLException.toAppError(): AppError {
    val server = (this as? PSQLException)?.serverErrorMessage
    val text = server?.message ?: message.orEmpty()
    val state = sqlState.orEmpty()
    return when {
        state.startsWith("PT") && state.drop(2).toIntOrNull() != null ->
            DatabaseRejection(state, text, HttpStatusCode.fromValue(state.drop(2).toInt()), server?.detail, server?.hint)

        state == "42501" && text.startsWith("new row violates row-level security") ->
            ForbiddenError("User cannot create this resource")

        state == "42501" -> DatabaseRejection(state, text, HttpStatusCode.Forbidden, server?.detail, server?.hint)

        state == "23505" ->
            DatabaseRejection(
                state,
                "Duplicate found, please try to update the existing resource instead",
                HttpStatusCode.Conflict,
                server?.detail,
            )

        state == "23503" -> DatabaseRejection(state, text, HttpStatusCode.Conflict, server?.detail, server?.hint)

        state.startsWith("23") || state.startsWith("22") ->
            DatabaseRejection(state, text, HttpStatusCode.BadRequest, server?.detail, server?.hint)

        else -> {
            logger.error(this) { "Unexpected database error writing a service providing group product application" }
            InternalServerError(traceIdOrUnknown())
        }
    }
}
