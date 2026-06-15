package no.elhub.flex.util

import java.sql.Array
import java.sql.Connection
import kotlin.time.Instant

/**
 * Creates a PostgreSQL timestamptz array from a list of Instants.
 */
fun Connection.createTimestampArray(instants: List<Instant>): Array =
    createArrayOf("timestamptz", instants.map { it.toString() }.toTypedArray())

/**
 * Creates a PostgreSQL timestamptz array from a list of nullable Instants.
 * Null elements are preserved as SQL NULL within the array.
 */
fun Connection.createNullableTimestampArray(instants: List<Instant?>): Array =
    createArrayOf("timestamptz", instants.map { it?.toString() }.toTypedArray())

/**
 * Creates a PostgreSQL bigint array from a list of Longs.
 */
fun Connection.createBigintArray(values: List<Long>): Array =
    createArrayOf("bigint", values.toTypedArray())
