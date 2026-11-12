package no.elhub.flex.api.accountingpoint

import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.api.model.dto.generated.models.AccountingPointEnergySupplierResponse
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.osloMidnight
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token
import kotlin.time.toJavaInstant

class AccountingPointEnergySupplierApiTest :
    ApiSpec({
        beforeEach { truncate("flex.accounting_point", "flex.metering_grid_area", "flex.party", "flex.entity") }

        // RLS: APES-FISO001
        test("a FISO can list the energy suppliers of all accounting points") {
            val fiso = seed { insertActor(TestPartyRole.FISO) }
            val accountingPoints = seed {
                val energySupplier = insertParty(TestPartyRole.ES)
                List(2) { insertAccountingPoint().also { insertAccountingPointEnergySupplier(it, energySupplier) } }
            }

            val response = api.get("/accounting_point_energy_supplier", fiso.token())

            response.status shouldBe HttpStatusCode.OK
            response.body<List<AccountingPointEnergySupplierResponse>>().map { it.accountingPointId }.toSet() shouldBe
                accountingPoints.toSet()
        }

        // RLS: APES-SO001
        context("a system operator") {
            test("sees the energy suppliers of the accounting points in its metering grid area, and no others") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val inArea = seed {
                    val energySupplier = insertParty(TestPartyRole.ES)
                    val ownArea = insertMeteringGridArea("Own area")
                    val otherArea = insertMeteringGridArea("Other area")
                    insertMeteringGridAreaSystemOperator(ownArea, so.partyId!!)
                    insertMeteringGridAreaSystemOperator(otherArea, insertParty(TestPartyRole.SO, "Other SO"))
                    val inArea = insertAccountingPoint()
                    val outsideArea = insertAccountingPoint()
                    insertAccountingPointMeteringGridArea(inArea, ownArea)
                    insertAccountingPointMeteringGridArea(outsideArea, otherArea)
                    insertAccountingPointEnergySupplier(inArea, energySupplier)
                    insertAccountingPointEnergySupplier(outsideArea, energySupplier)
                    inArea
                }

                val visible = api.get("/accounting_point_energy_supplier", so.token())
                    .body<List<AccountingPointEnergySupplierResponse>>()

                visible.map { it.accountingPointId } shouldBe listOf(inArea)
            }

            test("sees the energy supplier only while it is the system operator of the accounting point") {
                val so = seed { insertActor(TestPartyRole.SO) }
                seed {
                    val area = insertMeteringGridArea()
                    insertMeteringGridAreaSystemOperator(area, so.partyId!!, osloMidnight("2024-06-01"))
                    val accountingPoint = insertAccountingPoint()
                    insertAccountingPointMeteringGridArea(accountingPoint, area)
                    insertAccountingPointEnergySupplier(accountingPoint, insertParty(TestPartyRole.ES))
                }

                val visible = api.get("/accounting_point_energy_supplier", so.token())
                    .body<List<AccountingPointEnergySupplierResponse>>()

                visible.single().validFrom?.toJavaInstant() shouldBe osloMidnight("2024-06-01")
                visible.single().validTo shouldBe null
            }
        }

        // The other roles have no row level access, also not when they are related to the accounting point.
        for (role in TestPartyRole.rolesWithDataGrants - TestPartyRole.FISO - TestPartyRole.SO) {
            test("${role.type} sees no energy suppliers of accounting points") {
                val actor = seed { insertActor(role) }
                seed { insertAccountingPointRelatedTo(actor, role) }

                val response = api.get("/accounting_point_energy_supplier", actor.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<AccountingPointEnergySupplierResponse>>() shouldBe emptyList()
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the energy suppliers of accounting points") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get("/accounting_point_energy_supplier", org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
