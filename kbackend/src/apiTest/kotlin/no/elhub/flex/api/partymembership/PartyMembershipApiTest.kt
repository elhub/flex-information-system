package no.elhub.flex.api.partymembership

import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldNotBeEmpty
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.AuthScope
import no.elhub.flex.api.model.dto.generated.models.PartyMembershipCreateRequest
import no.elhub.flex.api.model.dto.generated.models.PartyMembershipHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.PartyMembershipResponse
import no.elhub.flex.api.model.dto.generated.models.PartyMembershipUpdateRequest
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

private const val ORG_ADMIN_SCOPE = "manage:data:party_membership read:data"

class PartyMembershipApiTest :
    ApiSpec({
        beforeEach { truncate("flex.party", "flex.entity") }

        // RLS: PTYM-FISO001
        // RLS: PTYM-FISO002
        context("a FISO") {
            test("can list, create, read, update and delete party memberships") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val so = seed { insertActor(TestPartyRole.SO) }
                val entity = seed { insertPersonEntity("New member") }

                val list = api.get("/party_membership", fiso.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<PartyMembershipResponse>>().shouldNotBeEmpty()

                val created = api.post(
                    "/party_membership",
                    fiso.token(),
                    PartyMembershipCreateRequest(partyId = so.partyId!!, entityId = entity, scopes = listOf(AuthScope.MANAGE_AUTH)),
                )
                created.status shouldBe HttpStatusCode.Created
                val membershipId = created.body<PartyMembershipResponse>().id

                val read = api.get("/party_membership/$membershipId", fiso.token())
                read.status shouldBe HttpStatusCode.OK
                val filtered = api.get("/party_membership", fiso.token(), "id" to "eq.$membershipId")
                filtered.body<List<PartyMembershipResponse>>() shouldBe listOf(read.body<PartyMembershipResponse>())

                val updated = api.patch(
                    "/party_membership/$membershipId",
                    fiso.token(),
                    PartyMembershipUpdateRequest(scopes = listOf(AuthScope.READ_DATA)),
                )
                updated.status shouldBe HttpStatusCode.OK
                updated.body<PartyMembershipResponse>().scopes shouldBe listOf(AuthScope.READ_DATA)

                // the view of the history also lists the current membership, so only archived revisions are requested
                val history = api.get(
                    "/party_membership_history",
                    fiso.token(),
                    "party_membership_id" to "eq.$membershipId",
                    "replaced_at" to "not.is.null",
                ).body<List<PartyMembershipHistoryResponse>>()
                history.shouldNotBeEmpty()
                history.forEach { it.replacedAt.shouldNotBeNull() }
                val historyRow = api.get("/party_membership_history/${history.first().id}", fiso.token())
                historyRow.status shouldBe HttpStatusCode.OK
                historyRow.body<PartyMembershipHistoryResponse>().partyMembershipId shouldBe membershipId

                api.delete("/party_membership/$membershipId", fiso.token()).status shouldBe HttpStatusCode.NoContent
                api.get("/party_membership/$membershipId", fiso.token()).status shouldBe HIDDEN_BY_RLS
            }
        }

        context("an entity that has not assumed a party") {
            // RLS: PTYM-ENT001
            test("sees its own party memberships, and no others") {
                val entity = seed { insertEntityActor() }
                val own = seed { insertPartyMembership(insertServiceProvider(), entity.entityId) }
                val others = seed { insertPartyMembership(insertServiceProvider(), insertPersonEntity()) }

                val visible = api.get("/party_membership", entity.token()).body<List<PartyMembershipResponse>>().map { it.id }

                visible shouldBe listOf(own)
                visible.contains(others) shouldBe false
            }

            // RLS: PTYM-ENT002
            test("sees the party memberships of the parties that it owns") {
                val entity = seed { insertEntityActor() }
                val owned = seed { insertParty(entity.entityId, "Owned", "service_provider", "flex_service_provider") }
                val member = seed { insertPersonEntity("Member of owned party") }
                val membership = seed { insertPartyMembership(owned, member) }

                val response = api.get("/party_membership/$membership", entity.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<PartyMembershipResponse>().id shouldBe membership
            }
        }

        // RLS: PTYM-ORG001
        // RLS: PTYM-ORG002
        context("an organisation with the scope to manage party memberships") {
            test("can read, create, update and delete the memberships of the parties it owns") {
                val org = seed { insertActor(TestPartyRole.ORG) }
                val owned = seed { insertParty(org.ownerEntityId!!, "Owned SP", "service_provider", "flex_service_provider") }
                val member = seed { insertPersonEntity("Member") }
                val membership = seed { insertPartyMembership(owned, member, listOf("read:auth")) }
                val token = org.token(ORG_ADMIN_SCOPE)

                api.get("/party_membership", token, "party_id" to "eq.$owned")
                    .body<List<PartyMembershipResponse>>().map { it.id } shouldBe listOf(membership)

                val updated = api.patch(
                    "/party_membership/$membership",
                    token,
                    PartyMembershipUpdateRequest(scopes = listOf(AuthScope.READ_DATA)),
                )
                updated.status shouldBe HttpStatusCode.OK

                api.delete("/party_membership/$membership", token).status shouldBe HttpStatusCode.NoContent

                // RLS: PTYM-ORG002 covers the history of memberships on such parties, also after deletion
                val history = api.get(
                    "/party_membership_history",
                    token,
                    "party_membership_id" to "eq.$membership",
                    "replaced_at" to "not.is.null",
                )
                history.status shouldBe HttpStatusCode.OK
                history.body<List<PartyMembershipHistoryResponse>>().shouldNotBeEmpty()

                val created = api.post(
                    "/party_membership",
                    token,
                    PartyMembershipCreateRequest(partyId = owned, entityId = member, scopes = listOf(AuthScope.READ_AUTH)),
                )
                created.status shouldBe HttpStatusCode.Created
            }

            test("cannot change the memberships of a party that another organisation owns") {
                val org = seed { insertActor(TestPartyRole.ORG) }
                val foreign = seed { insertServiceProvider("Foreign SP") }
                val membership = seed { insertPartyMembership(foreign, insertPersonEntity()) }
                val token = org.token(ORG_ADMIN_SCOPE)

                api.get("/party_membership/$membership", token).status shouldBe HIDDEN_BY_RLS
                api.patch(
                    "/party_membership/$membership",
                    token,
                    PartyMembershipUpdateRequest(scopes = listOf(AuthScope.READ_DATA)),
                ).status shouldBe HIDDEN_BY_RLS
                api.delete("/party_membership/$membership", token).status shouldBe HIDDEN_BY_RLS
            }
        }

        context("an organisation without the scope to manage party memberships") {
            test("can no longer update or delete the memberships it owns") {
                val org = seed { insertActor(TestPartyRole.ORG) }
                val owned = seed { insertParty(org.ownerEntityId!!, "Owned SP", "service_provider", "flex_service_provider") }
                val membership = seed { insertPartyMembership(owned, insertPersonEntity(), listOf("read:auth")) }
                val token = org.token("read:data")

                api.patch(
                    "/party_membership/$membership",
                    token,
                    PartyMembershipUpdateRequest(scopes = listOf(AuthScope.READ_DATA)),
                ).status shouldBe HttpStatusCode.Forbidden
                api.delete("/party_membership/$membership", token).status shouldBe HttpStatusCode.Forbidden
            }
        }

        context("a party of any role") {
            for (role in TestPartyRole.common) {
                // RLS: PTYM-COM001
                test("${role.type} can read the memberships of its own party") {
                    val actor = seed { insertActor(role) }
                    val otherMember = seed { insertPersonEntity("Other member") }
                    val membership = seed { insertPartyMembership(actor.partyId!!, otherMember) }

                    val visible = api.get("/party_membership", actor.token()).body<List<PartyMembershipResponse>>()

                    visible.map { it.id } shouldContain membership
                    visible.map { it.partyId }.toSet() shouldBe setOf(actor.partyId)
                }

                // RLS: PTYM-COM002
                test("${role.type} can read the archived revisions of the memberships of its own party") {
                    val actor = seed { insertActor(role) }
                    val membership = seed { insertPartyMembership(actor.partyId!!, insertPersonEntity()) }
                    // only an update or delete archives a revision, and the view lists the current membership too
                    seed { updatePartyMembershipScopes(membership, listOf("read:data")) }

                    val history = api.get(
                        "/party_membership_history",
                        actor.token(),
                        "party_membership_id" to "eq.$membership",
                        "replaced_at" to "not.is.null",
                    )

                    history.status shouldBe HttpStatusCode.OK
                    val revisions = history.body<List<PartyMembershipHistoryResponse>>()
                    revisions.shouldNotBeEmpty()
                    revisions.forEach { it.replacedAt.shouldNotBeNull() }
                }
            }

            for (role in TestPartyRole.withoutRla) {
                test("${role.type} sees only the membership of its own entity in its own party") {
                    val actor = seed { insertActor(role) }
                    seed { insertPartyMembership(insertServiceProvider(), insertPersonEntity()) }

                    val visible = api.get("/party_membership", actor.token()).body<List<PartyMembershipResponse>>()

                    visible.map { it.entityId } shouldContainExactlyInAnyOrder listOf(actor.entityId)
                }
            }
        }
    })
