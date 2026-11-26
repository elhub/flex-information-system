package no.elhub.flex.api.accountingpoint

import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.api.model.dto.generated.models.AccountingPointMeteringGridAreaResponse
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

class AccountingPointMeteringGridAreaApiTest :
    ApiSpec({
        beforeEach { truncate("flex.accounting_point", "flex.metering_grid_area", "flex.party", "flex.entity") }

        // RLS: APMGA-FISO001
        test("a FISO can list the metering grid areas of the accounting points") {
            val fiso = seed { insertActor(TestPartyRole.FISO) }
            val (accountingPoint, meteringGridArea) = seed {
                val accountingPoint = insertAccountingPoint()
                val meteringGridArea = insertMeteringGridArea()
                insertAccountingPointMeteringGridArea(accountingPoint, meteringGridArea)
                accountingPoint to meteringGridArea
            }

            val response = api.get("/accounting_point_metering_grid_area", fiso.token())

            response.status shouldBe HttpStatusCode.OK
            val rows = response.body<List<AccountingPointMeteringGridAreaResponse>>()
            rows.map { it.accountingPointId to it.meteringGridAreaId } shouldBe listOf(accountingPoint to meteringGridArea)
        }

        // The other roles have no row level access, also not when they are related to the accounting point.
        for (role in TestPartyRole.rolesWithDataGrants - TestPartyRole.FISO) {
            test("${role.type} sees no metering grid areas of accounting points") {
                val actor = seed { insertActor(role) }
                seed { insertAccountingPointRelatedTo(actor, role) }

                val response = api.get("/accounting_point_metering_grid_area", actor.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<AccountingPointMeteringGridAreaResponse>>() shouldBe emptyList()
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the metering grid areas of accounting points") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get("/accounting_point_metering_grid_area", org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
