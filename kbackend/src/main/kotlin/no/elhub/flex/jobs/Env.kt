package no.elhub.flex.jobs

fun requireEnv(name: String): String =
    System.getenv(name) ?: error("Required environment variable '$name' is not set")

fun booleanEnv(name: String, default: Boolean = false): Boolean =
    System.getenv(name)?.toBooleanStrict() ?: default
