package no.elhub.flex.api.party

import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldNotBeEmpty
import io.kotest.matchers.collections.shouldNotContain
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.PartyBusinessIdType
import no.elhub.flex.api.model.dto.generated.models.PartyCreateRequest
import no.elhub.flex.api.model.dto.generated.models.PartyHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.PartyResponse
import no.elhub.flex.api.model.dto.generated.models.PartyRole
import no.elhub.flex.api.model.dto.generated.models.PartyStatus
import no.elhub.flex.api.model.dto.generated.models.PartyType
import no.elhub.flex.api.model.dto.generated.models.PartyUpdateRequest
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.testutil.uniqueEicX
import no.elhub.flex.testutil.uniqueGln
import no.elhub.flex.token

class PartyApiTest :
    ApiSpec({
        beforeEach { truncate("flex.party", "flex.entity") }

        // RLS: PTY-FISO001
        context("a FISO") {
            test("can create an end user, which gets a UUID as business id and the status new") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val owner = seed { insertPersonEntity("End user owner") }

                val response = api.post(
                    "/party",
                    fiso.token(),
                    PartyCreateRequest(
                        name = "New End User",
                        role = PartyRole.FLEX_END_USER,
                        type = PartyType.END_USER,
                        entityId = owner,
                        status = PartyStatus.NEW,
                    ),
                )

                response.status shouldBe HttpStatusCode.Created
                response.body<PartyResponse>().businessIdType shouldBe PartyBusinessIdType.UUID
            }

            test("can create a service provider with an EIC") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val owner = seed { insertPersonEntity("SP owner") }

                val response = api.post(
                    "/party",
                    fiso.token(),
                    PartyCreateRequest(
                        name = "New SP",
                        businessId = uniqueEicX(),
                        businessIdType = PartyBusinessIdType.EIC_X,
                        role = PartyRole.FLEX_SERVICE_PROVIDER,
                        type = PartyType.SERVICE_PROVIDER,
                        entityId = owner,
                    ),
                )

                response.status shouldBe HttpStatusCode.Created
                response.body<PartyResponse>().status shouldBe PartyStatus.NEW
            }

            test("can create, update, list and read a party with a GLN") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val owner = seed { insertPersonEntity("Party owner") }

                val created = api.post(
                    "/party",
                    fiso.token(),
                    PartyCreateRequest(
                        name = "New Party",
                        businessId = uniqueGln(),
                        businessIdType = PartyBusinessIdType.GLN,
                        role = PartyRole.FLEX_FLEXIBILITY_INFORMATION_SYSTEM_OPERATOR,
                        type = PartyType.FLEXIBILITY_INFORMATION_SYSTEM_OPERATOR,
                        entityId = owner,
                    ),
                )
                created.status shouldBe HttpStatusCode.Created
                val partyId = created.body<PartyResponse>().id

                val updated = api.patch("/party/$partyId", fiso.token(), PartyUpdateRequest(name = "New Party Updated"))
                updated.status shouldBe HttpStatusCode.OK
                updated.body<PartyResponse>().name shouldBe "New Party Updated"

                val read = api.get("/party/$partyId", fiso.token())
                read.status shouldBe HttpStatusCode.OK

                val filtered = api.get("/party", fiso.token(), "id" to "eq.$partyId")
                filtered.body<List<PartyResponse>>() shouldBe listOf(read.body<PartyResponse>())
            }
        }

        context("a party of any role") {
            for (role in TestPartyRole.common) {
                // RLS: PTY-COM001
                test("${role.type} can read the history of a party that it can read") {
                    val actor = seed { insertActor(role) }

                    val list = api.get("/party_history", actor.token(), "party_id" to "eq.${actor.partyId}")
                    list.status shouldBe HttpStatusCode.OK
                    val history = list.body<List<PartyHistoryResponse>>()
                    history.shouldNotBeEmpty()

                    val read = api.get("/party_history/${history.first().id}", actor.token())
                    read.status shouldBe HttpStatusCode.OK
                    read.body<PartyHistoryResponse>().partyId shouldBe actor.partyId
                }

                // RLS: PTY-COM002
                test("${role.type} can read the parties that are not end users") {
                    val actor = seed { insertActor(role) }
                    val serviceProvider = seed { insertServiceProvider("Visible SP") }
                    val endUser = seed { insertEndUserParty() }

                    val visible = api.get("/party", actor.token()).body<List<PartyResponse>>().map { it.id }

                    visible shouldContain serviceProvider
                    // a FISO can read all parties, see PTY-FISO001
                    if (role != TestPartyRole.FISO) visible shouldNotContain endUser
                }
            }

            // RLS: PTY-COM003
            for (role in TestPartyRole.common) {
                test("${role.type} can read its own party, also when that is an end user") {
                    val actor = seed { insertActor(role) }

                    val response = api.get("/party/${actor.partyId}", actor.token())

                    response.status shouldBe HttpStatusCode.OK
                    response.body<PartyResponse>().id shouldBe actor.partyId
                }
            }

            for (role in TestPartyRole.withoutRla) {
                test("${role.type} sees only the parties that are not end users, and its own party") {
                    val actor = seed { insertActor(role) }
                    val serviceProvider = seed { insertServiceProvider("Visible SP") }
                    seed { insertEndUserParty() }

                    val visible = api.get("/party", actor.token()).body<List<PartyResponse>>().map { it.id }

                    visible shouldContainExactlyInAnyOrder listOf(serviceProvider, actor.partyId)
                }
            }
        }

        // RLS: PTY-ENT001
        context("an entity") {
            test("that has not assumed a party can read a party that it is a member of") {
                val entity = seed { insertEntityActor() }
                val endUser = seed { insertEndUserParty() }
                seed { insertPartyMembership(endUser, entity.entityId) }

                api.get("/party/$endUser", entity.token()).status shouldBe HttpStatusCode.OK
            }

            // RLS: PTY-ENT002
            test("that has not assumed a party can read the parties that it owns") {
                val entity = seed { insertEntityActor() }
                val owned = seed { insertParty(entity.entityId, "Owned", "end_user", "flex_end_user") }
                val notOwned = seed { insertEndUserParty() }

                api.get("/party/$owned", entity.token()).status shouldBe HttpStatusCode.OK
                api.get("/party/$notOwned", entity.token()).status shouldBe HIDDEN_BY_RLS
            }
        }
    })
