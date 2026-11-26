package no.elhub.flex.api.controllableunit

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitCreateRequest
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitRegulationDirection
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitResponse
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitStatus
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitUpdateRequest
import no.elhub.flex.testutil.NameRevision
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.SeededControllableUnit
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.osloMidnight
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token
import java.math.BigDecimal

private val jan1 = osloMidnight("2024-01-01")
private val jun1 = osloMidnight("2024-06-01")
private val jul1 = osloMidnight("2024-07-01")
private val sep1 = osloMidnight("2024-09-01")
private val dec1 = osloMidnight("2099-12-01")

/**
 * A controllable unit that was renamed twice. The names say which revision it is: v1 was recorded on 2024-01-01, v2 on
 * 2024-06-01 and v3, the current record, on 2024-09-01.
 */
private val revisions = listOf(NameRevision("v1", jan1), NameRevision("v2", jun1), NameRevision("v3", sep1))

private fun createRequest(accountingPoint: Long, name: String = "New CU") = ControllableUnitCreateRequest(
    name = name,
    accountingPointId = accountingPoint,
    regulationDirection = ControllableUnitRegulationDirection.BOTH,
    maximumActivePower = BigDecimal.valueOf(3.5),
)

private fun statusRequest(status: ControllableUnitStatus) = JsonObject(mapOf("status" to JsonPrimitive(status.value)))

/**
 * Seeds a controllable unit that is a member of a new service providing group, which has a product application for
 * the procuring system operator [pso] and, when given, a grid prequalification for the impacted system operator [iso].
 * Seed it with [Triggers.OFF], as the group would otherwise need an active unit with a contract and a qualified provider.
 */
private fun SeedScope.insertUnitInGroupFor(pso: Long?, iso: Long?): Long {
    val unit = insertControllableUnitAtNewAccountingPoint().id
    val group = insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "Group SP"))
    insertMembership(unit, group)
    pso?.let { insertServiceProvidingGroupProductApplication(group, it, listOf(insertProductType())) }
    iso?.let { insertGridPrequalification(group, it) }
    return unit
}

class ControllableUnitApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.accounting_point",
                "flex.metering_grid_area",
                "flex.party",
                "flex.entity",
                "flex.service_providing_group",
                "flex.product_type",
                "flex.controllable_unit_history",
            )
        }

        context("a FISO") {
            // RLS: CU-FISO001
            test("can list all controllable units") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val units = seed { List(2) { insertControllableUnitAtNewAccountingPoint().id } }

                val response = api.get("/controllable_unit", fiso.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ControllableUnitResponse>>().map { it.id } shouldContainExactlyInAnyOrder units
            }

            test("can create a controllable unit and update it") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val accountingPoint = seed { insertAccountingPoint() }

                val created = api.post("/controllable_unit", fiso.token(), createRequest(accountingPoint))
                created.status shouldBe HttpStatusCode.Created
                val id = created.body<ControllableUnitResponse>().id

                val updated = api.patch("/controllable_unit/$id", fiso.token(), ControllableUnitUpdateRequest(name = "Renamed"))
                updated.status shouldBe HttpStatusCode.OK
                updated.body<ControllableUnitResponse>().name shouldBe "Renamed"
            }

            // RLS: CU-FISO002
            test("can read the archived revisions of all controllable units") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val unit = seed { insertControllableUnit(insertAccountingPoint(), name = "Before") }
                // the view of the history also lists the current rows, so an archived revision is needed
                seed { renameControllableUnit(unit, "After") }

                val response = api.get("/controllable_unit_history", fiso.token(), "replaced_at" to "not.is.null")

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ControllableUnitHistoryResponse>>().map { it.name } shouldBe listOf("Before")
            }

            // RLS: CU-VAL004
            test("can only activate a controllable unit that has a technical resource") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val withoutResource = seed { insertControllableUnitAtNewAccountingPoint().id }
                // a technical resource lets the unit be activated
                val withResource = seed { insertControllableUnitAtNewAccountingPoint().id.also { insertTechnicalResource(it) } }

                api.patch("/controllable_unit/$withoutResource", fiso.token(), statusRequest(ControllableUnitStatus.ACTIVE)).status shouldBe
                    HttpStatusCode.BadRequest
                api.patch("/controllable_unit/$withResource", fiso.token(), statusRequest(ControllableUnitStatus.ACTIVE)).status shouldBe
                    HttpStatusCode.OK
            }

            test("can terminate a controllable unit and bring it back to activity, but not back to new") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                // a technical resource lets the unit be activated
                val unit = seed { insertControllableUnitAtNewAccountingPoint().id.also { insertTechnicalResource(it) } }

                api.patch("/controllable_unit/$unit", fiso.token(), statusRequest(ControllableUnitStatus.TERMINATED)).status shouldBe HttpStatusCode.OK
                api.patch("/controllable_unit/$unit", fiso.token(), statusRequest(ControllableUnitStatus.NEW)).status shouldBe HttpStatusCode.BadRequest
                api.patch("/controllable_unit/$unit", fiso.token(), statusRequest(ControllableUnitStatus.ACTIVE)).status shouldBe HttpStatusCode.OK
            }
        }

        context("a system operator that is the CSO") {
            // RLS: CU-SO001
            test("sees the controllable units in its area, and no others") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val own = seed { insertControllableUnit(insertAccountingPointOwnedBy(so.partyId!!)) }
                val other = seed { insertControllableUnit(insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO, "Other SO"))) }

                val list = api.get("/controllable_unit", so.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ControllableUnitResponse>>().map { it.id } shouldBe listOf(own)
                api.get("/controllable_unit/$other", so.token()).status shouldBe HIDDEN_BY_RLS
            }

            // The system operator has no grant to create or update a controllable unit through the API.
            test("cannot create or update a controllable unit") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val accountingPoint = seed { insertAccountingPointOwnedBy(so.partyId!!) }
                val unit = seed { insertControllableUnit(accountingPoint) }

                api.post("/controllable_unit", so.token(), createRequest(accountingPoint)).status shouldBe HttpStatusCode.Forbidden
                api.patch("/controllable_unit/$unit", so.token(), ControllableUnitUpdateRequest(name = "Updated by SO")).status shouldBe
                    HttpStatusCode.Forbidden
            }

            // RLS: CU-SO003
            test("can read the archived revisions of the controllable units it sees, and no others") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val own = seed { insertControllableUnit(insertAccountingPointOwnedBy(so.partyId!!), name = "Own before") }
                val other = seed {
                    insertControllableUnit(insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO, "Other SO")), name = "Other before")
                }
                seed {
                    renameControllableUnit(own, "Own after")
                    renameControllableUnit(other, "Other after")
                }

                val list = api.get("/controllable_unit_history", so.token(), "replaced_at" to "not.is.null")

                list.status shouldBe HttpStatusCode.OK
                list.body<List<ControllableUnitHistoryResponse>>().map { it.name } shouldBe listOf("Own before")
            }
        }

        // RLS: CU-SO002
        // The system operator is a PSO of the unit when the unit is a member of a group that has a product application for it.
        context("a system operator that is a PSO") {
            test("sees the controllable unit in the group, and no other") {
                val pso = seed { insertActor(TestPartyRole.SO) }
                val inGroup = seed(Triggers.OFF) { insertUnitInGroupFor(pso = pso.partyId!!, iso = null) }
                // a group with a product application for another system operator
                val other = seed(Triggers.OFF) { insertUnitInGroupFor(pso = insertParty(TestPartyRole.SO, "Other PSO"), iso = null) }

                val list = api.get("/controllable_unit", pso.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ControllableUnitResponse>>().map { it.id } shouldBe listOf(inGroup)
                api.get("/controllable_unit/$other", pso.token()).status shouldBe HIDDEN_BY_RLS
            }
        }

        context("a system operator that is an ISO") {
            test("does not see the controllable unit in a group that has a grid prequalification for it") {
                val iso = seed { insertActor(TestPartyRole.SO) }
                val unit = seed(Triggers.OFF) { insertUnitInGroupFor(pso = null, iso = iso.partyId!!) }

                api.get("/controllable_unit", iso.token()).body<List<ControllableUnitResponse>>() shouldBe emptyList()
                api.get("/controllable_unit/$unit", iso.token()).status shouldBe HIDDEN_BY_RLS
            }
        }

        // RLS: CU-EU001
        // RLS: CU-EU002
        // RLS: CU-ES001
        // RLS: CU-ES002
        // RLS: CU-BRP001
        // RLS: CU-BRP002
        // RLS: CU-SP001
        // RLS: CU-SP004
        // These parties are related to the controllable unit for a period. They see the unit as it was when the period
        // ended, and the revisions that were recorded in the period.
        for (role in TestPartyRole.relatedToControllableUnit) {
            context("a ${role.abbreviation} related to the controllable unit") {
                test("sees the current version, and all the revisions in the history") {
                    val actor = seed { insertActor(role) }
                    val unit = seed(Triggers.OFF) { insertControllableUnitAtNewAccountingPoint(revisions) }
                    seed { insertPartyRelatedToControllableUnit(role, actor.partyId!!, unit, validFrom = jan1) }

                    val current = api.get("/controllable_unit", actor.token()).body<List<ControllableUnitResponse>>()
                    val history = api.get("/controllable_unit_history", actor.token()).body<List<ControllableUnitHistoryResponse>>()

                    current.map { it.name } shouldBe listOf("v3")
                    history.map { it.name } shouldContainExactlyInAnyOrder listOf("v1", "v2", "v3")
                }

                test("whose period has ended sees the version that was current then, and only the revisions of the period") {
                    val actor = seed { insertActor(role) }
                    val unit = seed(Triggers.OFF) { insertControllableUnitAtNewAccountingPoint(revisions) }
                    // the period of the party starts when v2 was recorded, and ends before v3 was, so v1 is outside it
                    seed { insertPartyRelatedToControllableUnit(role, actor.partyId!!, unit, validFrom = jun1, validTo = jul1) }

                    val current = api.get("/controllable_unit", actor.token()).body<List<ControllableUnitResponse>>()
                    val history = api.get("/controllable_unit_history", actor.token()).body<List<ControllableUnitHistoryResponse>>()

                    current.map { it.name } shouldBe listOf("v2")
                    api.get("/controllable_unit/${unit.id}", actor.token()).body<ControllableUnitResponse>().name shouldBe "v2"
                    history.map { it.name } shouldBe listOf("v2")
                }

                test("does not see a controllable unit that it is not related to") {
                    val actor = seed { insertActor(role) }
                    val related = seed { insertControllableUnitAtNewAccountingPoint() }
                    val unrelated = seed { insertControllableUnitAtNewAccountingPoint() }
                    seed { insertPartyRelatedToControllableUnit(role, actor.partyId!!, related) }

                    val list = api.get("/controllable_unit", actor.token())

                    list.status shouldBe HttpStatusCode.OK
                    list.body<List<ControllableUnitResponse>>().map { it.id } shouldBe listOf(related.id)
                    api.get("/controllable_unit/${unrelated.id}", actor.token()).status shouldBe HIDDEN_BY_RLS
                }
            }
        }

        context("a service provider") {
            // RLS: CU-SP001
            test("sees a controllable unit once it has a contract, also one that starts in the future") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val unit = seed { insertControllableUnitAtNewAccountingPoint() }
                seed { insertPartyRelatedToControllableUnit(TestPartyRole.SP, sp.partyId!!, unit, validFrom = dec1) }

                api.get("/controllable_unit/${unit.id}", sp.token()).status shouldBe HttpStatusCode.OK
            }

            // RLS: CU-SP002
            // RLS: CU-SP005
            test("can create a controllable unit, and sees it without a contract") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val accountingPoint = seed { insertAccountingPoint() }

                val created = api.post("/controllable_unit", sp.token(), createRequest(accountingPoint))
                created.status shouldBe HttpStatusCode.Created
                val id = created.body<ControllableUnitResponse>().id

                api.get("/controllable_unit/$id", sp.token()).status shouldBe HttpStatusCode.OK
            }

            // RLS: CU-SP003
            test("can update the controllable unit while it has a contract, and not before the contract starts") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val contracted = seed { insertControllableUnitAtNewAccountingPoint() }
                val future = seed { insertControllableUnitAtNewAccountingPoint() }
                seed { insertPartyRelatedToControllableUnit(TestPartyRole.SP, sp.partyId!!, contracted) }
                // the SP created the unit with the future contract, which is why it sees a unit it cannot update (CU-SP005)
                val created = api.post("/controllable_unit", sp.token(), createRequest(future.accountingPoint)).body<ControllableUnitResponse>().id!!
                seed { insertPartyRelatedToControllableUnit(TestPartyRole.SP, sp.partyId!!, SeededControllableUnit(created, future.accountingPoint, future.meteringGridArea), validFrom = dec1) }

                api.patch("/controllable_unit/${contracted.id}", sp.token(), ControllableUnitUpdateRequest(name = "Updated by SP")).status shouldBe
                    HttpStatusCode.OK
                api.get("/controllable_unit/$created", sp.token()).status shouldBe HttpStatusCode.OK
                // the API answers 401 when the service provider is not the one responsible for the unit
                api.patch("/controllable_unit/$created", sp.token(), ControllableUnitUpdateRequest(name = "Updated by SP")).status shouldBe
                    HttpStatusCode.Unauthorized
            }

            test("can activate and terminate its controllable unit, but not set it back to new or bring it back to activity") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val unit = seed { insertControllableUnitAtNewAccountingPoint() }
                seed {
                    insertPartyRelatedToControllableUnit(TestPartyRole.SP, sp.partyId!!, unit)
                    insertTechnicalResource(unit.id)
                }

                api.patch("/controllable_unit/${unit.id}", sp.token(), statusRequest(ControllableUnitStatus.ACTIVE)).status shouldBe HttpStatusCode.OK
                api.patch("/controllable_unit/${unit.id}", sp.token(), statusRequest(ControllableUnitStatus.NEW)).status shouldBe
                    HttpStatusCode.BadRequest
                api.patch("/controllable_unit/${unit.id}", sp.token(), statusRequest(ControllableUnitStatus.TERMINATED)).status shouldBe
                    HttpStatusCode.OK
                api.patch("/controllable_unit/${unit.id}", sp.token(), statusRequest(ControllableUnitStatus.ACTIVE)).status shouldBe
                    HttpStatusCode.BadRequest
            }
        }

        // The other roles have no access to the controllable units.
        for (role in listOf(TestPartyRole.MO, TestPartyRole.TP)) {
            test("${role.type} cannot list the controllable units") {
                val actor = seed { insertActor(role) }

                api.get("/controllable_unit", actor.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the controllable units") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get("/controllable_unit", org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
