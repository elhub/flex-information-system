package no.elhub.flex.auth.db

import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import no.elhub.flex.auth.model.UserInfo
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.db.NotFoundError
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
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

    context("getOrCreateEntity") {

        test("creates an entity of type person that can be found from the identity, as the anonymous principal") {
            // given
            val pid = "3${(System.nanoTime() % 10_000_000_000L).toString().padStart(10, '0')}"

            // when
            val created = with(FlexPrincipal.anonymous) { repo.getOrCreateEntity(pid, "pid", "Created Person") }.shouldBeRight()

            // then
            val info = with(FlexPrincipal(role = "flex_entity", eid = created.externalId)) { repo.currentUserInfo() }.shouldBeRight()
            info.entityId shouldBe created.entityId
            info.entityName shouldBe "Created Person"
            info.partyId shouldBe null
        }

        test("returns the same entity and identity the second time, without changing the name") {
            // given
            val pid = "4${(System.nanoTime() % 10_000_000_000L).toString().padStart(10, '0')}"
            val first = with(FlexPrincipal.anonymous) { repo.getOrCreateEntity(pid, "pid", "First Name") }.shouldBeRight()

            // when
            val second = with(FlexPrincipal.anonymous) { repo.getOrCreateEntity(pid, "pid", "Other Name") }.shouldBeRight()

            // then
            second shouldBe first
        }

        test("returns DatabaseError for a business ID type that does not exist") {
            // when
            val result = with(FlexPrincipal.anonymous) { repo.getOrCreateEntity("12345678901", "not a type", "Person") }

            // then
            result.shouldBeLeft().shouldBe(DatabaseError("Failed to get or create the entity"))
        }
    }
})
