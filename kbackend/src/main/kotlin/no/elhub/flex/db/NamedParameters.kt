package no.elhub.flex.db

import java.sql.Connection
import java.sql.PreparedStatement
import java.sql.ResultSet

/**
 * Regex matching named parameters of the form `:paramName` in SQL strings.
 * Parameter names must start with a letter or underscore, followed by letters, digits, or underscores.
 * A negative lookbehind on `:` ensures PostgreSQL cast syntax (`::type`) is not treated as a parameter.
 */
private val NAMED_PARAM_REGEX = Regex("""(?<!:):([a-zA-Z_][a-zA-Z0-9_]*)""")

/**
 * Prepares a [PreparedStatement] from a SQL string that uses named parameters (`:paramName` syntax).
 *
 * Named parameters are substituted with positional `?` markers and values from [params] are
 * bound in the resulting order. The same named parameter may appear multiple times; each occurrence
 * is bound independently.
 *
 * Example:
 * ```kotlin
 * conn.prepareNamed(
 *     "SELECT id, name FROM flex.party WHERE id = :id",
 *     mapOf("id" to 42L),
 * ).use { stmt -> stmt.executeQuery().use { rs -> ... } }
 * ```
 *
 * @param sql SQL string with named parameters (e.g. `WHERE id = :id AND role = :role`)
 * @param params map of parameter name to value; `null` values are bound as SQL NULL
 * @throws IllegalArgumentException if a named parameter in [sql] has no matching key in [params]
 */
fun Connection.prepareNamed(
    sql: String,
    params: Map<String, Any?>,
): PreparedStatement {
    val paramNames = mutableListOf<String>()
    val positionalSql = NAMED_PARAM_REGEX.replace(sql.trimIndent()) { match ->
        val name = match.groupValues[1]
        require(name in params) { "Named parameter ':$name' is not present in the params map" }
        paramNames += name
        "?"
    }
    return prepareStatement(positionalSql).also { stmt ->
        paramNames.forEachIndexed { index, name ->
            stmt.setObject(index + 1, params[name])
        }
    }
}

/**
 * Executes this [PreparedStatement] as a query and maps every row using [rowMapper],
 * returning all results as a list. Returns an empty list if the result set contains no rows.
 *
 * Both the [PreparedStatement] and the [ResultSet] are closed when this function returns.
 */
fun <T> PreparedStatement.query(rowMapper: (ResultSet) -> T): List<T> =
    use { stmt ->
        stmt.executeQuery().use { rs ->
            val results = mutableListOf<T>()
            while (rs.next()) results += rowMapper(rs)
            results
        }
    }

/**
 * Executes this [PreparedStatement] as a query and maps the first row using [rowMapper].
 * Returns `null` if the result set contains no rows.
 *
 * Both the [PreparedStatement] and the [ResultSet] are closed when this function returns.
 */
fun <T> PreparedStatement.querySingle(rowMapper: (ResultSet) -> T): T? =
    use { stmt ->
        stmt.executeQuery().use { rs ->
            if (rs.next()) rowMapper(rs) else null
        }
    }

/**
 * Executes this [PreparedStatement] as a query and maps the first row using [rowMapper].
 * Throws [IllegalStateException] if the result set contains no rows.
 *
 * Both the [PreparedStatement] and the [ResultSet] are closed when this function returns.
 */
fun <T> PreparedStatement.queryRequiredSingle(rowMapper: (ResultSet) -> T): T =
    use { stmt ->
        stmt.executeQuery().use { rs ->
            check(rs.next()) { "Query returned no rows" }
            rowMapper(rs)
        }
    }
