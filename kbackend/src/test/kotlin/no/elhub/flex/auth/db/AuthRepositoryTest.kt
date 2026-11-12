package no.elhub.flex.auth.db

import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import no.elhub.flex.auth.model.BareEntityIdentity
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.ScopeVerb
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.db.NoMatchError
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
            val pid = "3${System.nanoTime() % 10_000_000_000L}".take(11)

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
            val pid = "4${System.nanoTime() % 10_000_000_000L}".take(11)
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

    context("entityIdentityOfExternalId") {

        test("returns the same identity, without client, for a person identity") {
            // given
            val entity = seed(Triggers.OFF) { insertEntityIdentity("Identity Entity") }

            // when
            val result = with(entity.principal) { repo.entityIdentityOfExternalId(entity.principal.eid) }.shouldBeRight()

            // then
            result shouldBe BareEntityIdentity(externalId = entity.principal.eid, clientId = null, scopes = null)
        }

        test("returns the client and its scopes for the identity of an entity client") {
            // given
            val client = seed(Triggers.OFF) { insertEntityClient(scopes = listOf("manage:auth", "read:data")) }
            val clientIdentity = with(FlexPrincipal.anonymous) { repo.entityClientByClientId(client.clientId) }.shouldBeRight()

            // when
            val result = with(FlexPrincipal("flex_entity", clientIdentity.externalId)) {
                repo.entityIdentityOfExternalId(clientIdentity.externalId)
            }.shouldBeRight()

            // then
            result shouldBe BareEntityIdentity(
                externalId = clientIdentity.externalId,
                clientId = client.clientId,
                scopes = listOf(Scope(ScopeVerb.Manage, "auth"), Scope(ScopeVerb.Read, "data")),
            )
        }

        test("returns NotFoundError for an identity that does not exist") {
            // given
            val unknown = FlexPrincipal(role = "flex_entity", eid = UUID.randomUUID().toString())

            // when
            val result = with(unknown) { repo.entityIdentityOfExternalId(unknown.eid) }

            // then
            result.shouldBeLeft().shouldBe(NotFoundError("identity does not exist in database"))
        }
    }

    context("entityClientByClientId") {

        test("returns the entity client, as the anonymous principal") {
            // given
            val client = seed(Triggers.OFF) { insertEntityClient(scopes = listOf("manage:auth"), publicKey = null) }

            // when
            val result = with(FlexPrincipal.anonymous) { repo.entityClientByClientId(client.clientId) }.shouldBeRight()

            // then
            result.entityId shouldBe client.entityId
            result.clientId shouldBe client.clientId
            result.partyId shouldBe null
            result.scopes shouldBe listOf(Scope(ScopeVerb.Manage, "auth"))
            result.publicKey shouldBe null
        }

        test("returns the party the client is restricted to and its public key") {
            // given
            val (partyId, client) = seed(Triggers.OFF) {
                val partyId = insertServiceProvider("Restricted SP")
                partyId to insertEntityClient(partyId = partyId, publicKey = "-----BEGIN PUBLIC KEY-----\nMIIB\n-----END PUBLIC KEY-----")
            }

            // when
            val result = with(FlexPrincipal.anonymous) { repo.entityClientByClientId(client.clientId) }.shouldBeRight()

            // then
            result.partyId shouldBe partyId
            result.publicKey shouldBe "-----BEGIN PUBLIC KEY-----\nMIIB\n-----END PUBLIC KEY-----"
        }

        test("returns NotFoundError for a client that does not exist") {
            // when
            val result = with(FlexPrincipal.anonymous) { repo.entityClientByClientId(UUID.randomUUID().toString()) }

            // then
            result.shouldBeLeft().shouldBe(NotFoundError("entity client does not exist in database"))
        }

        test("returns NotFoundError for a client ID that is not a UUID") {
            // when
            val result = with(FlexPrincipal.anonymous) { repo.entityClientByClientId("not a uuid") }

            // then
            result.shouldBeLeft().shouldBe(NotFoundError("entity client does not exist in database"))
        }
    }

    context("assumeParty") {

        test("returns the role and the scopes of the membership for a party the entity is a member of") {
            // given
            val (entity, partyId) = seed(Triggers.OFF) {
                val entity = insertEntityIdentity("Member Entity")
                val partyId = insertServiceProvider("Member SP")
                insertPartyMembership(partyId, entity.entityId)
                entity to partyId
            }

            // when
            val result = with(entity.principal) { repo.assumeParty(partyId) }.shouldBeRight()

            // then
            result.entityId shouldBe entity.entityId
            result.role shouldBe "flex_service_provider"
            result.scopes shouldBe listOf(Scope(ScopeVerb.Manage, "auth"))
        }

        test("returns the role and the default scopes of an owner for a party the entity owns") {
            // given
            val (owner, so) = seed(Triggers.OFF) {
                val so = insertSystemOperator("Owned SO")
                insertIdentityOf(so.entityId) to so
            }

            // when
            val result = with(owner.principal) { repo.assumeParty(so.partyId) }.shouldBeRight()

            // then
            result.entityId shouldBe so.entityId
            result.role shouldBe "flex_system_operator"
            result.scopes shouldBe listOf(Scope(ScopeVerb.Manage, "data"), Scope(ScopeVerb.Manage, "auth"))
        }

        test("returns NoMatchError for a party the entity can neither own nor be a member of") {
            // given
            val (entity, partyId) = seed(Triggers.OFF) { insertEntityIdentity("Stranger Entity") to insertServiceProvider("Foreign SP") }

            // when
            val result = with(entity.principal) { repo.assumeParty(partyId) }

            // then
            result.shouldBeLeft().shouldBe(NoMatchError("party cannot be assumed by the entity"))
        }
    }

    context("assumablePartyId") {

        fun businessIdOf(partyId: Long): String = seed(Triggers.OFF) { partyBusinessId(partyId) }

        test("returns the party the entity is a member of") {
            // given
            val (entity, partyId) = seed(Triggers.OFF) {
                val entity = insertEntityIdentity("Assuming Member")
                val partyId = insertServiceProvider("Assumable SP")
                insertPartyMembership(partyId, entity.entityId)
                entity to partyId
            }

            // when
            val result = with(entity.principal) {
                repo.assumablePartyId(entity.entityId, businessIdOf(partyId), "service_provider")
            }

            // then
            result.shouldBeRight() shouldBe partyId
        }

        test("returns the party the entity owns") {
            // given
            val (owner, so) = seed(Triggers.OFF) {
                val so = insertSystemOperator("Assumable SO")
                insertIdentityOf(so.entityId) to so
            }

            // when
            val result = with(owner.principal) {
                repo.assumablePartyId(so.entityId, businessIdOf(so.partyId), "system_operator")
            }

            // then
            result.shouldBeRight() shouldBe so.partyId
        }

        test("returns NotFoundError when the party type does not match") {
            // given
            val (entity, partyId) = seed(Triggers.OFF) {
                val entity = insertEntityIdentity("Wrong Type Member")
                val partyId = insertServiceProvider("Typed SP")
                insertPartyMembership(partyId, entity.entityId)
                entity to partyId
            }

            // when
            val result = with(entity.principal) {
                repo.assumablePartyId(entity.entityId, businessIdOf(partyId), "end_user")
            }

            // then
            result.shouldBeLeft().shouldBe(NotFoundError("party does not exist or cannot be assumed"))
        }

        test("returns NotFoundError for a party the entity can not assume") {
            // given
            val (entity, partyId) = seed(Triggers.OFF) { insertEntityIdentity("Outsider") to insertServiceProvider("Closed SP") }

            // when
            val result = with(entity.principal) {
                repo.assumablePartyId(entity.entityId, businessIdOf(partyId), "service_provider")
            }

            // then
            result.shouldBeLeft().shouldBe(NotFoundError("party does not exist or cannot be assumed"))
        }
    }

    context("isClient") {

        test("is false for the identity of a person") {
            val entity = seed(Triggers.OFF) { insertEntityIdentity("Not A Client") }

            val result = with(FlexPrincipal.anonymous) { repo.isClient(entity.principal.eid) }

            result.shouldBeRight() shouldBe false
        }

        test("is true for the identity of an entity client") {
            val client = seed(Triggers.OFF) { insertEntityClient() }
            val identity = with(FlexPrincipal.anonymous) { repo.entityClientByClientId(client.clientId) }.shouldBeRight()

            val result = with(FlexPrincipal.anonymous) { repo.isClient(identity.externalId) }

            result.shouldBeRight() shouldBe true
        }

        test("is still true after the entity client is deleted") {
            val client = seed(Triggers.OFF) { insertEntityClient() }
            val identity = with(FlexPrincipal.anonymous) { repo.entityClientByClientId(client.clientId) }.shouldBeRight()
            seed(Triggers.OFF) { deleteEntityClient(client.id) }

            val result = with(FlexPrincipal.anonymous) { repo.isClient(identity.externalId) }

            result.shouldBeRight() shouldBe true
        }

        test("is false for an identity that does not exist") {
            val result = with(FlexPrincipal.anonymous) { repo.isClient(UUID.randomUUID().toString()) }

            result.shouldBeRight() shouldBe false
        }
    }
})
