package no.elhub.flex.api.productapplication

import kotlinx.serialization.KSerializer
import kotlinx.serialization.SerializationException
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonDecoder
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.modules.SerializersModule
import java.math.BigDecimal

/** Reads a JSON number, and only a number, as a [BigDecimal]. */
private object NumberBigDecimalSerializer : KSerializer<BigDecimal> {
    override val descriptor = PrimitiveSerialDescriptor("BigDecimal", PrimitiveKind.DOUBLE)

    override fun serialize(encoder: Encoder, value: BigDecimal) = encoder.encodeString(value.toPlainString())

    override fun deserialize(decoder: Decoder): BigDecimal {
        val primitive = (decoder as JsonDecoder).decodeJsonElement().jsonPrimitive
        if (primitive.isString || primitive is JsonNull) {
            throw SerializationException("Expected a number but got ${primitive.content}")
        }
        return BigDecimal(primitive.content)
    }
}

/** Rejects unknown properties, unlike the lenient configuration used for the responses of the API. */
internal val strictJson = Json {
    ignoreUnknownKeys = false
    serializersModule = SerializersModule {
        contextual(BigDecimal::class, NumberBigDecimalSerializer)
    }
}

/** The text of a [JsonPrimitive], or `null` for JSON `null`. */
internal fun JsonPrimitive.textOrNull(): String? = if (this is JsonNull) null else content

/** The first line of the message of a decoding error, which is the useful one. */
internal fun Throwable.firstLine(): String = message?.lineSequence()?.firstOrNull().orEmpty()
