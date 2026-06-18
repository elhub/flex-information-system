package no.elhub.flex.model.domain

/**
 * The internal database ID of an accounting point.
 *
 * Wraps a [Long] to make it explicit at call sites where an accounting point ID is expected,
 * avoiding confusion with other plain [Long] identifiers.
 */
@JvmInline
value class AccountingPointId(val value: Long)
