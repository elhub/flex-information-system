package no.elhub.flex.api.serviceprovidinggroupproductsuspensioncomment

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductSuspensionCommentCreateRequest
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductSuspensionCommentHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductSuspensionCommentResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductSuspensionCommentUpdateRequest
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductSuspensionCommentVisibility
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.SeededActor
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

private const val PATH = "/service_providing_group_product_suspension_comment"

private fun createRequest(suspension: Long, visibility: ServiceProvidingGroupProductSuspensionCommentVisibility, content: String = "New comment") =
    ServiceProvidingGroupProductSuspensionCommentCreateRequest(
        serviceProvidingGroupProductSuspensionId = suspension,
        visibility = visibility,
        content = content,
    )

/**
 * The parties of a product suspension of a group: the system operator that made it (the PSO) and the service provider of the
 * suspended group. Both are involved in the suspension, and can comment on it.
 *
 * Seed it with [Triggers.OFF]. The triggers would require that the system operator has prequalified the group for the product type.
 */
private class ServiceProvidingGroupProductSuspensionParties(val suspension: Long, val so: SeededActor, val sp: SeededActor)

private fun SeedScope.insertServiceProvidingGroupProductSuspensionWithParties(): ServiceProvidingGroupProductSuspensionParties {
    val so = insertActor(TestPartyRole.SO, "PSO")
    val sp = insertActor(TestPartyRole.SP, "SP")
    val group = insertServiceProvidingGroup(sp.partyId!!)
    val productType = insertProductType()
    return ServiceProvidingGroupProductSuspensionParties(insertServiceProvidingGroupProductSuspension(group, so.partyId!!, listOf(productType)), so, sp)
}

