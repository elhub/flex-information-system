package no.elhub.flex.flexprivate

import arrow.core.Either

/**
 * External service interface for FlexPrivate (the Metering Point Datahub).
 *
 * Used to fetch the metering grid area business ID for an accounting point
 * that is not yet present in the local database.
 */
interface FlexPrivateService {
    /**
     * Returns the metering grid area business ID for [accountingPointBusinessId],
     * or a non-null error string on failure.
     */
    suspend fun fetchMeteringGridArea(accountingPointBusinessId: String): Either<String, String>
}
