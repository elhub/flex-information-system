package no.elhub.flex.api.accountingpoint

import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.api.model.dto.generated.models.AccountingPointBiddingZoneBiddingZone
import no.elhub.flex.api.model.dto.generated.models.AccountingPointBiddingZoneResponse
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.osloMidnight
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token
import kotlin.time.toJavaInstant

class AccountingPointBiddingZoneApiTest :
    ApiSpec({
        beforeEach { truncate("flex.accounting_point", "flex.metering_grid_area", "flex.party", "flex.entity") }

        // RLS: APBZ-FISO001
        test("a FISO can list the bidding zones of all accounting points") {
            val fiso = seed { insertActor(TestPartyRole.FISO) }
            val accountingPoints = seed {
                val area = insertMeteringGridArea()
                insertMeteringGridAreaPriceArea(area, "NO3")
                List(2) { insertAccountingPoint().also { insertAccountingPointMeteringGridArea(it, area) } }
            }

            val response = api.get("/accounting_point_bidding_zone", fiso.token())

            response.status shouldBe HttpStatusCode.OK
            val rows = response.body<List<AccountingPointBiddingZoneResponse>>()
            rows.map { it.accountingPointId }.toSet() shouldBe accountingPoints.toSet()
            rows.map { it.biddingZone }.toSet() shouldBe setOf(AccountingPointBiddingZoneBiddingZone.NO3)
        }

        // RLS: APBZ-SO001
        test("a system operator sees the bidding zones of the accounting points in its metering grid area, and no others") {
            val so = seed { insertActor(TestPartyRole.SO) }
            val inArea = seed {
                val ownArea = insertMeteringGridArea("Own area")
                val otherArea = insertMeteringGridArea("Other area")
                insertMeteringGridAreaPriceArea(ownArea)
                insertMeteringGridAreaPriceArea(otherArea)
                insertMeteringGridAreaSystemOperator(ownArea, so.partyId!!)
                insertMeteringGridAreaSystemOperator(otherArea, insertParty(TestPartyRole.SO, "Other SO"))
                val inArea = insertAccountingPoint()
                val outsideArea = insertAccountingPoint()
                insertAccountingPointMeteringGridArea(inArea, ownArea)
                insertAccountingPointMeteringGridArea(outsideArea, otherArea)
                inArea
            }

            val visible = api.get("/accounting_point_bidding_zone", so.token()).body<List<AccountingPointBiddingZoneResponse>>()

            visible.map { it.accountingPointId } shouldBe listOf(inArea)
        }

        // RLS: APBZ-SP001
        // A service provider sees the bidding zone of an accounting point, but only for the periods in which it has a
        // contract on a controllable unit at that accounting point.
        context("a service provider") {
            test("sees the bidding zone only for the periods of its contracts") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                seed {
                    // the bidding zone of the accounting point is that of its metering grid area, NO3 the whole time
                    val area = insertMeteringGridArea()
                    insertMeteringGridAreaPriceArea(area, "NO3", osloMidnight("2023-10-01"))
                    val accountingPoint = insertAccountingPoint()
                    insertAccountingPointMeteringGridArea(accountingPoint, area, osloMidnight("2024-01-01"))
                    val controllableUnit = insertControllableUnit(accountingPoint)
                    val endUser = insertParty(TestPartyRole.EU)
                    insertAccountingPointEndUser(accountingPoint, endUser)
                    // The service provider has a contract on a controllable unit at the accounting point in July, none
                    // in August and then one from September on. A contract requires that the end user owns the
                    // accounting point.
                    insertControllableUnitServiceProvider(
                        controllableUnit,
                        sp.partyId!!,
                        endUser,
                        validFrom = osloMidnight("2024-07-01"),
                        validTo = osloMidnight("2024-08-01"),
                    )
                    insertControllableUnitServiceProvider(
                        controllableUnit,
                        sp.partyId!!,
                        endUser,
                        validFrom = osloMidnight("2024-09-01"),
                    )
                }

                val visible = api.get("/accounting_point_bidding_zone", sp.token())
                    .body<List<AccountingPointBiddingZoneResponse>>()
                    .sortedBy { it.validFrom }

                // The bidding zone is visible in July and from September on, but not in August when there is no contract.
                visible.map { it.validFrom?.toJavaInstant() to it.validTo?.toJavaInstant() } shouldBe listOf(
                    osloMidnight("2024-07-01") to osloMidnight("2024-08-01"),
                    osloMidnight("2024-09-01") to null,
                )
                visible.map { it.biddingZone }.toSet() shouldBe setOf(AccountingPointBiddingZoneBiddingZone.NO3)
            }

            test("sees nothing when another service provider has the contract at the accounting point") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                seed {
                    val area = insertMeteringGridArea()
                    insertMeteringGridAreaPriceArea(area)
                    val accountingPoint = insertAccountingPoint()
                    insertAccountingPointMeteringGridArea(accountingPoint, area)
                    val endUser = insertParty(TestPartyRole.EU)
                    insertAccountingPointEndUser(accountingPoint, endUser)
                    insertControllableUnitServiceProvider(
                        insertControllableUnit(accountingPoint),
                        insertParty(TestPartyRole.SP, "Other SP"),
                        endUser,
                    )
                }

                api.get("/accounting_point_bidding_zone", sp.token()).body<List<AccountingPointBiddingZoneResponse>>() shouldBe emptyList()
            }
        }

        // The other roles have no row level access, also not when they are related to the accounting point.
        for (role in TestPartyRole.rolesWithDataGrants - TestPartyRole.FISO - TestPartyRole.SO - TestPartyRole.SP) {
            test("${role.type} sees no bidding zones of accounting points") {
                val actor = seed { insertActor(role) }
                seed { insertAccountingPointRelatedTo(actor, role) }

                val response = api.get("/accounting_point_bidding_zone", actor.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<AccountingPointBiddingZoneResponse>>() shouldBe emptyList()
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the bidding zones of accounting points") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get("/accounting_point_bidding_zone", org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
