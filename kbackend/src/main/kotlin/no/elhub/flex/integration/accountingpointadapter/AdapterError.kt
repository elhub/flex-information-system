package no.elhub.flex.integration.accountingpointadapter

import no.elhub.flex.util.AppError

/** Errors raised when communicating with the Accounting Point Adapter. */
sealed class AccountingPointAdapterError(message: String) : AppError(message)

/** The adapter returned a 404 — the accounting point is not known to the datahub. */
data class NotFoundError(val accountingPointId: String) :
    AccountingPointAdapterError("Accounting point not found: $accountingPointId")

/** The adapter returned a non-success, non-404 HTTP status. */
data class HttpError(val statusCode: Int, val statusDescription: String) :
    AccountingPointAdapterError("Adapter returned HTTP $statusCode $statusDescription")

/** A network or serialisation error occurred while calling the adapter. */
data class NetworkError(val cause: String?) :
    AccountingPointAdapterError("Adapter network error: $cause")
