package no.elhub.flex.api.entitylookup

import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.api.model.dto.generated.models.EntityLookupRequest
import no.elhub.flex.api.model.dto.generated.models.EntityLookupRequestBusinessIdType
import no.elhub.flex.api.model.dto.generated.models.EntityLookupRequestType
import no.elhub.flex.api.model.dto.generated.models.EntityLookupResponse
import no.elhub.flex.api.model.dto.generated.models.EntityResponse
import no.elhub.flex.api.model.dto.generated.models.ErrorMessage
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

private const val PATH = "/entity/lookup"

private fun organisation(businessId: String) = EntityLookupRequest(
    businessId = businessId,
    businessIdType = EntityLookupRequestBusinessIdType.ORG,
    name = "TEST-ENTITY-LOOKUP",
    type = EntityLookupRequestType.ORGANISATION,
)

private fun person(businessId: String, name: String = "TEST-ENTITY-LOOKUP") = EntityLookupRequest(
    businessId = businessId,
    businessIdType = EntityLookupRequestBusinessIdType.EMAIL,
    name = name,
    type = EntityLookupRequestType.PERSON,
)

class EntityLookupApiTest :
    ApiSpec({
        beforeEach { truncate("flex.party", "flex.entity") }

        context("a FISO") {
            test("finds an existing entity by its business id, without creating one") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val entity = seed { insertEntity("Existing organisation", "organisation", "133700000", "org") }
                val entitiesBefore = api.get("/entity", fiso.token()).body<List<EntityResponse>>().size

                val response = api.post(PATH, fiso.token(), organisation("133700000"))

                response.status shouldBe HttpStatusCode.OK
                response.body<EntityLookupResponse>().entityId shouldBe entity
                api.get("/entity", fiso.token()).body<List<EntityResponse>>().size shouldBe entitiesBefore
            }

            test("creates the entity when its business id is not known") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val entitiesBefore = api.get("/entity", fiso.token()).body<List<EntityResponse>>().map { it.id }

                val response = api.post(PATH, fiso.token(), person("test-lookup@example.com", "TEST-ENTITY-LOOKUP-EMAIL"))

                response.status shouldBe HttpStatusCode.Created
                val created = response.body<EntityLookupResponse>().entityId
                val entitiesAfter = api.get("/entity", fiso.token()).body<List<EntityResponse>>().map { it.id }
                entitiesAfter.toSet() shouldBe entitiesBefore.toSet() + created
            }

            context("cannot look up an ill formed request") {
                val illFormed = mapOf(
                    "an empty business id" to organisation(""),
                    "a business id that is not an organisation number" to organisation("badformat"),
                    "an organisation number with 10 digits instead of 9" to organisation("4337000099"),
                    "an organisation number for a person" to organisation("433700009").copy(type = EntityLookupRequestType.PERSON),
                    "an email address that is not valid" to person("notanemail"),
                    "an email address in uppercase" to person("User@Example.COM"),
                    "an empty name" to person("test@example.com", name = ""),
                )
                for ((description, request) in illFormed) {
                    test(description) {
                        val fiso = seed { insertActor(TestPartyRole.FISO) }

                        val response = api.post(PATH, fiso.token(), request)

                        response.status shouldBe HttpStatusCode.BadRequest
                        response.body<ErrorMessage>().code shouldBe "HTTP400"
                    }
                }
            }

            test("is told that an email address must be lowercase") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }

                val response = api.post(PATH, fiso.token(), person("User@Example.COM"))

                response.body<ErrorMessage>().message shouldBe "email address must be lowercase"
            }
        }

        // The organisation is the other role that can look up an entity.
        test("an organisation can look up an entity") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.post(PATH, org.token(), person("test@example.com")).status shouldBe HttpStatusCode.Created
        }

        // Only the FISO and the organisation can look up an entity.
        for (role in TestPartyRole.common - setOf(TestPartyRole.FISO, TestPartyRole.ORG)) {
            test("${role.type} cannot look up an entity") {
                val actor = seed { insertActor(role) }

                val response = api.post(PATH, actor.token(), person("test@example.com"))

                response.status shouldBe HttpStatusCode.Unauthorized
                response.body<ErrorMessage>().code shouldBe "HTTP401"
            }
        }

        test("an entity that has not assumed a party cannot look up an entity") {
            val entity = seed { insertEntityActor() }

            val response = api.post(PATH, entity.token(), person("test@example.com"))

            response.status shouldBe HttpStatusCode.Unauthorized
            response.body<ErrorMessage>().code shouldBe "HTTP401"
        }

        context("a token") {
            test("with the scope to use the lookup can look up an entity") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }

                val response = api.post(PATH, fiso.token(scope = "use:data:entity:lookup"), person("test@example.com"))

                response.status shouldBe HttpStatusCode.Created
            }

            for (scope in listOf("read:data", "use:data:controllable_unit:lookup")) {
                test("with the scope $scope cannot look up an entity") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }

                    val response = api.post(PATH, fiso.token(scope = scope), person("test@example.com"))

                    response.status shouldBe HttpStatusCode.Forbidden
                }
            }
        }
    })
