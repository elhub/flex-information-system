package no.elhub.flex.api.serviceprovidinggroupmembership

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupBiddingZone
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupMembershipCreateRequest
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupMembershipHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupMembershipResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupMembershipUpdateRequest
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.osloMidnight
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token
import java.time.Instant
import kotlin.time.toKotlinInstant

private val jan1 = osloMidnight("2024-01-01")
private val jan7 = osloMidnight("2024-01-07")
private val jan8 = osloMidnight("2024-01-08")
private val jan9 = osloMidnight("2024-01-09")
private val jan11 = osloMidnight("2024-01-11")
private val jan12 = osloMidnight("2024-01-12")
private val jan13 = osloMidnight("2024-01-13")
private val jul1 = osloMidnight("2024-07-01")

private fun createRequest(unit: Long, group: Long, validFrom: Instant = jan1, validTo: Instant? = null) =
    ServiceProvidingGroupMembershipCreateRequest(
        controllableUnitId = unit,
        serviceProvidingGroupId = group,
        validFrom = validFrom.toKotlinInstant(),
        validTo = validTo?.toKotlinInstant(),
    )

class ServiceProvidingGroupMembershipApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.service_providing_group",
                "flex.service_providing_group_membership_history",
                "flex.accounting_point",
                "flex.metering_grid_area",
                "flex.party",
                "flex.entity",
            )
        }

        context("a FISO") {
            // RLS: SPGM-FISO001
            test("can list the memberships of all groups") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                // the memberships only need to exist, so the triggers that validate the unit are off
                val memberships = seed(Triggers.OFF) {
                    List(2) {
                        insertMembership(insertControllableUnit(insertAccountingPoint()), insertServiceProvidingGroup(insertParty(TestPartyRole.SP)))
                    }
                }

                val response = api.get("/service_providing_group_membership", fiso.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProvidingGroupMembershipResponse>>().map { it.id } shouldContainExactlyInAnyOrder memberships
            }

            test("can add a unit to a group, change the membership and remove it") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val unit = seed { insertControllableUnitWithContract(sp).also { activateControllableUnit(it.id) } }
                val group = seed { insertServiceProvidingGroup(sp) }

                val created = api.post("/service_providing_group_membership", fiso.token(), createRequest(unit.id, group))
                created.status shouldBe HttpStatusCode.Created
                val id = created.body<ServiceProvidingGroupMembershipResponse>().id

                val updated = api.patch(
                    "/service_providing_group_membership/$id",
                    fiso.token(),
                    ServiceProvidingGroupMembershipUpdateRequest(validTo = jul1.toKotlinInstant()),
                )
                updated.status shouldBe HttpStatusCode.OK
                updated.body<ServiceProvidingGroupMembershipResponse>().validTo shouldBe jul1.toKotlinInstant()

                api.delete("/service_providing_group_membership/$id", fiso.token()).status shouldBe HttpStatusCode.NoContent
            }

            // RLS: SPGM-FISO002
            test("can read the archived revisions of the memberships of all groups") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val membership = seed(Triggers.OFF) {
                    insertMembership(insertControllableUnit(insertAccountingPoint()), insertServiceProvidingGroup(insertParty(TestPartyRole.SP)))
                }
                // deleting the membership moves it to the history
                seed { deleteMembership(membership) }

                val response = api.get("/service_providing_group_membership_history", fiso.token(), "replaced_at" to "not.is.null")

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProvidingGroupMembershipHistoryResponse>>().map { it.serviceProvidingGroupMembershipId } shouldBe
                    listOf(membership)
            }

            // SPGM-VAL001
            // The contract of the service provider on the unit lasts from 2024-01-08 to 2024-01-12.
            test("cannot add a unit to a group for a period that its service provider does not manage the unit") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val unit = seed { insertControllableUnitWithContract(sp, contractFrom = jan8, contractTo = jan12).also { activateControllableUnit(it.id) } }
                val group = seed { insertServiceProvidingGroup(sp) }

                val startsBeforeContract = createRequest(unit.id, group, validFrom = jan7, validTo = jan11)
                val endsAfterContract = createRequest(unit.id, group, validFrom = jan9, validTo = jan13)
                val withinContract = createRequest(unit.id, group, validFrom = jan9, validTo = jan11)
                api.post("/service_providing_group_membership", fiso.token(), startsBeforeContract).status shouldBe HttpStatusCode.BadRequest
                api.post("/service_providing_group_membership", fiso.token(), endsAfterContract).status shouldBe HttpStatusCode.BadRequest
                api.post("/service_providing_group_membership", fiso.token(), withinContract).status shouldBe HttpStatusCode.Created
            }

            // SPGM-VAL002
            test("cannot add a unit to a group in another bidding zone") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val unit = seed { insertControllableUnitWithContract(sp, priceArea = "NO1").also { activateControllableUnit(it.id) } }
                val group = seed { insertServiceProvidingGroup(sp, biddingZone = ServiceProvidingGroupBiddingZone.NO3) }

                api.post("/service_providing_group_membership", fiso.token(), createRequest(unit.id, group)).status shouldBe
                    HttpStatusCode.BadRequest
            }

            // SPGM-VAL003
            test("cannot add a unit whose maximum active power exceeds that of its technical resources") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val sp = seed { insertParty(TestPartyRole.SP) }
                // the unit has the maximum active power 1.0 kW, and its technical resource 0.5 kW
                val unit = seed { insertControllableUnitWithContract(sp).also { activateControllableUnit(it.id, technicalResourcePower = 0.5) } }
                val group = seed { insertServiceProvidingGroup(sp) }

                api.post("/service_providing_group_membership", fiso.token(), createRequest(unit.id, group)).status shouldBe
                    HttpStatusCode.BadRequest
            }

            // SPGM-VAL004
            test("cannot add a unit that is not active") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val unit = seed { insertControllableUnitWithContract(sp) }
                val group = seed { insertServiceProvidingGroup(sp) }

                api.post("/service_providing_group_membership", fiso.token(), createRequest(unit.id, group)).status shouldBe
                    HttpStatusCode.BadRequest
            }
        }

        // RLS: SPGM-SP001
        // RLS: SPGM-SP002
        // RLS: SPGM-SP003
        context("a service provider") {
            test("sees the memberships of its groups and their archived revisions, and no others") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val own = seed(Triggers.OFF) { insertMembership(insertControllableUnit(insertAccountingPoint()), insertServiceProvidingGroup(sp.partyId!!)) }
                val other = seed(Triggers.OFF) {
                    insertMembership(insertControllableUnit(insertAccountingPoint()), insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "Other SP")))
                }
                seed {
                    deleteMembership(own)
                    deleteMembership(other)
                }
                val remaining = seed(Triggers.OFF) {
                    insertMembership(insertControllableUnit(insertAccountingPoint()), insertServiceProvidingGroup(sp.partyId!!))
                }

                val list = api.get("/service_providing_group_membership", sp.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProvidingGroupMembershipResponse>>().map { it.id } shouldBe listOf(remaining)
                api.get("/service_providing_group_membership/$remaining", sp.token()).status shouldBe HttpStatusCode.OK

                val history = api.get("/service_providing_group_membership_history", sp.token(), "replaced_at" to "not.is.null")
                history.body<List<ServiceProvidingGroupMembershipHistoryResponse>>().map { it.serviceProvidingGroupMembershipId } shouldBe
                    listOf(own)
            }

            test("can add a unit to its group for a period that it manages the unit, and not before") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val unit = seed { insertControllableUnitWithContract(sp.partyId!!, contractFrom = jan8, contractTo = jan12).also { activateControllableUnit(it.id) } }
                val group = seed { insertServiceProvidingGroup(sp.partyId!!) }

                api.post("/service_providing_group_membership", sp.token(), createRequest(unit.id, group, validFrom = jan7, validTo = jan11)).status shouldBe
                    HttpStatusCode.BadRequest
                api.post("/service_providing_group_membership", sp.token(), createRequest(unit.id, group, validFrom = jan9, validTo = jan11)).status shouldBe
                    HttpStatusCode.Created
            }

            test("cannot add a unit to the group of another service provider") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val other = seed { insertParty(TestPartyRole.SP, "Other SP") }
                val unit = seed { insertControllableUnitWithContract(sp.partyId!!).also { activateControllableUnit(it.id) } }
                val group = seed { insertServiceProvidingGroup(other) }

                api.post("/service_providing_group_membership", sp.token(), createRequest(unit.id, group)).status shouldBe HttpStatusCode.BadRequest
            }

            test("can change and remove its membership, but not the membership of another service provider") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                // the change is validated, so the unit of its membership has a contract and is active
                val own = seed {
                    val unit = insertControllableUnitWithContract(sp.partyId!!).also { activateControllableUnit(it.id) }
                    insertMembership(unit.id, insertServiceProvidingGroup(sp.partyId!!), validFrom = jan1)
                }
                val other = seed(Triggers.OFF) {
                    insertMembership(insertControllableUnit(insertAccountingPoint()), insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "Other SP")))
                }
                val update = ServiceProvidingGroupMembershipUpdateRequest(validTo = jul1.toKotlinInstant())

                api.patch("/service_providing_group_membership/$other", sp.token(), update).status shouldBe HIDDEN_BY_RLS
                api.delete("/service_providing_group_membership/$other", sp.token()).status shouldBe HIDDEN_BY_RLS
                api.patch("/service_providing_group_membership/$own", sp.token(), update).status shouldBe HttpStatusCode.OK
                api.delete("/service_providing_group_membership/$own", sp.token()).status shouldBe HttpStatusCode.NoContent
            }
        }

        // RLS: SPGM-SO001
        // RLS: SPGM-SO002
        // The system operator sees the memberships of the groups it sees, here because it has a grid prequalification for them.
        context("a system operator") {
            test("sees the memberships of the groups it sees and their archived revisions, and no others") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val visibleGroup = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP)).also { insertGridPrequalification(it, so.partyId!!) } }
                val hiddenGroup = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "Other SP")) }
                val deletedVisible = seed(Triggers.OFF) { insertMembership(insertControllableUnit(insertAccountingPoint()), visibleGroup) }
                val deletedHidden = seed(Triggers.OFF) { insertMembership(insertControllableUnit(insertAccountingPoint()), hiddenGroup) }
                seed {
                    deleteMembership(deletedVisible)
                    deleteMembership(deletedHidden)
                }
                val visible = seed(Triggers.OFF) { insertMembership(insertControllableUnit(insertAccountingPoint()), visibleGroup) }
                val hidden = seed(Triggers.OFF) { insertMembership(insertControllableUnit(insertAccountingPoint()), hiddenGroup) }

                val list = api.get("/service_providing_group_membership", so.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProvidingGroupMembershipResponse>>().map { it.id } shouldBe listOf(visible)
                api.get("/service_providing_group_membership/$hidden", so.token()).status shouldBe HIDDEN_BY_RLS

                val history = api.get("/service_providing_group_membership_history", so.token(), "replaced_at" to "not.is.null")
                history.body<List<ServiceProvidingGroupMembershipHistoryResponse>>().map { it.serviceProvidingGroupMembershipId } shouldBe
                    listOf(deletedVisible)
            }

            test("cannot add, change or remove a membership") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val group = seed { insertServiceProvidingGroup(sp).also { insertGridPrequalification(it, so.partyId!!) } }
                val unit = seed { insertControllableUnitWithContract(sp).also { activateControllableUnit(it.id) } }
                val membership = seed(Triggers.OFF) { insertMembership(insertControllableUnit(insertAccountingPoint()), group) }

                api.post("/service_providing_group_membership", so.token(), createRequest(unit.id, group)).status shouldBe HttpStatusCode.Forbidden
                api.patch(
                    "/service_providing_group_membership/$membership",
                    so.token(),
                    ServiceProvidingGroupMembershipUpdateRequest(validTo = jul1.toKotlinInstant()),
                ).status shouldBe HttpStatusCode.Forbidden
                api.delete("/service_providing_group_membership/$membership", so.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // These roles have no grant on the memberships.
        for (role in TestPartyRole.rolesWithDataGrants - setOf(TestPartyRole.FISO, TestPartyRole.SO, TestPartyRole.SP)) {
            test("${role.type} cannot list the memberships") {
                val actor = seed { insertActor(role) }

                api.get("/service_providing_group_membership", actor.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the memberships") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get("/service_providing_group_membership", org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
