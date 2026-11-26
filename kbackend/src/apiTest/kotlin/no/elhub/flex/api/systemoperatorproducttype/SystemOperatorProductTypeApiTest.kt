package no.elhub.flex.api.systemoperatorproducttype

import io.kotest.matchers.collections.shouldContainAll
import io.kotest.matchers.collections.shouldNotBeEmpty
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.SystemOperatorProductTypeCreateRequest
import no.elhub.flex.api.model.dto.generated.models.SystemOperatorProductTypeHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.SystemOperatorProductTypeResponse
import no.elhub.flex.api.model.dto.generated.models.SystemOperatorProductTypeStatus
import no.elhub.flex.api.model.dto.generated.models.SystemOperatorProductTypeUpdateRequest
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

class SystemOperatorProductTypeApiTest :
    ApiSpec({
        beforeEach { truncate("flex.system_operator_product_type", "flex.product_type", "flex.party", "flex.entity") }

        context("a party of a role with grants on the data views") {
            // A FISO can read all rows through SOPT-FISO001, so SOPT-COM002 is tested with the other roles.
            for (role in TestPartyRole.rolesWithDataGrants - TestPartyRole.FISO) {
                // RLS: SOPT-COM002
                test("${role.type} can list and read the product types of all system operators") {
                    val actor = seed { insertActor(role) }
                    val productType = seed { insertProductType() }
                    val sopts = seed {
                        listOf(
                            insertSystemOperatorProductType(insertParty(TestPartyRole.SO, "SO 1"), productType),
                            insertSystemOperatorProductType(insertParty(TestPartyRole.SO, "SO 2"), productType),
                        )
                    }

                    val list = api.get("/system_operator_product_type", actor.token())
                    list.status shouldBe HttpStatusCode.OK
                    list.body<List<SystemOperatorProductTypeResponse>>().map { it.id } shouldContainAll sopts

                    val read = api.get("/system_operator_product_type/${sopts.first()}", actor.token())
                    read.status shouldBe HttpStatusCode.OK
                    read.body<SystemOperatorProductTypeResponse>().id shouldBe sopts.first()
                }
            }

            // The history has no policy for the FISO, so SOPT-COM001 applies to every role.
            for (role in TestPartyRole.rolesWithDataGrants) {
                // RLS: SOPT-COM001
                test("${role.type} can read the archived revisions of a product type of a system operator") {
                    val actor = seed { insertActor(role) }
                    val sopt = seed { insertSystemOperatorProductType(insertParty(TestPartyRole.SO), insertProductType()) }
                    // the view of the history also lists the current row, so an archived revision is needed;
                    // it is only archived when the update is made in another transaction than the insert
                    seed { updateSystemOperatorProductTypeStatus(sopt, "inactive") }

                    val list = api.get(
                        "/system_operator_product_type_history",
                        actor.token(),
                        "system_operator_product_type_id" to "eq.$sopt",
                        "replaced_at" to "not.is.null",
                    )
                    list.status shouldBe HttpStatusCode.OK
                    val history = list.body<List<SystemOperatorProductTypeHistoryResponse>>()
                    history.shouldNotBeEmpty()
                    history.forEach { it.replacedAt.shouldNotBeNull() }

                    val read = api.get("/system_operator_product_type_history/${history.first().id}", actor.token())
                    read.status shouldBe HttpStatusCode.OK
                    read.body<SystemOperatorProductTypeHistoryResponse>().systemOperatorProductTypeId shouldBe sopt
                }
            }

            // The organisation inherits flex_common, but the views have no grant for its role.
            test("an organisation cannot list the product types of system operators or their history") {
                val org = seed { insertActor(TestPartyRole.ORG) }

                api.get("/system_operator_product_type", org.token()).status shouldBe HttpStatusCode.Forbidden
                api.get("/system_operator_product_type_history", org.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // RLS: SOPT-FISO001
        context("a FISO") {
            test("can create and update the product types of any system operator") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val productType = seed { insertProductType() }

                val created = api.post(
                    "/system_operator_product_type",
                    fiso.token(),
                    SystemOperatorProductTypeCreateRequest(systemOperatorId = so, productTypeId = productType),
                )
                created.status shouldBe HttpStatusCode.Created
                val soptId = created.body<SystemOperatorProductTypeResponse>().id

                val updated = api.patch(
                    "/system_operator_product_type/$soptId",
                    fiso.token(),
                    SystemOperatorProductTypeUpdateRequest(status = SystemOperatorProductTypeStatus.INACTIVE),
                )
                updated.status shouldBe HttpStatusCode.OK
                updated.body<SystemOperatorProductTypeResponse>().status shouldBe SystemOperatorProductTypeStatus.INACTIVE
            }
        }

        // RLS: SOPT-SO001
        context("a system operator") {
            test("cannot create a product type for another system operator") {
                val so = seed { insertActor(TestPartyRole.SO, "SO 1") }
                val otherSo = seed { insertParty(TestPartyRole.SO, "SO 2") }
                val productType = seed { insertProductType() }

                api.post(
                    "/system_operator_product_type",
                    so.token(),
                    SystemOperatorProductTypeCreateRequest(systemOperatorId = otherSo, productTypeId = productType),
                ).status shouldBe HttpStatusCode.Forbidden
            }

            test("can create and update its own product types") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val productType = seed { insertProductType() }

                val created = api.post(
                    "/system_operator_product_type",
                    so.token(),
                    SystemOperatorProductTypeCreateRequest(systemOperatorId = so.partyId!!, productTypeId = productType),
                )
                created.status shouldBe HttpStatusCode.Created
                val soptId = created.body<SystemOperatorProductTypeResponse>().id

                api.patch(
                    "/system_operator_product_type/$soptId",
                    so.token(),
                    SystemOperatorProductTypeUpdateRequest(status = SystemOperatorProductTypeStatus.INACTIVE),
                ).status shouldBe HttpStatusCode.OK
            }

            test("cannot update the product types of another system operator") {
                val so = seed { insertActor(TestPartyRole.SO, "SO 1") }
                val sopt = seed { insertSystemOperatorProductType(insertParty(TestPartyRole.SO, "SO 2"), insertProductType()) }

                api.patch(
                    "/system_operator_product_type/$sopt",
                    so.token(),
                    SystemOperatorProductTypeUpdateRequest(status = SystemOperatorProductTypeStatus.INACTIVE),
                ).status shouldBe HIDDEN_BY_RLS
            }
        }
    })
