package no.elhub.flex.api.meteringgridarea

import io.kotest.matchers.collections.shouldContainAll
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.api.model.dto.generated.models.MeteringGridAreaResponse
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

class MeteringGridAreaApiTest :
    ApiSpec({
        beforeEach { truncate("flex.metering_grid_area", "flex.party", "flex.entity") }

        // RLS: MGA-COM001
        context("a party of a role with grants on the data views") {
            for (role in TestPartyRole.rolesWithDataGrants) {
                test("${role.type} can list and read metering grid areas") {
                    val actor = seed { insertActor(role) }
                    val areas = seed { listOf(insertMeteringGridArea("Area 1"), insertMeteringGridArea("Area 2")) }

                    val list = api.get("/metering_grid_area", actor.token())
                    list.status shouldBe HttpStatusCode.OK
                    list.body<List<MeteringGridAreaResponse>>().map { it.id } shouldContainAll areas

                    val read = api.get("/metering_grid_area/${areas.first()}", actor.token())
                    read.status shouldBe HttpStatusCode.OK
                    read.body<MeteringGridAreaResponse>().name shouldBe "Area 1"
                }
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list metering grid areas") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get("/metering_grid_area", org.token()).status shouldBe HttpStatusCode.Forbidden
        }

        test("an anonymous caller cannot list metering grid areas") {
            api.get("/metering_grid_area", token = null).status shouldBe HttpStatusCode.Unauthorized
        }
    })
