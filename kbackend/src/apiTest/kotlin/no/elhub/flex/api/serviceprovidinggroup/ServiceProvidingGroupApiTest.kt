package no.elhub.flex.api.serviceprovidinggroup

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupBiddingZone
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupCreateRequest
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupStatus
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

private fun createRequest(serviceProvider: Long, name: String = "New SPG") = ServiceProvidingGroupCreateRequest(
    name = name,
    serviceProviderId = serviceProvider,
    biddingZone = ServiceProvidingGroupBiddingZone.NO3,
)

private fun updateRequest(name: String? = null, status: ServiceProvidingGroupStatus? = null) = JsonObject(
    buildMap {
        name?.let { put("name", JsonPrimitive(it)) }
        status?.let { put("status", JsonPrimitive(it.value)) }
    },
)

class ServiceProvidingGroupApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.service_providing_group",
                "flex.service_providing_group_history",
                "flex.accounting_point",
                "flex.product_type",
                "flex.party",
                "flex.entity",
            )
        }

        context("a FISO") {
            // RLS: SPG-FISO001
            test("can list the groups of all service providers") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val groups = seed { List(2) { insertServiceProvidingGroup(insertParty(TestPartyRole.SP)) } }

                val response = api.get("/service_providing_group", fiso.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProvidingGroupResponse>>().map { it.id } shouldContainExactlyInAnyOrder groups
            }

            test("can create a group for a service provider") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val sp = seed { insertParty(TestPartyRole.SP) }

                val response = api.post("/service_providing_group", fiso.token(), createRequest(sp))

                response.status shouldBe HttpStatusCode.Created
                response.body<ServiceProvidingGroupResponse>().serviceProviderId shouldBe sp
            }

            // SPG-VAL001
            test("can terminate a group and activate it again, when it has a member") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val group = seed(Triggers.OFF) {
                    val group = insertServiceProvidingGroup(insertParty(TestPartyRole.SP), status = ServiceProvidingGroupStatus.ACTIVE)
                    insertMembership(insertControllableUnit(insertAccountingPoint()), group)
                    group
                }

                api.patch("/service_providing_group/$group", fiso.token(), updateRequest(status = ServiceProvidingGroupStatus.TERMINATED))
                    .status shouldBe HttpStatusCode.OK
                api.patch("/service_providing_group/$group", fiso.token(), updateRequest(status = ServiceProvidingGroupStatus.ACTIVE))
                    .status shouldBe HttpStatusCode.OK
            }

            // RLS: SPG-COM001
            test("can read the archived revisions of the groups of all service providers") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val group = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP), "Before") }
                // the view of the history also lists the current rows, so an archived revision is needed
                seed { renameServiceProvidingGroup(group, "After") }

                val response = api.get("/service_providing_group_history", fiso.token(), "replaced_at" to "not.is.null")

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProvidingGroupHistoryResponse>>().map { it.name } shouldBe listOf("Before")
            }
        }

        context("a service provider") {
            // RLS: SPG-SP001
            test("sees its own groups, and no others") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val own = seed { insertServiceProvidingGroup(sp.partyId!!) }
                val other = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "Other SP")) }

                val list = api.get("/service_providing_group", sp.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProvidingGroupResponse>>().map { it.id } shouldBe listOf(own)
                api.get("/service_providing_group/$own", sp.token()).status shouldBe HttpStatusCode.OK
                api.get("/service_providing_group/$other", sp.token()).status shouldBe HIDDEN_BY_RLS
            }

            test("can create a group for itself, but not for another service provider") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val other = seed { insertParty(TestPartyRole.SP, "Other SP") }

                api.post("/service_providing_group", sp.token(), createRequest(sp.partyId!!)).status shouldBe HttpStatusCode.Created
                api.post("/service_providing_group", sp.token(), createRequest(other)).status shouldBe HttpStatusCode.Forbidden
            }

            test("can update its group, and not the group of another service provider") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val own = seed { insertServiceProvidingGroup(sp.partyId!!) }
                val other = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "Other SP")) }

                val updated = api.patch("/service_providing_group/$own", sp.token(), updateRequest(name = "Renamed"))
                updated.status shouldBe HttpStatusCode.OK
                updated.body<ServiceProvidingGroupResponse>().name shouldBe "Renamed"
                api.patch("/service_providing_group/$other", sp.token(), updateRequest(name = "Renamed by SP")).status shouldBe HIDDEN_BY_RLS
            }

            // SPG-VAL001
            test("can activate a group that has a member, and not one that is empty") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val empty = seed { insertServiceProvidingGroup(sp.partyId!!) }
                val withMember = seed(Triggers.OFF) {
                    val group = insertServiceProvidingGroup(sp.partyId!!)
                    insertMembership(insertControllableUnit(insertAccountingPoint()), group)
                    group
                }

                api.patch("/service_providing_group/$empty", sp.token(), updateRequest(status = ServiceProvidingGroupStatus.ACTIVE))
                    .status shouldBe HttpStatusCode.BadRequest
                api.patch("/service_providing_group/$withMember", sp.token(), updateRequest(status = ServiceProvidingGroupStatus.ACTIVE))
                    .status shouldBe HttpStatusCode.OK
            }

            test("can terminate its group, but not bring it back to activity") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val group = seed(Triggers.OFF) {
                    val group = insertServiceProvidingGroup(sp.partyId!!, status = ServiceProvidingGroupStatus.ACTIVE)
                    insertMembership(insertControllableUnit(insertAccountingPoint()), group)
                    group
                }

                api.patch("/service_providing_group/$group", sp.token(), updateRequest(status = ServiceProvidingGroupStatus.TERMINATED))
                    .status shouldBe HttpStatusCode.OK
                api.patch("/service_providing_group/$group", sp.token(), updateRequest(status = ServiceProvidingGroupStatus.ACTIVE))
                    .status shouldBe HttpStatusCode.BadRequest
            }

            // RLS: SPG-COM001
            test("sees the archived revisions of its groups, and not those of other groups") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val own = seed { insertServiceProvidingGroup(sp.partyId!!, "Own before") }
                val other = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "Other SP"), "Other before") }
                seed {
                    renameServiceProvidingGroup(own, "Own after")
                    renameServiceProvidingGroup(other, "Other after")
                }

                val history = api.get("/service_providing_group_history", sp.token(), "replaced_at" to "not.is.null")

                history.status shouldBe HttpStatusCode.OK
                history.body<List<ServiceProvidingGroupHistoryResponse>>().map { it.name } shouldBe listOf("Own before")
            }
        }

        context("a system operator") {
            // RLS: SPG-SO001
            test("sees a group with a grid prequalification for it, and no other group") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val prequalified = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP)) }
                val other = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "Other SP")) }
                seed { insertGridPrequalification(prequalified, so.partyId!!) }

                val list = api.get("/service_providing_group", so.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProvidingGroupResponse>>().map { it.id } shouldBe listOf(prequalified)
                api.get("/service_providing_group/$other", so.token()).status shouldBe HIDDEN_BY_RLS
            }

            // RLS: SPG-SO002
            test("sees a group with a product application for it, and no other group") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val applied = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP)) }
                val appliedToOther = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "Other SP")) }
                // the product applications are seeded with Triggers.OFF, which also skips the creation of grid prequalifications,
                // so only the policy on product applications gives access
                seed(Triggers.OFF) {
                    val productType = insertProductType()
                    insertServiceProvidingGroupProductApplication(applied, so.partyId!!, listOf(productType))
                    insertServiceProvidingGroupProductApplication(appliedToOther, insertParty(TestPartyRole.SO, "Other SO"), listOf(productType))
                }

                val list = api.get("/service_providing_group", so.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProvidingGroupResponse>>().map { it.id } shouldBe listOf(applied)
            }

            test("cannot create or update a group") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val group = seed { insertServiceProvidingGroup(sp).also { insertGridPrequalification(it, so.partyId!!) } }

                api.post("/service_providing_group", so.token(), createRequest(sp)).status shouldBe HttpStatusCode.Forbidden
                api.patch("/service_providing_group/$group", so.token(), updateRequest(name = "Renamed by SO")).status shouldBe
                    HttpStatusCode.Forbidden
            }

            // RLS: SPG-COM001
            test("sees the archived revisions of the groups it sees, and no others") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val visible = seed {
                    insertServiceProvidingGroup(insertParty(TestPartyRole.SP), "Visible before").also { insertGridPrequalification(it, so.partyId!!) }
                }
                val hidden = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "Other SP"), "Hidden before") }
                seed {
                    renameServiceProvidingGroup(visible, "Visible after")
                    renameServiceProvidingGroup(hidden, "Hidden after")
                }

                val history = api.get("/service_providing_group_history", so.token(), "replaced_at" to "not.is.null")

                history.status shouldBe HttpStatusCode.OK
                history.body<List<ServiceProvidingGroupHistoryResponse>>().map { it.name } shouldBe listOf("Visible before")
            }
        }

        // These roles have no grant on the groups, also not when they are related to a unit in one.
        for (role in TestPartyRole.rolesWithDataGrants - setOf(TestPartyRole.FISO, TestPartyRole.SO, TestPartyRole.SP)) {
            test("${role.type} cannot list the groups") {
                val actor = seed { insertActor(role) }

                api.get("/service_providing_group", actor.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the groups") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get("/service_providing_group", org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
