package no.elhub.flex.model.dto.generated.models

import kotlin.String
import kotlin.collections.Map
import kotlinx.serialization.SerialName

/**
 * Type of device for technical resources.
 */
public enum class DeviceType(
  public val `value`: String,
) {
  @SerialName("inverter")
  INVERTER("inverter"),
  @SerialName("boiler")
  BOILER("boiler"),
  @SerialName("water_heater")
  WATER_HEATER("water_heater"),
  @SerialName("socket")
  SOCKET("socket"),
  @SerialName("hvac")
  HVAC("hvac"),
  @SerialName("ev_charging_device")
  EV_CHARGING_DEVICE("ev_charging_device"),
  @SerialName("energy_management_system")
  ENERGY_MANAGEMENT_SYSTEM("energy_management_system"),
  @SerialName("other")
  OTHER("other"),
  ;

  override fun toString(): String = value

  public companion object {
    private val mapping: Map<String, DeviceType> = entries.associateBy(DeviceType::value)

    public fun fromValue(`value`: String): DeviceType? = mapping[value]
  }
}
