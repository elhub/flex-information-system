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
 * Regex matching named parameters followed by a PostgreSQL array cast of the form `:paramName::type[]`.
 * Captures group 1 = parameter name, group 2 = element type (e.g. `bigint`, `text`, `timestamptz`).
 * The `[]` suffix is required — this regex is only used in the multi-row overload where every
 * parameter must carry an explicit array cast so the element type can be extracted for [Connection.createArrayOf].
 */
private val NAMED_PARAM_WITH_ARRAY_CAST_REGEX = Regex("""(?<!:):([a-zA-Z_][a-zA-Z0-9_]*)::([a-zA-Z0-9_ ]+)\[]""")

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
 * Prepares a [PreparedStatement] from a SQL string that uses named parameters (`:paramName` syntax),
 * binding multiple rows as PostgreSQL arrays.
 *
 * The SQL is written exactly as it will execute — named parameters appear inside `unnest(…)` calls
 * with explicit array casts (e.g. `:id::bigint[]`). Each `:paramName::type[]` token is substituted
 * with `?::type[]`, preserving the cast. The element type is extracted from the cast and used for
 * [Connection.createArrayOf]; the values from all rows are collected into a [java.sql.Array] and
 * bound in positional order. All rows must have the same set of keys.
 *
 * Example:
 * ```kotlin
 * conn.prepareNamed(
 *     """
 *     MERGE INTO flex.some_table AS t
 *     USING (
 *         SELECT
 *             unnest(:id::bigint[])    AS id,
 *             unnest(:name::text[])    AS name
 *     ) AS src
 *     ON t.id = src.id
 *     WHEN NOT MATCHED THEN INSERT (id, name) VALUES (src.id, src.name)
 *     """,
 *     listOf(
 *         mapOf("id" to 1L, "name" to "foo"),
 *         mapOf("id" to 2L, "name" to "bar"),
 *     ),
 * ).use { stmt -> stmt.execute() }
 * ```
 *
 * @param sql SQL string with named parameters used inside `unnest(…)` array expressions;
 *   every parameter must be followed by an explicit `::type[]` cast (e.g. `:id::bigint[]`)
 *   so the element type can be used for [Connection.createArrayOf]
 * @param rows list of parameter maps, one per row; all maps must contain the same keys
 * @throws IllegalArgumentException if [rows] is empty, keys are inconsistent, a parameter in
 *   [sql] has no matching key in the row maps, or a parameter is missing its `::type[]` cast
 */
fun Connection.prepareNamed(
    sql: String,
    rows: List<Map<String, Any?>>,
): PreparedStatement {
    require(rows.isNotEmpty()) { "rows must not be empty" }
    val firstKeys = rows.first().keys
    require(rows.all { it.keys == firstKeys }) { "All rows must have the same keys" }

    val paramNames = mutableListOf<String>()
    val paramTypes = mutableMapOf<String, String>()
    val positionalSql = NAMED_PARAM_WITH_ARRAY_CAST_REGEX.replace(sql.trimIndent()) { match ->
        val name = match.groupValues[1]
        val type = match.groupValues[2]
        require(name in firstKeys) { "Named parameter ':$name' is not present in the row maps" }
        paramNames += name
        paramTypes[name] = type
        "?::$type[]"
    }

    val unresolved = NAMED_PARAM_REGEX.find(positionalSql)?.groupValues?.get(1)
    require(unresolved == null) {
        "Named parameter ':$unresolved' in the multi-row overload must be followed by an explicit ::type[] cast"
    }

    return prepareStatement(positionalSql).also { stmt ->
        paramNames.forEachIndexed { index, name ->
            val values = rows.map { it[name] }.toTypedArray()
            stmt.setObject(index + 1, createArrayOf(paramTypes.getValue(name), values))
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
