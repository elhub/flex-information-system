package no.elhub.flex.auth.oidc

import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.types.shouldBeInstanceOf

class VerifierTest : FunSpec({

    test("the hash of a message is verified with the message of the same verifier") {
        val verifier = Verifier.fromRandom("key")

        val restored = Verifier.fromString("key", verifier.message).shouldBeRight()

        restored.verify(verifier.hash) shouldBe true
    }

    test("messages and hashes are random") {
        Verifier.fromRandom("key").message shouldNotBe Verifier.fromRandom("key").message
    }

    test("the hash of another message is rejected") {
        val verifier = Verifier.fromRandom("key")
        val other = Verifier.fromRandom("key")

        verifier.verify(other.hash) shouldBe false
    }

    test("a hash made with another key is rejected") {
        val verifier = Verifier.fromRandom("key")
        val restoredWithOtherKey = Verifier.fromString("other key", verifier.message).shouldBeRight()

        restoredWithOtherKey.verify(verifier.hash) shouldBe false
    }

    test("a hash that is not base64 is rejected") {
        Verifier.fromRandom("key").verify("not base64!") shouldBe false
    }

    test("a message that is not base64 cannot be restored") {
        Verifier.fromString("key", "not base64!").shouldBeLeft().shouldBeInstanceOf<MalformedMessageError>()
    }
})
