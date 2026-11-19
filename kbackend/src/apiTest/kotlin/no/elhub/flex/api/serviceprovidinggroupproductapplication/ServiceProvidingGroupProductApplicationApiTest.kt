package no.elhub.flex.api.serviceprovidinggroupproductapplication

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.add
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ServiceProviderProductApplicationStatus
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupGridPrequalificationStatus
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationCreateRequest
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationStatus
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupStatus
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token
import java.math.BigDecimal
import java.time.Instant

private val jan1 = Instant.parse("2024-01-01T08:00:00Z")

private const val PATH = "/service_providing_group_product_application"

private fun createRequest(group: Long, systemOperator: Long, productTypes: List<Long>) = ServiceProvidingGroupProductApplicationCreateRequest(
    serviceProvidingGroupId = group,
    procuringSystemOperatorId = systemOperator,
    productTypeIds = productTypes,
    maximumActivePowerUp = BigDecimal("1.0"),
    maximumActivePowerDown = BigDecimal("1.0"),
)

private fun updateRequest(status: ServiceProvidingGroupProductApplicationStatus) = buildJsonObject { put("status", status.value) }

private fun productTypes(vararg ids: Long) = buildJsonObject { putJsonArray("product_type_ids") { ids.forEach { add(it) } } }

/**
 * Seeds what a service provider needs to apply for the [productType] with the system operator [systemOperator]: the product type is
 * active for the operator, and the operator has qualified the provider for it. Seed it with [Triggers.OFF], as a
 * qualification has a process of its own.
 */
private fun SeedScope.insertQualifiedServiceProviderProductApplication(serviceProvider: Long, systemOperator: Long, productType: Long) {
    insertSystemOperatorProductType(systemOperator, productType)
    insertServiceProviderProductApplication(serviceProvider, systemOperator, listOf(productType), ServiceProviderProductApplicationStatus.QUALIFIED)
}

/**
 * Seeds an application of a group of the service provider [serviceProvider] to the system operator [systemOperator], with the qualification that it
 * needs. The triggers check the qualification each time the application is changed, not only when it is created. Seed it
 * with [Triggers.OFF], as the status of a new application is requested, and an active group needs members.
 */
@Suppress("LongParameterList")
private fun SeedScope.insertServiceProvidingGroupProductApplicationWithQualification(
    serviceProvider: Long,
    systemOperator: Long,
    status: ServiceProvidingGroupProductApplicationStatus = ServiceProvidingGroupProductApplicationStatus.REQUESTED,
    completeAt: Instant? = null,
    prequalifiedAt: Instant? = null,
    verifiedAt: Instant? = null,
    group: Long = insertServiceProvidingGroup(serviceProvider),
): Long {
    val productType = insertProductType()
    insertQualifiedServiceProviderProductApplication(serviceProvider, systemOperator, productType)
    return insertServiceProvidingGroupProductApplication(group, systemOperator, listOf(productType), status, completeAt, prequalifiedAt, verifiedAt)
}

class ServiceProvidingGroupProductApplicationApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.service_providing_group",
                "flex.service_providing_group_product_application_history",
                "flex.service_provider_product_application",
                "flex.product_type",
                "flex.party",
                "flex.entity",
            )
        }

        context("a FISO") {
            // RLS: SPGPA-FISO001
            test("can list the applications of all groups") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val applications = seed(Triggers.OFF) {
                    val productType = insertProductType()
                    List(2) {
                        insertServiceProvidingGroupProductApplication(
                            insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "SP $it")),
                            insertParty(TestPartyRole.SO, "SO $it"),
                            listOf(productType),
                        )
                    }
                }

                val response = api.get(PATH, fiso.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProvidingGroupProductApplicationResponse>>().map { it.id } shouldContainExactlyInAnyOrder applications
            }

            test("can update an application") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val application = seed(Triggers.OFF) {
                    insertServiceProvidingGroupProductApplicationWithQualification(
                        insertParty(TestPartyRole.SP),
                        insertParty(TestPartyRole.SO),
                    )
                }

                val response = api.patch(
                    "$PATH/$application",
                    fiso.token(),
                    buildJsonObject {
                        put("status", ServiceProvidingGroupProductApplicationStatus.PREQUALIFICATION.value)
                        put("complete_at", jan1.toString())
                    },
                )

                response.status shouldBe HttpStatusCode.OK
                response.body<ServiceProvidingGroupProductApplicationResponse>().status shouldBe ServiceProvidingGroupProductApplicationStatus.PREQUALIFICATION
            }

            test("cannot create an application") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val group = seed(Triggers.OFF) { insertServiceProvidingGroup(sp, status = ServiceProvidingGroupStatus.ACTIVE) }
                val productType = seed(Triggers.OFF) { insertProductType().also { insertQualifiedServiceProviderProductApplication(sp, so, it) } }

                api.post(PATH, fiso.token(), createRequest(group, so, listOf(productType))).status shouldBe HttpStatusCode.Forbidden
            }

            // The timestamps must follow the status: prequalified_at is set for prequalified and not for rejected, verified_at is set
            // for verified and not for rejected, and complete_at is set once the processing of the application has started.
            context("changing the status") {
                // SPGPA-VAL004
                test("to prequalified needs the time of the prequalification") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }
                    val application = seed(Triggers.OFF) {
                        insertServiceProvidingGroupProductApplicationWithQualification(
                            insertParty(TestPartyRole.SP),
                            insertParty(TestPartyRole.SO),
                            ServiceProvidingGroupProductApplicationStatus.PREQUALIFICATION,
                            completeAt = jan1,
                        )
                    }
                    val prequalified = ServiceProvidingGroupProductApplicationStatus.PREQUALIFIED.value

                    api.patch("$PATH/$application", fiso.token(), buildJsonObject { put("status", prequalified) }).status shouldBe HttpStatusCode.BadRequest
                    api.patch(
                        "$PATH/$application",
                        fiso.token(),
                        buildJsonObject {
                            put("status", prequalified)
                            put("prequalified_at", jan1.toString())
                        }
                    ).status shouldBe HttpStatusCode.OK
                }

                // SPGPA-VAL005
                test("to verified needs the time of the verification") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }
                    val application = seed(Triggers.OFF) {
                        insertServiceProvidingGroupProductApplicationWithQualification(
                            insertParty(TestPartyRole.SP),
                            insertParty(TestPartyRole.SO),
                            ServiceProvidingGroupProductApplicationStatus.PREQUALIFIED,
                            completeAt = jan1,
                            prequalifiedAt = jan1,
                        )
                    }
                    val verified = ServiceProvidingGroupProductApplicationStatus.VERIFIED.value

                    api.patch("$PATH/$application", fiso.token(), buildJsonObject { put("status", verified) }).status shouldBe HttpStatusCode.BadRequest
                    api.patch(
                        "$PATH/$application",
                        fiso.token(),
                        buildJsonObject {
                            put("status", verified)
                            put("verified_at", jan1.toString())
                        }
                    ).status shouldBe HttpStatusCode.OK
                }

                // SPGPA-VAL006
                test("to rejected needs the times of the prequalification and the verification to be cleared") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }
                    val application = seed(Triggers.OFF) {
                        insertServiceProvidingGroupProductApplicationWithQualification(
                            insertParty(TestPartyRole.SP),
                            insertParty(TestPartyRole.SO),
                            ServiceProvidingGroupProductApplicationStatus.VERIFIED,
                            completeAt = jan1,
                            prequalifiedAt = jan1,
                            verifiedAt = jan1,
                        )
                    }
                    val rejected = ServiceProvidingGroupProductApplicationStatus.REJECTED.value

                    api.patch("$PATH/$application", fiso.token(), buildJsonObject { put("status", rejected) }).status shouldBe HttpStatusCode.BadRequest
                    api.patch(
                        "$PATH/$application",
                        fiso.token(),
                        buildJsonObject {
                            put("status", rejected)
                            put("prequalified_at", JsonNull)
                        }
                    ).status shouldBe HttpStatusCode.BadRequest
                    api.patch(
                        "$PATH/$application",
                        fiso.token(),
                        buildJsonObject {
                            put("status", rejected)
                            put("verified_at", JsonNull)
                        }
                    ).status shouldBe HttpStatusCode.BadRequest
                    api.patch(
                        "$PATH/$application",
                        fiso.token(),
                        buildJsonObject {
                            put("status", rejected)
                            put("prequalified_at", JsonNull)
                            put("verified_at", JsonNull)
                        }
                    ).status shouldBe HttpStatusCode.OK
                }

                // SPGPA-VAL011
                test("to prequalification needs the time the application was completed") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }
                    val application = seed(Triggers.OFF) {
                        insertServiceProvidingGroupProductApplicationWithQualification(
                            insertParty(TestPartyRole.SP),
                            insertParty(TestPartyRole.SO),
                        )
                    }
                    val prequalification = ServiceProvidingGroupProductApplicationStatus.PREQUALIFICATION.value

                    api.patch("$PATH/$application", fiso.token(), buildJsonObject { put("status", prequalification) }).status shouldBe
                        HttpStatusCode.BadRequest
                    val response = api.patch(
                        "$PATH/$application",
                        fiso.token(),
                        buildJsonObject {
                            put("status", prequalification)
                            put("complete_at", jan1.toString())
                        }
                    )
                    response.status shouldBe HttpStatusCode.OK
                    response.body<ServiceProvidingGroupProductApplicationResponse>().completeAt!!.toString() shouldBe "2024-01-01T08:00:00Z"
                }
            }

            // SPGPA-VAL007
            // SPGPA-VAL008
            // These product types need a ramping capability and a ramping description.
            for (businessId in listOf("manual_frequency_restoration", "manual_frequency_restoration_disruption")) {
                test("cannot have $businessId without a ramping capability and a ramping description") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }
                    val sp = seed { insertParty(TestPartyRole.SP) }
                    val so = seed { insertParty(TestPartyRole.SO) }
                    val productType = seed(Triggers.OFF) {
                        insertProductType(businessId = businessId).also { insertQualifiedServiceProviderProductApplication(sp, so, it) }
                    }
                    val application = seed(Triggers.OFF) {
                        insertServiceProvidingGroupProductApplication(
                            insertServiceProvidingGroup(sp, status = ServiceProvidingGroupStatus.ACTIVE),
                            so,
                            listOf(productType),
                        )
                    }

                    api.patch("$PATH/$application", fiso.token(), buildJsonObject { put("ramping_capability", "always") }).status shouldBe
                        HttpStatusCode.BadRequest
                    api.patch("$PATH/$application", fiso.token(), buildJsonObject { put("ramping_description", "Ramps in 5 minutes") }).status shouldBe
                        HttpStatusCode.BadRequest
                    api.patch(
                        "$PATH/$application",
                        fiso.token(),
                        buildJsonObject {
                            put("ramping_capability", "always")
                            put("ramping_description", "Ramps in 5 minutes")
                        }
                    ).status shouldBe HttpStatusCode.OK
                }
            }

            // SPGPA-VAL009
            test("cannot remove all the product types of an application") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val application = seed(Triggers.OFF) {
                    insertServiceProvidingGroupProductApplicationWithQualification(
                        insertParty(TestPartyRole.SP),
                        insertParty(TestPartyRole.SO),
                    )
                }

                api.patch("$PATH/$application", fiso.token(), productTypes()).status shouldBe
                    HttpStatusCode.BadRequest
            }
        }

        context("a service provider") {
            // RLS: SPGPA-SP001
            test("sees the applications of its groups, and no others") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val productType = seed { insertProductType() }
                val own = seed(Triggers.OFF) {
                    insertServiceProvidingGroupProductApplication(insertServiceProvidingGroup(sp.partyId!!), so, listOf(productType))
                }
                val other = seed(Triggers.OFF) {
                    insertServiceProvidingGroupProductApplication(insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "Other SP")), so, listOf(productType))
                }

                val list = api.get(PATH, sp.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProvidingGroupProductApplicationResponse>>().map { it.id } shouldBe listOf(own)
                api.get("$PATH/$own", sp.token()).status shouldBe HttpStatusCode.OK
                api.get("$PATH/$other", sp.token()).status shouldBe HIDDEN_BY_RLS
            }

            // RLS: SPGPA-SP001
            test("can apply for its group, and the application is requested") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val group = seed(Triggers.OFF) { insertServiceProvidingGroup(sp.partyId!!, status = ServiceProvidingGroupStatus.ACTIVE) }
                val productType = seed(Triggers.OFF) { insertProductType().also { insertQualifiedServiceProviderProductApplication(sp.partyId!!, so, it) } }

                val response = api.post(PATH, sp.token(), createRequest(group, so, listOf(productType)))

                response.status shouldBe HttpStatusCode.Created
                response.body<ServiceProvidingGroupProductApplicationResponse>().status shouldBe ServiceProvidingGroupProductApplicationStatus.REQUESTED
            }

            // The policy SPGPA-SP001 would deny this too, but the trigger that checks the qualification runs first. It reads the
            // qualifications as the caller, who cannot see those of the owner of the group, so the application is rejected as not qualified.
            test("cannot apply for the group of another service provider") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val other = seed { insertParty(TestPartyRole.SP, "Other SP") }
                val so = seed { insertParty(TestPartyRole.SO) }
                val group = seed(Triggers.OFF) { insertServiceProvidingGroup(other, status = ServiceProvidingGroupStatus.ACTIVE) }
                val productType = seed(Triggers.OFF) { insertProductType().also { insertQualifiedServiceProviderProductApplication(other, so, it) } }

                api.post(PATH, sp.token(), createRequest(group, so, listOf(productType))).status shouldBe HttpStatusCode.BadRequest
            }

            // SPGPA-VAL001
            test("cannot apply for a group that is not active") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val group = seed { insertServiceProvidingGroup(sp.partyId!!) }
                val productType = seed(Triggers.OFF) { insertProductType().also { insertQualifiedServiceProviderProductApplication(sp.partyId!!, so, it) } }

                api.post(PATH, sp.token(), createRequest(group, so, listOf(productType))).status shouldBe HttpStatusCode.BadRequest
            }

            // SPGPA-VAL002
            test("cannot apply for a product type that is not active for the system operator") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val group = seed(Triggers.OFF) { insertServiceProvidingGroup(sp.partyId!!, status = ServiceProvidingGroupStatus.ACTIVE) }
                val productType = seed(Triggers.OFF) {
                    insertProductType().also {
                        insertSystemOperatorProductType(so, it, status = "inactive")
                        insertServiceProviderProductApplication(sp.partyId!!, so, listOf(it), ServiceProviderProductApplicationStatus.QUALIFIED)
                    }
                }

                api.post(PATH, sp.token(), createRequest(group, so, listOf(productType))).status shouldBe HttpStatusCode.BadRequest
            }

            // SPGPA-VAL003
            test("cannot apply for a product type that the system operator has not qualified it for") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val group = seed(Triggers.OFF) { insertServiceProvidingGroup(sp.partyId!!, status = ServiceProvidingGroupStatus.ACTIVE) }
                val productType = seed(Triggers.OFF) {
                    insertProductType().also {
                        insertSystemOperatorProductType(so, it)
                        insertServiceProviderProductApplication(sp.partyId!!, so, listOf(it), ServiceProviderProductApplicationStatus.NOT_QUALIFIED)
                    }
                }

                api.post(PATH, sp.token(), createRequest(group, so, listOf(productType))).status shouldBe HttpStatusCode.BadRequest
            }

            // SPGPA-VAL009
            test("cannot apply for no product types") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val so = seed { insertParty(TestPartyRole.SO) }
                val group = seed(Triggers.OFF) { insertServiceProvidingGroup(sp.partyId!!, status = ServiceProvidingGroupStatus.ACTIVE) }

                api.post(PATH, sp.token(), createRequest(group, so, emptyList())).status shouldBe HttpStatusCode.BadRequest
            }

            // SPGPA-VAL010
            // The group has an application to the system operator for product type A. Another application of the group to the same system
            // operator cannot include A, whether it is created or changed.
            context("with an application for product type A of a group to a system operator") {
                test("can apply for product type B to the same system operator, but not for A") {
                    val sp = seed { insertActor(TestPartyRole.SP) }
                    val so = seed { insertParty(TestPartyRole.SO) }
                    val group = seed(Triggers.OFF) { insertServiceProvidingGroup(sp.partyId!!, status = ServiceProvidingGroupStatus.ACTIVE) }
                    val (a, b) = seed(Triggers.OFF) { List(2) { insertProductType().also { type -> insertQualifiedServiceProviderProductApplication(sp.partyId!!, so, type) } } }
                    seed(Triggers.OFF) { insertServiceProvidingGroupProductApplication(group, so, listOf(a)) }

                    api.post(PATH, sp.token(), createRequest(group, so, listOf(a))).status shouldBe HttpStatusCode.BadRequest
                    api.post(PATH, sp.token(), createRequest(group, so, listOf(a, b))).status shouldBe HttpStatusCode.BadRequest
                    api.post(PATH, sp.token(), createRequest(group, so, listOf(b))).status shouldBe HttpStatusCode.Created
                }

                test("can apply for A to another system operator, and with another group to the same system operator") {
                    val sp = seed { insertActor(TestPartyRole.SP) }
                    val so = seed { insertParty(TestPartyRole.SO) }
                    val otherSo = seed { insertParty(TestPartyRole.SO, "Other SO") }
                    val group = seed(Triggers.OFF) { insertServiceProvidingGroup(sp.partyId!!, status = ServiceProvidingGroupStatus.ACTIVE) }
                    val otherGroup = seed(Triggers.OFF) {
                        insertServiceProvidingGroup(sp.partyId!!, "Other SPG", status = ServiceProvidingGroupStatus.ACTIVE)
                    }
                    val a = seed(Triggers.OFF) {
                        insertProductType().also {
                            insertQualifiedServiceProviderProductApplication(sp.partyId!!, so, it)
                            insertQualifiedServiceProviderProductApplication(sp.partyId!!, otherSo, it)
                        }
                    }
                    seed(Triggers.OFF) { insertServiceProvidingGroupProductApplication(group, so, listOf(a)) }

                    api.post(PATH, sp.token(), createRequest(group, otherSo, listOf(a))).status shouldBe HttpStatusCode.Created
                    api.post(PATH, sp.token(), createRequest(otherGroup, so, listOf(a))).status shouldBe HttpStatusCode.Created
                }

                test("cannot change another application to include A, but can add another product type or keep its own") {
                    val sp = seed { insertActor(TestPartyRole.SP) }
                    val so = seed { insertParty(TestPartyRole.SO) }
                    val group = seed(Triggers.OFF) { insertServiceProvidingGroup(sp.partyId!!, status = ServiceProvidingGroupStatus.ACTIVE) }
                    val (a, b, c) = seed(Triggers.OFF) { List(3) { insertProductType().also { type -> insertQualifiedServiceProviderProductApplication(sp.partyId!!, so, type) } } }
                    val applicationForA = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplication(group, so, listOf(a)) }
                    val applicationForB = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplication(group, so, listOf(b)) }

                    api.patch("$PATH/$applicationForB", sp.token(), productTypes(a, b))
                        .status shouldBe HttpStatusCode.BadRequest
                    api.patch("$PATH/$applicationForB", sp.token(), productTypes(b, c))
                        .status shouldBe HttpStatusCode.OK
                    api.patch("$PATH/$applicationForA", sp.token(), productTypes(a))
                        .status shouldBe HttpStatusCode.OK
                }
            }

            // RLS: SPGPA-SP001
            test("cannot update the application of another service provider") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val application = seed(Triggers.OFF) {
                    insertServiceProvidingGroupProductApplicationWithQualification(
                        insertParty(TestPartyRole.SP, "Other SP"),
                        insertParty(TestPartyRole.SO),
                    )
                }

                api.patch("$PATH/$application", sp.token(), updateRequest(ServiceProvidingGroupProductApplicationStatus.INACTIVE)).status shouldBe HIDDEN_BY_RLS
            }

            // RLS: SPGPA-SP002
            // The service provider can change a requested application, take it back by making it inactive, and request it again
            // when it has been rejected or made inactive. It cannot do anything else with the status.
            context("updating its application") {
                test("can change it while it is requested") {
                    val sp = seed { insertActor(TestPartyRole.SP) }
                    val application = seed(Triggers.OFF) {
                        insertServiceProvidingGroupProductApplicationWithQualification(
                            sp.partyId!!,
                            insertParty(TestPartyRole.SO),
                        )
                    }

                    val response = api.patch("$PATH/$application", sp.token(), buildJsonObject { put("additional_information", "More information") })

                    response.status shouldBe HttpStatusCode.OK
                    response.body<ServiceProvidingGroupProductApplicationResponse>().additionalInformation shouldBe "More information"
                }

                test("can make it inactive while it is requested, and request it again") {
                    val sp = seed { insertActor(TestPartyRole.SP) }
                    val application = seed(Triggers.OFF) {
                        insertServiceProvidingGroupProductApplicationWithQualification(
                            sp.partyId!!,
                            insertParty(TestPartyRole.SO),
                        )
                    }

                    val inactive = api.patch("$PATH/$application", sp.token(), updateRequest(ServiceProvidingGroupProductApplicationStatus.INACTIVE))
                    inactive.status shouldBe HttpStatusCode.OK
                    inactive.body<ServiceProvidingGroupProductApplicationResponse>().status shouldBe ServiceProvidingGroupProductApplicationStatus.INACTIVE
                    val requested = api.patch("$PATH/$application", sp.token(), updateRequest(ServiceProvidingGroupProductApplicationStatus.REQUESTED))
                    requested.status shouldBe HttpStatusCode.OK
                    requested.body<ServiceProvidingGroupProductApplicationResponse>().status shouldBe ServiceProvidingGroupProductApplicationStatus.REQUESTED
                }

                test("can request it again after it has been rejected") {
                    val sp = seed { insertActor(TestPartyRole.SP) }
                    val application = seed(Triggers.OFF) {
                        insertServiceProvidingGroupProductApplicationWithQualification(
                            sp.partyId!!,
                            insertParty(TestPartyRole.SO),
                            ServiceProvidingGroupProductApplicationStatus.REJECTED,
                        )
                    }

                    api.patch("$PATH/$application", sp.token(), updateRequest(ServiceProvidingGroupProductApplicationStatus.REQUESTED)).status shouldBe
                        HttpStatusCode.OK
                }

                test("cannot set any other status") {
                    val sp = seed { insertActor(TestPartyRole.SP) }
                    // the application is complete, so that only the status can make the update fail
                    val application = seed(Triggers.OFF) {
                        insertServiceProvidingGroupProductApplicationWithQualification(sp.partyId!!, insertParty(TestPartyRole.SO), completeAt = jan1)
                    }

                    for (status in listOf(ServiceProvidingGroupProductApplicationStatus.PREQUALIFICATION, ServiceProvidingGroupProductApplicationStatus.REJECTED)) {
                        api.patch("$PATH/$application", sp.token(), updateRequest(status)).status shouldBe HttpStatusCode.BadRequest
                    }
                }

                test("cannot change it, or make it inactive, once the system operator has started to process it") {
                    val sp = seed { insertActor(TestPartyRole.SP) }
                    val application = seed(Triggers.OFF) {
                        insertServiceProvidingGroupProductApplicationWithQualification(
                            sp.partyId!!,
                            insertParty(TestPartyRole.SO),
                            ServiceProvidingGroupProductApplicationStatus.PREQUALIFICATION,
                            completeAt = jan1,
                        )
                    }

                    api.patch("$PATH/$application", sp.token(), buildJsonObject { put("additional_information", "More information") }).status shouldBe
                        HttpStatusCode.BadRequest
                    api.patch("$PATH/$application", sp.token(), updateRequest(ServiceProvidingGroupProductApplicationStatus.INACTIVE)).status shouldBe
                        HttpStatusCode.BadRequest
                }

                test("cannot change it while it is inactive, without requesting it again") {
                    val sp = seed { insertActor(TestPartyRole.SP) }
                    val application = seed(Triggers.OFF) {
                        insertServiceProvidingGroupProductApplicationWithQualification(
                            sp.partyId!!,
                            insertParty(TestPartyRole.SO),
                            ServiceProvidingGroupProductApplicationStatus.INACTIVE,
                        )
                    }

                    api.patch("$PATH/$application", sp.token(), buildJsonObject { put("additional_information", "More information") }).status shouldBe
                        HttpStatusCode.BadRequest
                    api.patch("$PATH/$application", sp.token(), updateRequest(ServiceProvidingGroupProductApplicationStatus.INACTIVE)).status shouldBe
                        HttpStatusCode.BadRequest
                }

                test("is not restricted for a FISO or a system operator, which can make an inactive application inactive again") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }
                    val so = seed { insertActor(TestPartyRole.SO) }
                    val application = seed(Triggers.OFF) {
                        insertServiceProvidingGroupProductApplicationWithQualification(
                            insertParty(TestPartyRole.SP),
                            so.partyId!!,
                            ServiceProvidingGroupProductApplicationStatus.INACTIVE,
                        )
                    }

                    api.patch("$PATH/$application", fiso.token(), updateRequest(ServiceProvidingGroupProductApplicationStatus.INACTIVE)).status shouldBe
                        HttpStatusCode.OK
                    api.patch("$PATH/$application", so.token(), updateRequest(ServiceProvidingGroupProductApplicationStatus.INACTIVE)).status shouldBe
                        HttpStatusCode.OK
                }
            }
        }

        context("a system operator") {
            // RLS: SPGPA-SO001
            // The system operator is the procuring system operator of one application of group A. It sees that application and the other
            // applications of group A, also those to other system operators, and no applications of group B.
            test("sees its applications and the applications of the same groups, and no others") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val otherSo = seed { insertParty(TestPartyRole.SO, "Other SO") }
                val groupA = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP), "SPG A") }
                val groupB = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "Other SP"), "SPG B") }
                val productType = seed { insertProductType() }
                val own = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplication(groupA, so.partyId!!, listOf(productType)) }
                val sameGroup = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplication(groupA, otherSo, listOf(productType)) }
                val otherGroup = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplication(groupB, otherSo, listOf(productType)) }

                val list = api.get(PATH, so.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProvidingGroupProductApplicationResponse>>().map { it.id } shouldContainExactlyInAnyOrder listOf(own, sameGroup)
                api.get("$PATH/$otherGroup", so.token()).status shouldBe HIDDEN_BY_RLS
            }

            // RLS: SPGPA-SO003
            // The system operator is the impacted system operator of group A, and the procuring system operator of none of its
            // applications. It sees the applications of group A as long as its grid prequalification is not inactive.
            test("sees the applications of a group it has a grid prequalification for, unless it is inactive") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val otherSo = seed { insertParty(TestPartyRole.SO, "Other SO") }
                val groupA = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP), "SPG A") }
                val groupB = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "Other SP"), "SPG B") }
                val groupC = seed { insertServiceProvidingGroup(insertParty(TestPartyRole.SP, "Third SP"), "SPG C") }
                val productType = seed { insertProductType() }
                val applicationA = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplication(groupA, otherSo, listOf(productType)) }
                val applicationB = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplication(groupB, otherSo, listOf(productType)) }
                // the group of the application is prequalified by another system operator
                seed(Triggers.OFF) { insertServiceProvidingGroupProductApplication(groupC, otherSo, listOf(productType)) }
                seed { insertGridPrequalification(groupC, otherSo) }
                // the status of a new grid prequalification must be requested, which Triggers.OFF skips the check of
                seed(Triggers.OFF) {
                    insertGridPrequalification(groupA, so.partyId!!)
                    insertGridPrequalification(groupB, so.partyId!!, ServiceProvidingGroupGridPrequalificationStatus.INACTIVE)
                }

                val list = api.get(PATH, so.token())

                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProvidingGroupProductApplicationResponse>>().map { it.id } shouldBe listOf(applicationA)
                api.get("$PATH/$applicationB", so.token()).status shouldBe HIDDEN_BY_RLS
            }

            // RLS: SPGPA-SO002
            test("can update an application it is the procuring system operator of, and not the others it sees") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val otherSo = seed { insertParty(TestPartyRole.SO, "Other SO") }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val group = seed { insertServiceProvidingGroup(sp) }
                val own = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationWithQualification(sp, so.partyId!!, group = group) }
                val sameGroup = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationWithQualification(sp, otherSo, group = group) }
                val update = buildJsonObject {
                    put("status", ServiceProvidingGroupProductApplicationStatus.PREQUALIFICATION.value)
                    put("complete_at", jan1.toString())
                }

                api.patch("$PATH/$sameGroup", so.token(), update).status shouldBe HIDDEN_BY_RLS
                api.patch("$PATH/$own", so.token(), update).status shouldBe HttpStatusCode.OK
            }

            test("cannot create an application") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val group = seed(Triggers.OFF) { insertServiceProvidingGroup(sp, status = ServiceProvidingGroupStatus.ACTIVE) }
                val productType = seed(Triggers.OFF) { insertProductType().also { insertQualifiedServiceProviderProductApplication(sp, so.partyId!!, it) } }

                api.post(PATH, so.token(), createRequest(group, so.partyId!!, listOf(productType))).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // RLS: SPGPA-COM001
        // The archived revisions of an application are read by the parties that can read the application.
        context("the archived revisions of an application") {
            test("are read by a FISO, the service provider of the group and the procuring system operator, and not by others") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val sp = seed { insertActor(TestPartyRole.SP) }
                val so = seed { insertActor(TestPartyRole.SO) }
                val otherSp = seed { insertActor(TestPartyRole.SP, "Other SP") }
                val otherSo = seed { insertActor(TestPartyRole.SO, "Other SO") }
                val application = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationWithQualification(sp.partyId!!, so.partyId!!) }
                // the outsiders have an application of their own, which is not enough to read the revisions of this one
                seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationWithQualification(otherSp.partyId!!, otherSo.partyId!!) }
                seed { changeServiceProvidingGroupProductApplicationInformation(application, "Changed") }

                for (reader in listOf(fiso, sp, so)) {
                    val history = api.get("${PATH}_history", reader.token(), "replaced_at" to "not.is.null")
                    history.status shouldBe HttpStatusCode.OK
                    history.body<List<ServiceProvidingGroupProductApplicationHistoryResponse>>().map { it.serviceProvidingGroupProductApplicationId } shouldBe
                        listOf(application)
                }
                for (outsider in listOf(otherSp, otherSo)) {
                    api.get("${PATH}_history", outsider.token(), "replaced_at" to "not.is.null")
                        .body<List<ServiceProvidingGroupProductApplicationHistoryResponse>>() shouldBe emptyList()
                }
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
