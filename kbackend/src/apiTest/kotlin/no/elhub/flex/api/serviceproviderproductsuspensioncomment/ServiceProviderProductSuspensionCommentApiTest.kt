package no.elhub.flex.api.serviceproviderproductsuspensioncomment

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ServiceProviderProductSuspensionCommentCreateRequest
import no.elhub.flex.api.model.dto.generated.models.ServiceProviderProductSuspensionCommentHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProviderProductSuspensionCommentResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProviderProductSuspensionCommentUpdateRequest
import no.elhub.flex.api.model.dto.generated.models.ServiceProviderProductSuspensionCommentVisibility
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.SeededActor
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

private const val PATH = "/service_provider_product_suspension_comment"

private fun createRequest(suspension: Long, visibility: ServiceProviderProductSuspensionCommentVisibility, content: String = "New comment") =
    ServiceProviderProductSuspensionCommentCreateRequest(
        serviceProviderProductSuspensionId = suspension,
        visibility = visibility,
        content = content,
    )

/**
 * The parties of a product suspension of a service provider: the system operator that made it (the PSO) and the suspended
 * service provider. Both are involved in the suspension, and can comment on it.
 *
 * Seed it with [Triggers.OFF]. The triggers would require that the system operator has qualified the service provider for the product type.
 */
private class ServiceProviderProductSuspensionParties(val suspension: Long, val so: SeededActor, val sp: SeededActor)

private fun SeedScope.insertServiceProviderProductSuspensionWithParties(): ServiceProviderProductSuspensionParties {
    val so = insertActor(TestPartyRole.SO, "PSO")
    val sp = insertActor(TestPartyRole.SP, "SP")
    val productType = insertProductType()
    return ServiceProviderProductSuspensionParties(insertServiceProviderProductSuspension(sp.partyId!!, so.partyId!!, listOf(productType)), so, sp)
}

class ServiceProviderProductSuspensionCommentApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.party",
                "flex.entity",
                "flex.product_type",
                "flex.service_provider_product_suspension_comment_history",
            )
        }

        context("a FISO") {
            // RLS: SPPSC-FISO001
            test("can list, create and update the comments of all parties") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val parties = seed(Triggers.OFF) { insertServiceProviderProductSuspensionWithParties() }
                val comment = seed { insertServiceProviderProductSuspensionComment(parties.suspension, parties.sp, "same_party") }

                val list = api.get(PATH, fiso.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProviderProductSuspensionCommentResponse>>().map { it.id } shouldBe listOf(comment)

                val created = api.post(
                    PATH,
                    fiso.token(),
                    createRequest(parties.suspension, ServiceProviderProductSuspensionCommentVisibility.SAME_PARTY),
                )
                created.status shouldBe HttpStatusCode.Created

                val updated = api.patch(
                    "$PATH/$comment",
                    fiso.token(),
                    ServiceProviderProductSuspensionCommentUpdateRequest(content = "Edited by FISO"),
                )
                updated.status shouldBe HttpStatusCode.OK
            }

            // RLS: SPPSC-FISO002
            test("can read the archived revisions of the comments of all parties") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val parties = seed(Triggers.OFF) { insertServiceProviderProductSuspensionWithParties() }
                val comment = seed { insertServiceProviderProductSuspensionComment(parties.suspension, parties.sp, "same_party", "Before") }
                // the view of the history also lists the current rows, so an archived revision is needed
                seed { changeServiceProviderProductSuspensionCommentContent(comment, "After") }

                val response = api.get("${PATH}_history", fiso.token(), "replaced_at" to "not.is.null")

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProviderProductSuspensionCommentHistoryResponse>>().map { it.content } shouldBe listOf("Before")
            }
        }

        // RLS: SPPSC-SO001
        // RLS: SPPSC-SP001
        context("an involved party") {
            test("can comment on the product suspension, which a party that is not involved cannot") {
                val parties = seed(Triggers.OFF) { insertServiceProviderProductSuspensionWithParties() }
                val outsiderSo = seed { insertActor(TestPartyRole.SO, "Outsider SO") }
                val outsiderSp = seed { insertActor(TestPartyRole.SP, "Outsider SP") }
                val visibility = ServiceProviderProductSuspensionCommentVisibility.SAME_PARTY

                for (involved in listOf(parties.so, parties.sp)) {
                    api.post(PATH, involved.token(), createRequest(parties.suspension, visibility)).status shouldBe
                        HttpStatusCode.Created
                }
                for (outsider in listOf(outsiderSo, outsiderSp)) {
                    api.post(PATH, outsider.token(), createRequest(parties.suspension, visibility)).status shouldBe
                        HttpStatusCode.Forbidden
                }
            }
        }

        // RLS: SPPSC-SO002
        // RLS: SPPSC-SP002
        // A comment with the visibility same_party can only be read by the party that wrote it, and a comment with the
        // visibility any_involved_party by all the parties of the product suspension.
        context("a comment") {
            test("with the visibility same_party is read by the party that wrote it, and not by the other party") {
                val parties = seed(Triggers.OFF) { insertServiceProviderProductSuspensionWithParties() }
                val bySo = seed { insertServiceProviderProductSuspensionComment(parties.suspension, parties.so, "same_party") }
                val bySp = seed { insertServiceProviderProductSuspensionComment(parties.suspension, parties.sp, "same_party") }

                api.get(PATH, parties.so.token()).body<List<ServiceProviderProductSuspensionCommentResponse>>()
                    .map { it.id } shouldBe listOf(bySo)
                api.get(PATH, parties.sp.token()).body<List<ServiceProviderProductSuspensionCommentResponse>>()
                    .map { it.id } shouldBe listOf(bySp)
                api.get("$PATH/$bySp", parties.so.token()).status shouldBe HIDDEN_BY_RLS
                api.get("$PATH/$bySo", parties.sp.token()).status shouldBe HIDDEN_BY_RLS
            }

            test("with the visibility any_involved_party is read by all the parties of the product suspension") {
                val parties = seed(Triggers.OFF) { insertServiceProviderProductSuspensionWithParties() }
                val bySo = seed { insertServiceProviderProductSuspensionComment(parties.suspension, parties.so, "any_involved_party") }
                val bySp = seed { insertServiceProviderProductSuspensionComment(parties.suspension, parties.sp, "any_involved_party") }

                for (reader in listOf(parties.so, parties.sp)) {
                    api.get(PATH, reader.token()).body<List<ServiceProviderProductSuspensionCommentResponse>>()
                        .map { it.id } shouldContainExactlyInAnyOrder listOf(bySo, bySp)
                }
            }

            test("with the visibility any_involved_party is not read by a party that is not involved") {
                val parties = seed(Triggers.OFF) { insertServiceProviderProductSuspensionWithParties() }
                val outsider = seed { insertActor(TestPartyRole.SO, "Outsider SO") }
                val comment = seed { insertServiceProviderProductSuspensionComment(parties.suspension, parties.so, "any_involved_party") }

                api.get(PATH, outsider.token()).body<List<ServiceProviderProductSuspensionCommentResponse>>() shouldBe
                    emptyList()
                api.get("$PATH/$comment", outsider.token()).status shouldBe HIDDEN_BY_RLS
            }
        }

        // RLS: SPPSC-COM001
        context("the author of a comment") {
            test("can update it, but nobody else can, also not when the comment is visible to them") {
                val parties = seed(Triggers.OFF) { insertServiceProviderProductSuspensionWithParties() }
                val comment = seed { insertServiceProviderProductSuspensionComment(parties.suspension, parties.sp, "any_involved_party", "Original") }
                val fiso = seed { insertActor(TestPartyRole.FISO) }

                api.patch(
                    "$PATH/$comment",
                    parties.so.token(),
                    ServiceProviderProductSuspensionCommentUpdateRequest(content = "Edited by PSO"),
                ).status shouldBe HIDDEN_BY_RLS
                api.get("$PATH/$comment", fiso.token()).body<ServiceProviderProductSuspensionCommentResponse>().content shouldBe
                    "Original"

                val updated = api.patch(
                    "$PATH/$comment",
                    parties.sp.token(),
                    ServiceProviderProductSuspensionCommentUpdateRequest(content = "Edited by SP"),
                )
                updated.status shouldBe HttpStatusCode.OK
                updated.body<ServiceProviderProductSuspensionCommentResponse>().content shouldBe "Edited by SP"
            }
        }

        // RLS: SPPSC-SO003
        // RLS: SPPSC-SP003
        // The revisions of a comment follow the latest visibility of the comment.
        context("the archived revisions of a comment") {
            test("with the visibility same_party are read by the party that wrote it, and not by the other party") {
                val parties = seed(Triggers.OFF) { insertServiceProviderProductSuspensionWithParties() }
                val comment = seed { insertServiceProviderProductSuspensionComment(parties.suspension, parties.so, "same_party", "Before") }
                seed { changeServiceProviderProductSuspensionCommentContent(comment, "After") }

                val own = api.get("${PATH}_history", parties.so.token(), "replaced_at" to "not.is.null")
                own.body<List<ServiceProviderProductSuspensionCommentHistoryResponse>>().map { it.content } shouldBe listOf("Before")
                api.get("${PATH}_history", parties.sp.token(), "replaced_at" to "not.is.null")
                    .body<List<ServiceProviderProductSuspensionCommentHistoryResponse>>() shouldBe emptyList()
            }

            test("with the visibility any_involved_party are read by all the parties of the product suspension") {
                val parties = seed(Triggers.OFF) { insertServiceProviderProductSuspensionWithParties() }
                val comment = seed { insertServiceProviderProductSuspensionComment(parties.suspension, parties.so, "any_involved_party", "Before") }
                seed { changeServiceProviderProductSuspensionCommentContent(comment, "After") }

                for (reader in listOf(parties.so, parties.sp)) {
                    val history = api.get("${PATH}_history", reader.token(), "replaced_at" to "not.is.null")
                    history.body<List<ServiceProviderProductSuspensionCommentHistoryResponse>>().map { it.content } shouldBe listOf("Before")
                }
            }
        }

        // RLS: SPPSC-SO003
        test("the archived revisions of a comment with the visibility any_involved_party are not read by a party that is not involved") {
            val parties = seed(Triggers.OFF) { insertServiceProviderProductSuspensionWithParties() }
            val outsider = seed { insertActor(TestPartyRole.SO, "Outsider SO") }
            val comment = seed { insertServiceProviderProductSuspensionComment(parties.suspension, parties.so, "any_involved_party", "Before") }
            seed { changeServiceProviderProductSuspensionCommentContent(comment, "After") }

            api.get("${PATH}_history", outsider.token(), "replaced_at" to "not.is.null")
                .body<List<ServiceProviderProductSuspensionCommentHistoryResponse>>() shouldBe emptyList()
        }

        // The other roles can read the view, but no policy lets them see a comment, also not when they are related to the group.
        for (role in TestPartyRole.rolesWithDataGrants - setOf(TestPartyRole.FISO, TestPartyRole.SO, TestPartyRole.SP)) {
            test("${role.type} sees no comments") {
                val actor = seed { insertActor(role) }
                val parties = seed(Triggers.OFF) { insertServiceProviderProductSuspensionWithParties() }
                seed { insertServiceProviderProductSuspensionComment(parties.suspension, parties.so, "any_involved_party") }

                val response = api.get(PATH, actor.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProviderProductSuspensionCommentResponse>>() shouldBe emptyList()
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the comments") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get(PATH, org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
