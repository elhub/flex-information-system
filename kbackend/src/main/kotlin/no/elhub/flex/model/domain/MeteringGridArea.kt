package no.elhub.flex.model.domain

/**
 * Internal domain representation of a metering_grid_area row from the database.
 *
 * @property id surrogate primary key
 * @property businessId EIC-Y identifier for the metering grid area
 * @property name human-readable name of the metering grid area (max 128 characters)
 * @property status lifecycle status of the metering grid area
 */
data class MeteringGridArea(
    val id: Long,
    val businessId: String,
    val name: String,
    val status: MeteringGridAreaStatus,
)

/** Lifecycle status of a [MeteringGridArea]. */
enum class MeteringGridAreaStatus { ACTIVE, INACTIVE }
