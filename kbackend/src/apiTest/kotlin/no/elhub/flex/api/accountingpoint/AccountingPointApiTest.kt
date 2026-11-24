package no.elhub.flex.api.accountingpoint

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.AccountingPointResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupGridPrequalificationStatus
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.osloMidnight
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token
import java.time.Instant

/**
 * The view only lists accounting points that currently have a system operator, which is the owner of the metering
 * grid area they are in. Every accounting point in these tests is therefore in an area with an owner.
 */
class AccountingPointApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.accounting_point",
                "flex.metering_grid_area",
                "flex.service_providing_group",
                "flex.product_type",
                "flex.party",
                "flex.entity",
            )
        }

        test("an anonymous caller cannot list accounting points") {
            api.get("/accounting_point", token = null).status shouldBe HttpStatusCode.Unauthorized
        }

        // RLS: AP-FISO001
        test("a FISO can list and read all accounting points") {
            val fiso = seed { insertActor(TestPartyRole.FISO) }
            val accountingPoints = seed {
                val systemOperator = insertParty(TestPartyRole.SO)
                List(2) { insertAccountingPointOwnedBy(systemOperator) }
            }

            val list = api.get("/accounting_point", fiso.token())
            list.status shouldBe HttpStatusCode.OK
            list.body<List<AccountingPointResponse>>().map { it.id } shouldContainExactlyInAnyOrder accountingPoints

            val read = api.get("/accounting_point/${accountingPoints.first()}", fiso.token())
            read.status shouldBe HttpStatusCode.OK
            read.body<AccountingPointResponse>().id shouldBe accountingPoints.first()
        }

        context("a system operator") {
            // RLS: AP-SO001
            // The system operator is the CSO of an accounting point when it owns the metering grid area that the
            // accounting point is in.
            test("sees the accounting points in the metering grid area that it owns, and no others") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val (own, other) = seed {
                    insertAccountingPointOwnedBy(so.partyId!!) to insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO, "Other SO"))
                }

                val list = api.get("/accounting_point", so.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<AccountingPointResponse>>().map { it.id } shouldBe listOf(own)

                api.get("/accounting_point/$own", so.token()).status shouldBe HttpStatusCode.OK
                api.get("/accounting_point/$other", so.token()).status shouldBe HIDDEN_BY_RLS
            }

            // RLS: AP-SO001
            test("no longer sees an accounting point when the ownership of its metering grid area has ended") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val accountingPoint = seed {
                    val area = insertMeteringGridArea()
                    // the area is owned by the SO until 2024-06-01 and by another SO after that, which is the owner now
                    insertMeteringGridAreaSystemOperator(area, so.partyId!!, osloMidnight("2024-01-01"), osloMidnight("2024-06-01"))
                    insertMeteringGridAreaSystemOperator(area, insertParty(TestPartyRole.SO, "New owner"), osloMidnight("2024-06-01"))
                    insertAccountingPoint().also { insertAccountingPointMeteringGridArea(it, area) }
                }

                api.get("/accounting_point/$accountingPoint", so.token()).status shouldBe HIDDEN_BY_RLS
            }

            // RLS: AP-SO002
            // The system operator is an ISO, an impacted system operator, of an accounting point when a service providing
            // group with a controllable unit at the accounting point has a grid prequalification for it.
            context("that is an impacted system operator") {
                test("sees the accounting point, but not one that is not linked to it") {
                    val iso = seed { insertActor(TestPartyRole.SO) }
                    val cso = seed { insertParty(TestPartyRole.SO, "CSO") }
                    val impacted = seed { insertAccountingPointOwnedBy(cso) }
                    val notImpacted = seed { insertAccountingPointOwnedBy(cso) }
                    // the grid prequalification makes the SO an ISO of the accounting point
                    // triggers off: only the linking rows are needed, see insertGroupWithControllableUnitAt
                    seed(Triggers.OFF) { insertGridPrequalification(insertGroupWithControllableUnitAt(impacted), iso.partyId!!) }

                    api.get("/accounting_point", iso.token()).body<List<AccountingPointResponse>>().map { it.id } shouldBe listOf(impacted)
                    api.get("/accounting_point/$impacted", iso.token()).status shouldBe HttpStatusCode.OK
                    api.get("/accounting_point/$notImpacted", iso.token()).status shouldBe HIDDEN_BY_RLS
                }

                test("does not see the accounting point when the grid prequalification is inactive") {
                    val iso = seed { insertActor(TestPartyRole.SO) }
                    val accountingPoint = seed { insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO, "CSO")) }
                    // the grid prequalification would make the SO an ISO of the accounting point, but it is inactive
                    // triggers off: only the linking rows are needed, see insertGroupWithControllableUnitAt
                    seed(Triggers.OFF) {
                        insertGridPrequalification(
                            insertGroupWithControllableUnitAt(accountingPoint),
                            iso.partyId!!,
                            ServiceProvidingGroupGridPrequalificationStatus.INACTIVE,
                        )
                    }

                    api.get("/accounting_point/$accountingPoint", iso.token()).status shouldBe HIDDEN_BY_RLS
                }
            }

            // RLS: AP-SO003
            // The system operator is a PSO, a procuring system operator, of an accounting point when a service providing
            // group with a controllable unit at the accounting point has a product application for it.
            test("that is a procuring system operator sees the accounting point, but not one that is not linked to it") {
                val pso = seed { insertActor(TestPartyRole.SO) }
                val cso = seed { insertParty(TestPartyRole.SO, "CSO") }
                val procured = seed { insertAccountingPointOwnedBy(cso) }
                val notProcured = seed { insertAccountingPointOwnedBy(cso) }
                // the product application makes the SO a PSO of the accounting point
                // triggers off: only the linking rows are needed, see insertGroupWithControllableUnitAt
                seed(Triggers.OFF) {
                    val group = insertGroupWithControllableUnitAt(procured)
                    insertServiceProvidingGroupProductApplication(group, pso.partyId!!, listOf(insertProductType()))
                }

                api.get("/accounting_point", pso.token()).body<List<AccountingPointResponse>>().map { it.id } shouldBe listOf(procured)
                api.get("/accounting_point/$procured", pso.token()).status shouldBe HttpStatusCode.OK
                api.get("/accounting_point/$notProcured", pso.token()).status shouldBe HIDDEN_BY_RLS
            }
        }

        context("a service provider") {
            // RLS: AP-SP001
            test("sees the accounting points where it has a contract on a controllable unit, and no others") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val (contracted, other) = seed {
                    val cso = insertParty(TestPartyRole.SO)
                    val contracted = insertAccountingPointOwnedBy(cso)
                    insertContract(contracted, sp.partyId!!)
                    // another service provider has the contract on this one
                    val other = insertAccountingPointOwnedBy(cso)
                    insertContract(other, insertParty(TestPartyRole.SP, "Other SP"))
                    contracted to other
                }

                api.get("/accounting_point", sp.token()).body<List<AccountingPointResponse>>().map { it.id } shouldBe listOf(contracted)
                api.get("/accounting_point/$contracted", sp.token()).status shouldBe HttpStatusCode.OK
                api.get("/accounting_point/$other", sp.token()).status shouldBe HIDDEN_BY_RLS
            }

            // RLS: AP-SP001
            // The link is kept when the contract ends, so a former service provider can still see the accounting point
            // of the controllable units that it had.
            test("that had a contract that has ended still sees the accounting point") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val accountingPoint = seed {
                    insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO)).also {
                        insertContract(it, sp.partyId!!, validFrom = osloMidnight("2024-07-01"), validTo = osloMidnight("2024-08-01"))
                    }
                }

                api.get("/accounting_point/$accountingPoint", sp.token()).status shouldBe HttpStatusCode.OK
                api.get("/accounting_point", sp.token()).body<List<AccountingPointResponse>>().map { it.id } shouldBe listOf(accountingPoint)
            }
        }

        context("a balance responsible party") {
            // RLS: AP-BRP001
            // The balance responsible party of an accounting point is the one of its energy supplier in the area.
            test("sees the accounting points where it is currently the balance responsible party, and no others") {
                val brp = seed { insertActor(TestPartyRole.BRP) }
                val (current, ended) = seed {
                    val energySupplier = insertParty(TestPartyRole.ES)

                    // The accounting point where the BRP is responsible for the energy supplier of the area, from 2024-01-01
                    val area = insertMeteringGridArea("Current area")
                    insertMeteringGridAreaSystemOperator(area, insertParty(TestPartyRole.SO))
                    val current = insertAccountingPoint()
                    insertAccountingPointMeteringGridArea(current, area)
                    insertAccountingPointEnergySupplier(current, energySupplier)
                    insertEnergySupplierBalanceResponsibility(area, energySupplier, brp.partyId!!)

                    // The accounting point where the BRP was responsible until 2024-06-01
                    val endedArea = insertMeteringGridArea("Ended area")
                    insertMeteringGridAreaSystemOperator(endedArea, insertParty(TestPartyRole.SO, "Other SO"))
                    val ended = insertAccountingPoint()
                    insertAccountingPointMeteringGridArea(ended, endedArea)
                    insertAccountingPointEnergySupplier(ended, energySupplier)
                    insertEnergySupplierBalanceResponsibility(
                        endedArea,
                        energySupplier,
                        brp.partyId!!,
                        validFrom = osloMidnight("2024-01-01"),
                        validTo = osloMidnight("2024-06-01"),
                    )
                    current to ended
                }

                api.get("/accounting_point", brp.token()).body<List<AccountingPointResponse>>().map { it.id } shouldBe listOf(current)
                api.get("/accounting_point/$current", brp.token()).status shouldBe HttpStatusCode.OK
                api.get("/accounting_point/$ended", brp.token()).status shouldBe HIDDEN_BY_RLS
            }
        }

        // These roles have no grant on the accounting points, so they are denied also for an accounting point that
        // they are related to.
        for (role in TestPartyRole.rolesWithDataGrants - TestPartyRole.FISO - TestPartyRole.SO - TestPartyRole.SP - TestPartyRole.BRP) {
            test("${role.type} cannot list accounting points") {
                val actor = seed { insertActor(role) }
                seed { insertAccountingPointRelatedTo(actor, role) }

                api.get("/accounting_point", actor.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list accounting points") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get("/accounting_point", org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })

/** A contract that makes the service provider the provider of a new controllable unit at the accounting point. */
private fun SeedScope.insertContract(
    accountingPoint: Long,
    serviceProvider: Long,
    validFrom: Instant = osloMidnight("2024-01-01"),
    validTo: Instant? = null,
) {
    // A contract requires that the end user owns the accounting point
    val endUser = insertParty(TestPartyRole.EU)
    insertAccountingPointEndUser(accountingPoint, endUser)
    insertControllableUnitServiceProvider(insertControllableUnit(accountingPoint), serviceProvider, endUser, validFrom = validFrom, validTo = validTo)
}
