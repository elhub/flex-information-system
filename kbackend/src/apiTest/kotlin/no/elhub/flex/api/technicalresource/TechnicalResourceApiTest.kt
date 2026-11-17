package no.elhub.flex.api.technicalresource

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.DeviceType
import no.elhub.flex.api.model.dto.generated.models.TechnicalResourceCreateRequest
import no.elhub.flex.api.model.dto.generated.models.TechnicalResourceHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.TechnicalResourceResponse
import no.elhub.flex.api.model.dto.generated.models.TechnicalResourceUpdateRequest
import no.elhub.flex.api.model.dto.generated.models.Technology
import no.elhub.flex.testutil.NameRevision
import no.elhub.flex.testutil.SeedScope
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

/**
 * A technical resource that was renamed twice. The names say which revision it is: v1 was recorded on 2024-01-01, v2
 * on 2024-06-01 and v3, the current record, on 2024-09-01.
 */
private val revisions = listOf(
    NameRevision("v1", jan1),
    NameRevision("v2", jun1),
    NameRevision("v3", sep1),
)

private fun createRequest(controllableUnit: Long, name: String = "New TR") = TechnicalResourceCreateRequest(
    name = name,
    controllableUnitId = controllableUnit,
    technology = listOf(Technology.OTHER_CONSUMPTION),
    maximumActivePower = BigDecimal.valueOf(1.0),
    deviceType = DeviceType.OTHER,
)

/** Seeds the revisions as the history of a technical resource, which needs the triggers off, see [SeedScope.insertTechnicalResourceWithRevisions]. */
private fun seedRevisionsOn(controllableUnit: Long): Long = seed(Triggers.OFF) { insertTechnicalResourceWithRevisions(controllableUnit, revisions) }

class TechnicalResourceApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.accounting_point",
                "flex.metering_grid_area",
                "flex.party",
                "flex.entity",
                "flex.technical_resource_history",
            )
        }

        // RLS: TR-FISO001
        context("a FISO") {
            test("can list the technical resources of all controllable units") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val technicalResources = seed {
                    List(2) { insertTechnicalResource(insertControllableUnitAtNewAccountingPoint().id) }
                }

                val response = api.get("/technical_resource", fiso.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<TechnicalResourceResponse>>().map { it.id } shouldContainExactlyInAnyOrder technicalResources
            }

            test("can create, update and delete a technical resource") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val unit = seed { insertControllableUnitAtNewAccountingPoint() }

                val created = api.post("/technical_resource", fiso.token(), createRequest(unit.id))
                created.status shouldBe HttpStatusCode.Created
                val id = created.body<TechnicalResourceResponse>().id

                val updated = api.patch("/technical_resource/$id", fiso.token(), TechnicalResourceUpdateRequest(name = "Renamed"))
                updated.status shouldBe HttpStatusCode.OK
                updated.body<TechnicalResourceResponse>().name shouldBe "Renamed"

                api.delete("/technical_resource/$id", fiso.token()).status shouldBe HttpStatusCode.NoContent
                api.get("/technical_resource/$id", fiso.token()).status shouldBe HIDDEN_BY_RLS
            }

            // RLS: TR-FISO002
            test("can read the archived revisions of all technical resources") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val technicalResource = seed { insertTechnicalResource(insertControllableUnitAtNewAccountingPoint().id, "Before") }
                // the view of the history also lists the current rows, so an archived revision is needed
                seed { renameTechnicalResource(technicalResource, "After") }

                val response = api.get("/technical_resource_history", fiso.token(), "replaced_at" to "not.is.null")

                response.status shouldBe HttpStatusCode.OK
                response.body<List<TechnicalResourceHistoryResponse>>().map { it.name } shouldBe listOf("Before")
            }
        }

        // RLS: TR-SO001
        // RLS: TR-SO002
        // The system operator sees a technical resource when it sees the controllable unit, here as the CSO of its
        // accounting point.
        context("a system operator") {
            test("sees the technical resources of the controllable units in its area, and no others") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val own = seed {
                    insertTechnicalResource(insertControllableUnit(insertAccountingPointOwnedBy(so.partyId!!)))
                }
                val other = seed {
                    insertTechnicalResource(insertControllableUnit(insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO, "Other SO"))))
                }

                val list = api.get("/technical_resource", so.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<TechnicalResourceResponse>>().map { it.id } shouldBe listOf(own)
                api.get("/technical_resource/$own", so.token()).status shouldBe HttpStatusCode.OK
                api.get("/technical_resource/$other", so.token()).status shouldBe HIDDEN_BY_RLS
            }

            test("can read the archived revisions of the technical resources in its area, and no others") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val own = seed {
                    insertTechnicalResource(insertControllableUnit(insertAccountingPointOwnedBy(so.partyId!!)), "Own before")
                }
                val other = seed {
                    insertTechnicalResource(insertControllableUnit(insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO, "Other SO"))), "Other before")
                }
                seed {
                    renameTechnicalResource(own, "Own after")
                    renameTechnicalResource(other, "Other after")
                }

                val list = api.get("/technical_resource_history", so.token(), "replaced_at" to "not.is.null")

                list.status shouldBe HttpStatusCode.OK
                list.body<List<TechnicalResourceHistoryResponse>>().map { it.name } shouldBe listOf("Own before")
            }
        }

        // RLS: TR-BRP001
        // RLS: TR-BRP002
        // RLS: TR-EU001
        // RLS: TR-EU002
        // RLS: TR-ES001
        // RLS: TR-ES002
        // RLS: TR-SP002
        // RLS: TR-SP003
        // These parties are related to the controllable unit for a period, and see the versions of its technical
        // resources that were recorded in that period. A party whose period has ended sees the technical resource as
        // it was when the period ended.
        for (role in TestPartyRole.relatedToControllableUnit) {
            context("a ${role.abbreviation} related to the controllable unit") {
                test("sees the current version, and all the revisions in the history") {
                    val actor = seed { insertActor(role) }
                    val unit = seed { insertControllableUnitAtNewAccountingPoint() }
                    seed { insertPartyRelatedToControllableUnit(role, actor.partyId!!, unit, validFrom = jan1) }
                    seedRevisionsOn(unit.id)

                    val current = api.get("/technical_resource", actor.token()).body<List<TechnicalResourceResponse>>()
                    val history = api.get("/technical_resource_history", actor.token()).body<List<TechnicalResourceHistoryResponse>>()

                    current.map { it.name } shouldBe listOf("v3")
                    history.map { it.name } shouldContainExactlyInAnyOrder listOf("v1", "v2", "v3")
                }

                test("whose period has ended sees the version that was current then, and only the revisions of the period") {
                    val actor = seed { insertActor(role) }
                    val unit = seed { insertControllableUnitAtNewAccountingPoint() }
                    // the period of the party starts when v2 was recorded, and ends before v3 was, so v1 is outside it
                    seed { insertPartyRelatedToControllableUnit(role, actor.partyId!!, unit, validFrom = jun1, validTo = jul1) }
                    val technicalResource = seedRevisionsOn(unit.id)

                    val current = api.get("/technical_resource", actor.token()).body<List<TechnicalResourceResponse>>()
                    val history = api.get("/technical_resource_history", actor.token()).body<List<TechnicalResourceHistoryResponse>>()

                    current.map { it.name } shouldBe listOf("v2")
                    api.get("/technical_resource/$technicalResource", actor.token()).body<TechnicalResourceResponse>().name shouldBe "v2"
                    history.map { it.name } shouldBe listOf("v2")
                }

                test("does not see the technical resources of a controllable unit that it is not related to") {
                    val actor = seed { insertActor(role) }
                    val related = seed { insertControllableUnitAtNewAccountingPoint() }
                    val unrelated = seed { insertControllableUnitAtNewAccountingPoint() }
                    seed { insertPartyRelatedToControllableUnit(role, actor.partyId!!, related) }
                    val own = seed { insertTechnicalResource(related.id) }
                    val other = seed { insertTechnicalResource(unrelated.id) }

                    val list = api.get("/technical_resource", actor.token())

                    list.status shouldBe HttpStatusCode.OK
                    list.body<List<TechnicalResourceResponse>>().map { it.id } shouldBe listOf(own)
                    api.get("/technical_resource/$other", actor.token()).status shouldBe HIDDEN_BY_RLS
                }
            }
        }

        // RLS: TR-SP001
        // The service provider can change the technical resources of a controllable unit while it has a contract on it.
        context("a service provider with a contract on the controllable unit") {
            test("can create, update and delete a technical resource") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val unit = seed { insertControllableUnitAtNewAccountingPoint() }
                seed { insertPartyRelatedToControllableUnit(TestPartyRole.SP, sp.partyId!!, unit) }

                val created = api.post("/technical_resource", sp.token(), createRequest(unit.id))
                created.status shouldBe HttpStatusCode.Created
                val id = created.body<TechnicalResourceResponse>().id

                val updated = api.patch("/technical_resource/$id", sp.token(), TechnicalResourceUpdateRequest(name = "Renamed"))
                updated.status shouldBe HttpStatusCode.OK
                updated.body<TechnicalResourceResponse>().name shouldBe "Renamed"

                api.delete("/technical_resource/$id", sp.token()).status shouldBe HttpStatusCode.NoContent
            }

            test("cannot create or update a technical resource after the contract has ended") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val unit = seed { insertControllableUnitAtNewAccountingPoint() }
                seed { insertPartyRelatedToControllableUnit(TestPartyRole.SP, sp.partyId!!, unit, validTo = jul1) }
                val technicalResource = seed { insertTechnicalResource(unit.id, "Original name") }

                api.post("/technical_resource", sp.token(), createRequest(unit.id)).status shouldBe HttpStatusCode.Forbidden
                api.patch("/technical_resource/$technicalResource", sp.token(), TechnicalResourceUpdateRequest(name = "Updated by SP"))
                    .status shouldBe HIDDEN_BY_RLS

                val fiso = seed { insertActor(TestPartyRole.FISO) }
                api.get("/technical_resource/$technicalResource", fiso.token()).body<TechnicalResourceResponse>().name shouldBe "Original name"
            }
        }

        // The other roles have no access to the technical resources, also not when they are related to the unit.
        for (role in TestPartyRole.rolesWithDataGrants - setOf(TestPartyRole.FISO, TestPartyRole.SO) - TestPartyRole.relatedToControllableUnit) {
            test("${role.type} cannot list the technical resources") {
                val actor = seed { insertActor(role) }
                seed { insertTechnicalResource(insertControllableUnitAtNewAccountingPoint().id) }

                api.get("/technical_resource", actor.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the technical resources") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get("/technical_resource", org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
