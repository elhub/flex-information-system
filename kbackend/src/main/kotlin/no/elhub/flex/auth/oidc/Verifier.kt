package no.elhub.flex.auth.oidc

import arrow.core.Either
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Base64
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

private const val ENTROPY_BYTES = 8
private const val HMAC_ALGORITHM = "HmacSHA256"

private val encoder = Base64.getUrlEncoder().withoutPadding()
private val decoder = Base64.getUrlDecoder()

/**
 * Used to verify state and nonce between the request and the response.
 * It uses HMAC hashing with SHA256 for verification.
 */
class Verifier private constructor(private val key: ByteArray, private val messageBytes: ByteArray) {
    private val hashBytes: ByteArray = Mac.getInstance(HMAC_ALGORITHM)
        .apply { init(SecretKeySpec(key, HMAC_ALGORITHM)) }
        .doFinal(messageBytes)

    /** The message as a string. */
    val message: String get() = encoder.encodeToString(messageBytes)

    /** The hash as a string. */
    val hash: String get() = encoder.encodeToString(hashBytes)

    /** Checks if [hash] is equal to the hash of the verifier. */
    fun verify(hash: String): Boolean {
        val returned = Either.catch { decoder.decode(hash) }.getOrNull() ?: return false
        return MessageDigest.isEqual(hashBytes, returned)
    }

    companion object {
        private val random = SecureRandom()

        /** Creates a verifier with a random message. */
        fun fromRandom(key: String): Verifier =
            Verifier(key.toByteArray(), ByteArray(ENTROPY_BYTES).also { random.nextBytes(it) })

        /** Creates a verifier from a message string. */
        fun fromString(key: String, msg: String): Either<MalformedMessageError, Verifier> =
            Either.catch { decoder.decode(msg) }
                .map { msg -> Verifier(key.toByteArray(), msg) }
                .mapLeft { MalformedMessageError("could not decode the message: ${it.message}") }
    }
}
