package no.elhub.flex.api.accountingpoint

import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.api.model.dto.generated.models.AccountingPointBalanceResponsiblePartyEnergyDirection
import no.elhub.flex.api.model.dto.generated.models.AccountingPointBalanceResponsiblePartyResponse
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.osloMidnight
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import kotlin.time.toJavaInstant

/**
 * Puts the accounting point in the metering grid area and gives it a new energy supplier, and returns that supplier.
 * The accounting point's balance responsible party is not stored anywhere: it follows from the energy supplier's
 * balance responsibility in the area, which is seeded with [SeedScope.insertEnergySupplierBalanceResponsibility].
 */
private fun SeedScope.insertEnergySupplierFor(accountingPoint: Long, meteringGridArea: Long): Long {
    val energySupplier = insertParty(TestPartyRole.ES)
    insertAccountingPointMeteringGridArea(accountingPoint, meteringGridArea)
    insertAccountingPointEnergySupplier(accountingPoint, energySupplier)
    return energySupplier
}

/** Midnight in Oslo, [days] days from today. */
private fun inDays(days: Long): Instant = osloMidnight(LocalDate.now(ZoneId.of("Europe/Oslo")).plusDays(days).toString())

private val jan1 = osloMidnight("2024-01-01")
private val jul1 = osloMidnight("2024-07-01")
private val jul20 = osloMidnight("2024-07-20")
private val aug1 = osloMidnight("2024-08-01")
private val sep1 = osloMidnight("2024-09-01")
private val sep10 = osloMidnight("2024-09-10")

