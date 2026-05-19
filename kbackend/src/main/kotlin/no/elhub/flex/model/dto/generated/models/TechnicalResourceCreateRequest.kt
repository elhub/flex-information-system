package no.elhub.flex.model.dto.generated.models

import java.math.BigDecimal
import kotlin.Long
import kotlin.String
import kotlin.collections.List
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request schema for create operations - Technical unit being part of a controllable unit.
 */
@Serializable
public data class TechnicalResourceCreateRequest(
  /**
   * Name of the technical resource. Maximum 128 characters.
   */
  @SerialName("name")
  public val name: String,
  /**
   * Reference to the controllable unit that this technical resource belongs to.
   */
  @SerialName("controllable_unit_id")
  public val controllableUnitId: Long,
  /**
   * Technologies of the technical resource. Multiple technologies can be given, e.g. solar and
   * battery for hybrid inverters.
   */
  @SerialName("technology")
  public val technology: List<Technology>,
  /**
   * Rated power in kilowatts. This is the maximum nominal continuous power of the device, typically
   * defined by the manufacturer.
   */
  @Contextual
  @SerialName("maximum_active_power")
  public val maximumActivePower: BigDecimal,
  /**
   * Type of device for technical resources.
   */
  @SerialName("device_type")
  public val deviceType: DeviceType,
  /**
   * The manufacturer of the device. Required if model or business id is provided.
   */
  @SerialName("make")
  public val make: String? = null,
  /**
   * The model of the device.
   */
  @SerialName("model")
  public val model: String? = null,
  /**
   * Business identifier of the device, such as a serial number or MAC address.
   */
  @SerialName("business_id")
  public val businessId: String? = null,
  /**
   * The type of business identifier used for the device.
   */
  @SerialName("business_id_type")
  public val businessIdType: TechnicalResourceBusinessIdType? = null,
  /**
   * Free text field for extra information about the technical resource if needed.
   */
  @SerialName("additional_information")
  public val additionalInformation: String? = null,
)
