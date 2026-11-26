package no.elhub.flex.api.accountingpoint

import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.api.model.dto.generated.models.AccountingPointEndUserResponse
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

class AccountingPointEndUserApiTest :
    ApiSpec({
        beforeEach { truncate("flex.accounting_point", "flex.metering_grid_area", "flex.party", "flex.entity") }

        // RLS: APEU-FISO001
        test("a FISO can list the end users of the accounting points") {
            val fiso = seed { insertActor(TestPartyRole.FISO) }
            val (accountingPoint, endUser) = seed {
                val accountingPoint = insertAccountingPoint()
                val endUser = insertParty(TestPartyRole.EU)
                insertAccountingPointEndUser(accountingPoint, endUser)
                accountingPoint to endUser
            }

            val response = api.get("/accounting_point_end_user", fiso.token())

            response.status shouldBe HttpStatusCode.OK
            response.body<List<AccountingPointEndUserResponse>>().map { it.accountingPointId to it.endUserId } shouldBe
                listOf(accountingPoint to endUser)
        }

        // The other roles have no row level access, also not when they are related to the accounting point.
        for (role in TestPartyRole.rolesWithDataGrants - TestPartyRole.FISO) {
            test("${role.type} sees no end users of accounting points") {
                val actor = seed { insertActor(role) }
                seed { insertAccountingPointRelatedTo(actor, role) }

                val response = api.get("/accounting_point_end_user", actor.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<AccountingPointEndUserResponse>>() shouldBe emptyList()
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the end users of accounting points") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get("/accounting_point_end_user", org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
