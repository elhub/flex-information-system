package no.elhub.flex.util

import kotlinx.serialization.KSerializer
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.JsonDecoder
import kotlinx.serialization.json.JsonEncoder
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonPrimitive
import java.math.BigDecimal

object BigDecimalSerializer : KSerializer<BigDecimal> {
    override val descriptor = PrimitiveSerialDescriptor("BigDecimal", PrimitiveKind.DOUBLE)

    override fun serialize(encoder: Encoder, value: BigDecimal) {
        require(encoder is JsonEncoder)
        encoder.encodeJsonElement(JsonPrimitive(value))
    }

    override fun deserialize(decoder: Decoder): BigDecimal {
        require(decoder is JsonDecoder)
        return decoder.decodeJsonElement().jsonPrimitive.content.toBigDecimal()
    }
}
