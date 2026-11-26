package no.elhub.flex.api.entityclient

import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.MUTATION_DENIED_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.AuthScope
import no.elhub.flex.api.model.dto.generated.models.EntityClientCreateRequest
import no.elhub.flex.api.model.dto.generated.models.EntityClientResponse
import no.elhub.flex.api.model.dto.generated.models.EntityClientUpdateRequest
import no.elhub.flex.testutil.SeededActor
import no.elhub.flex.testutil.SeededEntityClient
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

private fun newClient(entityId: Long, name: String = "test client name") = EntityClientCreateRequest(
    entityId = entityId,
    name = name,
    scopes = listOf(AuthScope.MANAGE_DATA, AuthScope.MANAGE_AUTH),
)

class EntityClientApiTest :
    ApiSpec({
        beforeEach { truncate("flex.party", "flex.entity") }

        fun seedClientActor(): Triple<SeededActor, SeededEntityClient, Long> = seed {
            val entityId = insertPersonEntity("Client owner")
            val client = insertEntityClient(entityId)
            Triple(insertEntityActor(entityId, client.id), client, entityId)
        }

        // RLS: ECL-ENT001
        context("an entity client") {
            test("can list and read the clients of its own entity") {
                val (actor, client, _) = seedClientActor()

                val list = api.get("/entity_client", actor.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<EntityClientResponse>>().map { it.id } shouldContain client.id

                val read = api.get("/entity_client/${client.id}", actor.token())
                read.status shouldBe HttpStatusCode.OK
                read.body<EntityClientResponse>().clientId shouldBe client.clientId
            }

            test("cannot create or update clients, because it is not a human") {
                val (actor, client, entityId) = seedClientActor()

                api.post("/entity_client", actor.token(), newClient(entityId)).status shouldBe HttpStatusCode.Forbidden
                api.patch(
                    "/entity_client/${client.id}",
                    actor.token(),
                    EntityClientUpdateRequest(name = "updated client name"),
                ).status shouldBe MUTATION_DENIED_BY_RLS
            }

            test("cannot delete clients, because it is not a human") {
                val (actor, client, _) = seedClientActor()

                api.delete("/entity_client/${client.id}", actor.token()).status shouldBe MUTATION_DENIED_BY_RLS
            }
        }

        // RLS: ECL-FISO001
        context("a FISO") {
            test("can read the clients of any entity") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val (_, client, _) = seedClientActor()

                api.get("/entity_client/${client.id}", fiso.token()).status shouldBe HttpStatusCode.OK
            }

            test("cannot create, update or delete clients") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val (_, client, entityId) = seedClientActor()

                api.post("/entity_client", fiso.token(), newClient(entityId)).status shouldBe HttpStatusCode.Forbidden
                api.patch(
                    "/entity_client/${client.id}",
                    fiso.token(),
                    EntityClientUpdateRequest(name = "updated client name"),
                ).status shouldBe HttpStatusCode.Forbidden
                api.delete("/entity_client/${client.id}", fiso.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        test("another entity cannot create a client for an entity") {
            val (_, _, entityId) = seedClientActor()
            val other = seed { insertEntityActor() }

            api.post("/entity_client", other.token(), newClient(entityId)).status shouldBe HttpStatusCode.Forbidden
        }

        // RLS: ECL-ENT002
        context("a human") {
            test("can create, read, update and delete the clients of its own entity") {
                val human = seed { insertEntityActor() }

                val created = api.post("/entity_client", human.token(), newClient(human.entityId))
                created.status shouldBe HttpStatusCode.Created
                val clientId = created.body<EntityClientResponse>().id

                api.get("/entity_client/$clientId", human.token()).status shouldBe HttpStatusCode.OK

                val updated = api.patch(
                    "/entity_client/$clientId",
                    human.token(),
                    EntityClientUpdateRequest(name = "updated client name"),
                )
                updated.status shouldBe HttpStatusCode.OK
                updated.body<EntityClientResponse>().name shouldBe "updated client name"

                api.delete("/entity_client/$clientId", human.token()).status shouldBe HttpStatusCode.NoContent
                api.get("/entity_client/$clientId", human.token()).status shouldBe HIDDEN_BY_RLS
            }

            test("cannot create a client for another entity") {
                val human = seed { insertEntityActor() }
                val other = seed { insertPersonEntity("Other") }

                api.post("/entity_client", human.token(), newClient(other)).status shouldBe HttpStatusCode.Forbidden
            }

            test("cannot delete the clients of another entity") {
                val human = seed { insertEntityActor() }
                val (_, client, _) = seedClientActor()

                api.delete("/entity_client/${client.id}", human.token()).status shouldBe HIDDEN_BY_RLS
            }

            context("setting the party of a client") {
                test("works for a party that the entity owns") {
                    val human = seed { insertEntityActor() }
                    val client = seed { insertEntityClient(human.entityId) }
                    val owned = seed { insertParty(human.entityId, "Owned SP", "service_provider", "flex_service_provider") }

                    val response = api.patch(
                        "/entity_client/${client.id}",
                        human.token(),
                        EntityClientUpdateRequest(partyId = owned),
                    )

                    response.status shouldBe HttpStatusCode.OK
                    response.body<EntityClientResponse>().partyId shouldBe owned
                }

                test("is rejected for a party that the entity neither owns nor is a member of") {
                    val human = seed { insertEntityActor() }
                    val client = seed { insertEntityClient(human.entityId) }
                    val foreign = seed { insertServiceProvider("Foreign SP") }

                    api.patch(
                        "/entity_client/${client.id}",
                        human.token(),
                        EntityClientUpdateRequest(partyId = foreign),
                    ).status shouldBe HttpStatusCode.BadRequest
                }

                test("works once the entity is a member of the party") {
                    val human = seed { insertEntityActor() }
                    val client = seed { insertEntityClient(human.entityId) }
                    val foreign = seed { insertServiceProvider("Foreign SP") }
                    seed { insertPartyMembership(foreign, human.entityId, listOf("manage:auth", "manage:data:entity_client")) }

                    api.patch(
                        "/entity_client/${client.id}",
                        human.token(),
                        EntityClientUpdateRequest(partyId = foreign),
                    ).status shouldBe HttpStatusCode.OK
                }
            }
        }

        context("an organisation") {
            // RLS: ECL-ORG001
            test("can read the clients of the entity that owns its party") {
                val org = seed { insertActor(TestPartyRole.ORG) }
                val client = seed { insertEntityClient(org.ownerEntityId!!) }

                val list = api.get("/entity_client", org.token(), "entity_id" to "eq.${org.ownerEntityId}")

                list.status shouldBe HttpStatusCode.OK
                list.body<List<EntityClientResponse>>().map { it.id } shouldBe listOf(client.id)
            }

            // RLS: ECL-ORG002
            test("that is a human can create, update and delete the clients of the entity that owns its party") {
                val org = seed { insertActor(TestPartyRole.ORG) }
                val ownerEntityId = org.ownerEntityId!!

                val created = api.post("/entity_client", org.token(), newClient(ownerEntityId))
                created.status shouldBe HttpStatusCode.Created
                val clientId = created.body<EntityClientResponse>().id

                api.patch(
                    "/entity_client/$clientId",
                    org.token(),
                    EntityClientUpdateRequest(name = "updated client name"),
                ).status shouldBe HttpStatusCode.OK
                api.delete("/entity_client/$clientId", org.token()).status shouldBe HttpStatusCode.NoContent
            }

            test("that is not a human cannot create, update or delete the clients of the entity that owns its party") {
                val (org, client) = seed {
                    val ownerEntityId = insertOrganisationEntity("Org owner")
                    val personEntityId = insertPersonEntity("Org person")
                    val clientOfPerson = insertEntityClient(personEntityId)
                    insertActor(
                        TestPartyRole.ORG,
                        ownerEntityId = ownerEntityId,
                        entityId = personEntityId,
                        clientId = clientOfPerson.id,
                    ) to insertEntityClient(ownerEntityId)
                }

                api.post("/entity_client", org.token(), newClient(org.ownerEntityId!!)).status shouldBe HttpStatusCode.Forbidden
                api.patch(
                    "/entity_client/${client.id}",
                    org.token(),
                    EntityClientUpdateRequest(name = "updated client name"),
                ).status shouldBe MUTATION_DENIED_BY_RLS
                api.delete("/entity_client/${client.id}", org.token()).status shouldBe MUTATION_DENIED_BY_RLS
            }

            test("whose own entity is an organisation cannot create, update or delete clients, because it is not a person") {
                val organisationEntity = seed { insertOrganisationEntity("Organisation") }
                val org = seed { insertActor(TestPartyRole.ORG, ownerEntityId = organisationEntity, entityId = organisationEntity) }
                val client = seed { insertEntityClient(organisationEntity) }

                api.post("/entity_client", org.token(), newClient(organisationEntity)).status shouldBe HttpStatusCode.Forbidden
                api.patch(
                    "/entity_client/${client.id}",
                    org.token(),
                    EntityClientUpdateRequest(name = "updated client name"),
                ).status shouldBe MUTATION_DENIED_BY_RLS
                api.delete("/entity_client/${client.id}", org.token()).status shouldBe MUTATION_DENIED_BY_RLS
            }
        }
    })