class ServiceProvidingGroupProductSuspensionCommentApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.party",
                "flex.entity",
                "flex.service_providing_group",
                "flex.service_providing_group_product_suspension_comment_history",
            )
        }

        context("a FISO") {
            // RLS: SPGPSC-FISO001
            test("can list, create and update the comments of all parties") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductSuspensionWithParties() }
                val comment = seed { insertServiceProvidingGroupProductSuspensionComment(parties.suspension, parties.sp, "same_party") }

                val list = api.get(PATH, fiso.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProvidingGroupProductSuspensionCommentResponse>>().map { it.id } shouldBe listOf(comment)

                val created = api.post(
                    PATH,
                    fiso.token(),
                    createRequest(parties.suspension, ServiceProvidingGroupProductSuspensionCommentVisibility.SAME_PARTY),
                )
                created.status shouldBe HttpStatusCode.Created

                val updated = api.patch(
                    "$PATH/$comment",
                    fiso.token(),
                    ServiceProvidingGroupProductSuspensionCommentUpdateRequest(content = "Edited by FISO"),
                )
                updated.status shouldBe HttpStatusCode.OK
            }

            // RLS: SPGPSC-FISO002
            test("can read the archived revisions of the comments of all parties") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductSuspensionWithParties() }
                val comment = seed { insertServiceProvidingGroupProductSuspensionComment(parties.suspension, parties.sp, "same_party", "Before") }
                // the view of the history also lists the current rows, so an archived revision is needed
                seed { changeServiceProvidingGroupProductSuspensionCommentContent(comment, "After") }

                val response = api.get("${PATH}_history", fiso.token(), "replaced_at" to "not.is.null")

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProvidingGroupProductSuspensionCommentHistoryResponse>>().map { it.content } shouldBe listOf("Before")
            }
        }

        // RLS: SPGPSC-SO001
        // RLS: SPGPSC-SP001
        context("an involved party") {
            test("can comment on the product suspension, which a party that is not involved cannot") {
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductSuspensionWithParties() }
                val outsiderSo = seed { insertActor(TestPartyRole.SO, "Outsider SO") }
                val outsiderSp = seed { insertActor(TestPartyRole.SP, "Outsider SP") }
                val visibility = ServiceProvidingGroupProductSuspensionCommentVisibility.SAME_PARTY

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

        // RLS: SPGPSC-SO002
        // RLS: SPGPSC-SP002
        // A comment with the visibility same_party can only be read by the party that wrote it, and a comment with the
        // visibility any_involved_party by all the parties of the product suspension.
        context("a comment") {
            test("with the visibility same_party is read by the party that wrote it, and not by the other party") {
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductSuspensionWithParties() }
                val bySo = seed { insertServiceProvidingGroupProductSuspensionComment(parties.suspension, parties.so, "same_party") }
                val bySp = seed { insertServiceProvidingGroupProductSuspensionComment(parties.suspension, parties.sp, "same_party") }

                api.get(PATH, parties.so.token()).body<List<ServiceProvidingGroupProductSuspensionCommentResponse>>()
                    .map { it.id } shouldBe listOf(bySo)
                api.get(PATH, parties.sp.token()).body<List<ServiceProvidingGroupProductSuspensionCommentResponse>>()
                    .map { it.id } shouldBe listOf(bySp)
                api.get("$PATH/$bySp", parties.so.token()).status shouldBe HIDDEN_BY_RLS
                api.get("$PATH/$bySo", parties.sp.token()).status shouldBe HIDDEN_BY_RLS
            }

            test("with the visibility any_involved_party is read by all the parties of the product suspension") {
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductSuspensionWithParties() }
                val bySo = seed { insertServiceProvidingGroupProductSuspensionComment(parties.suspension, parties.so, "any_involved_party") }
                val bySp = seed { insertServiceProvidingGroupProductSuspensionComment(parties.suspension, parties.sp, "any_involved_party") }

                for (reader in listOf(parties.so, parties.sp)) {
                    api.get(PATH, reader.token()).body<List<ServiceProvidingGroupProductSuspensionCommentResponse>>()
                        .map { it.id } shouldContainExactlyInAnyOrder listOf(bySo, bySp)
                }
            }

            test("with the visibility any_involved_party is not read by a party that is not involved") {
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductSuspensionWithParties() }
                val outsider = seed { insertActor(TestPartyRole.SO, "Outsider SO") }
                val comment = seed { insertServiceProvidingGroupProductSuspensionComment(parties.suspension, parties.so, "any_involved_party") }

                api.get(PATH, outsider.token()).body<List<ServiceProvidingGroupProductSuspensionCommentResponse>>() shouldBe
                    emptyList()
                api.get("$PATH/$comment", outsider.token()).status shouldBe HIDDEN_BY_RLS
            }
        }

        // RLS: SPGPSC-COM001
        context("the author of a comment") {
            test("can update it, but nobody else can, also not when the comment is visible to them") {
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductSuspensionWithParties() }
                val comment = seed { insertServiceProvidingGroupProductSuspensionComment(parties.suspension, parties.sp, "any_involved_party", "Original") }
                val fiso = seed { insertActor(TestPartyRole.FISO) }

                api.patch(
                    "$PATH/$comment",
                    parties.so.token(),
                    ServiceProvidingGroupProductSuspensionCommentUpdateRequest(content = "Edited by PSO"),
                ).status shouldBe HIDDEN_BY_RLS
                api.get("$PATH/$comment", fiso.token()).body<ServiceProvidingGroupProductSuspensionCommentResponse>().content shouldBe
                    "Original"

                val updated = api.patch(
                    "$PATH/$comment",
                    parties.sp.token(),
                    ServiceProvidingGroupProductSuspensionCommentUpdateRequest(content = "Edited by SP"),
                )
                updated.status shouldBe HttpStatusCode.OK
                updated.body<ServiceProvidingGroupProductSuspensionCommentResponse>().content shouldBe "Edited by SP"
            }
        }

        // RLS: SPGPSC-SO003
        // RLS: SPGPSC-SP003
        // The revisions of a comment follow the latest visibility of the comment.
        context("the archived revisions of a comment") {
            test("with the visibility same_party are read by the party that wrote it, and not by the other party") {
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductSuspensionWithParties() }
                val comment = seed { insertServiceProvidingGroupProductSuspensionComment(parties.suspension, parties.so, "same_party", "Before") }
                seed { changeServiceProvidingGroupProductSuspensionCommentContent(comment, "After") }

                val own = api.get("${PATH}_history", parties.so.token(), "replaced_at" to "not.is.null")
                own.body<List<ServiceProvidingGroupProductSuspensionCommentHistoryResponse>>().map { it.content } shouldBe listOf("Before")
                api.get("${PATH}_history", parties.sp.token(), "replaced_at" to "not.is.null")
                    .body<List<ServiceProvidingGroupProductSuspensionCommentHistoryResponse>>() shouldBe emptyList()
            }

            test("with the visibility any_involved_party are read by all the parties of the product suspension") {
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductSuspensionWithParties() }
                val comment = seed { insertServiceProvidingGroupProductSuspensionComment(parties.suspension, parties.so, "any_involved_party", "Before") }
                seed { changeServiceProvidingGroupProductSuspensionCommentContent(comment, "After") }

                for (reader in listOf(parties.so, parties.sp)) {
                    val history = api.get("${PATH}_history", reader.token(), "replaced_at" to "not.is.null")
                    history.body<List<ServiceProvidingGroupProductSuspensionCommentHistoryResponse>>().map { it.content } shouldBe listOf("Before")
                }
            }
        }

        // RLS: SPGPSC-SO003
        test("the archived revisions of a comment with the visibility any_involved_party are not read by a party that is not involved") {
            val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductSuspensionWithParties() }
            val outsider = seed { insertActor(TestPartyRole.SO, "Outsider SO") }
            val comment = seed { insertServiceProvidingGroupProductSuspensionComment(parties.suspension, parties.so, "any_involved_party", "Before") }
            seed { changeServiceProvidingGroupProductSuspensionCommentContent(comment, "After") }

            api.get("${PATH}_history", outsider.token(), "replaced_at" to "not.is.null")
                .body<List<ServiceProvidingGroupProductSuspensionCommentHistoryResponse>>() shouldBe emptyList()
        }

        // The other roles can read the view, but no policy lets them see a comment, also not when they are related to the group.
        for (role in TestPartyRole.rolesWithDataGrants - setOf(TestPartyRole.FISO, TestPartyRole.SO, TestPartyRole.SP)) {
            test("${role.type} sees no comments") {
                val actor = seed { insertActor(role) }
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductSuspensionWithParties() }
                seed { insertServiceProvidingGroupProductSuspensionComment(parties.suspension, parties.so, "any_involved_party") }

                val response = api.get(PATH, actor.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProvidingGroupProductSuspensionCommentResponse>>() shouldBe emptyList()
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the comments") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get(PATH, org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
