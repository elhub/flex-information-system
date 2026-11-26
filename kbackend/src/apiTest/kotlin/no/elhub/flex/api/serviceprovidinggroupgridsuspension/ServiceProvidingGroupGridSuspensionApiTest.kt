package no.elhub.flex.api.serviceprovidinggroupgridsuspension

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupGridSuspensionCreateRequest
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupGridSuspensionHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupGridSuspensionReason
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupGridSuspensionResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupGridSuspensionUpdateRequest
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

private fun createRequest(group: Long, impactedSystemOperator: Long) = ServiceProvidingGroupGridSuspensionCreateRequest(
    serviceProvidingGroupId = group,
    impactedSystemOperatorId = impactedSystemOperator,
    reason = ServiceProvidingGroupGridSuspensionReason.OTHER,
)

private fun updateRequest(reason: ServiceProvidingGroupGridSuspensionReason) = ServiceProvidingGroupGridSuspensionUpdateRequest(reason = reason)

/** A group of a new service provider, which the system operator [iso] has approved. */
private fun SeedScope.insertGroupApprovedBy(iso: Long, name: String = "Test SPG"): Long =
    insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "SP of $name"), name).also { insertApprovedGridPrequalification(it, iso) }

class ServiceProvidingGroupGridSuspensionApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.service_providing_group",
                "flex.service_providing_group_grid_suspension_history",
                "flex.product_type",
                "flex.party",
                "flex.entity",
            )
        }

        context("a FISO") {
            // RLS: SPGGS-FISO001
            test("can list the grid suspensions of all groups") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val suspensions = seed {
                    List(2) {
                        val iso = insertParty(TestPartyRole.SO, "ISO $it")
                        insertGridSuspension(insertGroupApprovedBy(iso, "SPG $it"), iso)
                    }
                }

                val response = api.get("/service_providing_group_grid_suspension", fiso.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProvidingGroupGridSuspensionResponse>>().map { it.id } shouldContainExactlyInAnyOrder suspensions
            }

            test("can create, update and delete a grid suspension for an impacted system operator") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val iso = seed { insertParty(TestPartyRole.SO) }
                val group = seed { insertGroupApprovedBy(iso) }

                val created = api.post("/service_providing_group_grid_suspension", fiso.token(), createRequest(group, iso))
                created.status shouldBe HttpStatusCode.Created
                val id = created.body<ServiceProvidingGroupGridSuspensionResponse>().id

                val updated = api.patch(
                    "/service_providing_group_grid_suspension/$id",
                    fiso.token(),
                    updateRequest(ServiceProvidingGroupGridSuspensionReason.BREACH_OF_CONDITIONS),
                )
                updated.status shouldBe HttpStatusCode.OK
                updated.body<ServiceProvidingGroupGridSuspensionResponse>().reason shouldBe ServiceProvidingGroupGridSuspensionReason.BREACH_OF_CONDITIONS

                api.delete("/service_providing_group_grid_suspension/$id", fiso.token()).status shouldBe HttpStatusCode.NoContent
            }

            // SPGGS-VAL001
            test("cannot create a grid suspension for a system operator that has not approved the group") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val iso = seed { insertParty(TestPartyRole.SO) }
                val group = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP)).also { insertGridPrequalification(it, iso) } }

                api.post("/service_providing_group_grid_suspension", fiso.token(), createRequest(group, iso)).status shouldBe HttpStatusCode.BadRequest
            }

            // RLS: SPGGS-FISO002
            test("can read the archived revisions of the grid suspensions of all groups") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val iso = seed { insertParty(TestPartyRole.SO) }
                val suspension = seed { insertGridSuspension(insertGroupApprovedBy(iso), iso, "other") }
                // the view of the history also lists the current rows, so an archived revision is needed
                seed { changeGridSuspensionReason(suspension, "breach_of_conditions") }

                val response = api.get("/service_providing_group_grid_suspension_history", fiso.token(), "replaced_at" to "not.is.null")

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProvidingGroupGridSuspensionHistoryResponse>>().map { it.reason } shouldBe
                    listOf(ServiceProvidingGroupGridSuspensionReason.OTHER)
            }
        }

        // RLS: SPGGS-SP001
        // RLS: SPGGS-SP002
        context("a service provider") {
            test("sees the grid suspensions of its groups and their archived revisions, and no others") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val iso = seed { insertParty(TestPartyRole.SO) }
                val ownGroup = seed { insertServiceProvidingGroup(sp.partyId!!).also { insertApprovedGridPrequalification(it, iso) } }
                val own = seed { insertGridSuspension(ownGroup, iso, "other") }
                val other = seed { insertGridSuspension(insertGroupApprovedBy(iso, "Other SPG"), iso, "other") }
                seed {
                    changeGridSuspensionReason(own, "breach_of_conditions")
                    changeGridSuspensionReason(other, "breach_of_conditions")
                }

                val list = api.get("/service_providing_group_grid_suspension", sp.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProvidingGroupGridSuspensionResponse>>().map { it.id } shouldBe listOf(own)
                api.get("/service_providing_group_grid_suspension/$other", sp.token()).status shouldBe HIDDEN_BY_RLS

                val history = api.get("/service_providing_group_grid_suspension_history", sp.token(), "replaced_at" to "not.is.null")
                history.body<List<ServiceProvidingGroupGridSuspensionHistoryResponse>>().map { it.serviceProvidingGroupGridSuspensionId } shouldBe listOf(own)
            }

            test("still sees the archived revisions of a grid suspension that has been deleted") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val iso = seed { insertParty(TestPartyRole.SO) }
                val ownGroup = seed { insertServiceProvidingGroup(sp.partyId!!).also { insertApprovedGridPrequalification(it, iso) } }
                val suspension = seed { insertGridSuspension(ownGroup, iso) }
                seed { deleteGridSuspension(suspension) }

                val history = api.get("/service_providing_group_grid_suspension_history", sp.token(), "replaced_at" to "not.is.null")

                history.body<List<ServiceProvidingGroupGridSuspensionHistoryResponse>>().map { it.serviceProvidingGroupGridSuspensionId } shouldBe listOf(suspension)
            }

            test("cannot create, update or delete a grid suspension") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val iso = seed { insertParty(TestPartyRole.SO) }
                val group = seed { insertServiceProvidingGroup(sp.partyId!!).also { insertApprovedGridPrequalification(it, iso) } }
                val suspension = seed { insertGridSuspension(group, iso) }

                api.post("/service_providing_group_grid_suspension", sp.token(), createRequest(group, iso)).status shouldBe HttpStatusCode.Forbidden
                api.patch(
                    "/service_providing_group_grid_suspension/$suspension",
                    sp.token(),
                    updateRequest(ServiceProvidingGroupGridSuspensionReason.BREACH_OF_CONDITIONS),
                ).status shouldBe HttpStatusCode.Forbidden
                api.delete("/service_providing_group_grid_suspension/$suspension", sp.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // RLS: SPGGS-SO001
        // RLS: SPGGS-SO002
        context("a system operator that is the impacted system operator") {
            test("can create, read, update and delete its grid suspension") {
                val iso = seed { insertActor(TestPartyRole.SO) }
                val group = seed { insertGroupApprovedBy(iso.partyId!!) }

                val created = api.post("/service_providing_group_grid_suspension", iso.token(), createRequest(group, iso.partyId!!))
                created.status shouldBe HttpStatusCode.Created
                val id = created.body<ServiceProvidingGroupGridSuspensionResponse>().id

                api.get("/service_providing_group_grid_suspension/$id", iso.token()).status shouldBe HttpStatusCode.OK
                api.patch(
                    "/service_providing_group_grid_suspension/$id",
                    iso.token(),
                    updateRequest(ServiceProvidingGroupGridSuspensionReason.SIGNIFICANT_GROUP_CHANGE),
                ).status shouldBe HttpStatusCode.OK
                api.delete("/service_providing_group_grid_suspension/$id", iso.token()).status shouldBe HttpStatusCode.NoContent
            }

            test("cannot create a grid suspension for another system operator") {
                val iso = seed { insertActor(TestPartyRole.SO) }
                val other = seed { insertParty(TestPartyRole.SO, "Other ISO") }
                val group = seed { insertGroupApprovedBy(other) }

                api.post("/service_providing_group_grid_suspension", iso.token(), createRequest(group, other)).status shouldBe HttpStatusCode.Forbidden
            }

            // SPGGS-VAL002
            test("cannot create a second grid suspension of the same group") {
                val iso = seed { insertActor(TestPartyRole.SO) }
                val group = seed { insertGroupApprovedBy(iso.partyId!!) }
                seed { insertGridSuspension(group, iso.partyId!!) }

                api.post("/service_providing_group_grid_suspension", iso.token(), createRequest(group, iso.partyId!!)).status shouldBe
                    HttpStatusCode.Conflict
            }

            test("sees the archived revisions of its grid suspensions") {
                val iso = seed { insertActor(TestPartyRole.SO) }
                val suspension = seed { insertGridSuspension(insertGroupApprovedBy(iso.partyId!!), iso.partyId!!, "other") }
                seed { changeGridSuspensionReason(suspension, "breach_of_conditions") }

                val history = api.get("/service_providing_group_grid_suspension_history", iso.token(), "replaced_at" to "not.is.null")

                history.status shouldBe HttpStatusCode.OK
                history.body<List<ServiceProvidingGroupGridSuspensionHistoryResponse>>().map { it.serviceProvidingGroupGridSuspensionId } shouldBe listOf(suspension)
            }
        }

        // RLS: SPGGS-SO003
        // RLS: SPGGS-SO004
        // A system operator sees the grid suspensions of the groups it sees, which it does when it has a grid prequalification
        // for the group (here as an ISO) or a product application (as a PSO), also when the suspension is by another system operator.
        context("a system operator that sees the group") {
            test("as an ISO sees the grid suspension of another system operator, and its revisions, and no others") {
                val iso = seed { insertActor(TestPartyRole.SO) }
                val suspender = seed { insertParty(TestPartyRole.SO, "Suspending ISO") }
                val visibleGroup = seed { insertGroupApprovedBy(suspender) }
                seed { insertGridPrequalification(visibleGroup, iso.partyId!!) }
                val hiddenGroup = seed { insertGroupApprovedBy(suspender, "Hidden SPG") }
                val visible = seed { insertGridSuspension(visibleGroup, suspender, "other") }
                val hidden = seed { insertGridSuspension(hiddenGroup, suspender, "other") }
                seed {
                    changeGridSuspensionReason(visible, "breach_of_conditions")
                    changeGridSuspensionReason(hidden, "breach_of_conditions")
                }

                val list = api.get("/service_providing_group_grid_suspension", iso.token())
                list.body<List<ServiceProvidingGroupGridSuspensionResponse>>().map { it.id } shouldBe listOf(visible)
                api.get("/service_providing_group_grid_suspension/$hidden", iso.token()).status shouldBe HIDDEN_BY_RLS
                val history = api.get("/service_providing_group_grid_suspension_history", iso.token(), "replaced_at" to "not.is.null")
                history.body<List<ServiceProvidingGroupGridSuspensionHistoryResponse>>().map { it.serviceProvidingGroupGridSuspensionId } shouldBe
                    listOf(visible)
            }

            test("as a PSO sees the grid suspension of a system operator, and its revisions, and no others") {
                val pso = seed { insertActor(TestPartyRole.SO) }
                val suspender = seed { insertParty(TestPartyRole.SO, "Suspending ISO") }
                val visibleGroup = seed { insertGroupApprovedBy(suspender) }
                val hiddenGroup = seed { insertGroupApprovedBy(suspender, "Hidden SPG") }
                // the product application is seeded with Triggers.OFF, which does not make the PSO an ISO of the group
                seed(Triggers.OFF) { insertServiceProvidingGroupProductApplication(visibleGroup, pso.partyId!!, listOf(insertProductType())) }
                val visible = seed { insertGridSuspension(visibleGroup, suspender, "other") }
                seed { insertGridSuspension(hiddenGroup, suspender, "other") }
                seed { changeGridSuspensionReason(visible, "breach_of_conditions") }

                val list = api.get("/service_providing_group_grid_suspension", pso.token())
                list.body<List<ServiceProvidingGroupGridSuspensionResponse>>().map { it.id } shouldBe listOf(visible)
                val history = api.get("/service_providing_group_grid_suspension_history", pso.token(), "replaced_at" to "not.is.null")
                history.body<List<ServiceProvidingGroupGridSuspensionHistoryResponse>>().map { it.serviceProvidingGroupGridSuspensionId } shouldBe
                    listOf(visible)
            }

            test("cannot update or delete the grid suspension of another system operator") {
                val iso = seed { insertActor(TestPartyRole.SO) }
                val suspender = seed { insertParty(TestPartyRole.SO, "Suspending ISO") }
                val group = seed { insertGroupApprovedBy(suspender) }
                seed { insertGridPrequalification(group, iso.partyId!!) }
                val suspension = seed { insertGridSuspension(group, suspender) }

                api.patch(
                    "/service_providing_group_grid_suspension/$suspension",
                    iso.token(),
                    updateRequest(ServiceProvidingGroupGridSuspensionReason.BREACH_OF_CONDITIONS),
                ).status shouldBe HIDDEN_BY_RLS
                api.delete("/service_providing_group_grid_suspension/$suspension", iso.token()).status shouldBe HIDDEN_BY_RLS
            }
        }

        // These roles have no grant on the grid suspensions.
        for (role in TestPartyRole.rolesWithDataGrants - setOf(TestPartyRole.FISO, TestPartyRole.SO, TestPartyRole.SP)) {
            test("${role.type} cannot list the grid suspensions") {
                val actor = seed { insertActor(role) }

                api.get("/service_providing_group_grid_suspension", actor.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the grid suspensions") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get("/service_providing_group_grid_suspension", org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
