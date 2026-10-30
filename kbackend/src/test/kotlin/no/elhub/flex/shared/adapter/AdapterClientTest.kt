package no.elhub.flex.shared.adapter

import com.github.tomakehurst.wiremock.client.WireMock.aResponse
import com.github.tomakehurst.wiremock.client.WireMock.equalTo
import com.github.tomakehurst.wiremock.client.WireMock.get
import com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo
import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import io.ktor.http.HttpStatusCode
import no.elhub.flex.shared.adapter.generated.models.PriceArea
import java.util.UUID
import kotlin.time.Instant

private const val GSRN = "133700000000000053"
private const val API_KEY = "secret-key"
private val VALID_FROM = Instant.parse("2024-01-01T00:00:00+01:00")

class AdapterClientTest : FunSpec({
    extensions(AdapterWireMockServer)

    lateinit var service: AdapterHttpClient

    beforeSpec {
        service = AdapterHttpClient(AdapterClientConfig(AdapterWireMockServer.baseUrl(), API_KEY))
    }

    beforeTest {
        AdapterWireMockServer.resetAll()
    }

    context("getAccountingPoint") {
        test("200 response is parsed and returned as Right") {
            AdapterWireMockServer.stubFor(
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
            AdapterWireMockServer.stubFor(
                get(urlPathEqualTo("/accounting_point/$GSRN"))
                    .willReturn(aResponse().withStatus(HttpStatusCode.NotFound.value)),
            )

            val result = service.getAccountingPoint(GSRN, VALID_FROM)

            result.shouldBeLeft().shouldBeInstanceOf<NotFoundError>()
        }

        test("500 response is returned as Left HttpError") {
            AdapterWireMockServer.stubFor(
                get(urlPathEqualTo("/accounting_point/$GSRN"))
                    .willReturn(aResponse().withStatus(HttpStatusCode.InternalServerError.value)),
            )

            val result = service.getAccountingPoint(GSRN, VALID_FROM)

            val error = result.shouldBeLeft().shouldBeInstanceOf<HttpError>()
            error.statusCode shouldBe HttpStatusCode.InternalServerError.value
        }

        test("200 response with lat/lon is parsed correctly") {
            AdapterWireMockServer.stubFor(
                get(urlPathEqualTo("/accounting_point/$GSRN"))
                    .willReturn(
                        aResponse()
                            .withStatus(HttpStatusCode.OK.value)
                            .withHeader("Content-Type", "application/json")
                            .withBodyFile("accounting-point-200-with-location.json"),
                    ),
            )

            val result = service.getAccountingPoint(GSRN, VALID_FROM)

            val accountingPoint = result.shouldBeRight()
            accountingPoint.latitude shouldBe 59.9139
            accountingPoint.longitude shouldBe 10.7522
        }

        test("200 response with explicit null lat/lon is parsed correctly") {
            AdapterWireMockServer.stubFor(
                get(urlPathEqualTo("/accounting_point/$GSRN"))
                    .willReturn(
                        aResponse()
                            .withStatus(HttpStatusCode.OK.value)
                            .withHeader("Content-Type", "application/json")
                            .withBodyFile("accounting-point-200-with-null-location.json"),
                    ),
            )

            val result = service.getAccountingPoint(GSRN, VALID_FROM)

            val accountingPoint = result.shouldBeRight()
            accountingPoint.latitude shouldBe null
            accountingPoint.longitude shouldBe null
        }

        test("200 response with substation is parsed correctly") {
            AdapterWireMockServer.stubFor(
                get(urlPathEqualTo("/accounting_point/$GSRN"))
                    .willReturn(
                        aResponse()
                            .withStatus(HttpStatusCode.OK.value)
                            .withHeader("Content-Type", "application/json")
                            .withBodyFile("accounting-point-200-with-substation.json"),
                    ),
            )

            val result = service.getAccountingPoint(GSRN, VALID_FROM)

            val accountingPoint = result.shouldBeRight()
            accountingPoint.substation shouldBe UUID.fromString("3fa85f64-5717-4562-b3fc-2c963f66afa6")
        }
    }

    context("getMeteringGridAreas") {
        test("200 response is parsed and returned as Right") {
            AdapterWireMockServer.stubFor(
                get(urlPathEqualTo("/metering_grid_area"))
                    .withHeader("Authorization", equalTo("Bearer $API_KEY"))
                    .willReturn(
                        aResponse()
                            .withStatus(HttpStatusCode.OK.value)
                            .withHeader("Content-Type", "application/json")
                            .withBodyFile("metering-grid-areas-200.json"),
                    ),
            )

            val areas = service.getMeteringGridAreas().shouldBeRight()

            areas shouldHaveSize 2
            val oslo = areas.first()
            oslo.businessId shouldBe "10YNO-1--------2"
            oslo.name shouldBe "Oslo"
            oslo.isActive shouldBe true
            oslo.systemOperator shouldHaveSize 2
            oslo.systemOperator.first().businessId shouldBe "1337000000044"
            oslo.systemOperator.first().validTo shouldBe Instant.parse("2025-01-01T00:00:00+01:00")
            oslo.systemOperator.last().validTo shouldBe null
            oslo.priceArea.single().priceArea shouldBe PriceArea.NO1
            oslo.priceArea.single().validTo shouldBe null

            val kristiansand = areas.last()
            kristiansand.isActive shouldBe false
            kristiansand.systemOperator shouldBe emptyList()
            kristiansand.priceArea shouldBe emptyList()
        }

        test("500 response is returned as Left HttpError") {
            AdapterWireMockServer.stubFor(
                get(urlPathEqualTo("/metering_grid_area"))
                    .willReturn(aResponse().withStatus(HttpStatusCode.InternalServerError.value)),
            )

            val error = service.getMeteringGridAreas().shouldBeLeft().shouldBeInstanceOf<HttpError>()

            error.statusCode shouldBe HttpStatusCode.InternalServerError.value
        }

        test("404 response is returned as Left HttpError, not NotFoundError") {
            AdapterWireMockServer.stubFor(
                get(urlPathEqualTo("/metering_grid_area"))
                    .willReturn(aResponse().withStatus(HttpStatusCode.NotFound.value)),
            )

            val error = service.getMeteringGridAreas().shouldBeLeft().shouldBeInstanceOf<HttpError>()

            error.statusCode shouldBe HttpStatusCode.NotFound.value
        }

        test("malformed body is returned as Left NetworkError") {
            AdapterWireMockServer.stubFor(
                get(urlPathEqualTo("/metering_grid_area"))
                    .willReturn(
                        aResponse()
                            .withStatus(HttpStatusCode.OK.value)
                            .withHeader("Content-Type", "application/json")
                            .withBody("""{"not": "a list"}"""),
                    ),
            )

            service.getMeteringGridAreas().shouldBeLeft().shouldBeInstanceOf<NetworkError>()
        }
    }

    context("getGridModel") {
        test("200 response is parsed and returned as Right") {
            AdapterWireMockServer.stubFor(
                get(urlPathEqualTo("/grid_model"))
                    .withHeader("Authorization", equalTo("Bearer $API_KEY"))
                    .willReturn(
                        aResponse()
                            .withStatus(HttpStatusCode.OK.value)
                            .withHeader("Content-Type", "application/json")
                            .withBodyFile("grid-model-200.json"),
                    ),
            )

            val gridModel = service.getGridModel().shouldBeRight()

            gridModel.substations shouldHaveSize 7
            gridModel.substations[1].apply {
                mrid shouldBe UUID.fromString("b1000001-0000-4000-8000-000000000012")
                name shouldBe "Sol transformatorstasjon"
                kind shouldBe "transformer"
                primaryConcessionaire shouldBe "BKK"
                substationClusterMrid shouldBe UUID.fromString("b1000001-0000-4000-8000-000000000001")
                voltageLevels shouldBe listOf(66.0, 11.0)
                latitude shouldBe 60.3975
                longitude shouldBe 5.3269
            }
            gridModel.substationClusters.map { it.name } shouldBe listOf("Krus", "Kopp", "Glass")
            gridModel.lines.map { it.name } shouldBe listOf("Linje1", "Linje2")
        }

        test("500 response is returned as Left HttpError") {
            AdapterWireMockServer.stubFor(
                get(urlPathEqualTo("/grid_model"))
                    .willReturn(aResponse().withStatus(HttpStatusCode.InternalServerError.value)),
            )

            val error = service.getGridModel().shouldBeLeft().shouldBeInstanceOf<HttpError>()

            error.statusCode shouldBe HttpStatusCode.InternalServerError.value
        }

        test("malformed body is returned as Left NetworkError") {
            AdapterWireMockServer.stubFor(
                get(urlPathEqualTo("/grid_model"))
                    .willReturn(
                        aResponse()
                            .withStatus(HttpStatusCode.OK.value)
                            .withHeader("Content-Type", "application/json")
                            .withBody("""{"substations": []}"""),
                    ),
            )

            service.getGridModel().shouldBeLeft().shouldBeInstanceOf<NetworkError>()
        }
    }
})
