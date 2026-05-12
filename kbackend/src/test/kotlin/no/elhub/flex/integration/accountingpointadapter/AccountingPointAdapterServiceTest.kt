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
import kotlin.time.Instant

private const val GSRN = "133700000000000053"
private const val API_KEY = "secret-key"
private val VALID_FROM = Instant.parse("2024-01-01T00:00:00+01:00")

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
                    .withHeader("Authorization", equalTo("Bearer $API_KEY"))
                    .willReturn(
                        aResponse()
                            .withStatus(HttpStatusCode.OK.value)
                            .withHeader("Content-Type", "application/json")
                            .withBodyFile("accounting-point-200.json"),
                    ),
            )

            val result = service.getAccountingPoint(GSRN, VALID_FROM)

            val accountingPoint = result.shouldBeRight()
            accountingPoint.gsrn shouldBe GSRN
            accountingPoint.meteringGridArea.first().businessId shouldBe "10Y1001A1001A264"
        }

        test("404 response is returned as Left NotFoundError") {
            AccountingPointAdapterWireMockServer.stubFor(
                get(urlPathEqualTo("/accounting_point/$GSRN"))
                    .willReturn(aResponse().withStatus(HttpStatusCode.NotFound.value)),
            )

            val result = service.getAccountingPoint(GSRN, VALID_FROM)

            result.shouldBeLeft().shouldBeInstanceOf<NotFoundError>()
        }

        test("500 response is returned as Left HttpError") {
            AccountingPointAdapterWireMockServer.stubFor(
                get(urlPathEqualTo("/accounting_point/$GSRN"))
                    .willReturn(aResponse().withStatus(HttpStatusCode.InternalServerError.value)),
            )

            val result = service.getAccountingPoint(GSRN, VALID_FROM)

            val error = result.shouldBeLeft().shouldBeInstanceOf<HttpError>()
            error.statusCode shouldBe HttpStatusCode.InternalServerError.value
        }
    }
})
