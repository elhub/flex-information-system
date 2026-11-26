package no.elhub.flex.testutil

import java.util.concurrent.atomic.AtomicLong

private val pidCounter = AtomicLong(30_000_000_000L + System.nanoTime() % 1_000_000L)

/**
 * Generates a unique PID of 11 digits, which is the format the database requires of a PID.
 *
 * The digits do not encode a birth date. Tests that depend on the birth date of the PID need to build their own.
 */
fun uniquePid(): String = pidCounter.getAndIncrement().toString()
