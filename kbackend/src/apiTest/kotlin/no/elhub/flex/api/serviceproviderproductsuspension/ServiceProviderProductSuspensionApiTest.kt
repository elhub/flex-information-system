package no.elhub.flex.api.serviceproviderproductsuspension

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ServiceProviderProductApplicationStatus
import no.elhub.flex.api.model.dto.generated.models.ServiceProviderProductSuspensionCreateRequest
import no.elhub.flex.api.model.dto.generated.models.ServiceProviderProductSuspensionHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProviderProductSuspensionReason
import no.elhub.flex.api.model.dto.generated.models.ServiceProviderProductSuspensionResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProviderProductSuspensionUpdateRequest
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

private const val PATH = "/service_provider_product_suspension"

private fun createRequest(serviceProvider: Long, systemOperator: Long, productTypes: List<Long>) = ServiceProviderProductSuspensionCreateRequest(
    procuringSystemOperatorId = systemOperator,
    serviceProviderId = serviceProvider,
    productTypeIds = productTypes,
    reason = ServiceProviderProductSuspensionReason.OTHER,
)

private fun updateRequest(reason: ServiceProviderProductSuspensionReason) = ServiceProviderProductSuspensionUpdateRequest(reason = reason)

class ServiceProviderProductSuspensionApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.service_provider_product_suspension",
                "flex.service_provider_product_suspension_history",
                "flex.service_provider_product_application",
                "flex.product_type",
                "flex.party",
                "flex.entity",
            )
        }

        context("a FISO") {
            // RLS: SPPS-FISO001
            test("can list the product suspensions of all service providers") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val productType = seed { insertProductType() }
                val suspensions = seed(Triggers.OFF) {
                    List(2) {
                        val sp = insertParty(TestPartyRole.SP, "SP $it")
                        val so = insertParty(TestPartyRole.SO, "SO $it")
                        insertServiceProviderProductApplication(sp, so, listOf(productType), ServiceProviderProductApplicationStatus.QUALIFIED)
                        insertServiceProviderProductSuspension(sp, so, listOf(productType))
                    }
                }

                val response = api.get(PATH, fiso.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProviderProductSuspensionResponse>>().map { it.id } shouldContainExactlyInAnyOrder suspensions
            }

            test("can create, update and delete a product suspension for a system operator") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val productType = seed(Triggers.OFF) {
                    insertProductType().also { insertServiceProviderProductApplication(sp, so, listOf(it), ServiceProviderProductApplicationStatus.QUALIFIED) }
                }

                val created = api.post(PATH, fiso.token(), createRequest(sp, so, listOf(productType)))
                created.status shouldBe HttpStatusCode.Created
                val id = created.body<ServiceProviderProductSuspensionResponse>().id

                val updated = api.patch("$PATH/$id", fiso.token(), updateRequest(ServiceProviderProductSuspensionReason.BREACH_OF_CONDITIONS))
                updated.status shouldBe HttpStatusCode.OK
                updated.body<ServiceProviderProductSuspensionResponse>().reason shouldBe ServiceProviderProductSuspensionReason.BREACH_OF_CONDITIONS

                api.delete("$PATH/$id", fiso.token()).status shouldBe HttpStatusCode.NoContent
            }

            // SPPS-VAL001
            // The system operator has qualified the service provider for product type A, and has an application for B that is not qualified.
            // Another system operator has qualified the service provider for A, and the system operator has qualified another service provider.
            test("cannot suspend a service provider for a product type that the system operator has not qualified it for") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val otherSp = seed { insertParty(TestPartyRole.SP, "Other SP") }
                val so = seed { insertParty(TestPartyRole.SO) }
                val otherSo = seed { insertParty(TestPartyRole.SO, "Other SO") }
                val (a, b, c) = seed { List(3) { insertProductType() } }
                seed(Triggers.OFF) {
                    insertServiceProviderProductApplication(sp, so, listOf(a), ServiceProviderProductApplicationStatus.QUALIFIED)
                    insertServiceProviderProductApplication(sp, so, listOf(b), ServiceProviderProductApplicationStatus.NOT_QUALIFIED)
                    insertServiceProviderProductApplication(sp, otherSo, listOf(c), ServiceProviderProductApplicationStatus.QUALIFIED)
                    insertServiceProviderProductApplication(otherSp, so, listOf(c), ServiceProviderProductApplicationStatus.QUALIFIED)
                }

                api.post(PATH, fiso.token(), createRequest(sp, so, listOf(b))).status shouldBe HttpStatusCode.BadRequest
                api.post(PATH, fiso.token(), createRequest(sp, so, listOf(c))).status shouldBe HttpStatusCode.BadRequest
                api.post(PATH, fiso.token(), createRequest(sp, so, listOf(a, b))).status shouldBe HttpStatusCode.BadRequest
                api.post(PATH, fiso.token(), createRequest(sp, otherSo, listOf(a))).status shouldBe HttpStatusCode.BadRequest
                api.post(PATH, fiso.token(), createRequest(otherSp, so, listOf(a))).status shouldBe HttpStatusCode.BadRequest
                api.post(PATH, fiso.token(), createRequest(sp, so, listOf(a))).status shouldBe HttpStatusCode.Created
            }

            // RLS: SPPS-FISO002
            test("can read the archived revisions of the product suspensions of all service providers") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val productType = seed(Triggers.OFF) {
                    insertProductType().also { insertServiceProviderProductApplication(sp, so, listOf(it), ServiceProviderProductApplicationStatus.QUALIFIED) }
                }
                val suspension = seed { insertServiceProviderProductSuspension(sp, so, listOf(productType), "other") }
                // the view of the history also lists the current rows, so an archived revision is needed
                seed { changeServiceProviderProductSuspensionReason(suspension, "breach_of_conditions") }

                val response = api.get("${PATH}_history", fiso.token(), "replaced_at" to "not.is.null")

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProviderProductSuspensionHistoryResponse>>().map { it.reason } shouldBe
                    listOf(ServiceProviderProductSuspensionReason.OTHER)
            }
        }

        // RLS: SPPS-SP001
        // RLS: SPPS-SP002
        context("a service provider") {
            test("sees its product suspensions and their archived revisions, and no others") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val other = seed { insertParty(TestPartyRole.SP, "Other SP") }
                val so = seed { insertParty(TestPartyRole.SO) }
                val productType = seed(Triggers.OFF) {
                    insertProductType().also {
                        insertServiceProviderProductApplication(sp.partyId!!, so, listOf(it), ServiceProviderProductApplicationStatus.QUALIFIED)
                        insertServiceProviderProductApplication(other, so, listOf(it), ServiceProviderProductApplicationStatus.QUALIFIED)
                    }
                }
                val own = seed { insertServiceProviderProductSuspension(sp.partyId!!, so, listOf(productType), "other") }
                val others = seed { insertServiceProviderProductSuspension(other, so, listOf(productType), "other") }
                seed {
                    changeServiceProviderProductSuspensionReason(own, "breach_of_conditions")
                    changeServiceProviderProductSuspensionReason(others, "breach_of_conditions")
                }

                val list = api.get(PATH, sp.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProviderProductSuspensionResponse>>().map { it.id } shouldBe listOf(own)
                api.get("$PATH/$others", sp.token()).status shouldBe HIDDEN_BY_RLS

                val history = api.get("${PATH}_history", sp.token(), "replaced_at" to "not.is.null")
                history.body<List<ServiceProviderProductSuspensionHistoryResponse>>().map { it.serviceProviderProductSuspensionId } shouldBe listOf(own)
            }

            test("still sees the archived revisions of a product suspension that has been deleted") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val productType = seed(Triggers.OFF) {
                    insertProductType().also { insertServiceProviderProductApplication(sp.partyId!!, so, listOf(it), ServiceProviderProductApplicationStatus.QUALIFIED) }
                }
                val suspension = seed { insertServiceProviderProductSuspension(sp.partyId!!, so, listOf(productType)) }
                seed { deleteServiceProviderProductSuspension(suspension) }

                val history = api.get("${PATH}_history", sp.token(), "replaced_at" to "not.is.null")

                history.body<List<ServiceProviderProductSuspensionHistoryResponse>>().map { it.serviceProviderProductSuspensionId } shouldBe listOf(suspension)
            }

            test("cannot create, update or delete a product suspension") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val productType = seed(Triggers.OFF) {
                    insertProductType().also { insertServiceProviderProductApplication(sp.partyId!!, so, listOf(it), ServiceProviderProductApplicationStatus.QUALIFIED) }
                }
                val suspension = seed { insertServiceProviderProductSuspension(sp.partyId!!, so, listOf(productType)) }

                api.post(PATH, sp.token(), createRequest(sp.partyId!!, so, listOf(productType))).status shouldBe HttpStatusCode.Forbidden
                api.patch("$PATH/$suspension", sp.token(), updateRequest(ServiceProviderProductSuspensionReason.BREACH_OF_CONDITIONS)).status shouldBe
                    HttpStatusCode.Forbidden
                api.delete("$PATH/$suspension", sp.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // RLS: SPPS-SO001
        // RLS: SPPS-SO002
        context("the procuring system operator") {
            test("can create, read, update and delete its product suspension") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val productType = seed(Triggers.OFF) {
                    insertProductType().also { insertServiceProviderProductApplication(sp, so.partyId!!, listOf(it), ServiceProviderProductApplicationStatus.QUALIFIED) }
                }

                val created = api.post(PATH, so.token(), createRequest(sp, so.partyId!!, listOf(productType)))
                created.status shouldBe HttpStatusCode.Created
                val id = created.body<ServiceProviderProductSuspensionResponse>().id

                api.get("$PATH/$id", so.token()).status shouldBe HttpStatusCode.OK
                api.patch("$PATH/$id", so.token(), updateRequest(ServiceProviderProductSuspensionReason.BREACH_OF_CONDITIONS)).status shouldBe HttpStatusCode.OK
                api.delete("$PATH/$id", so.token()).status shouldBe HttpStatusCode.NoContent
            }

            test("cannot create a product suspension for another system operator") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val other = seed { insertParty(TestPartyRole.SO, "Other SO") }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val productType = seed(Triggers.OFF) {
                    insertProductType().also { insertServiceProviderProductApplication(sp, other, listOf(it), ServiceProviderProductApplicationStatus.QUALIFIED) }
                }

                api.post(PATH, so.token(), createRequest(sp, other, listOf(productType))).status shouldBe HttpStatusCode.Forbidden
            }

            test("sees the archived revisions of its product suspensions, and no others") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val other = seed { insertParty(TestPartyRole.SO, "Other SO") }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val otherSp = seed { insertParty(TestPartyRole.SP, "Other SP") }
                val productType = seed(Triggers.OFF) {
                    insertProductType().also {
                        insertServiceProviderProductApplication(sp, so.partyId!!, listOf(it), ServiceProviderProductApplicationStatus.QUALIFIED)
                        insertServiceProviderProductApplication(otherSp, other, listOf(it), ServiceProviderProductApplicationStatus.QUALIFIED)
                    }
                }
                val own = seed { insertServiceProviderProductSuspension(sp, so.partyId!!, listOf(productType), "other") }
                val others = seed { insertServiceProviderProductSuspension(otherSp, other, listOf(productType), "other") }
                seed {
                    changeServiceProviderProductSuspensionReason(own, "breach_of_conditions")
                    changeServiceProviderProductSuspensionReason(others, "breach_of_conditions")
                }

                val history = api.get("${PATH}_history", so.token(), "replaced_at" to "not.is.null")

                history.status shouldBe HttpStatusCode.OK
                history.body<List<ServiceProviderProductSuspensionHistoryResponse>>().map { it.serviceProviderProductSuspensionId } shouldBe listOf(own)
            }
        }

        // RLS: SPPS-SO003
        // RLS: SPPS-SO004
        // A system operator that has qualified the service provider for a product type, sees the suspensions of the service provider
        // for that product type, also when they are by another system operator.
        context("a system operator that has qualified the service provider for a product type") {
            test("sees the product suspension of another system operator for that product type, and not for others") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val suspender = seed { insertParty(TestPartyRole.SO, "Suspending SO") }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val (common, onlySuspender) = seed { List(2) { insertProductType() } }
                seed(Triggers.OFF) {
                    insertServiceProviderProductApplication(sp, suspender, listOf(common, onlySuspender), ServiceProviderProductApplicationStatus.QUALIFIED)
                    insertServiceProviderProductApplication(sp, so.partyId!!, listOf(common), ServiceProviderProductApplicationStatus.QUALIFIED)
                }
                val onCommon = seed { insertServiceProviderProductSuspension(sp, suspender, listOf(common)) }
                val onOther = seed { insertServiceProviderProductSuspension(sp, suspender, listOf(onlySuspender)) }

                val list = api.get(PATH, so.token())

                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProviderProductSuspensionResponse>>().map { it.id } shouldBe listOf(onCommon)
                api.get("$PATH/$onOther", so.token()).status shouldBe HIDDEN_BY_RLS
            }

            test("does not see the product suspension of another system operator when it has not qualified the service provider") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val suspender = seed { insertParty(TestPartyRole.SO, "Suspending SO") }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val productType = seed { insertProductType() }
                seed(Triggers.OFF) {
                    insertServiceProviderProductApplication(sp, suspender, listOf(productType), ServiceProviderProductApplicationStatus.QUALIFIED)
                    insertServiceProviderProductApplication(sp, so.partyId!!, listOf(productType), ServiceProviderProductApplicationStatus.NOT_QUALIFIED)
                }
                val suspension = seed { insertServiceProviderProductSuspension(sp, suspender, listOf(productType)) }

                api.get(PATH, so.token()).body<List<ServiceProviderProductSuspensionResponse>>() shouldBe emptyList()
                api.get("$PATH/$suspension", so.token()).status shouldBe HIDDEN_BY_RLS
            }

            test("does not see the archived revisions of a product suspension when it has not qualified the service provider") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val suspender = seed { insertParty(TestPartyRole.SO, "Suspending SO") }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val productType = seed(Triggers.OFF) {
                    insertProductType().also {
                        insertServiceProviderProductApplication(sp, suspender, listOf(it), ServiceProviderProductApplicationStatus.QUALIFIED)
                        insertServiceProviderProductApplication(sp, so.partyId!!, listOf(it), ServiceProviderProductApplicationStatus.NOT_QUALIFIED)
                    }
                }
                val suspension = seed { insertServiceProviderProductSuspension(sp, suspender, listOf(productType)) }
                seed { deleteServiceProviderProductSuspension(suspension) }

                api.get("${PATH}_history", so.token(), "replaced_at" to "not.is.null")
                    .body<List<ServiceProviderProductSuspensionHistoryResponse>>() shouldBe emptyList()
            }

            test("cannot update or delete the product suspension of another system operator") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val suspender = seed { insertParty(TestPartyRole.SO, "Suspending SO") }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val productType = seed(Triggers.OFF) {
                    insertProductType().also {
                        insertServiceProviderProductApplication(sp, suspender, listOf(it), ServiceProviderProductApplicationStatus.QUALIFIED)
                        insertServiceProviderProductApplication(sp, so.partyId!!, listOf(it), ServiceProviderProductApplicationStatus.QUALIFIED)
                    }
                }
                val suspension = seed { insertServiceProviderProductSuspension(sp, suspender, listOf(productType)) }

                api.patch("$PATH/$suspension", so.token(), updateRequest(ServiceProviderProductSuspensionReason.BREACH_OF_CONDITIONS)).status shouldBe
                    HIDDEN_BY_RLS
                api.delete("$PATH/$suspension", so.token()).status shouldBe HIDDEN_BY_RLS
            }

            // The archived revisions can be read after the suspension is deleted, as long as the application was there at the time of the revision.
            test("sees the archived revisions of that product suspension, also when it has been deleted") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val suspender = seed { insertParty(TestPartyRole.SO, "Suspending SO") }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val (common, onlySuspender) = seed { List(2) { insertProductType() } }
                seed(Triggers.OFF) {
                    insertServiceProviderProductApplication(sp, suspender, listOf(common, onlySuspender), ServiceProviderProductApplicationStatus.QUALIFIED)
                    insertServiceProviderProductApplication(sp, so.partyId!!, listOf(common), ServiceProviderProductApplicationStatus.QUALIFIED)
                }
                val onCommon = seed { insertServiceProviderProductSuspension(sp, suspender, listOf(common)) }
                val onOther = seed { insertServiceProviderProductSuspension(sp, suspender, listOf(onlySuspender)) }
                seed {
                    deleteServiceProviderProductSuspension(onCommon)
                    deleteServiceProviderProductSuspension(onOther)
                }

                val history = api.get("${PATH}_history", so.token(), "replaced_at" to "not.is.null")

                history.status shouldBe HttpStatusCode.OK
                history.body<List<ServiceProviderProductSuspensionHistoryResponse>>().map { it.serviceProviderProductSuspensionId } shouldBe listOf(onCommon)
            }

            // Timeline:
            //   1. the suspending system operator suspends the service provider and the suspension is deleted
            //   2. the system operator qualifies the service provider for the same product type
            test("does not see the archived revisions of a product suspension that ended before its own qualification existed") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val suspender = seed { insertParty(TestPartyRole.SO, "Suspending SO") }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val productType = seed(Triggers.OFF) {
                    insertProductType().also { insertServiceProviderProductApplication(sp, suspender, listOf(it), ServiceProviderProductApplicationStatus.QUALIFIED) }
                }
                val suspension = seed { insertServiceProviderProductSuspension(sp, suspender, listOf(productType)) }
                seed { deleteServiceProviderProductSuspension(suspension) }
                seed(Triggers.OFF) { insertServiceProviderProductApplication(sp, so.partyId!!, listOf(productType), ServiceProviderProductApplicationStatus.QUALIFIED) }

                api.get("${PATH}_history", so.token(), "replaced_at" to "not.is.null")
                    .body<List<ServiceProviderProductSuspensionHistoryResponse>>() shouldBe emptyList()
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
