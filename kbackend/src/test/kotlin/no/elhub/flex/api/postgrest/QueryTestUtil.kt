package no.elhub.flex.api.postgrest

import io.ktor.http.Parameters
import io.ktor.http.ParametersBuilder

fun queryOf(vararg pairs: Pair<String, String>): ParametersBuilder =
    ParametersBuilder().also { query -> pairs.forEach { (name, value) -> query.append(name, value) } }

fun Parameters.toMap(): Map<String, List<String>> = entries().associate { it.key to it.value }

fun ParametersBuilder.toMap(): Map<String, List<String>> = build().toMap()
