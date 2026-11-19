package no.elhub.flex.api.serviceprovidinggroupgridprequalification

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupGridPrequalificationCreateRequest
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupGridPrequalificationHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupGridPrequalificationResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupGridPrequalificationStatus
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationStatus
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.osloMidnight
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token
import java.time.Instant

private val jan1 = osloMidnight("2024-01-01")
private val jan2 = osloMidnight("2024-01-02")
private val jan1Morning = Instant.parse("2024-01-01T08:00:00Z")

private fun createRequest(group: Long, impactedSystemOperator: Long) =
    ServiceProvidingGroupGridPrequalificationCreateRequest(serviceProvidingGroupId = group, impactedSystemOperatorId = impactedSystemOperator)

private fun updateRequest(status: ServiceProvidingGroupGridPrequalificationStatus, prequalifiedAt: Instant? = null, clearTimestamp: Boolean = false) =
    JsonObject(
        buildMap {
            put("status", JsonPrimitive(status.value))
            prequalifiedAt?.let { put("prequalified_at", JsonPrimitive(it.toString())) }
            if (clearTimestamp) put("prequalified_at", JsonNull)
        },
    )

private fun SeedScope.insertGroup(name: String = "Test SPG") = insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "SP of $name"), name)

class ServiceProvidingGroupGridPrequalificationApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.service_providing_group",
                "flex.service_providing_group_grid_prequalification_history",
                "flex.accounting_point",
                "flex.metering_grid_area",
                "flex.product_type",
                "flex.party",
                "flex.entity",
            )
        }

        context("a FISO") {
            // RLS: SPGGP-FISO001
            test("can list the grid prequalifications of all groups") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val prequalifications = seed { List(2) { insertGridPrequalification(insertGroup(), insertParty(TestPartyRole.SO, "ISO $it")) } }

                val response = api.get("/service_providing_group_grid_prequalification", fiso.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProvidingGroupGridPrequalificationResponse>>().map { it.id } shouldContainExactlyInAnyOrder prequalifications
            }

            test("can create a grid prequalification, with the status requested") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val group = seed { insertGroup() }
                val iso = seed { insertParty(TestPartyRole.SO) }

                val response = api.post("/service_providing_group_grid_prequalification", fiso.token(), createRequest(group, iso))

                response.status shouldBe HttpStatusCode.Created
                response.body<ServiceProvidingGroupGridPrequalificationResponse>().status shouldBe ServiceProvidingGroupGridPrequalificationStatus.REQUESTED
            }

            test("can move the status on, but not back to requested") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val prequalification = seed { insertGridPrequalification(insertGroup(), insertParty(TestPartyRole.SO)) }
                val path = "/service_providing_group_grid_prequalification/$prequalification"

                api.patch(path, fiso.token(), updateRequest(ServiceProvidingGroupGridPrequalificationStatus.IN_PROGRESS)).status shouldBe HttpStatusCode.OK
                api.patch(path, fiso.token(), updateRequest(ServiceProvidingGroupGridPrequalificationStatus.REQUESTED)).status shouldBe
                    HttpStatusCode.BadRequest
            }

            // SPGGP-VAL001
            test("cannot approve a grid prequalification without the time of the prequalification") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val prequalification = seed { insertGridPrequalification(insertGroup(), insertParty(TestPartyRole.SO)) }
                val path = "/service_providing_group_grid_prequalification/$prequalification"

                api.patch(path, fiso.token(), updateRequest(ServiceProvidingGroupGridPrequalificationStatus.APPROVED)).status shouldBe
                    HttpStatusCode.BadRequest
                api.patch(path, fiso.token(), updateRequest(ServiceProvidingGroupGridPrequalificationStatus.CONDITIONALLY_APPROVED)).status shouldBe
                    HttpStatusCode.BadRequest
                api.patch(path, fiso.token(), updateRequest(ServiceProvidingGroupGridPrequalificationStatus.APPROVED, jan1Morning)).status shouldBe
                    HttpStatusCode.OK
            }

            // SPGGP-VAL002
            test("cannot reject a grid prequalification that has the time of a prequalification, unless it is cleared") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val prequalification = seed { insertGridPrequalification(insertGroup(), insertParty(TestPartyRole.SO)) }
                val path = "/service_providing_group_grid_prequalification/$prequalification"
                api.patch(path, fiso.token(), updateRequest(ServiceProvidingGroupGridPrequalificationStatus.APPROVED, jan1Morning)).status shouldBe
                    HttpStatusCode.OK

                api.patch(path, fiso.token(), updateRequest(ServiceProvidingGroupGridPrequalificationStatus.NOT_APPROVED)).status shouldBe
                    HttpStatusCode.BadRequest
                api.patch(path, fiso.token(), updateRequest(ServiceProvidingGroupGridPrequalificationStatus.NOT_APPROVED, clearTimestamp = true)).status shouldBe
                    HttpStatusCode.OK
            }
        }

        context("a service provider") {
            // RLS: SPGGP-SP001
            test("sees the grid prequalifications of its groups, and no others") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val iso = seed { insertParty(TestPartyRole.SO) }
                val own = seed { insertGridPrequalification(insertServiceProvidingGroup(sp.partyId!!), iso) }
                val other = seed { insertGridPrequalification(insertGroup("Other SPG"), iso) }

                val list = api.get("/service_providing_group_grid_prequalification", sp.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProvidingGroupGridPrequalificationResponse>>().map { it.id } shouldBe listOf(own)
                api.get("/service_providing_group_grid_prequalification/$other", sp.token()).status shouldBe HIDDEN_BY_RLS
            }

            test("cannot create or update a grid prequalification") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val iso = seed { insertParty(TestPartyRole.SO) }
                val group = seed { insertServiceProvidingGroup(sp.partyId!!) }
                val prequalification = seed { insertGridPrequalification(group, iso) }

                api.post("/service_providing_group_grid_prequalification", sp.token(), createRequest(group, iso)).status shouldBe
                    HttpStatusCode.Forbidden
                api.patch(
                    "/service_providing_group_grid_prequalification/$prequalification",
                    sp.token(),
                    updateRequest(ServiceProvidingGroupGridPrequalificationStatus.IN_PROGRESS),
                ).status shouldBe HttpStatusCode.Forbidden
            }
        }

        context("a system operator") {
            // RLS: SPGGP-SO001
            test("sees the grid prequalifications where it is the impacted system operator, and no others") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val own = seed { insertGridPrequalification(insertGroup(), so.partyId!!) }
                val other = seed { insertGridPrequalification(insertGroup("Other SPG"), insertParty(TestPartyRole.SO, "Other ISO")) }

                val list = api.get("/service_providing_group_grid_prequalification", so.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProvidingGroupGridPrequalificationResponse>>().map { it.id } shouldBe listOf(own)
                api.get("/service_providing_group_grid_prequalification/$other", so.token()).status shouldBe HIDDEN_BY_RLS
            }

            // RLS: SPGGP-SO002
            test("also sees the grid prequalifications of other impacted system operators on the same group") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val group = seed { insertGroup() }
                val own = seed { insertGridPrequalification(group, so.partyId!!) }
                val sameGroup = seed { insertGridPrequalification(group, insertParty(TestPartyRole.SO, "Other ISO")) }
                val otherGroup = seed { insertGridPrequalification(insertGroup("Other SPG"), insertParty(TestPartyRole.SO, "Third ISO")) }

                val list = api.get("/service_providing_group_grid_prequalification", so.token())
                list.body<List<ServiceProvidingGroupGridPrequalificationResponse>>().map { it.id } shouldContainExactlyInAnyOrder listOf(own, sameGroup)
                api.get("/service_providing_group_grid_prequalification/$otherGroup", so.token()).status shouldBe HIDDEN_BY_RLS
            }

            // RLS: SPGGP-SO003
            // The product application is seeded with Triggers.OFF, so no grid prequalification is created for the PSO until the sync runs.
            test("sees the grid prequalifications of a group that it is the procuring system operator of") {
                val pso = seed { insertActor(TestPartyRole.SO) }
                val group = seed { insertGroup() }
                val prequalification = seed { insertGridPrequalification(group, insertParty(TestPartyRole.SO, "ISO")) }
                val otherGroup = seed { insertGroup("Other SPG") }
                seed { insertGridPrequalification(otherGroup, insertParty(TestPartyRole.SO, "Other ISO")) }
                seed(Triggers.OFF) {
                    val productType = insertProductType()
                    insertServiceProvidingGroupProductApplication(group, pso.partyId!!, listOf(productType))
                    insertServiceProvidingGroupProductApplication(otherGroup, insertParty(TestPartyRole.SO, "Other PSO"), listOf(productType))
                }

                val list = api.get("/service_providing_group_grid_prequalification", pso.token())

                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProvidingGroupGridPrequalificationResponse>>().map { it.id } shouldBe listOf(prequalification)
            }

            // RLS: SPGGP-SO001
            test("can update the grid prequalification where it is the impacted system operator, and not the others") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val group = seed { insertGroup() }
                val own = seed { insertGridPrequalification(group, so.partyId!!) }
                val sameGroup = seed { insertGridPrequalification(group, insertParty(TestPartyRole.SO, "Other ISO")) }
                val update = updateRequest(ServiceProvidingGroupGridPrequalificationStatus.IN_PROGRESS, jan1Morning)

                api.patch("/service_providing_group_grid_prequalification/$own", so.token(), update).status shouldBe HttpStatusCode.OK
                api.patch("/service_providing_group_grid_prequalification/$sameGroup", so.token(), update).status shouldBe HIDDEN_BY_RLS
            }

            test("cannot create a grid prequalification") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val group = seed { insertGroup() }

                api.post("/service_providing_group_grid_prequalification", so.token(), createRequest(group, so.partyId!!)).status shouldBe
                    HttpStatusCode.Forbidden
            }
        }

        // RLS: SPGGP-COM001
        // The archived revisions of a grid prequalification can be read by the parties that can read the grid prequalification.
        context("the archived revisions of a grid prequalification") {
            test("are read by the service provider of the group, and the impacted system operator, and not by others") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val iso = seed { insertActor(TestPartyRole.SO, "ISO") }
                val otherIso = seed { insertActor(TestPartyRole.SO, "Other ISO") }
                val otherSp = seed { insertActor(TestPartyRole.SP, "Other SP") }
                val prequalification = seed { insertGridPrequalification(insertServiceProvidingGroup(sp.partyId!!), iso.partyId!!) }
                // the outsiders can read a grid prequalification of their own, which is not enough to read the revisions of this one
                seed {
                    insertGridPrequalification(insertGroup("Other SPG"), otherIso.partyId!!)
                    insertGridPrequalification(insertServiceProvidingGroup(otherSp.partyId!!), insertParty(TestPartyRole.SO, "Third ISO"))
                }
                seed { changeGridPrequalificationStatus(prequalification, ServiceProvidingGroupGridPrequalificationStatus.IN_PROGRESS) }

                for (reader in listOf(sp, iso)) {
                    val history = api.get("/service_providing_group_grid_prequalification_history", reader.token(), "replaced_at" to "not.is.null")
                    history.body<List<ServiceProvidingGroupGridPrequalificationHistoryResponse>>().map { it.serviceProvidingGroupGridPrequalificationId } shouldBe
                        listOf(prequalification)
                }
                for (outsider in listOf(otherIso, otherSp)) {
                    val history = api.get("/service_providing_group_grid_prequalification_history", outsider.token(), "replaced_at" to "not.is.null")
                    history.body<List<ServiceProvidingGroupGridPrequalificationHistoryResponse>>() shouldBe emptyList()
                }
            }

            test("are read by a FISO") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val prequalification = seed { insertGridPrequalification(insertGroup(), insertParty(TestPartyRole.SO)) }
                seed { changeGridPrequalificationStatus(prequalification, ServiceProvidingGroupGridPrequalificationStatus.IN_PROGRESS) }

                val history = api.get("/service_providing_group_grid_prequalification_history", fiso.token(), "replaced_at" to "not.is.null")

                history.status shouldBe HttpStatusCode.OK
                history.body<List<ServiceProvidingGroupGridPrequalificationHistoryResponse>>().map { it.serviceProvidingGroupGridPrequalificationId } shouldBe
                    listOf(prequalification)
            }
        }

        // The grid prequalifications follow the product applications and the memberships of the group, through a job that
        // the tests run by hand. The group has a unit in the area of the ISO, and a product application for another PSO.
        context("the job that syncs the grid prequalifications") {
            test("creates a grid prequalification for the CSO of a unit in the group and for the PSO, once a product application is processed") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val iso = seed { insertParty(TestPartyRole.SO, "ISO") }
                val pso = seed { insertParty(TestPartyRole.SO, "PSO") }
                val group = seed { insertGroup() }
                seed(Triggers.OFF) {
                    insertMembership(insertControllableUnit(insertAccountingPointOwnedBy(iso)), group)
                    insertServiceProvidingGroupProductApplication(
                        group,
                        pso,
                        listOf(insertProductType()),
                        ServiceProvidingGroupProductApplicationStatus.PREQUALIFICATION,
                    )
                }

                seed { syncGridPrequalifications() }

                val list = api.get("/service_providing_group_grid_prequalification", fiso.token())
                list.body<List<ServiceProvidingGroupGridPrequalificationResponse>>().map { it.impactedSystemOperatorId } shouldContainExactlyInAnyOrder
                    listOf(iso, pso)
            }

            test("does not create a grid prequalification while the product application is only requested") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val group = seed { insertGroup() }
                seed(Triggers.OFF) {
                    insertMembership(insertControllableUnit(insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO, "ISO"))), group)
                    insertServiceProvidingGroupProductApplication(group, insertParty(TestPartyRole.SO, "PSO"), listOf(insertProductType()))
                }

                seed { syncGridPrequalifications() }

                api.get("/service_providing_group_grid_prequalification", fiso.token()).body<List<ServiceProvidingGroupGridPrequalificationResponse>>() shouldBe
                    emptyList()
            }

            // When the last unit of the ISO leaves the group, the grid prequalification is made inactive. It is reactivated, with the
            // same id, when a unit of the ISO comes back. A unit leaves either when the membership is deleted or when it ends.
            for (removal in listOf("is deleted", "has ended")) {
                test("makes the grid prequalification of the ISO inactive when the last membership $removal, and reactivates it") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }
                    val iso = seed { insertParty(TestPartyRole.SO, "ISO") }
                    val group = seed { insertGroup() }
                    val membership = seed(Triggers.OFF) {
                        insertServiceProvidingGroupProductApplication(
                            group,
                            insertParty(TestPartyRole.SO, "PSO"),
                            listOf(insertProductType()),
                            ServiceProvidingGroupProductApplicationStatus.PREQUALIFICATION,
                        )
                        insertMembership(insertControllableUnit(insertAccountingPointOwnedBy(iso)), group, validFrom = jan1)
                    }
                    seed { syncGridPrequalifications() }
                    val prequalification = api.get("/service_providing_group_grid_prequalification", fiso.token(), "impacted_system_operator_id" to "eq.$iso")
                        .body<List<ServiceProvidingGroupGridPrequalificationResponse>>().single()
                    prequalification.status shouldBe ServiceProvidingGroupGridPrequalificationStatus.REQUESTED

                    if (removal == "is deleted") {
                        seed { deleteMembership(membership) }
                    } else {
                        // the triggers would check the bidding zone of the unit, which this test does not seed
                        seed(Triggers.OFF) { endMembership(membership, jan2) }
                    }
                    seed { syncGridPrequalifications() }
                    api.get("/service_providing_group_grid_prequalification/${prequalification.id}", fiso.token())
                        .body<ServiceProvidingGroupGridPrequalificationResponse>().status shouldBe ServiceProvidingGroupGridPrequalificationStatus.INACTIVE

                    seed(Triggers.OFF) { insertMembership(insertControllableUnit(insertAccountingPointOwnedBy(iso)), group) }
                    seed { syncGridPrequalifications() }
                    val reactivated = api.get("/service_providing_group_grid_prequalification", fiso.token(), "impacted_system_operator_id" to "eq.$iso")
                        .body<List<ServiceProvidingGroupGridPrequalificationResponse>>()
                    reactivated.map { it.id to it.status } shouldBe listOf(prequalification.id to ServiceProvidingGroupGridPrequalificationStatus.REQUESTED)
                }
            }
        }

        // These roles have no grant on the grid prequalifications.
        for (role in TestPartyRole.rolesWithDataGrants - setOf(TestPartyRole.FISO, TestPartyRole.SO, TestPartyRole.SP)) {
            test("${role.type} cannot list the grid prequalifications") {
                val actor = seed { insertActor(role) }

                api.get("/service_providing_group_grid_prequalification", actor.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the grid prequalifications") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get("/service_providing_group_grid_prequalification", org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
