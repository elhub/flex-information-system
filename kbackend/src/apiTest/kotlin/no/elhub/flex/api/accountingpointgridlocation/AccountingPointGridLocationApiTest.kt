package no.elhub.flex.api.accountingpointgridlocation

import io.kotest.matchers.collections.shouldNotBeEmpty
import io.kotest.matchers.comparables.shouldBeEqualComparingTo
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.accountingpoint.insertAccountingPointRelatedTo
import no.elhub.flex.api.model.dto.generated.models.AccountingPointGridLocationCreateRequest
import no.elhub.flex.api.model.dto.generated.models.AccountingPointGridLocationHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.AccountingPointGridLocationObjectType
import no.elhub.flex.api.model.dto.generated.models.AccountingPointGridLocationQuality
import no.elhub.flex.api.model.dto.generated.models.AccountingPointGridLocationResponse
import no.elhub.flex.api.model.dto.generated.models.AccountingPointGridLocationUpdateRequest
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupGridPrequalificationStatus
import no.elhub.flex.shared.accountingpoint.model.AccountingPointGridLocationSource
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token
import java.math.BigDecimal
import java.util.UUID

/** Seeds a grid location at the accounting point, on a new substation, and returns its id. */
private fun SeedScope.insertGridLocationAt(
    accountingPoint: Long,
    source: AccountingPointGridLocationSource = AccountingPointGridLocationSource.CSO,
): Long = insertGridLocation(accountingPoint, businessId = insertSubstation(), source = source)

private fun createRequest(
    accountingPoint: Long,
    substation: UUID,
    name: String = "New location",
    nominalVoltage: Double = 22.0,
) = AccountingPointGridLocationCreateRequest(
    accountingPointId = accountingPoint,
    objectType = AccountingPointGridLocationObjectType.SUBSTATION,
    businessId = substation.toString(),
    name = name,
    nominalVoltage = BigDecimal.valueOf(nominalVoltage),
    quality = AccountingPointGridLocationQuality.CONFIRMED,
)

class AccountingPointGridLocationApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.accounting_point",
                "flex.metering_grid_area",
                "flex.service_providing_group",
                "flex.product_type",
                "flex.substation",
                "flex.substation_cluster",
                "flex.party",
                "flex.entity",
            )
        }

        test("an anonymous caller cannot list grid locations") {
            api.get("/accounting_point_grid_location", token = null).status shouldBe HttpStatusCode.Unauthorized
        }

        // RLS: APGL-FISO001
        context("a FISO") {
            test("can list and read all grid locations") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val locations = seed { List(2) { insertGridLocationAt(insertAccountingPoint()) } }

                val list = api.get("/accounting_point_grid_location", fiso.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<AccountingPointGridLocationResponse>>().map { it.id }.toSet() shouldBe locations.toSet()

                val read = api.get("/accounting_point_grid_location/${locations.first()}", fiso.token())
                read.status shouldBe HttpStatusCode.OK
                read.body<AccountingPointGridLocationResponse>().id shouldBe locations.first()
            }

            test("can create a grid location") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val (accountingPoint, substation) = seed { insertAccountingPoint() to insertSubstation() }

                val response = api.post("/accounting_point_grid_location", fiso.token(), createRequest(accountingPoint, substation))

                response.status shouldBe HttpStatusCode.Created
                val created = response.body<AccountingPointGridLocationResponse>()
                created.accountingPointId shouldBe accountingPoint
                created.objectType shouldBe AccountingPointGridLocationObjectType.SUBSTATION
                created.quality shouldBe AccountingPointGridLocationQuality.CONFIRMED
                created.nominalVoltage shouldBeEqualComparingTo BigDecimal.valueOf(22.0)
            }

            // RLS: APGL-COM001
            test("can update a grid location, which archives the previous revision in the history") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val location = seed { insertGridLocationAt(insertAccountingPoint()) }

                val updated = api.patch(
                    "/accounting_point_grid_location/$location",
                    fiso.token(),
                    AccountingPointGridLocationUpdateRequest(quality = AccountingPointGridLocationQuality.GUESSED),
                )
                updated.status shouldBe HttpStatusCode.OK
                updated.body<AccountingPointGridLocationResponse>().quality shouldBe AccountingPointGridLocationQuality.GUESSED

                val list = api.get(
                    "/accounting_point_grid_location_history",
                    fiso.token(),
                    "accounting_point_grid_location_id" to "eq.$location",
                    "replaced_at" to "not.is.null",
                )
                list.status shouldBe HttpStatusCode.OK
                val history = list.body<List<AccountingPointGridLocationHistoryResponse>>()
                history.shouldNotBeEmpty()
                history.forEach { it.replacedAt.shouldNotBeNull() }
                // the archived revision is the one from before the update
                history.map { it.quality }.toSet() shouldBe setOf(AccountingPointGridLocationQuality.CONFIRMED)

                val read = api.get("/accounting_point_grid_location_history/${history.first().id}", fiso.token())
                read.status shouldBe HttpStatusCode.OK
                read.body<AccountingPointGridLocationHistoryResponse>().accountingPointGridLocationId shouldBe location
            }
        }

        // RLS: APGL-SO001
        // The system operator is the CSO of an accounting point when it owns the metering grid area that the
        // accounting point is in.
        context("a system operator that is the CSO") {
            test("sees the grid locations in its area, and no others") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val own = seed { insertGridLocationAt(insertAccountingPointOwnedBy(so.partyId!!)) }
                val other = seed { insertGridLocationAt(insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO, "Other SO"))) }

                val list = api.get("/accounting_point_grid_location", so.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<AccountingPointGridLocationResponse>>().map { it.id } shouldBe listOf(own)

                api.get("/accounting_point_grid_location/$own", so.token()).status shouldBe HttpStatusCode.OK
                api.get("/accounting_point_grid_location/$other", so.token()).status shouldBe HIDDEN_BY_RLS
            }

            test("can update a grid location in its area, but not one outside it") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val own = seed { insertGridLocationAt(insertAccountingPointOwnedBy(so.partyId!!)) }
                val other = seed { insertGridLocationAt(insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO, "Other SO"))) }

                val updated = api.patch("/accounting_point_grid_location/$own", so.token(), AccountingPointGridLocationUpdateRequest(name = "Updated by SO"))
                updated.status shouldBe HttpStatusCode.OK
                updated.body<AccountingPointGridLocationResponse>().name shouldBe "Updated by SO"

                api.patch("/accounting_point_grid_location/$other", so.token(), AccountingPointGridLocationUpdateRequest(name = "Updated by SO"))
                    .status shouldBe HIDDEN_BY_RLS
            }

            test("can create a grid location in its area, but not one outside it") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val own = seed { insertAccountingPointOwnedBy(so.partyId!!) }
                val other = seed { insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO, "Other SO")) }
                val substation = seed { insertSubstation() }

                api.post("/accounting_point_grid_location", so.token(), createRequest(own, substation)).status shouldBe HttpStatusCode.Created
                api.post("/accounting_point_grid_location", so.token(), createRequest(other, substation)).status shouldBe HttpStatusCode.Forbidden
            }

            // RLS: APGL-COM001
            test("can read the archived revisions of a grid location in its area, but not of one outside it") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val own = seed { insertGridLocationAt(insertAccountingPointOwnedBy(so.partyId!!)) }
                val other = seed { insertGridLocationAt(insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO, "Other SO"))) }
                // the view of the history also lists the current rows, so archived revisions are needed
                seed {
                    renameGridLocation(own, "Renamed own")
                    renameGridLocation(other, "Renamed other")
                }

                val list = api.get("/accounting_point_grid_location_history", so.token(), "replaced_at" to "not.is.null")

                list.status shouldBe HttpStatusCode.OK
                list.body<List<AccountingPointGridLocationHistoryResponse>>().map { it.accountingPointGridLocationId } shouldBe listOf(own)
            }
        }

        // RLS: APGL-SO001
        // The system operator is a PSO, a procuring system operator, of an accounting point when a service providing
        // group with a controllable unit at the accounting point has a product application for it.
        context("a system operator that is a PSO") {
            test("sees and can update the grid location of the accounting point, but not one that is not linked to it") {
                val pso = seed { insertActor(TestPartyRole.SO) }
                val cso = seed { insertParty(TestPartyRole.SO, "CSO") }
                val procuredAccountingPoint = seed { insertAccountingPointOwnedBy(cso) }
                // The source of the location is so, as a system operator that is not the CSO can only update such a location
                val procured = seed { insertGridLocationAt(procuredAccountingPoint, AccountingPointGridLocationSource.SO) }
                val notProcured = seed { insertGridLocationAt(insertAccountingPointOwnedBy(cso)) }
                // the product application makes the SO a PSO of the accounting point
                // triggers off: only the linking rows are needed, see insertGroupWithControllableUnitAt
                seed(Triggers.OFF) {
                    val group = insertGroupWithControllableUnitAt(procuredAccountingPoint)
                    insertServiceProvidingGroupProductApplication(group, pso.partyId!!, listOf(insertProductType()))
                }

                val list = api.get("/accounting_point_grid_location", pso.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<AccountingPointGridLocationResponse>>().map { it.id } shouldBe listOf(procured)
                api.get("/accounting_point_grid_location/$procured", pso.token()).status shouldBe HttpStatusCode.OK
                api.get("/accounting_point_grid_location/$notProcured", pso.token()).status shouldBe HIDDEN_BY_RLS

                api.patch("/accounting_point_grid_location/$procured", pso.token(), AccountingPointGridLocationUpdateRequest(name = "Updated by PSO"))
                    .status shouldBe HttpStatusCode.OK
            }

            // RLS: APGL-COM001
            test("can read the archived revisions of the grid location of the accounting point") {
                val pso = seed { insertActor(TestPartyRole.SO) }
                val accountingPoint = seed { insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO, "CSO")) }
                val location = seed { insertGridLocationAt(accountingPoint) }
                // the product application makes the SO a PSO of the accounting point
                // triggers off: only the linking rows are needed, see insertGroupWithControllableUnitAt
                seed(Triggers.OFF) {
                    val group = insertGroupWithControllableUnitAt(accountingPoint)
                    insertServiceProvidingGroupProductApplication(group, pso.partyId!!, listOf(insertProductType()))
                }
                seed { renameGridLocation(location, "Renamed") }

                val list = api.get("/accounting_point_grid_location_history", pso.token(), "replaced_at" to "not.is.null")

                list.status shouldBe HttpStatusCode.OK
                list.body<List<AccountingPointGridLocationHistoryResponse>>().map { it.accountingPointGridLocationId } shouldBe listOf(location)
            }
        }

        // RLS: APGL-SO003
        // The system operator is an ISO, an impacted system operator, of an accounting point when a service providing
        // group with a controllable unit at the accounting point has a grid prequalification for it.
        context("a system operator that is an ISO") {
            test("sees the grid location of the accounting point, but not one that is not linked to it") {
                val iso = seed { insertActor(TestPartyRole.SO) }
                val cso = seed { insertParty(TestPartyRole.SO, "CSO") }
                val impactedAccountingPoint = seed { insertAccountingPointOwnedBy(cso) }
                val impacted = seed { insertGridLocationAt(impactedAccountingPoint) }
                val notImpacted = seed { insertGridLocationAt(insertAccountingPointOwnedBy(cso)) }
                // the grid prequalification makes the SO an ISO of the accounting point
                // triggers off: only the linking rows are needed, see insertGroupWithControllableUnitAt
                seed(Triggers.OFF) { insertGridPrequalification(insertGroupWithControllableUnitAt(impactedAccountingPoint), iso.partyId!!) }

                val list = api.get("/accounting_point_grid_location", iso.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<AccountingPointGridLocationResponse>>().map { it.id } shouldBe listOf(impacted)
                api.get("/accounting_point_grid_location/$impacted", iso.token()).status shouldBe HttpStatusCode.OK
                api.get("/accounting_point_grid_location/$notImpacted", iso.token()).status shouldBe HIDDEN_BY_RLS
            }

            test("does not see the grid location when the grid prequalification is inactive") {
                val iso = seed { insertActor(TestPartyRole.SO) }
                val accountingPoint = seed { insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO, "CSO")) }
                val location = seed { insertGridLocationAt(accountingPoint) }
                // the grid prequalification would make the SO an ISO of the accounting point, but it is inactive
                // triggers off: only the linking rows are needed, see insertGroupWithControllableUnitAt
                seed(Triggers.OFF) {
                    insertGridPrequalification(
                        insertGroupWithControllableUnitAt(accountingPoint),
                        iso.partyId!!,
                        ServiceProvidingGroupGridPrequalificationStatus.INACTIVE,
                    )
                }

                api.get("/accounting_point_grid_location/$location", iso.token()).status shouldBe HIDDEN_BY_RLS
            }

            // RLS: APGL-COM001
            test("can read the archived revisions of the grid location of the accounting point") {
                val iso = seed { insertActor(TestPartyRole.SO) }
                val accountingPoint = seed { insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO, "CSO")) }
                val location = seed { insertGridLocationAt(accountingPoint) }
                // the grid prequalification makes the SO an ISO of the accounting point
                // triggers off: only the linking rows are needed, see insertGroupWithControllableUnitAt
                seed(Triggers.OFF) { insertGridPrequalification(insertGroupWithControllableUnitAt(accountingPoint), iso.partyId!!) }
                seed { renameGridLocation(location, "Renamed") }

                val list = api.get("/accounting_point_grid_location_history", iso.token(), "replaced_at" to "not.is.null")

                list.status shouldBe HttpStatusCode.OK
                list.body<List<AccountingPointGridLocationHistoryResponse>>().map { it.accountingPointGridLocationId } shouldBe listOf(location)
            }

            // APGL-SO003 only gives read access
            test("cannot update the grid location of the accounting point") {
                val iso = seed { insertActor(TestPartyRole.SO) }
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val accountingPoint = seed { insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO, "CSO")) }
                val location = seed { insertGridLocationAt(accountingPoint) }
                seed { renameGridLocation(location, "Original name") }
                // the grid prequalification makes the SO an ISO of the accounting point
                // triggers off: only the linking rows are needed, see insertGroupWithControllableUnitAt
                seed(Triggers.OFF) { insertGridPrequalification(insertGroupWithControllableUnitAt(accountingPoint), iso.partyId!!) }

                val response = api.patch(
                    "/accounting_point_grid_location/$location",
                    iso.token(),
                    AccountingPointGridLocationUpdateRequest(name = "Updated by ISO"),
                )

                response.status shouldBe HIDDEN_BY_RLS
                val unchanged = api.get("/accounting_point_grid_location/$location", fiso.token())
                unchanged.body<AccountingPointGridLocationResponse>().name shouldBe "Original name"
            }
        }

        // These roles have no policy on the grid locations and no grant on their history, so they are denied also
        // for an accounting point that they are related to.
        for (role in TestPartyRole.rolesWithDataGrants - TestPartyRole.FISO - TestPartyRole.SO) {
            test("${role.type} cannot list grid locations or their history") {
                val actor = seed { insertActor(role) }
                seed { insertGridLocationAt(insertAccountingPointRelatedTo(actor, role)) }

                api.get("/accounting_point_grid_location", actor.token()).status shouldBe HttpStatusCode.Forbidden
                api.get("/accounting_point_grid_location_history", actor.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // The organisation inherits flex_common, but the views have no grant for its role.
        test("an organisation cannot list grid locations or their history") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get("/accounting_point_grid_location", org.token()).status shouldBe HttpStatusCode.Forbidden
            api.get("/accounting_point_grid_location_history", org.token()).status shouldBe HttpStatusCode.Forbidden
        }

        // The source is set by the database, and the API has no grant to write it, so even a valid value is denied.
        test("a FISO cannot update the source of a grid location") {
            val fiso = seed { insertActor(TestPartyRole.FISO) }
            val location = seed { insertGridLocationAt(insertAccountingPoint()) }

            api.patch("/accounting_point_grid_location/$location", fiso.token(), JsonObject(mapOf("source" to JsonPrimitive("so"))))
                .status shouldBe HttpStatusCode.Forbidden
        }

        // Validation
        //
        // A FISO makes the changes, as it can reach every accounting point. The invalid values for the enums are sent
        // in an update, as a typed request cannot hold them, to a grid location that is valid.
        context("validation") {
            // APGL-VAL003
            test("rejects a confirmed location with a nominal voltage of zero") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val (accountingPoint, substation) = seed { insertAccountingPoint() to insertSubstation() }

                api.post("/accounting_point_grid_location", fiso.token(), createRequest(accountingPoint, substation, nominalVoltage = 0.0))
                    .status shouldBe HttpStatusCode.BadRequest
            }

            test("rejects a negative nominal voltage") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val (accountingPoint, substation) = seed { insertAccountingPoint() to insertSubstation() }

                api.post("/accounting_point_grid_location", fiso.token(), createRequest(accountingPoint, substation, nominalVoltage = -1.0))
                    .status shouldBe HttpStatusCode.BadRequest
            }

            test("rejects a name of more than 512 characters") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val (accountingPoint, substation) = seed { insertAccountingPoint() to insertSubstation() }

                api.post("/accounting_point_grid_location", fiso.token(), createRequest(accountingPoint, substation, name = "x".repeat(513)))
                    .status shouldBe HttpStatusCode.BadRequest
            }

            test("rejects a business ID that is not a substation") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val accountingPoint = seed { insertAccountingPoint() }

                // a well-formed UUID that no substation has
                api.post("/accounting_point_grid_location", fiso.token(), createRequest(accountingPoint, UUID.randomUUID()))
                    .status shouldBe HttpStatusCode.BadRequest
            }

            val invalidUpdates = mapOf(
                "an unknown object type" to JsonObject(mapOf("object_type" to JsonPrimitive("invalid_type"))),
                "an unknown quality" to JsonObject(mapOf("quality" to JsonPrimitive("invalid_quality"))),
                "no business ID" to JsonObject(mapOf("business_id" to JsonNull)),
            )
            for ((description, update) in invalidUpdates) {
                test("rejects an update with $description") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }
                    val location = seed { insertGridLocationAt(insertAccountingPoint()) }

                    api.patch("/accounting_point_grid_location/$location", fiso.token(), update).status shouldBe HttpStatusCode.BadRequest
                }
            }
        }
    })
