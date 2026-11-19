package no.elhub.flex.api.controllableunitlookup

import com.github.tomakehurst.wiremock.client.WireMock.aResponse
import com.github.tomakehurst.wiremock.client.WireMock.get
import com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.AdapterTestServer
import no.elhub.flex.ApiSpec
import no.elhub.flex.api.model.dto.generated.models.AccountingPointResponse
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitLookupRequest
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitLookupResponse
import no.elhub.flex.api.model.dto.generated.models.ErrorMessage
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.osloMidnight
import no.elhub.flex.testutil.randomOrg
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.testutil.uniqueEicY
import no.elhub.flex.testutil.uniqueGsrn
import no.elhub.flex.token

private const val PATH = "/controllable_unit/lookup"

/** What the adapter knows about the accounting point: the organisation that is its end user, and its metering grid area. */
private fun stubAccountingPointInAdapter(accountingPoint: String, endUser: String, meteringGridArea: String) {
    val validFrom = osloMidnight("2024-01-01")
    AdapterTestServer.stubFor(
        get(urlPathEqualTo("/accounting_point/$accountingPoint"))
            .willReturn(
                aResponse()
                    .withStatus(HttpStatusCode.OK.value)
                    .withHeader("Content-Type", "application/json")
                    .withBody(
                        """
                        {
                            "gsrn": "$accountingPoint",
                            "end_user": [{"business_id": "$endUser", "entity_type": "organisation", "valid_from": "$validFrom"}],
                            "energy_supplier": [],
                            "metering_grid_area": [{"business_id": "$meteringGridArea", "valid_from": "$validFrom"}]
                        }
                        """.trimIndent(),
                    ),
            ),
    )
}

class ControllableUnitLookupAccountingPointSyncApiTest :
    ApiSpec(
        {
            beforeEach {
                AdapterTestServer.reset()
                truncate("flex.accounting_point", "flex.metering_grid_area", "flex.party", "flex.entity", "flex.event")
            }

            test("creates an accounting point that exists only in the adapter") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val meteringGridAreaBusinessId = uniqueEicY()
                seed {
                    val area = insertMeteringGridArea(businessId = meteringGridAreaBusinessId)
                    // the accounting point is only visible through the system operator of its metering grid area
                    insertMeteringGridAreaSystemOperator(area, insertParty(TestPartyRole.SO))
                }
                val accountingPointBusinessId = uniqueGsrn()
                val endUserOrganisationNumber = randomOrg()
                stubAccountingPointInAdapter(accountingPointBusinessId, endUserOrganisationNumber, meteringGridAreaBusinessId)

                val response = api.post(
                    PATH,
                    fiso.token(),
                    ControllableUnitLookupRequest(endUserOrganisationNumber, accountingPoint = accountingPointBusinessId),
                )

                response.status shouldBe HttpStatusCode.OK
                response.body<ControllableUnitLookupResponse>().controllableUnits shouldBe emptyList()
                val created = api.get("/accounting_point", fiso.token(), "business_id" to "eq.$accountingPointBusinessId")
                created.body<List<AccountingPointResponse>>().map { it.businessId } shouldBe listOf(accountingPointBusinessId)
            }

            test("does not find an accounting point that the adapter does not know either") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }

                val response = api.post(PATH, fiso.token(), ControllableUnitLookupRequest(randomOrg(), accountingPoint = uniqueGsrn()))

                response.status shouldBe HttpStatusCode.NotFound
                response.body<ErrorMessage>().code shouldBe "HTTP404"
            }
        },
        syncAccountingPoints = true,
    )
