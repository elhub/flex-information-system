package no.elhub.flex.testutil

import kotlin.random.Random

/** A string of [length] random digits. */
fun randomNumber(length: Int): String = (1..length).joinToString("") { Random.nextInt(10).toString() }

/** A random value shaped like an organisation number. */
@Suppress("MagicNumber")
fun randomOrg(): String = "8" + randomNumber(8)

/** A random value shaped like a GSRN, without a valid check digit. */
@Suppress("MagicNumber")
fun randomGsrn(): String = "9" + randomNumber(17)

/** A random, valid email address. */
@Suppress("MagicNumber")
fun randomEmail(domain: String = "example.com"): String =
    (1..10).joinToString("") { ('a'..'z').random().toString() } + "@$domain"
