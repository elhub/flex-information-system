package no.elhub.flex.api.producttype

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.shouldBe
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpStatusCode
import io.ktor.server.testing.TestApplication
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json
import no.elhub.flex.API_VERSION
import no.elhub.flex.api.model.dto.generated.models.ProductTypeResponse
import no.elhub.flex.apiTestApplication
import no.elhub.flex.auth.util.makeJwt
import no.elhub.flex.testutil.SeededParty
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate

/** The party roles, with the party type that goes with each of them. */
private val partyRoles = mapOf(
    "BRP" to ("balance_responsible_party" to "flex_balance_responsible_party"),
    "EU" to ("end_user" to "flex_end_user"),
    "ES" to ("energy_supplier" to "flex_energy_supplier"),
    "FISO" to ("flexibility_information_system_operator" to "flex_flexibility_information_system_operator"),
    "MO" to ("market_operator" to "flex_market_operator"),
    "SP" to ("service_provider" to "flex_service_provider"),
    "SO" to ("system_operator" to "flex_system_operator"),
    "TP" to ("third_party" to "flex_third_party"),
)

class ProductTypeApiTest :
    FunSpec({
        lateinit var app: TestApplication

        beforeSpec { app = apiTestApplication().also { it.start() } }
        afterSpec { app.stop() }

        beforeEach { truncate("flex.product_type", "flex.party", "flex.entity") }

        fun jwt(party: SeededParty) = makeJwt(
            role = party.principal.role,
            eid = party.principal.eid,
            entityId = party.entityId.toInt(),
            partyId = party.partyId.toInt(),
            scope = "manage:data",
        )

        // RLS: PT-COM001 grants SELECT to flex_common, which every party role inherits
        context("a party of any role") {
            for ((abbreviation, roleAndType) in partyRoles) {
                val (type, role) = roleAndType
                test("$abbreviation can list and read product types") {
                    val productTypeId = seed { insertProductType("Common product type") }
                    val party = seed { insertPartyWithIdentity("Test $abbreviation", type, role) }
                    val token = jwt(party)

                    // endpoint: GET /product_type
                    val list = app.client.get("/api/v1/product_type") {
                        header("Authorization", "Bearer $token")
                        header("Api-Version", API_VERSION)
                    }
                    list.status shouldBe HttpStatusCode.OK
                    val productTypes = Json.decodeFromString(ListSerializer(ProductTypeResponse.serializer()), list.bodyAsText())
                    productTypes.map { it.id } shouldContain productTypeId

                    // endpoint: GET /product_type/{id}
                    val read = app.client.get("/api/v1/product_type/$productTypeId") {
                        header("Authorization", "Bearer $token")
                        header("Api-Version", API_VERSION)
                    }
                    read.status shouldBe HttpStatusCode.OK
                    Json.decodeFromString(ProductTypeResponse.serializer(), read.bodyAsText()).id shouldBe productTypeId
                }
            }
        }

        test("an anonymous caller cannot list product types") {
            val response = app.client.get("/api/v1/product_type") {
                header("Api-Version", API_VERSION)
            }
            response.status shouldBe HttpStatusCode.Unauthorized
        }

        test("an entity that has not assumed a party cannot list product types") {
            val entity = seed { insertEntityIdentity("Product type entity") }
            val token = makeJwt(
                role = entity.principal.role,
                eid = entity.principal.eid,
                entityId = entity.entityId.toInt(),
                partyId = 0,
                scope = "manage:data",
            )

            val response = app.client.get("/api/v1/product_type") {
                header("Authorization", "Bearer $token")
                header("Api-Version", API_VERSION)
            }
            response.status shouldBe HttpStatusCode.Forbidden
        }
    })
