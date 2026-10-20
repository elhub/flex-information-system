package no.elhub.flex.util

fun requireEnv(name: String): String =
    System.getenv(name) ?: error("Required environment variable '$name' is not set")
