package no.elhub.flex.util

import java.sql.Array
import java.sql.Connection
import kotlin.time.Instant

/**
 * Creates a PostgreSQL timestamptz array from a list of Instants.
 */
fun Connection.createTimestampArray(instants: List<Instant>): Array =
    createArrayOf("timestamptz", instants.map { it.toString() }.toTypedArray())