class AccountingPointBalanceResponsiblePartyApiTest :
    ApiSpec({
        beforeEach { truncate("flex.accounting_point", "flex.metering_grid_area", "flex.party", "flex.entity") }

        // RLS: APBRP-FISO001
        // A FISO sees all rows, without any clipping.
        test("a FISO can list the balance responsible parties of all accounting points") {
            val fiso = seed { insertActor(TestPartyRole.FISO) }
            val (accountingPoint, balanceResponsibleParty) = seed {
                val area = insertMeteringGridArea()
                val accountingPoint = insertAccountingPoint()
                val energySupplier = insertEnergySupplierFor(accountingPoint, area)
                val balanceResponsibleParty = insertParty(TestPartyRole.BRP)
                insertEnergySupplierBalanceResponsibility(area, energySupplier, balanceResponsibleParty)
                accountingPoint to balanceResponsibleParty
            }

            val response = api.get("/accounting_point_balance_responsible_party", fiso.token())

            response.status shouldBe HttpStatusCode.OK
            val row = response.body<List<AccountingPointBalanceResponsiblePartyResponse>>().single()
            row.accountingPointId shouldBe accountingPoint
            row.balanceResponsiblePartyId shouldBe balanceResponsibleParty
            row.energyDirection shouldBe AccountingPointBalanceResponsiblePartyEnergyDirection.PRODUCTION
        }

        // RLS: APBRP-SO001
        // A system operator sees the rows of the accounting points that are in a metering grid area it owns.
        test("a system operator sees the balance responsible parties of the accounting points in its metering grid area, and no others") {
            val so = seed { insertActor(TestPartyRole.SO) }
            val inArea = seed {
                // two areas with an accounting point each: one owned by the system operator, one by another
                val ownArea = insertMeteringGridArea("Own area")
                val otherArea = insertMeteringGridArea("Other area")
                insertMeteringGridAreaSystemOperator(ownArea, so.partyId!!)
                insertMeteringGridAreaSystemOperator(otherArea, insertParty(TestPartyRole.SO, "Other SO"))
                val inArea = insertAccountingPoint()
                val outsideArea = insertAccountingPoint()
                insertEnergySupplierBalanceResponsibility(ownArea, insertEnergySupplierFor(inArea, ownArea), insertParty(TestPartyRole.BRP))
                insertEnergySupplierBalanceResponsibility(
                    otherArea,
                    insertEnergySupplierFor(outsideArea, otherArea),
                    insertParty(TestPartyRole.BRP),
                )
                inArea
            }

            val visible = api.get("/accounting_point_balance_responsible_party", so.token())
                .body<List<AccountingPointBalanceResponsiblePartyResponse>>()

            visible.map { it.accountingPointId } shouldBe listOf(inArea)
        }

        // RLS: APBRP-BRP001
        // A balance responsible party sees the rows where it is the balance responsible party.
        test("a balance responsible party sees the rows where it is the balance responsible party, and no others") {
            val brp = seed { insertActor(TestPartyRole.BRP) }
            val ownAccountingPoint = seed {
                val area = insertMeteringGridArea()
                val ownAccountingPoint = insertAccountingPoint()
                val otherAccountingPoint = insertAccountingPoint()
                insertEnergySupplierBalanceResponsibility(area, insertEnergySupplierFor(ownAccountingPoint, area), brp.partyId!!)
                insertEnergySupplierBalanceResponsibility(
                    area,
                    insertEnergySupplierFor(otherAccountingPoint, area),
                    insertParty(TestPartyRole.BRP, "Other BRP"),
                )
                ownAccountingPoint
            }

            val visible = api.get("/accounting_point_balance_responsible_party", brp.token())
                .body<List<AccountingPointBalanceResponsiblePartyResponse>>()

            visible.map { it.accountingPointId to it.balanceResponsiblePartyId } shouldBe listOf(ownAccountingPoint to brp.partyId)
        }

        // RLS: APBRP-SP001
        // A service provider sees the balance responsible parties of an accounting point, but only for the periods in
        // which it has a contract on a controllable unit at that accounting point.
        context("a service provider") {
            test("sees the balance responsible parties only for the periods of its contracts") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val (brp1, brp2) = seed {
                    val area = insertMeteringGridArea()
                    val accountingPoint = insertAccountingPoint()
                    val energySupplier = insertEnergySupplierFor(accountingPoint, area)
                    val brp1 = insertParty(TestPartyRole.BRP, "BRP 1")
                    val brp2 = insertParty(TestPartyRole.BRP, "BRP 2")

                    // The balance responsibility of the energy supplier in the area: BRP 1, then BRP 2, then BRP 1 again.
                    insertEnergySupplierBalanceResponsibility(
                        area,
                        energySupplier,
                        brp1,
                        validFrom = jan1,
                        validTo = jul20,
                    )
                    insertEnergySupplierBalanceResponsibility(area, energySupplier, brp2, validFrom = jul20, validTo = sep10)
                    insertEnergySupplierBalanceResponsibility(area, energySupplier, brp1, validFrom = sep10)

                    // The service provider has a contract on a controllable unit at the accounting point in July, none
                    // in August and then one from September on. A contract requires that the end user owns the
                    // accounting point.
                    val controllableUnit = insertControllableUnit(accountingPoint)
                    val endUser = insertParty(TestPartyRole.EU)
                    insertAccountingPointEndUser(accountingPoint, endUser)
                    insertControllableUnitServiceProvider(controllableUnit, sp.partyId!!, endUser, validFrom = jul1, validTo = aug1)
                    insertControllableUnitServiceProvider(controllableUnit, sp.partyId!!, endUser, validFrom = sep1)
                    brp1 to brp2
                }

                val visible = api.get("/accounting_point_balance_responsible_party", sp.token())
                    .body<List<AccountingPointBalanceResponsiblePartyResponse>>()
                    .sortedBy { it.validFrom }

                // The service provider is blind in August, and sees nothing from before its first contract:
                //
                //                Jan 1     Jul 1     Jul 20    Aug 1     Sep 1     Sep 10
                // balance resp.  | BRP 1 ------------| BRP 2 ----------------------| BRP 1 ------->
                // SP contracts             | contract 1 =======|         | contract 2 ============>
                // SP sees                  | BRP 1 --| BRP 2 --|         | BRP 2 --| BRP 1 ------->
                //
                // BRP 2 is split in two rows by the gap in the contracts.
                visible.map { Triple(it.balanceResponsiblePartyId, it.validFrom?.toJavaInstant(), it.validTo?.toJavaInstant()) } shouldBe
                    listOf(
                        Triple(brp1, jul1, jul20),
                        Triple(brp2, jul20, aug1),
                        Triple(brp2, sep1, sep10),
                        Triple(brp1, sep10, null),
                    )
            }

            // The service provider does not see further ahead than two weeks from now.
            test("does not see a balance responsibility that starts more than two weeks ahead, and sees no end beyond that") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val brp1 = seed {
                    val area = insertMeteringGridArea()
                    val accountingPoint = insertAccountingPoint()
                    val energySupplier = insertEnergySupplierFor(accountingPoint, area)
                    val brp1 = insertParty(TestPartyRole.BRP, "BRP 1")
                    val brp2 = insertParty(TestPartyRole.BRP, "BRP 2")

                    // BRP 1 is balance responsible until 30 days from now, and BRP 2 after that.
                    insertEnergySupplierBalanceResponsibility(area, energySupplier, brp1, validFrom = jan1, validTo = inDays(30))
                    insertEnergySupplierBalanceResponsibility(area, energySupplier, brp2, validFrom = inDays(30))

                    val endUser = insertParty(TestPartyRole.EU)
                    insertAccountingPointEndUser(accountingPoint, endUser)
                    insertControllableUnitServiceProvider(insertControllableUnit(accountingPoint), sp.partyId!!, endUser, validFrom = jan1)
                    brp1
                }

                val visible = api.get("/accounting_point_balance_responsible_party", sp.token())
                    .body<List<AccountingPointBalanceResponsiblePartyResponse>>()

                // BRP 2 starts beyond the window, so it is not shown. BRP 1 ends beyond the window, so its end is not shown.
                visible.map { Triple(it.balanceResponsiblePartyId, it.validFrom?.toJavaInstant(), it.validTo) } shouldBe
                    listOf(Triple(brp1, jan1, null))
            }

            test("sees nothing when another service provider has the contract at the accounting point") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                seed {
                    val area = insertMeteringGridArea()
                    val accountingPoint = insertAccountingPoint()
                    insertEnergySupplierBalanceResponsibility(
                        area,
                        insertEnergySupplierFor(accountingPoint, area),
                        insertParty(TestPartyRole.BRP),
                    )
                    val endUser = insertParty(TestPartyRole.EU)
                    insertAccountingPointEndUser(accountingPoint, endUser)
                    insertControllableUnitServiceProvider(
                        insertControllableUnit(accountingPoint),
                        insertParty(TestPartyRole.SP, "Other SP"),
                        endUser,
                    )
                }

                api.get("/accounting_point_balance_responsible_party", sp.token())
                    .body<List<AccountingPointBalanceResponsiblePartyResponse>>() shouldBe emptyList()
            }
        }

        // The other roles have no row level access, also not when they are related to the accounting point.
        for (role in TestPartyRole.rolesWithDataGrants - TestPartyRole.FISO - TestPartyRole.SO - TestPartyRole.SP - TestPartyRole.BRP) {
            test("${role.type} sees no balance responsible parties of accounting points") {
                val actor = seed { insertActor(role) }
                seed { insertAccountingPointRelatedTo(actor, role) }

                val response = api.get("/accounting_point_balance_responsible_party", actor.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<AccountingPointBalanceResponsiblePartyResponse>>() shouldBe emptyList()
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the balance responsible parties of accounting points") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get("/accounting_point_balance_responsible_party", org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
