package no.elhub.flex.model.domain

import java.util.UUID

/**
 * Internal domain representation of a row in flex.accounting_point_grid_location.
 *
 * @property accountingPointId surrogate FK to flex.accounting_point
 * @property objectType type of grid model object the accounting point is located at
 * @property businessId business ID of the referenced grid model object (substation UUID)
 * @property name human-readable name of the referenced grid model object
 * @property nominalVoltage nominal voltage in kV; 0 while the location has not been confirmed
 * @property additionalInformation free-text notes, if any
 * @property source how the grid location was determined
 * @property quality the quality of the grid location registration
 */
data class AccountingPointGridLocation(
    val accountingPointId: Long,
    val objectType: AccountingPointGridLocationObjectType,
    val businessId: UUID,
    val name: String,
    val nominalVoltage: Double,
    val additionalInformation: String?,
    val source: AccountingPointGridLocationSource,
    val quality: AccountingPointGridLocationQuality,
)

/** The type of grid model object an [AccountingPointGridLocation] refers to. */
enum class AccountingPointGridLocationObjectType { SUBSTATION }

/** How an [AccountingPointGridLocation] was determined. */
enum class AccountingPointGridLocationSource { CSO, SO, GRID_MODEL, SYSTEM }

/** The quality of an [AccountingPointGridLocation] registration. */
enum class AccountingPointGridLocationQuality { CONFIRMED, GUESSED }
