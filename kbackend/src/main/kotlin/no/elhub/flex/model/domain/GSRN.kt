package no.elhub.flex.model.domain

import arrow.core.Either
import arrow.core.getOrElse
import arrow.core.raise.either
import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerializationException
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import no.elhub.flex.model.error.ParsingError
import no.elhub.flex.util.isValidGsrn

/**
 * A validated Global Service Relation Number (GSRN).
 *
 * @property value the 18-digit GSRN string.
 */
@Serializable(with = GSRNSerializer::class)
@ConsistentCopyVisibility
data class GSRN private constructor(
    val value: String,
) {
    /** Factory for parsing and validating [GSRN] values. */
    companion object {
        private const val GSRN_LENGTH = 18

        /** Parses and validates a [GSRN] from the given string. */
        fun parse(str: String): Either<ParsingError, GSRN> =
            either {
                if (str.length != GSRN_LENGTH) raise(ParsingError("GSRN must have 18 digits"))
                if (str[0] == '0') raise(ParsingError("GSRN must start with a non-zero digit"))
                if (!isValidGsrn(str)) raise(ParsingError("Invalid GS1"))

                GSRN(str)
            }
    }
}

/** Custom serializer for [GSRN] values. */
object GSRNSerializer : KSerializer<GSRN> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("GSRN", PrimitiveKind.STRING)

    override fun serialize(
        encoder: Encoder,
        value: GSRN,
    ) = encoder.encodeString(value.value)

    override fun deserialize(decoder: Decoder): GSRN =
        GSRN.parse(decoder.decodeString()).getOrElse { throw SerializationException(it.details) }
}
