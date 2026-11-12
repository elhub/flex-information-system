package no.elhub.flex.api.producttype

import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.api.model.dto.generated.models.ProductTypeResponse
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

class ProductTypeApiTest :
    ApiSpec({
        beforeEach { truncate("flex.product_type", "flex.party", "flex.entity") }

        // RLS: PT-COM001 grants SELECT to flex_common, which every party role inherits
        context("a party of any role") {
            // the organisation inherits flex_common too, but has no grant on the product_type view, see below
            for (role in TestPartyRole.common - TestPartyRole.ORG) {
                test("${role.type} can list and read product types") {
                    val productTypeId = seed { insertProductType("Common product type") }
                    val actor = seed { insertActor(role) }

                    val list = api.get("/product_type", actor.token())
                    list.status shouldBe HttpStatusCode.OK
                    list.body<List<ProductTypeResponse>>().map { it.id } shouldContain productTypeId

                    val read = api.get("/product_type/$productTypeId", actor.token())
                    read.status shouldBe HttpStatusCode.OK
                    read.body<ProductTypeResponse>().id shouldBe productTypeId
                }
            }
        }

        test("an organisation cannot list product types, because the view has no grant for its role") {
            val org = seed { insertActor(TestPartyRole.ORG) }
            seed { insertProductType() }

            api.get("/product_type", org.token()).status shouldBe HttpStatusCode.Forbidden
        }

        test("an anonymous caller cannot list product types") {
            api.get("/product_type", token = null).status shouldBe HttpStatusCode.Unauthorized
        }

        test("an entity that has not assumed a party cannot list product types") {
            val entity = seed { insertEntityActor() }

            api.get("/product_type", entity.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
