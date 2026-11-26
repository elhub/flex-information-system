package no.elhub.flex.shared.adapter

/** Errors raised when communicating with the adapter. */
sealed class AdapterError(message: String)

/** The adapter returned a 404 — the accounting point is not known. */
data class NotFoundError(val resource: String, val id: String) :
    AdapterError("$resource not found: $id")

/** The adapter returned a non-success, non-404 HTTP status. */
data class HttpError(val statusCode: Int, val statusDescription: String) :
    AdapterError("Adapter returned HTTP $statusCode $statusDescription")

/** A network or serialisation error occurred while calling the adapter. */
data class NetworkError(val cause: String?) :
    AdapterError("Adapter network error: $cause")
