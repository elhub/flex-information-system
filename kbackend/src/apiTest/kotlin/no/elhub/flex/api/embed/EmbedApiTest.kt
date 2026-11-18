package no.elhub.flex.api.embed

import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.jsonObject
import no.elhub.flex.ApiSpec
import no.elhub.flex.apiJson
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token
import java.time.Instant

class EmbedApiTest :
    ApiSpec({
        beforeEach { truncate("flex.accounting_point", "flex.metering_grid_area", "flex.party", "flex.entity") }

        test("the bidding zone embedded in the accounting point of a controllable unit is a list") {
            val fiso = seed { insertActor(TestPartyRole.FISO) }
            val controllableUnit = seed {
                val area = insertMeteringGridArea()
                insertMeteringGridAreaPriceArea(area, "NO3")
                // the accounting point is only visible through the system operator of its metering grid area
                insertMeteringGridAreaSystemOperator(area, insertParty(TestPartyRole.SO))
                val accountingPoint = insertAccountingPoint()
                insertAccountingPointMeteringGridArea(accountingPoint, area)
                insertControllableUnit(accountingPoint)
            }

            val response = api.get(
                "/controllable_unit/$controllableUnit",
                fiso.token(),
                "embed" to "accounting_point(bidding_zone,balance_responsible_party(balance_responsible_party))",
                "accounting_point.bidding_zone.valid_at" to Instant.now().toString(),
            )

            response.status shouldBe HttpStatusCode.OK
            val accountingPoint = apiJson.parseToJsonElement(response.text).jsonObject.getValue("accounting_point").jsonObject
            (accountingPoint.getValue("bidding_zone") is JsonArray) shouldBe true
        }
    })
