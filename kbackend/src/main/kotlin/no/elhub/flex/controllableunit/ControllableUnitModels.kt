package no.elhub.flex.controllableunit

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Wire format for error responses, matching the PostgREST error body shape.
 *
 * @property code short machine-readable error code, e.g. "HTTP400"
 * @property message human-readable description
 * @property details optional extended detail
 * @property hint optional hint for the caller
 */
@Serializable
data class ErrorMessage(
    val code: String,
    val message: String,
    val details: String? = null,
    val hint: String? = null,
)

/** Request body for `POST /controllable_unit/lookup`. */
@Serializable
data class ControllableUnitLookupRequest(
    @SerialName("end_user") val endUser: String? = null,
    @SerialName("controllable_unit") val controllableUnit: String? = null,
    @SerialName("accounting_point") val accountingPoint: String? = null,
)

/** Technical resource nested inside a [ControllableUnit]. */
@Serializable
data class TechnicalResource(
    val id: Int,
    val name: String,
    val details: String? = null,
)

/** Controllable unit nested inside [ControllableUnitLookupResponse]. */
@Serializable
data class ControllableUnit(
    val id: Int,
    @SerialName("business_id") val businessId: String,
    val name: String,
    @SerialName("technical_resources") val technicalResources: List<TechnicalResource>,
)

/** Accounting-point object nested in [ControllableUnitLookupResponse]. */
@Serializable
data class AccountingPointSummary(
    val id: Int,
    @SerialName("business_id") val businessId: String,
)

/** End-user object nested in [ControllableUnitLookupResponse]. */
@Serializable
data class EndUserSummary(val id: Int)

/** Successful response body for `POST /controllable_unit/lookup`. */
@Serializable
data class ControllableUnitLookupResponse(
    @SerialName("accounting_point") val accountingPoint: AccountingPointSummary,
    @SerialName("end_user") val endUser: EndUserSummary,
    @SerialName("controllable_units") val controllableUnits: List<ControllableUnit>,
)
