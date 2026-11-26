package no.elhub.flex.api.entity

import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldNotContain
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.EntityBusinessIdType
import no.elhub.flex.api.model.dto.generated.models.EntityCreateRequest
import no.elhub.flex.api.model.dto.generated.models.EntityResponse
import no.elhub.flex.api.model.dto.generated.models.EntityType
import no.elhub.flex.api.model.dto.generated.models.EntityUpdateRequest
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.randomEmail
import no.elhub.flex.testutil.randomGsrn
import no.elhub.flex.testutil.randomOrg
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.testutil.uniquePid
import no.elhub.flex.token

private fun newEntity(
    businessId: String,
    businessIdType: EntityBusinessIdType,
    type: EntityType,
    name: String = "Test Entity",
) = EntityCreateRequest(name = name, businessId = businessId, businessIdType = businessIdType, type = type)

class EntityApiTest :
    ApiSpec({
        beforeEach { truncate("flex.entity", "flex.party") }

        // RLS: ENT-FISO001
        // RLS: ENT-FISO002
        context("a FISO") {
            test("can list and read entities") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val other = seed { insertPersonEntity("Other person") }

                val list = api.get("/entity", fiso.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<EntityResponse>>().map { it.id } shouldContain other

                val read = api.get("/entity/$other", fiso.token())
                read.status shouldBe HttpStatusCode.OK
                read.body<EntityResponse>().name shouldBe "Other person"

                val filtered = api.get("/entity", fiso.token(), "id" to "eq.$other")
                filtered.body<List<EntityResponse>>() shouldBe listOf(read.body<EntityResponse>())
            }

            context("creating an organisation") {
                val invalid = mapOf(
                    "a PID as the business id of an organisation" to
                        newEntity(uniquePid(), EntityBusinessIdType.PID, EntityType.ORGANISATION),
                    "a GSRN with the id type PID" to
                        newEntity(randomGsrn(), EntityBusinessIdType.PID, EntityType.ORGANISATION),
                    "a PID with the id type ORG" to
                        newEntity(uniquePid(), EntityBusinessIdType.ORG, EntityType.ORGANISATION),
                    "an organisation number with the id type PID" to
                        newEntity(randomOrg(), EntityBusinessIdType.PID, EntityType.ORGANISATION),
                )
                for ((description, request) in invalid) {
                    test("is rejected with $description") {
                        val fiso = seed { insertActor(TestPartyRole.FISO) }

                        api.post("/entity", fiso.token(), request).status shouldBe HttpStatusCode.BadRequest
                    }
                }

                test("succeeds with an organisation number") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }

                    val response = api.post(
                        "/entity",
                        fiso.token(),
                        newEntity(randomOrg(), EntityBusinessIdType.ORG, EntityType.ORGANISATION, "Test Entity VALID ORG"),
                    )

                    response.status shouldBe HttpStatusCode.Created
                    response.body<EntityResponse>().type shouldBe EntityType.ORGANISATION
                }
            }

            context("creating a person") {
                val invalid = mapOf(
                    "a GSRN with the id type PID" to newEntity(randomGsrn(), EntityBusinessIdType.PID, EntityType.PERSON),
                    "an organisation number with the id type ORG" to
                        newEntity(randomOrg(), EntityBusinessIdType.ORG, EntityType.PERSON),
                    "an organisation number with the id type PID" to
                        newEntity(randomOrg(), EntityBusinessIdType.PID, EntityType.PERSON),
                    "an email with the id type PID" to newEntity(randomEmail(), EntityBusinessIdType.PID, EntityType.PERSON),
                    "a PID with the id type EMAIL" to newEntity(uniquePid(), EntityBusinessIdType.EMAIL, EntityType.PERSON),
                ) + listOf(
                    "plainaddress",
                    "@missingusername.com",
                    "username@.com",
                    "username@com",
                    "Valid.But.Upper.Case@example.com",
                ).associate { email ->
                    "the malformed email $email" to newEntity(email, EntityBusinessIdType.EMAIL, EntityType.PERSON)
                }
                for ((description, request) in invalid) {
                    test("is rejected with $description") {
                        val fiso = seed { insertActor(TestPartyRole.FISO) }

                        api.post("/entity", fiso.token(), request).status shouldBe HttpStatusCode.BadRequest
                    }
                }

                test("succeeds with an email address, also on an unusual domain") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }

                    for (email in listOf(randomEmail(), randomEmail("something.energy"))) {
                        val response = api.post("/entity", fiso.token(), newEntity(email, EntityBusinessIdType.EMAIL, EntityType.PERSON))

                        response.status shouldBe HttpStatusCode.Created
                        response.body<EntityResponse>().businessId shouldBe email
                    }
                }

                test("succeeds with a PID, which is masked in the response") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }
                    val pid = uniquePid()

                    val response = api.post("/entity", fiso.token(), newEntity(pid, EntityBusinessIdType.PID, EntityType.PERSON))

                    response.status shouldBe HttpStatusCode.Created
                    response.body<EntityResponse>().businessId shouldBe pid.take(6) + "*****"
                }
            }

            test("can update the name of an entity") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val entityId = seed { insertPersonEntity("Before") }

                val response = api.patch("/entity/$entityId", fiso.token(), EntityUpdateRequest(name = "Test Entity Updated"))

                response.status shouldBe HttpStatusCode.OK
                response.body<EntityResponse>().name shouldBe "Test Entity Updated"
            }
        }

        // RLS: ENT-ORG001
        context("an organisation") {
            test("sees an entity that is a member of a party that it owns, and no other") {
                val org = seed { insertActor(TestPartyRole.ORG) }
                val partyOwnedByOrg = seed { insertParty(org.ownerEntityId!!, "ES owned by org", "energy_supplier", "flex_energy_supplier") }
                val person = seed { insertPersonEntity("Person seen by org") }

                api.get("/entity/$person", org.token()).status shouldBe HIDDEN_BY_RLS

                seed { insertPartyMembership(partyOwnedByOrg, person) }

                val response = api.get("/entity/$person", org.token())
                response.status shouldBe HttpStatusCode.OK
                response.body<EntityResponse>().id shouldBe person
            }
        }

        context("a party of any role") {
            // a FISO sees every entity, see above
            for (role in TestPartyRole.common - TestPartyRole.FISO) {
                // RLS: ENT-COM001
                test("${role.type} sees all organisation entities, but not other persons") {
                    val actor = seed { insertActor(role) }
                    val organisation = seed { insertOrganisationEntity("Unrelated organisation") }
                    val person = seed { insertPersonEntity("Unrelated person") }

                    val visible = api.get("/entity", actor.token()).body<List<EntityResponse>>().map { it.id }

                    visible shouldContain organisation
                    visible shouldContain actor.ownerEntityId
                    visible shouldNotContain person
                }
            }

            // RLS: ENT-COM002
            test("sees the entities that are members of its party") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val member = seed { insertPersonEntity("Member") }
                val nonMember = seed { insertPersonEntity("Non-member") }
                seed { insertPartyMembership(so.partyId!!, member) }

                val visible = api.get("/entity", so.token()).body<List<EntityResponse>>().map { it.id }

                visible shouldContain member
                visible shouldNotContain nonMember
            }

            // RLS: ENT-COM003
            test("can read the entity that owns its party, also when that is a person") {
                // a person owner is not visible through ENT-COM001, which only covers organisations
                val owner = seed { insertPersonEntity("Party owner") }
                val so = seed { insertActor(TestPartyRole.SO, ownerEntityId = owner) }
                val ownerOfOtherParty = seed { insertPersonEntity("Owner of another party") }
                seed { insertActor(TestPartyRole.SO, name = "Other SO", ownerEntityId = ownerOfOtherParty) }

                val response = api.get("/entity/$owner", so.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<EntityResponse>().id shouldBe owner
                api.get("/entity/$ownerOfOtherParty", so.token()).status shouldBe HIDDEN_BY_RLS
            }

            // there is no row level access beyond ENT-COM001 and ENT-ENT001 for these roles
            for (role in TestPartyRole.withoutRla) {
                test("${role.type} sees the organisations and its own entity, and nothing else") {
                    val actor = seed { insertActor(role) }
                    val organisation = seed { insertOrganisationEntity("Another organisation") }
                    seed { insertPersonEntity("Unrelated person") }

                    val visible = api.get("/entity", actor.token()).body<List<EntityResponse>>().map { it.id }

                    visible shouldContainExactlyInAnyOrder listOf(actor.ownerEntityId, organisation, actor.entityId)
                }
            }
        }

        // RLS: ENT-ENT001
        test("an entity that has not assumed a party sees only itself") {
            val entity = seed { insertEntityActor() }
            seed { insertOrganisationEntity("Another organisation") }

            val visible = api.get("/entity", entity.token()).body<List<EntityResponse>>()

            visible.map { it.id } shouldBe listOf(entity.entityId)
            visible.single().type shouldBe EntityType.PERSON
        }
    })
