package no.elhub.flex.api.identity

import io.kotest.matchers.collections.shouldContainAll
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.api.model.dto.generated.models.IdentityResponse
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

class IdentityApiTest :
    ApiSpec({
        beforeEach { truncate("flex.party", "flex.entity") }

        // RLS: ID-COM001
        context("a party of any role") {
            for (role in TestPartyRole.common) {
                test("${role.type} can list and read all identities") {
                    val actor = seed { insertActor(role) }
                    val other = seed { insertActor(TestPartyRole.SP) }

                    val list = api.get("/identity", actor.token())
                    list.status shouldBe HttpStatusCode.OK
                    val identities = list.body<List<IdentityResponse>>()
                    identities.map { it.entityId } shouldContainAll listOf(actor.entityId, other.entityId)

                    val read = api.get("/identity/${identities.first().id}", actor.token())
                    read.status shouldBe HttpStatusCode.OK
                    read.body<IdentityResponse>().id shouldBe identities.first().id
                }
            }
        }

        // RLS: ID-ENT001
        test("an entity that has not assumed a party can list and read all identities") {
            val entity = seed { insertEntityActor() }
            val other = seed { insertActor(TestPartyRole.SP) }

            val list = api.get("/identity", entity.token())
            list.status shouldBe HttpStatusCode.OK
            val identities = list.body<List<IdentityResponse>>()
            identities.map { it.entityId } shouldContainAll listOf(entity.entityId, other.entityId)

            api.get("/identity/${identities.first().id}", entity.token()).status shouldBe HttpStatusCode.OK
        }

        test("an anonymous caller cannot list identities") {
            api.get("/identity", token = null).status shouldBe HttpStatusCode.Unauthorized
        }
    })
