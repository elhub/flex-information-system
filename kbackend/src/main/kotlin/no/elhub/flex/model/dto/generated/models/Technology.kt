package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * Technology classification using ltree path notation. Technologies are hierarchical (e.g.,
 * hydropower.pumped, hvac.heat_pump). Use the most specific technology applicable to the technical
 * resource.
 */
public enum class Technology(
  public val `value`: String,
) {
  @SerialName("hydropower")
  HYDROPOWER("hydropower"),
  @SerialName("hydropower.pumped")
  HYDROPOWER_PUMPED("hydropower.pumped"),
  @SerialName("hydropower.run_of_river")
  HYDROPOWER_RUN_OF_RIVER("hydropower.run_of_river"),
  @SerialName("heat_power_plant")
  HEAT_POWER_PLANT("heat_power_plant"),
  @SerialName("heat_power_plant.chp")
  HEAT_POWER_PLANT_CHP("heat_power_plant.chp"),
  @SerialName("solar")
  SOLAR("solar"),
  @SerialName("wind")
  WIND("wind"),
  @SerialName("backup_generator")
  BACKUP_GENERATOR("backup_generator"),
  @SerialName("hvac")
  HVAC("hvac"),
  @SerialName("hvac.heat")
  HVAC_HEAT("hvac.heat"),
  @SerialName("hvac.heat_pump")
  HVAC_HEAT_PUMP("hvac.heat_pump"),
  @SerialName("lighting")
  LIGHTING("lighting"),
  @SerialName("water_heater")
  WATER_HEATER("water_heater"),
  @SerialName("boiler")
  BOILER("boiler"),
  @SerialName("ev_charging_device")
  EV_CHARGING_DEVICE("ev_charging_device"),
  @SerialName("ev_charging_device.v2g")
  EV_CHARGING_DEVICE_V2G("ev_charging_device.v2g"),
  @SerialName("battery")
  BATTERY("battery"),
  @SerialName("other.consumption")
  OTHER_CONSUMPTION("other.consumption"),
  @SerialName("other.production")
  OTHER_PRODUCTION("other.production"),
  @SerialName("other.energy_storage")
  OTHER_ENERGY_STORAGE("other.energy_storage"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, Technology> = entries.associateBy(Technology::value)

    public fun fromValue(`value`: String): Technology? = mapping[value]
  }
}
