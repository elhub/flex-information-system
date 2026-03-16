package no.elhub.flex.integration.accountingpointadapter

import com.github.tomakehurst.wiremock.client.WireMock.aResponse
import com.github.tomakehurst.wiremock.client.WireMock.equalTo
import com.github.tomakehurst.wiremock.client.WireMock.get
import com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo
import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import io.ktor.http.HttpStatusCode

private const val GSRN = "133700000000000053"
private const val API_KEY = "secret-key"

class AccountingPointAdapterServiceTest : FunSpec({
    extensions(AccountingPointAdapterWireMockServer)

    lateinit var service: AccountingPointAdapterHttpService

    beforeSpec {
        service = AccountingPointAdapterHttpService(AccountingPointAdapterWireMockServer.baseUrl(), API_KEY)
    }

    beforeTest {
        AccountingPointAdapterWireMockServer.resetAll()
    }

    context("getAccountingPoint") {
        test("200 response is parsed and returned as Right") {
            AccountingPointAdapterWireMockServer.stubFor(
                get(urlPathEqualTo("/accounting_point/$GSRN"))
                    .withHeader("X-API-Key", equalTo(API_KEY))
                    .willReturn(
                        aResponse()
                            .withStatus(HttpStatusCode.OK.value)
                            .withHeader("Content-Type", "application/json")
                            .withBodyFile("accounting-point-200.json"),
                    ),
            )

            val result = service.getAccountingPoint(GSRN)

            val accountingPoint = result.shouldBeRight()
            accountingPoint.gsrn shouldBe GSRN
            accountingPoint.meteringGridArea.first().businessId shouldBe "10Y1001A1001A264"
        }

        test("404 response is returned as Left NotFoundError") {
            AccountingPointAdapterWireMockServer.stubFor(
                get(urlPathEqualTo("/accounting_point/$GSRN"))
                    .willReturn(aResponse().withStatus(HttpStatusCode.NotFound.value)),
            )

            val result = service.getAccountingPoint(GSRN)

            result.shouldBeLeft().shouldBeInstanceOf<NotFoundError>()
        }

        test("500 response is returned as Left HttpError") {
            AccountingPointAdapterWireMockServer.stubFor(
                get(urlPathEqualTo("/accounting_point/$GSRN"))
                    .willReturn(aResponse().withStatus(HttpStatusCode.InternalServerError.value)),
            )

            val result = service.getAccountingPoint(GSRN)

            val error = result.shouldBeLeft().shouldBeInstanceOf<HttpError>()
            error.statusCode shouldBe HttpStatusCode.InternalServerError.value
        }
    }
})
