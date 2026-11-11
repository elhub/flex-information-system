package no.elhub.flex.auth.token

import com.auth0.jwt.JWT
import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import no.elhub.flex.auth.scope.DefaultEntityScopes
import no.elhub.flex.auth.util.TEST_JWT_SECRET

private fun token(partyId: Int = 0, exp: Long = System.currentTimeMillis() / 1000 + 60) = AccessToken(
    entityId = 12,
    externalId = "2c5a3b1e-6a3b-4f6e-b0e4-9a1f9f0a4c11",
    partyId = partyId,
    role = if (partyId == 0) "flex_entity" else "flex_service_provider",
    scope = DefaultEntityScopes,
    expiryUnixSeconds = exp,
)

class AccessTokenTest : FunSpec({

    test("a signed token is read back by parse") {
        val token = token(partyId = 7)

        AccessToken.parse(token.sign(TEST_JWT_SECRET), TEST_JWT_SECRET).shouldBeRight() shouldBe token
    }

    test("the claims are the expected ones: space separated scopes, and no party_id without party") {
        val jwt = JWT.decode(token().sign(TEST_JWT_SECRET))

        jwt.getClaim("entity_id").asInt() shouldBe 12
        jwt.getClaim("eid").asString() shouldBe "2c5a3b1e-6a3b-4f6e-b0e4-9a1f9f0a4c11"
        jwt.getClaim("role").asString() shouldBe "flex_entity"
        jwt.getClaim("scope").asString() shouldBe "manage:auth manage:data read:grid manage:attachment"
        jwt.getClaim("party_id").isMissing shouldBe true
        jwt.algorithm shouldBe "HS256"
    }

    test("party_id is there when there is a party") {
        JWT.decode(token(partyId = 7).sign(TEST_JWT_SECRET)).getClaim("party_id").asInt() shouldBe 7
    }

    test("a token signed with another secret is not valid") {
        AccessToken.parse(token().sign("another secret that is long enough for hs256"), TEST_JWT_SECRET).shouldBeLeft()
    }
})
