package no.elhub.flex.api.serviceprovidinggroupproductsuspension

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationStatus
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductSuspensionCreateRequest
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductSuspensionHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductSuspensionReason
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductSuspensionResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductSuspensionUpdateRequest
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

private const val PATH = "/service_providing_group_product_suspension"

private fun createRequest(group: Long, systemOperator: Long, productTypes: List<Long>) = ServiceProvidingGroupProductSuspensionCreateRequest(
    procuringSystemOperatorId = systemOperator,
    serviceProvidingGroupId = group,
    productTypeIds = productTypes,
    reason = ServiceProvidingGroupProductSuspensionReason.OTHER,
)

private fun updateRequest(reason: ServiceProvidingGroupProductSuspensionReason) = ServiceProvidingGroupProductSuspensionUpdateRequest(reason = reason)

/**
 * Seeds a group of a new service provider that the system operator [systemOperator] has prequalified for the [productTypes], which is
 * what a suspension of the group by the operator needs. Seed it with [Triggers.OFF], as the status of a new application
 * is requested.
 */
private fun SeedScope.insertServiceProvidingGroupPrequalifiedBy(systemOperator: Long, productTypes: List<Long>, name: String = "Test SPG"): Long =
    insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "SP of $name"), name).also {
        insertServiceProvidingGroupProductApplication(it, systemOperator, productTypes, ServiceProvidingGroupProductApplicationStatus.PREQUALIFIED)
    }

class ServiceProvidingGroupProductSuspensionApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.service_providing_group",
                "flex.service_providing_group_product_suspension_history",
                "flex.product_type",
                "flex.party",
                "flex.entity",
            )
        }

        context("a FISO") {
            // RLS: SPGPS-FISO001
            test("can list the product suspensions of all groups") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val productType = seed { insertProductType() }
                val suspensions = seed(Triggers.OFF) {
                    List(2) {
                        val so = insertParty(TestPartyRole.SO, "SO $it")
                        insertServiceProvidingGroupProductSuspension(insertServiceProvidingGroupPrequalifiedBy(so, listOf(productType), "SPG $it"), so, listOf(productType))
                    }
                }

                val response = api.get(PATH, fiso.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProvidingGroupProductSuspensionResponse>>().map { it.id } shouldContainExactlyInAnyOrder suspensions
            }

            test("can create, update and delete a product suspension for a system operator") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val productType = seed { insertProductType() }
                val group = seed(Triggers.OFF) { insertServiceProvidingGroupPrequalifiedBy(so, listOf(productType)) }

                val created = api.post(PATH, fiso.token(), createRequest(group, so, listOf(productType)))
                created.status shouldBe HttpStatusCode.Created
                val id = created.body<ServiceProvidingGroupProductSuspensionResponse>().id

                val updated = api.patch("$PATH/$id", fiso.token(), updateRequest(ServiceProvidingGroupProductSuspensionReason.FAILED_VERIFICATION))
                updated.status shouldBe HttpStatusCode.OK
                updated.body<ServiceProvidingGroupProductSuspensionResponse>().reason shouldBe ServiceProvidingGroupProductSuspensionReason.FAILED_VERIFICATION

                api.delete("$PATH/$id", fiso.token()).status shouldBe HttpStatusCode.NoContent
            }

            // SPGPS-VAL001
            // The system operator has prequalified the group for product type A, and has an application for B that is only requested.
            // Another system operator has no application for the group.
            test("cannot suspend a group for a product type that the system operator has not prequalified it for") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val otherSo = seed { insertParty(TestPartyRole.SO, "Other SO") }
                val (a, b, c) = seed { List(3) { insertProductType() } }
                val group = seed(Triggers.OFF) {
                    insertServiceProvidingGroupPrequalifiedBy(so, listOf(a)).also { insertServiceProvidingGroupProductApplication(it, so, listOf(b)) }
                }

                api.post(PATH, fiso.token(), createRequest(group, so, listOf(b))).status shouldBe HttpStatusCode.BadRequest
                api.post(PATH, fiso.token(), createRequest(group, so, listOf(c))).status shouldBe HttpStatusCode.BadRequest
                api.post(PATH, fiso.token(), createRequest(group, so, listOf(a, b))).status shouldBe HttpStatusCode.BadRequest
                api.post(PATH, fiso.token(), createRequest(group, otherSo, listOf(a))).status shouldBe HttpStatusCode.BadRequest
                api.post(PATH, fiso.token(), createRequest(group, so, listOf(a))).status shouldBe HttpStatusCode.Created
            }

            // RLS: SPGPS-FISO002
            test("can read the archived revisions of the product suspensions of all groups") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val productType = seed { insertProductType() }
                val group = seed(Triggers.OFF) { insertServiceProvidingGroupPrequalifiedBy(so, listOf(productType)) }
                val suspension = seed { insertServiceProvidingGroupProductSuspension(group, so, listOf(productType), "other") }
                // the view of the history also lists the current rows, so an archived revision is needed
                seed { changeServiceProvidingGroupProductSuspensionReason(suspension, "failed_verification") }

                val response = api.get("${PATH}_history", fiso.token(), "replaced_at" to "not.is.null")

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProvidingGroupProductSuspensionHistoryResponse>>().map { it.reason } shouldBe
                    listOf(ServiceProvidingGroupProductSuspensionReason.OTHER)
            }
        }

        // RLS: SPGPS-SP001
        // RLS: SPGPS-SP002
        context("a service provider") {
            test("sees the product suspensions of its groups and their archived revisions, and no others") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val productType = seed { insertProductType() }
                val ownGroup = seed(Triggers.OFF) {
                    insertServiceProvidingGroup(sp.partyId!!).also {
                        insertServiceProvidingGroupProductApplication(it, so, listOf(productType), ServiceProvidingGroupProductApplicationStatus.PREQUALIFIED)
                    }
                }
                val otherGroup = seed(Triggers.OFF) { insertServiceProvidingGroupPrequalifiedBy(so, listOf(productType), "Other SPG") }
                val own = seed { insertServiceProvidingGroupProductSuspension(ownGroup, so, listOf(productType), "other") }
                val other = seed { insertServiceProvidingGroupProductSuspension(otherGroup, so, listOf(productType), "other") }
                seed {
                    changeServiceProvidingGroupProductSuspensionReason(own, "failed_verification")
                    changeServiceProvidingGroupProductSuspensionReason(other, "failed_verification")
                }

                val list = api.get(PATH, sp.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProvidingGroupProductSuspensionResponse>>().map { it.id } shouldBe listOf(own)
                api.get("$PATH/$other", sp.token()).status shouldBe HIDDEN_BY_RLS

                val history = api.get("${PATH}_history", sp.token(), "replaced_at" to "not.is.null")
                history.body<List<ServiceProvidingGroupProductSuspensionHistoryResponse>>().map { it.serviceProvidingGroupProductSuspensionId } shouldBe
                    listOf(own)
            }

            test("still sees the archived revisions of a product suspension that has been deleted") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val productType = seed { insertProductType() }
                val group = seed(Triggers.OFF) {
                    insertServiceProvidingGroup(sp.partyId!!).also {
                        insertServiceProvidingGroupProductApplication(it, so, listOf(productType), ServiceProvidingGroupProductApplicationStatus.PREQUALIFIED)
                    }
                }
                val suspension = seed { insertServiceProvidingGroupProductSuspension(group, so, listOf(productType)) }
                seed { deleteServiceProvidingGroupProductSuspension(suspension) }

                val history = api.get("${PATH}_history", sp.token(), "replaced_at" to "not.is.null")

                history.body<List<ServiceProvidingGroupProductSuspensionHistoryResponse>>().map { it.serviceProvidingGroupProductSuspensionId } shouldBe
                    listOf(suspension)
            }

            test("cannot create, update or delete a product suspension") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val productType = seed { insertProductType() }
                val group = seed(Triggers.OFF) {
                    insertServiceProvidingGroup(sp.partyId!!).also {
                        insertServiceProvidingGroupProductApplication(it, so, listOf(productType), ServiceProvidingGroupProductApplicationStatus.PREQUALIFIED)
                    }
                }
                val suspension = seed { insertServiceProvidingGroupProductSuspension(group, so, listOf(productType)) }

                api.post(PATH, sp.token(), createRequest(group, so, listOf(productType))).status shouldBe HttpStatusCode.Forbidden
                api.patch("$PATH/$suspension", sp.token(), updateRequest(ServiceProvidingGroupProductSuspensionReason.FAILED_VERIFICATION)).status shouldBe
                    HttpStatusCode.Forbidden
                api.delete("$PATH/$suspension", sp.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // RLS: SPGPS-SO001
        // RLS: SPGPS-SO002
        context("the procuring system operator") {
            test("can create, read, update and delete its product suspension") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val productType = seed { insertProductType() }
                val group = seed(Triggers.OFF) { insertServiceProvidingGroupPrequalifiedBy(so.partyId!!, listOf(productType)) }

                val created = api.post(PATH, so.token(), createRequest(group, so.partyId!!, listOf(productType)))
                created.status shouldBe HttpStatusCode.Created
                val id = created.body<ServiceProvidingGroupProductSuspensionResponse>().id

                api.get("$PATH/$id", so.token()).status shouldBe HttpStatusCode.OK
                api.patch("$PATH/$id", so.token(), updateRequest(ServiceProvidingGroupProductSuspensionReason.FAILED_VERIFICATION)).status shouldBe
                    HttpStatusCode.OK
                api.delete("$PATH/$id", so.token()).status shouldBe HttpStatusCode.NoContent
            }

            test("cannot create a product suspension for another system operator") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val other = seed { insertParty(TestPartyRole.SO, "Other SO") }
                val productType = seed { insertProductType() }
                val group = seed(Triggers.OFF) { insertServiceProvidingGroupPrequalifiedBy(other, listOf(productType)) }

                api.post(PATH, so.token(), createRequest(group, other, listOf(productType))).status shouldBe HttpStatusCode.Forbidden
            }

            test("sees the archived revisions of its product suspensions, and no others") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val other = seed { insertParty(TestPartyRole.SO, "Other SO") }
                val productType = seed { insertProductType() }
                val ownGroup = seed(Triggers.OFF) { insertServiceProvidingGroupPrequalifiedBy(so.partyId!!, listOf(productType)) }
                val otherGroup = seed(Triggers.OFF) { insertServiceProvidingGroupPrequalifiedBy(other, listOf(productType), "Other SPG") }
                val own = seed { insertServiceProvidingGroupProductSuspension(ownGroup, so.partyId!!, listOf(productType), "other") }
                val others = seed { insertServiceProvidingGroupProductSuspension(otherGroup, other, listOf(productType), "other") }
                seed {
                    changeServiceProvidingGroupProductSuspensionReason(own, "failed_verification")
                    changeServiceProvidingGroupProductSuspensionReason(others, "failed_verification")
                }

                val history = api.get("${PATH}_history", so.token(), "replaced_at" to "not.is.null")

                history.status shouldBe HttpStatusCode.OK
                history.body<List<ServiceProvidingGroupProductSuspensionHistoryResponse>>().map { it.serviceProvidingGroupProductSuspensionId } shouldBe
                    listOf(own)
            }
        }

        // RLS: SPGPS-SO003
        // RLS: SPGPS-SO004
        // A system operator that has prequalified the group for a product type, sees the suspensions of the group for that product type,
        // also when they are by another system operator.
        context("a system operator that has prequalified the group for a product type") {
            test("sees the product suspension of another system operator for that product type, and not for others") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val suspender = seed { insertParty(TestPartyRole.SO, "Suspending SO") }
                val (common, onlySuspender) = seed { List(2) { insertProductType() } }
                val group = seed(Triggers.OFF) {
                    insertServiceProvidingGroupPrequalifiedBy(suspender, listOf(common, onlySuspender)).also {
                        insertServiceProvidingGroupProductApplication(it, so.partyId!!, listOf(common), ServiceProvidingGroupProductApplicationStatus.PREQUALIFIED)
                    }
                }
                val onCommon = seed { insertServiceProvidingGroupProductSuspension(group, suspender, listOf(common)) }
                val onOther = seed { insertServiceProvidingGroupProductSuspension(group, suspender, listOf(onlySuspender)) }

                val list = api.get(PATH, so.token())

                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProvidingGroupProductSuspensionResponse>>().map { it.id } shouldBe listOf(onCommon)
                api.get("$PATH/$onOther", so.token()).status shouldBe HIDDEN_BY_RLS
            }

            test("does not see the product suspension of another system operator when its own application is not ready for the market") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val suspender = seed { insertParty(TestPartyRole.SO, "Suspending SO") }
                val productType = seed { insertProductType() }
                val group = seed(Triggers.OFF) {
                    insertServiceProvidingGroupPrequalifiedBy(suspender, listOf(productType)).also {
                        insertServiceProvidingGroupProductApplication(it, so.partyId!!, listOf(productType))
                    }
                }
                val suspension = seed { insertServiceProvidingGroupProductSuspension(group, suspender, listOf(productType)) }

                api.get(PATH, so.token()).body<List<ServiceProvidingGroupProductSuspensionResponse>>() shouldBe emptyList()
                api.get("$PATH/$suspension", so.token()).status shouldBe HIDDEN_BY_RLS
            }

            test("cannot update or delete the product suspension of another system operator") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val suspender = seed { insertParty(TestPartyRole.SO, "Suspending SO") }
                val productType = seed { insertProductType() }
                val group = seed(Triggers.OFF) {
                    insertServiceProvidingGroupPrequalifiedBy(suspender, listOf(productType)).also {
                        insertServiceProvidingGroupProductApplication(it, so.partyId!!, listOf(productType), ServiceProvidingGroupProductApplicationStatus.PREQUALIFIED)
                    }
                }
                val suspension = seed { insertServiceProvidingGroupProductSuspension(group, suspender, listOf(productType)) }

                api.patch("$PATH/$suspension", so.token(), updateRequest(ServiceProvidingGroupProductSuspensionReason.FAILED_VERIFICATION)).status shouldBe
                    HIDDEN_BY_RLS
                api.delete("$PATH/$suspension", so.token()).status shouldBe HIDDEN_BY_RLS
            }

            // The archived revisions can be read after the suspension is deleted, as long as the application was there at the time of the revision.
            test("sees the archived revisions of that product suspension, also when it has been deleted") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val suspender = seed { insertParty(TestPartyRole.SO, "Suspending SO") }
                val (common, onlySuspender) = seed { List(2) { insertProductType() } }
                val group = seed(Triggers.OFF) {
                    insertServiceProvidingGroupPrequalifiedBy(suspender, listOf(common, onlySuspender)).also {
                        insertServiceProvidingGroupProductApplication(it, so.partyId!!, listOf(common), ServiceProvidingGroupProductApplicationStatus.PREQUALIFIED)
                    }
                }
                val onCommon = seed { insertServiceProvidingGroupProductSuspension(group, suspender, listOf(common)) }
                val onOther = seed { insertServiceProvidingGroupProductSuspension(group, suspender, listOf(onlySuspender)) }
                seed {
                    deleteServiceProvidingGroupProductSuspension(onCommon)
                    deleteServiceProvidingGroupProductSuspension(onOther)
                }

                val history = api.get("${PATH}_history", so.token(), "replaced_at" to "not.is.null")

                history.status shouldBe HttpStatusCode.OK
                history.body<List<ServiceProvidingGroupProductSuspensionHistoryResponse>>().map { it.serviceProvidingGroupProductSuspensionId } shouldBe
                    listOf(onCommon)
            }

            // Timeline:
            //   1. the suspending system operator suspends the group and the suspension is deleted
            //   2. the system operator prequalifies the group for the same product type
            test("does not see the archived revisions of a product suspension that ended before its own application existed") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val suspender = seed { insertParty(TestPartyRole.SO, "Suspending SO") }
                val productType = seed { insertProductType() }
                val group = seed(Triggers.OFF) { insertServiceProvidingGroupPrequalifiedBy(suspender, listOf(productType)) }
                val suspension = seed { insertServiceProvidingGroupProductSuspension(group, suspender, listOf(productType)) }
                seed { deleteServiceProvidingGroupProductSuspension(suspension) }
                seed(Triggers.OFF) {
                    insertServiceProvidingGroupProductApplication(group, so.partyId!!, listOf(productType), ServiceProvidingGroupProductApplicationStatus.PREQUALIFIED)
                }

                api.get("${PATH}_history", so.token(), "replaced_at" to "not.is.null")
                    .body<List<ServiceProvidingGroupProductSuspensionHistoryResponse>>() shouldBe emptyList()
            }
        }

        // These roles have no grant on the product suspensions.
        for (role in TestPartyRole.rolesWithDataGrants - setOf(TestPartyRole.FISO, TestPartyRole.SO, TestPartyRole.SP)) {
            test("${role.type} cannot list the product suspensions") {
                val actor = seed { insertActor(role) }

                api.get(PATH, actor.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the product suspensions") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get(PATH, org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
