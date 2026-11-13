package no.elhub.flex.auth.token

import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.datatest.withData
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import java.util.UUID

private const val NOW = 1_700_000_000L

private fun payload(
    audience: String? = "https://flex.test/auth/v1/",
    issuer: String? = UUID.randomUUID().toString(),
    issuedAt: Long? = NOW,
    expirationTime: Long? = NOW + 60,
    jwtId: String? = "jti",
    subject: String? = null,
): String =
    listOf("aud" to audience, "iss" to issuer, "iat" to issuedAt, "exp" to expirationTime, "jti" to jwtId, "sub" to subject)
        .filter { it.second != null }
        .joinToString(",", "{", "}") { (name, value) -> if (value is String) """"$name":"$value"""" else """"$name":$value""" }

private fun problemsOf(payload: String): List<String> =
    AuthorizationGrant.parse(payload, NOW).shouldBeLeft().shouldBeInstanceOf<InvalidGrantError>().problems

class GrantSubjectTest : FunSpec({

    context("parse") {
        test("parses a GLN subject") {
            GrantSubject.parse("no:party:gln:1234567890123:service_provider").shouldBeRight() shouldBe
                GrantSubject("gln", "1234567890123", "service_provider")
        }

        test("parses a UUID subject") {
            val uuid = UUID.randomUUID().toString()

            GrantSubject.parse("no:party:uuid:$uuid:end_user").shouldBeRight() shouldBe GrantSubject("uuid", uuid, "end_user")
        }

        test("toString is the inverse of parse") {
            val subject = "no:party:gln:1234567890123:flexibility_information_system_operator"

            GrantSubject.parse(subject).shouldBeRight().toString() shouldBe subject
        }

        context("is rejected") {
            withData(
                nameFn = { "${it.first}: ${it.second}" },
                "too short" to "no:party:gln:1:end_user",
                "too long" to "no:party:uuid:123e4567-e89b-12d3-a456-426614174000:${"a".repeat(40)}",
                "incorrect subject prefix" to "xx:party:gln:1234567890123:end_user",
                "incorrect number of parts" to "no:party:gln:1234567890123:service:provider",
                "invalid identifier type" to "no:party:eic:1234567890123:end_user",
                "invalid uuid identifier" to "no:party:uuid:${"x".repeat(36)}:end_user",
                "invalid numeric identifier" to "no:party:gln:123456789012x:end_user",
                "invalid gln identifier" to "no:party:gln:12345678901234:end_user",
                "invalid party type" to "no:party:gln:1234567890123:wizard_user",
            ) { (reason, subject) ->
                GrantSubject.parse(subject).shouldBeLeft() shouldBe InvalidSubjectError(reason)
            }
        }
    }
})

class AuthorizationGrantTest : FunSpec({

    context("parse") {
        test("reads the claims, ignoring unknown ones") {
            val iss = UUID.randomUUID().toString()
            val json =
                """{"aud":"a","iss":"$iss","iat":$NOW,"exp":${NOW + 1},"jti":"j","sub":"no:party:gln:1234567890123:end_user","x":1}"""

            AuthorizationGrant.parse(json, NOW).shouldBeRight() shouldBe AuthorizationGrant(
                audience = "a",
                issuer = iss,
                issuedAt = NOW,
                expirationTime = NOW + 1,
                jwtId = "j",
                subject = GrantSubject("gln", "1234567890123", "end_user"),
            )
        }

        test("a grant without subject has no subject") {
            AuthorizationGrant.parse(payload(), NOW).shouldBeRight().subject shouldBe null
        }

        test("a payload that is not a JSON object is malformed") {
            AuthorizationGrant.parse("nope", NOW).shouldBeLeft().shouldBeInstanceOf<MalformedGrantError>()
        }

        test("a claim of the wrong type is malformed") {
            AuthorizationGrant.parse("""{"iat":"yesterday"}""", NOW).shouldBeLeft().shouldBeInstanceOf<MalformedGrantError>()
        }

        test("an invalid subject is reported") {
            AuthorizationGrant.parse(payload(subject = "nope"), NOW).shouldBeLeft() shouldBe InvalidSubjectError("too short")
        }
    }

    context("validation") {
        test("an empty grant has all the problems") {
            problemsOf("{}") shouldBe listOf(
                "aud is empty",
                "iss is not a valid UUID",
                "iat must be within 10 seconds of server time",
                "iat must be before exp",
                "jti is empty",
            )
        }

        test("the audience is required") {
            problemsOf(payload(audience = "")) shouldBe listOf("aud is empty")
        }

        test("the issuer must be a UUID") {
            problemsOf(payload(issuer = "not-a-uuid")) shouldBe listOf("iss is not a valid UUID")
        }

        test("iat must be within 10 seconds of the server time, in both directions") {
            problemsOf(payload(issuedAt = NOW - 10, expirationTime = NOW + 30)) shouldBe
                listOf("iat must be within 10 seconds of server time")
            problemsOf(payload(issuedAt = NOW + 10, expirationTime = NOW + 30)) shouldBe
                listOf("iat must be within 10 seconds of server time")
            AuthorizationGrant.parse(payload(issuedAt = NOW - 9, expirationTime = NOW + 30), NOW).shouldBeRight()
        }

        test("the lifetime is at most 120 seconds") {
            AuthorizationGrant.parse(payload(expirationTime = NOW + 120), NOW).shouldBeRight()
            problemsOf(payload(expirationTime = NOW + 121)) shouldBe listOf("maximum lifetime is 120 seconds")
        }

        test("iat must be before exp") {
            problemsOf(payload(expirationTime = NOW)) shouldBe listOf("iat must be before exp")
        }

        test("the jti is required") {
            problemsOf(payload(jwtId = "")) shouldBe listOf("jti is empty")
        }
    }
})
