package no.elhub.flex.auth.db

import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import no.elhub.flex.api.util.Triggers
import no.elhub.flex.api.util.seed
import no.elhub.flex.auth.model.UserInfo
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.NotFoundError
import java.util.UUID

class AuthRepositoryTest : FunSpec({

    val repo = AuthRepositoryImpl()

    context("currentUserInfo") {

        test("returns the entity and no party for an entity identity") {
            // given
            val entity = seed(Triggers.OFF) { insertEntityIdentity("Userinfo Entity") }

            // when
            val result = with(entity.principal) { repo.currentUserInfo() }.shouldBeRight()

            // then
            result.externalId shouldBe entity.principal.eid
            result.entityId shouldBe entity.entityId
            result.partyId shouldBe null
        }

        test("returns the entity and the party for a party identity") {
            // given
            val so = seed(Triggers.OFF) { insertSystemOperator("Userinfo SO") }

            // when
            val result = with(so.principal) { repo.currentUserInfo() }.shouldBeRight()

            // then
            result.externalId shouldBe so.principal.eid
            result.partyId shouldBe so.partyId
        }

        test("returns NotFoundError when the principal has no identity") {
            // given
            val unknown = FlexPrincipal(role = "flex_entity", eid = UUID.randomUUID().toString())

            // when
            val result = with(unknown) { repo.currentUserInfo() }

            // then
            result.shouldBeLeft().shouldBe(NotFoundError("identity does not exist in database"))
        }
    }
})
