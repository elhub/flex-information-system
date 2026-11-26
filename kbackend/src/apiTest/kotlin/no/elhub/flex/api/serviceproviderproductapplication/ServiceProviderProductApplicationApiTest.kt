package no.elhub.flex.api.serviceproviderproductapplication

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.add
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ServiceProviderProductApplicationCreateRequest
import no.elhub.flex.api.model.dto.generated.models.ServiceProviderProductApplicationHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProviderProductApplicationResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProviderProductApplicationStatus
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token
import java.time.Instant

private val jan1 = Instant.parse("2024-01-01T08:00:00Z")

private const val PATH = "/service_provider_product_application"

private fun createRequest(serviceProvider: Long, systemOperator: Long, productTypes: List<Long>) = ServiceProviderProductApplicationCreateRequest(
    serviceProviderId = serviceProvider,
    systemOperatorId = systemOperator,
    productTypeIds = productTypes,
)

private fun updateRequest(status: ServiceProviderProductApplicationStatus) = buildJsonObject { put("status", status.value) }

private fun productTypes(vararg ids: Long): JsonObject = buildJsonObject { putJsonArray("product_type_ids") { ids.forEach { add(it) } } }

class ServiceProviderProductApplicationApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.service_provider_product_application",
                "flex.service_provider_product_application_history",
                "flex.product_type",
                "flex.party",
                "flex.entity",
            )
        }

        context("a FISO") {
            // RLS: SPPA-FISO001
            test("can list the applications of all service providers") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val productType = seed { insertProductType() }
                // the triggers would require that the product types are active for the system operator
                val applications = seed(Triggers.OFF) {
                    List(2) {
                        insertServiceProviderProductApplication(insertParty(TestPartyRole.SP, "SP $it"), insertParty(TestPartyRole.SO, "SO $it"), listOf(productType))
                    }
                }

                val response = api.get(PATH, fiso.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProviderProductApplicationResponse>>().map { it.id } shouldContainExactlyInAnyOrder applications
            }

            test("can update the status and the product types of an application") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val (a, b) = seed { List(2) { insertProductType() } }
                // the triggers would require that the product types are active for the system operator
                val application = seed(Triggers.OFF) { insertServiceProviderProductApplication(insertParty(TestPartyRole.SP), insertParty(TestPartyRole.SO), listOf(a)) }

                api.patch("$PATH/$application", fiso.token(), updateRequest(ServiceProviderProductApplicationStatus.IN_PROGRESS)).status shouldBe HttpStatusCode.OK
                val updated = api.patch("$PATH/$application", fiso.token(), productTypes(a, b))
                updated.status shouldBe HttpStatusCode.OK
                updated.body<ServiceProviderProductApplicationResponse>().productTypeIds shouldContainExactlyInAnyOrder listOf(a, b)
            }

            test("cannot create an application") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val productType = seed { insertProductType().also { insertSystemOperatorProductType(so, it) } }

                api.post(PATH, fiso.token(), createRequest(sp, so, listOf(productType))).status shouldBe HttpStatusCode.Forbidden
            }

            test("cannot make an application requested again") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val application = seed(Triggers.OFF) {
                    insertServiceProviderProductApplication(
                        insertParty(TestPartyRole.SP),
                        insertParty(TestPartyRole.SO),
                        listOf(insertProductType()),
                        ServiceProviderProductApplicationStatus.IN_PROGRESS,
                    )
                }

                api.patch("$PATH/$application", fiso.token(), updateRequest(ServiceProviderProductApplicationStatus.REQUESTED)).status shouldBe
                    HttpStatusCode.BadRequest
            }

            // The time of the qualification is set for qualified, and cleared for not qualified.
            context("qualifying an application") {
                test("needs the time of the qualification") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }
                    // the triggers would require that the product types are active for the system operator
                    val application = seed(Triggers.OFF) { insertServiceProviderProductApplication(insertParty(TestPartyRole.SP), insertParty(TestPartyRole.SO), listOf(insertProductType())) }
                    val qualified = ServiceProviderProductApplicationStatus.QUALIFIED.value

                    api.patch("$PATH/$application", fiso.token(), buildJsonObject { put("status", qualified) }).status shouldBe HttpStatusCode.BadRequest
                    val response = api.patch(
                        "$PATH/$application",
                        fiso.token(),
                        buildJsonObject {
                            put("status", qualified)
                            put("qualified_at", jan1.toString())
                        }
                    )
                    response.status shouldBe HttpStatusCode.OK
                    response.body<ServiceProviderProductApplicationResponse>().status shouldBe ServiceProviderProductApplicationStatus.QUALIFIED
                }

                test("is undone by clearing the time of the qualification") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }
                    val application = seed(Triggers.OFF) {
                        insertServiceProviderProductApplication(
                            insertParty(TestPartyRole.SP),
                            insertParty(TestPartyRole.SO),
                            listOf(insertProductType()),
                            ServiceProviderProductApplicationStatus.QUALIFIED,
                        )
                    }
                    val notQualified = ServiceProviderProductApplicationStatus.NOT_QUALIFIED.value

                    api.patch("$PATH/$application", fiso.token(), buildJsonObject { put("status", notQualified) }).status shouldBe HttpStatusCode.BadRequest
                    api.patch(
                        "$PATH/$application",
                        fiso.token(),
                        buildJsonObject {
                            put("status", notQualified)
                            put("qualified_at", JsonNull)
                        }
                    ).status shouldBe HttpStatusCode.OK
                }
            }

            // SPPA-VAL004
            test("cannot remove all the product types of an application") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                // the triggers would require that the product types are active for the system operator
                val application = seed(Triggers.OFF) { insertServiceProviderProductApplication(insertParty(TestPartyRole.SP), insertParty(TestPartyRole.SO), listOf(insertProductType())) }

                api.patch("$PATH/$application", fiso.token(), productTypes()).status shouldBe HttpStatusCode.BadRequest
            }
        }

        context("a service provider") {
            // RLS: SPPA-SP001
            test("sees its own applications, and no others") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val productType = seed { insertProductType() }
                // the triggers would require that the product types are active for the system operator
                val own = seed(Triggers.OFF) { insertServiceProviderProductApplication(sp.partyId!!, so, listOf(productType)) }
                val other = seed(Triggers.OFF) { insertServiceProviderProductApplication(insertParty(TestPartyRole.SP, "Other SP"), so, listOf(productType)) }

                val list = api.get(PATH, sp.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProviderProductApplicationResponse>>().map { it.id } shouldBe listOf(own)
                api.get("$PATH/$own", sp.token()).status shouldBe HttpStatusCode.OK
                api.get("$PATH/$other", sp.token()).status shouldBe HIDDEN_BY_RLS
            }

            // RLS: SPPA-SP001
            test("can apply for itself, and the application is requested") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val productType = seed { insertProductType().also { insertSystemOperatorProductType(so, it) } }

                val response = api.post(PATH, sp.token(), createRequest(sp.partyId!!, so, listOf(productType)))

                response.status shouldBe HttpStatusCode.Created
                response.body<ServiceProviderProductApplicationResponse>().status shouldBe ServiceProviderProductApplicationStatus.REQUESTED
            }

            // RLS: SPPA-SP001
            test("cannot apply for another service provider") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val other = seed { insertParty(TestPartyRole.SP, "Other SP") }
                val so = seed { insertParty(TestPartyRole.SO) }
                val productType = seed { insertProductType().also { insertSystemOperatorProductType(so, it) } }

                api.post(PATH, sp.token(), createRequest(other, so, listOf(productType))).status shouldBe HttpStatusCode.Forbidden
            }

            // SPPA-VAL001
            test("cannot apply for a product type that is not active for the system operator") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val (inactive, unlinked) = seed { List(2) { insertProductType() } }
                // the status of a new product type of a system operator must be active, which Triggers.OFF skips the check of
                seed(Triggers.OFF) { insertSystemOperatorProductType(so, inactive, status = "inactive") }

                api.post(PATH, sp.token(), createRequest(sp.partyId!!, so, listOf(inactive))).status shouldBe HttpStatusCode.BadRequest
                api.post(PATH, sp.token(), createRequest(sp.partyId!!, so, listOf(unlinked))).status shouldBe HttpStatusCode.BadRequest
            }

            // SPPA-VAL004
            test("cannot apply for no product types") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val so = seed { insertParty(TestPartyRole.SO) }

                api.post(PATH, sp.token(), createRequest(sp.partyId!!, so, emptyList())).status shouldBe HttpStatusCode.BadRequest
            }

            // RLS: SPPA-SP002
            test("can change the product types of its application while it is requested") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val (a, b) = seed { List(2) { insertProductType() } }
                // the triggers would require that the product types are active for the system operator
                val application = seed(Triggers.OFF) { insertServiceProviderProductApplication(sp.partyId!!, insertParty(TestPartyRole.SO), listOf(a)) }

                val response = api.patch("$PATH/$application", sp.token(), productTypes(a, b))

                response.status shouldBe HttpStatusCode.OK
                response.body<ServiceProviderProductApplicationResponse>().productTypeIds shouldContainExactlyInAnyOrder listOf(a, b)
            }

            // RLS: SPPA-SP002
            test("cannot change the product types of its application once the system operator has started to process it") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val (a, b) = seed { List(2) { insertProductType() } }
                val application = seed(Triggers.OFF) {
                    insertServiceProviderProductApplication(sp.partyId!!, insertParty(TestPartyRole.SO), listOf(a), ServiceProviderProductApplicationStatus.IN_PROGRESS)
                }

                api.patch("$PATH/$application", sp.token(), productTypes(a, b)).status shouldBe HttpStatusCode.BadRequest
            }

            test("cannot change the status of its application") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                // the triggers would require that the product types are active for the system operator
                val application = seed(Triggers.OFF) { insertServiceProviderProductApplication(sp.partyId!!, insertParty(TestPartyRole.SO), listOf(insertProductType())) }

                api.patch("$PATH/$application", sp.token(), updateRequest(ServiceProviderProductApplicationStatus.IN_PROGRESS)).status shouldBe
                    HttpStatusCode.Forbidden
            }

            // RLS: SPPA-SP001
            test("cannot update the application of another service provider") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val (a, b) = seed { List(2) { insertProductType() } }
                // the triggers would require that the product types are active for the system operator
                val application = seed(Triggers.OFF) { insertServiceProviderProductApplication(insertParty(TestPartyRole.SP, "Other SP"), insertParty(TestPartyRole.SO), listOf(a)) }

                api.patch("$PATH/$application", sp.token(), productTypes(a, b)).status shouldBe HIDDEN_BY_RLS
            }
        }

        context("a system operator") {
            // RLS: SPPA-SO001
            test("sees the applications to all system operators") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val productType = seed { insertProductType() }
                // the triggers would require that the product types are active for the system operator
                val own = seed(Triggers.OFF) { insertServiceProviderProductApplication(insertParty(TestPartyRole.SP), so.partyId!!, listOf(productType)) }
                val other = seed(Triggers.OFF) { insertServiceProviderProductApplication(insertParty(TestPartyRole.SP, "Other SP"), insertParty(TestPartyRole.SO, "Other SO"), listOf(productType)) }

                val list = api.get(PATH, so.token())

                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProviderProductApplicationResponse>>().map { it.id } shouldContainExactlyInAnyOrder listOf(own, other)
                api.get("$PATH/$other", so.token()).status shouldBe HttpStatusCode.OK
            }

            // RLS: SPPA-SO002
            test("can update the status of an application to it, and not of the others it sees") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val productType = seed { insertProductType() }
                // the triggers would require that the product types are active for the system operator
                val own = seed(Triggers.OFF) { insertServiceProviderProductApplication(insertParty(TestPartyRole.SP), so.partyId!!, listOf(productType)) }
                val other = seed(Triggers.OFF) { insertServiceProviderProductApplication(insertParty(TestPartyRole.SP, "Other SP"), insertParty(TestPartyRole.SO, "Other SO"), listOf(productType)) }

                api.patch("$PATH/$other", so.token(), updateRequest(ServiceProviderProductApplicationStatus.IN_PROGRESS)).status shouldBe HIDDEN_BY_RLS
                api.patch("$PATH/$own", so.token(), updateRequest(ServiceProviderProductApplicationStatus.IN_PROGRESS)).status shouldBe HttpStatusCode.OK
            }

            test("cannot create an application, or change its product types") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val (a, b) = seed { List(2) { insertProductType() } }
                seed { insertSystemOperatorProductType(so.partyId!!, a) }
                // the triggers would require that the product types are active for the system operator
                val application = seed(Triggers.OFF) { insertServiceProviderProductApplication(sp, so.partyId!!, listOf(a)) }

                api.post(PATH, so.token(), createRequest(sp, so.partyId!!, listOf(a))).status shouldBe HttpStatusCode.Forbidden
                api.patch("$PATH/$application", so.token(), productTypes(a, b)).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // RLS: SPPA-COM001
        // The archived revisions of an application are read by the parties that can read the application: a FISO, the service
        // provider of the application, and the system operators, but not another service provider.
        context("the archived revisions of an application") {
            test("are read by a FISO, the service provider and a system operator, and not by another service provider") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val sp = seed { insertActor(TestPartyRole.SP) }
                val so = seed { insertActor(TestPartyRole.SO) }
                val otherSp = seed { insertActor(TestPartyRole.SP, "Other SP") }
                val productType = seed { insertProductType() }
                // the triggers would require that the product types are active for the system operator
                val application = seed(Triggers.OFF) { insertServiceProviderProductApplication(sp.partyId!!, so.partyId!!, listOf(productType)) }
                // the other service provider has an application of its own, which is not enough to read the revisions of this one
                seed(Triggers.OFF) { insertServiceProviderProductApplication(otherSp.partyId!!, so.partyId!!, listOf(productType)) }
                seed { changeServiceProviderProductApplicationStatus(application, ServiceProviderProductApplicationStatus.IN_PROGRESS) }

                for (reader in listOf(fiso, sp, so)) {
                    val history = api.get("${PATH}_history", reader.token(), "replaced_at" to "not.is.null")
                    history.status shouldBe HttpStatusCode.OK
                    history.body<List<ServiceProviderProductApplicationHistoryResponse>>().map { it.serviceProviderProductApplicationId } shouldBe listOf(application)
                }
                api.get("${PATH}_history", otherSp.token(), "replaced_at" to "not.is.null")
                    .body<List<ServiceProviderProductApplicationHistoryResponse>>() shouldBe emptyList()
            }
        }

        // These roles have no grant on the applications.
        for (role in TestPartyRole.rolesWithDataGrants - setOf(TestPartyRole.FISO, TestPartyRole.SO, TestPartyRole.SP)) {
            test("${role.type} cannot list the applications") {
                val actor = seed { insertActor(role) }

                api.get(PATH, actor.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the applications") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get(PATH, org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
