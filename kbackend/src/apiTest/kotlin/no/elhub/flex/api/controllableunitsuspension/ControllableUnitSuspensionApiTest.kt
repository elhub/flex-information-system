package no.elhub.flex.api.controllableunitsuspension

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitSuspensionCreateRequest
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitSuspensionHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitSuspensionReason
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitSuspensionResponse
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitSuspensionUpdateRequest
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.SeededControllableUnit
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.osloMidnight
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

private val jan1 = osloMidnight("2024-01-01")
private val jul1 = osloMidnight("2024-07-01")

private fun createRequest(controllableUnit: Long, impactedSystemOperator: Long) = ControllableUnitSuspensionCreateRequest(
    controllableUnitId = controllableUnit,
    impactedSystemOperatorId = impactedSystemOperator,
    reason = ControllableUnitSuspensionReason.OTHER,
)

/** A suspension is only possible for an active controllable unit. */
private fun SeedScope.insertActiveControllableUnit(): SeededControllableUnit =
    insertControllableUnitAtNewAccountingPoint().also { activateControllableUnit(it.id) }

class ControllableUnitSuspensionApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.accounting_point",
                "flex.metering_grid_area",
                "flex.party",
                "flex.entity",
                "flex.controllable_unit_suspension_history",
            )
        }

        context("a FISO") {
            // RLS: CUS-FISO001
            test("can list the suspensions of all controllable units") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val suspensions = seed {
                    List(2) { insertControllableUnitSuspension(insertActiveControllableUnit().id, insertParty(TestPartyRole.SO)) }
                }

                val response = api.get("/controllable_unit_suspension", fiso.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ControllableUnitSuspensionResponse>>().map { it.id } shouldContainExactlyInAnyOrder suspensions
            }

            test("can create, update and delete a suspension") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val iso = seed { insertParty(TestPartyRole.SO) }
                val unit = seed { insertActiveControllableUnit() }

                val created = api.post("/controllable_unit_suspension", fiso.token(), createRequest(unit.id, iso))
                created.status shouldBe HttpStatusCode.Created
                val id = created.body<ControllableUnitSuspensionResponse>().id

                val updated = api.patch(
                    "/controllable_unit_suspension/$id",
                    fiso.token(),
                    ControllableUnitSuspensionUpdateRequest(reason = ControllableUnitSuspensionReason.COMPROMISES_SAFE_OPERATION),
                )
                updated.status shouldBe HttpStatusCode.OK
                updated.body<ControllableUnitSuspensionResponse>().reason shouldBe ControllableUnitSuspensionReason.COMPROMISES_SAFE_OPERATION

                api.delete("/controllable_unit_suspension/$id", fiso.token()).status shouldBe HttpStatusCode.NoContent
            }

            // CUS-VAL001
            test("cannot create a suspension of a controllable unit that is not active") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val iso = seed { insertParty(TestPartyRole.SO) }
                val unit = seed { insertControllableUnitAtNewAccountingPoint() }

                api.post("/controllable_unit_suspension", fiso.token(), createRequest(unit.id, iso)).status shouldBe HttpStatusCode.BadRequest
            }

            // RLS: CUS-FISO002
            test("can read the archived revisions of all suspensions") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val suspension = seed { insertControllableUnitSuspension(insertActiveControllableUnit().id, insertParty(TestPartyRole.SO), "other") }
                // the view of the history also lists the current rows, so an archived revision is needed
                seed { changeSuspensionReason(suspension, "compromises_safe_operation") }

                val response = api.get("/controllable_unit_suspension_history", fiso.token(), "replaced_at" to "not.is.null")

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ControllableUnitSuspensionHistoryResponse>>().map { it.reason } shouldBe
                    listOf(ControllableUnitSuspensionReason.OTHER)
            }
        }

        // RLS: CUS-SO001
        // RLS: CUS-SO002
        // The impacted system operator of a suspension is the one that created it, and it has full control of it.
        context("a system operator that is the impacted system operator") {
            test("can create, read, update and delete its suspension") {
                val iso = seed { insertActor(TestPartyRole.SO) }
                val unit = seed { insertActiveControllableUnit() }

                val created = api.post("/controllable_unit_suspension", iso.token(), createRequest(unit.id, iso.partyId!!))
                created.status shouldBe HttpStatusCode.Created
                val id = created.body<ControllableUnitSuspensionResponse>().id

                api.get("/controllable_unit_suspension/$id", iso.token()).status shouldBe HttpStatusCode.OK
                api.patch(
                    "/controllable_unit_suspension/$id",
                    iso.token(),
                    ControllableUnitSuspensionUpdateRequest(reason = ControllableUnitSuspensionReason.COMPROMISES_SAFE_OPERATION),
                ).status shouldBe HttpStatusCode.OK
                api.delete("/controllable_unit_suspension/$id", iso.token()).status shouldBe HttpStatusCode.NoContent
            }

            test("cannot create a suspension for another system operator") {
                val iso = seed { insertActor(TestPartyRole.SO) }
                val other = seed { insertParty(TestPartyRole.SO, "Other SO") }
                val unit = seed { insertActiveControllableUnit() }

                api.post("/controllable_unit_suspension", iso.token(), createRequest(unit.id, other)).status shouldBe HttpStatusCode.Forbidden
            }

            // CUS-VAL002
            test("cannot create a second suspension of the same controllable unit") {
                val iso = seed { insertActor(TestPartyRole.SO) }
                val unit = seed { insertActiveControllableUnit() }
                seed { insertControllableUnitSuspension(unit.id, iso.partyId!!) }

                api.post("/controllable_unit_suspension", iso.token(), createRequest(unit.id, iso.partyId!!)).status shouldBe
                    HttpStatusCode.Conflict
            }

            test("sees its suspensions and their archived revisions, and not those of another impacted system operator") {
                val iso = seed { insertActor(TestPartyRole.SO) }
                val other = seed { insertParty(TestPartyRole.SO, "Other SO") }
                val own = seed { insertControllableUnitSuspension(insertActiveControllableUnit().id, iso.partyId!!, "other") }
                val others = seed { insertControllableUnitSuspension(insertActiveControllableUnit().id, other, "other") }
                seed {
                    changeSuspensionReason(own, "compromises_safe_operation")
                    changeSuspensionReason(others, "compromises_safe_operation")
                }

                val list = api.get("/controllable_unit_suspension", iso.token())
                list.body<List<ControllableUnitSuspensionResponse>>().map { it.id } shouldBe listOf(own)
                api.get("/controllable_unit_suspension/$others", iso.token()).status shouldBe HIDDEN_BY_RLS

                val history = api.get("/controllable_unit_suspension_history", iso.token(), "replaced_at" to "not.is.null")
                history.body<List<ControllableUnitSuspensionHistoryResponse>>().map { it.controllableUnitSuspensionId } shouldBe listOf(own)
            }
        }

        // RLS: CUS-SO003
        // RLS: CUS-SO004
        // The CSO of the controllable unit sees the suspensions that other system operators made of it, and cannot change them.
        context("a system operator that is the CSO of the controllable unit") {
            test("sees the suspensions of the units in its area, and the archived revisions, and no others") {
                val cso = seed { insertActor(TestPartyRole.SO) }
                val iso = seed { insertParty(TestPartyRole.SO, "ISO") }
                val own = seed {
                    val unit = insertControllableUnit(insertAccountingPointOwnedBy(cso.partyId!!))
                    activateControllableUnit(unit)
                    insertControllableUnitSuspension(unit, iso, "other")
                }
                val other = seed {
                    val unit = insertControllableUnit(insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO, "Other CSO")))
                    activateControllableUnit(unit)
                    insertControllableUnitSuspension(unit, iso, "other")
                }
                seed {
                    changeSuspensionReason(own, "compromises_safe_operation")
                    changeSuspensionReason(other, "compromises_safe_operation")
                }

                val list = api.get("/controllable_unit_suspension", cso.token())
                list.body<List<ControllableUnitSuspensionResponse>>().map { it.id } shouldBe listOf(own)
                api.get("/controllable_unit_suspension/$other", cso.token()).status shouldBe HIDDEN_BY_RLS

                val history = api.get("/controllable_unit_suspension_history", cso.token(), "replaced_at" to "not.is.null")
                history.body<List<ControllableUnitSuspensionHistoryResponse>>().map { it.controllableUnitSuspensionId } shouldBe listOf(own)
            }

            test("cannot update or delete a suspension of another system operator") {
                val cso = seed { insertActor(TestPartyRole.SO) }
                val suspension = seed {
                    val unit = insertControllableUnit(insertAccountingPointOwnedBy(cso.partyId!!))
                    activateControllableUnit(unit)
                    insertControllableUnitSuspension(unit, insertParty(TestPartyRole.SO, "ISO"))
                }

                api.patch(
                    "/controllable_unit_suspension/$suspension",
                    cso.token(),
                    ControllableUnitSuspensionUpdateRequest(reason = ControllableUnitSuspensionReason.COMPROMISES_SAFE_OPERATION),
                ).status shouldBe HIDDEN_BY_RLS
                api.delete("/controllable_unit_suspension/$suspension", cso.token()).status shouldBe HIDDEN_BY_RLS
            }
        }

        // RLS: CUS-SP001
        // RLS: CUS-SP002
        // The service provider sees the suspensions that were recorded while it had a contract on the unit.
        context("a service provider") {
            test("sees the suspension of a unit it has a contract on, and the archived revisions") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val unit = seed { insertActiveControllableUnit() }
                seed { insertPartyRelatedToControllableUnit(TestPartyRole.SP, sp.partyId!!, unit) }
                val suspension = seed { insertControllableUnitSuspension(unit.id, insertParty(TestPartyRole.SO), "other") }
                seed { changeSuspensionReason(suspension, "compromises_safe_operation") }

                api.get("/controllable_unit_suspension/$suspension", sp.token()).status shouldBe HttpStatusCode.OK
                val history = api.get("/controllable_unit_suspension_history", sp.token(), "replaced_at" to "not.is.null")
                history.body<List<ControllableUnitSuspensionHistoryResponse>>().map { it.controllableUnitSuspensionId } shouldBe listOf(suspension)
            }

            test("does not see the suspension of a unit whose contract ended before the suspension") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val unit = seed { insertActiveControllableUnit() }
                seed { insertPartyRelatedToControllableUnit(TestPartyRole.SP, sp.partyId!!, unit, validFrom = jan1, validTo = jul1) }
                val suspension = seed { insertControllableUnitSuspension(unit.id, insertParty(TestPartyRole.SO), "other") }
                seed { changeSuspensionReason(suspension, "compromises_safe_operation") }

                api.get("/controllable_unit_suspension", sp.token()).body<List<ControllableUnitSuspensionResponse>>() shouldBe emptyList()
                api.get("/controllable_unit_suspension/$suspension", sp.token()).status shouldBe HIDDEN_BY_RLS
                api.get("/controllable_unit_suspension_history", sp.token()).body<List<ControllableUnitSuspensionHistoryResponse>>() shouldBe
                    emptyList()
            }

            test("cannot delete a suspension") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val unit = seed { insertActiveControllableUnit() }
                seed { insertPartyRelatedToControllableUnit(TestPartyRole.SP, sp.partyId!!, unit) }
                val suspension = seed { insertControllableUnitSuspension(unit.id, insertParty(TestPartyRole.SO)) }

                api.delete("/controllable_unit_suspension/$suspension", sp.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // RLS: CUS-BRP001
        // RLS: CUS-BRP002
        // The balance responsible party sees the suspensions of the unit while it is related to it, and the revisions that
        // were recorded while it was.
        context("a balance responsible party") {
            test("sees the suspension of a unit it is related to, and the archived revisions") {
                val brp = seed { insertActor(TestPartyRole.BRP) }
                val unit = seed { insertActiveControllableUnit() }
                seed { insertPartyRelatedToControllableUnit(TestPartyRole.BRP, brp.partyId!!, unit) }
                val suspension = seed { insertControllableUnitSuspension(unit.id, insertParty(TestPartyRole.SO), "other") }
                seed { changeSuspensionReason(suspension, "compromises_safe_operation") }

                api.get("/controllable_unit_suspension/$suspension", brp.token()).status shouldBe HttpStatusCode.OK
                val history = api.get("/controllable_unit_suspension_history", brp.token(), "replaced_at" to "not.is.null")
                history.body<List<ControllableUnitSuspensionHistoryResponse>>().map { it.controllableUnitSuspensionId } shouldBe listOf(suspension)
            }

            test("does not see the suspension of a unit after its period has ended, nor the revisions") {
                val brp = seed { insertActor(TestPartyRole.BRP) }
                val unit = seed { insertActiveControllableUnit() }
                seed { insertPartyRelatedToControllableUnit(TestPartyRole.BRP, brp.partyId!!, unit, validFrom = jan1, validTo = jul1) }
                val suspension = seed { insertControllableUnitSuspension(unit.id, insertParty(TestPartyRole.SO), "other") }
                seed { changeSuspensionReason(suspension, "compromises_safe_operation") }

                api.get("/controllable_unit_suspension/$suspension", brp.token()).status shouldBe HIDDEN_BY_RLS
                api.get("/controllable_unit_suspension_history", brp.token()).body<List<ControllableUnitSuspensionHistoryResponse>>() shouldBe
                    emptyList()
            }
        }

        // These roles have no grant on the suspensions, also not when they are related to the controllable unit.
        for (role in TestPartyRole.rolesWithDataGrants - setOf(TestPartyRole.FISO, TestPartyRole.SO, TestPartyRole.SP, TestPartyRole.BRP)) {
            test("${role.type} cannot list the suspensions") {
                val actor = seed { insertActor(role) }

                api.get("/controllable_unit_suspension", actor.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the suspensions") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get("/controllable_unit_suspension", org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
