package no.elhub.flex.api.serviceprovidinggroupproductapplicationcomment

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationCommentCreateRequest
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationCommentHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationCommentResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationCommentUpdateRequest
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationCommentVisibility
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.SeededActor
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

private const val PATH = "/service_providing_group_product_application_comment"

private fun createRequest(application: Long, visibility: ServiceProvidingGroupProductApplicationCommentVisibility, content: String = "New comment") =
    ServiceProvidingGroupProductApplicationCommentCreateRequest(
        serviceProvidingGroupProductApplicationId = application,
        visibility = visibility,
        content = content,
    )

/**
 * The parties of a product application of a group: the system operator that is applied to (the PSO) and the service provider
 * of the group. Both are involved in the application, and can comment on it.
 *
 * Seed it with [Triggers.OFF]. The triggers would require an active group, and a qualified service provider.
 */
private class ServiceProvidingGroupProductApplicationParties(val application: Long, val so: SeededActor, val sp: SeededActor)

private fun SeedScope.insertServiceProvidingGroupProductApplicationWithParties(): ServiceProvidingGroupProductApplicationParties {
    val so = insertActor(TestPartyRole.SO, "PSO")
    val sp = insertActor(TestPartyRole.SP, "SP")
    val group = insertServiceProvidingGroup(sp.partyId!!)
    return ServiceProvidingGroupProductApplicationParties(insertServiceProvidingGroupProductApplication(group, so.partyId!!, listOf(insertProductType())), so, sp)
}

class ServiceProvidingGroupProductApplicationCommentApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.party",
                "flex.entity",
                "flex.service_providing_group",
                "flex.service_providing_group_product_application_comment_history",
            )
        }

        context("a FISO") {
            // RLS: SPGPAC-FISO001
            test("can list, create and update the comments of all parties") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationWithParties() }
                val comment = seed { insertServiceProvidingGroupProductApplicationComment(parties.application, parties.sp, "same_party") }

                val list = api.get(PATH, fiso.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProvidingGroupProductApplicationCommentResponse>>().map { it.id } shouldBe listOf(comment)

                val created = api.post(
                    PATH,
                    fiso.token(),
                    createRequest(parties.application, ServiceProvidingGroupProductApplicationCommentVisibility.SAME_PARTY),
                )
                created.status shouldBe HttpStatusCode.Created

                val updated = api.patch(
                    "$PATH/$comment",
                    fiso.token(),
                    ServiceProvidingGroupProductApplicationCommentUpdateRequest(content = "Edited by FISO"),
                )
                updated.status shouldBe HttpStatusCode.OK
            }

            // RLS: SPGPAC-FISO002
            test("can read the archived revisions of the comments of all parties") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationWithParties() }
                val comment = seed { insertServiceProvidingGroupProductApplicationComment(parties.application, parties.sp, "same_party", "Before") }
                // the view of the history also lists the current rows, so an archived revision is needed
                seed { changeServiceProvidingGroupProductApplicationCommentContent(comment, "After") }

                val response = api.get("${PATH}_history", fiso.token(), "replaced_at" to "not.is.null")

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProvidingGroupProductApplicationCommentHistoryResponse>>().map { it.content } shouldBe listOf("Before")
            }
        }

        // RLS: SPGPAC-SO001
        // RLS: SPGPAC-SP001
        context("an involved party") {
            test("can comment on the product application, which a party that is not involved cannot") {
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationWithParties() }
                val outsiderSo = seed { insertActor(TestPartyRole.SO, "Outsider SO") }
                val outsiderSp = seed { insertActor(TestPartyRole.SP, "Outsider SP") }
                val visibility = ServiceProvidingGroupProductApplicationCommentVisibility.SAME_PARTY

                for (involved in listOf(parties.so, parties.sp)) {
                    api.post(PATH, involved.token(), createRequest(parties.application, visibility)).status shouldBe
                        HttpStatusCode.Created
                }
                for (outsider in listOf(outsiderSo, outsiderSp)) {
                    api.post(PATH, outsider.token(), createRequest(parties.application, visibility)).status shouldBe
                        HttpStatusCode.Forbidden
                }
            }
        }

        // RLS: SPGPAC-SO002
        // RLS: SPGPAC-SP002
        // A comment with the visibility same_party can only be read by the party that wrote it, and a comment with the
        // visibility any_involved_party by all the parties of the product application.
        context("a comment") {
            test("with the visibility same_party is read by the party that wrote it, and not by the other party") {
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationWithParties() }
                val bySo = seed { insertServiceProvidingGroupProductApplicationComment(parties.application, parties.so, "same_party") }
                val bySp = seed { insertServiceProvidingGroupProductApplicationComment(parties.application, parties.sp, "same_party") }

                api.get(PATH, parties.so.token()).body<List<ServiceProvidingGroupProductApplicationCommentResponse>>()
                    .map { it.id } shouldBe listOf(bySo)
                api.get(PATH, parties.sp.token()).body<List<ServiceProvidingGroupProductApplicationCommentResponse>>()
                    .map { it.id } shouldBe listOf(bySp)
                api.get("$PATH/$bySp", parties.so.token()).status shouldBe HIDDEN_BY_RLS
                api.get("$PATH/$bySo", parties.sp.token()).status shouldBe HIDDEN_BY_RLS
            }

            test("with the visibility any_involved_party is read by all the parties of the product application") {
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationWithParties() }
                val bySo = seed { insertServiceProvidingGroupProductApplicationComment(parties.application, parties.so, "any_involved_party") }
                val bySp = seed { insertServiceProvidingGroupProductApplicationComment(parties.application, parties.sp, "any_involved_party") }

                for (reader in listOf(parties.so, parties.sp)) {
                    api.get(PATH, reader.token()).body<List<ServiceProvidingGroupProductApplicationCommentResponse>>()
                        .map { it.id } shouldContainExactlyInAnyOrder listOf(bySo, bySp)
                }
            }

            test("with the visibility any_involved_party is not read by a party that is not involved") {
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationWithParties() }
                val outsider = seed { insertActor(TestPartyRole.SO, "Outsider SO") }
                val comment = seed { insertServiceProvidingGroupProductApplicationComment(parties.application, parties.so, "any_involved_party") }

                api.get(PATH, outsider.token()).body<List<ServiceProvidingGroupProductApplicationCommentResponse>>() shouldBe
                    emptyList()
                api.get("$PATH/$comment", outsider.token()).status shouldBe HIDDEN_BY_RLS
            }
        }

        // RLS: SPGPAC-COM001
        context("the author of a comment") {
            test("can update it, but nobody else can, also not when the comment is visible to them") {
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationWithParties() }
                val comment = seed { insertServiceProvidingGroupProductApplicationComment(parties.application, parties.sp, "any_involved_party", "Original") }
                val fiso = seed { insertActor(TestPartyRole.FISO) }

                api.patch(
                    "$PATH/$comment",
                    parties.so.token(),
                    ServiceProvidingGroupProductApplicationCommentUpdateRequest(content = "Edited by PSO"),
                ).status shouldBe HIDDEN_BY_RLS
                api.get("$PATH/$comment", fiso.token()).body<ServiceProvidingGroupProductApplicationCommentResponse>().content shouldBe
                    "Original"

                val updated = api.patch(
                    "$PATH/$comment",
                    parties.sp.token(),
                    ServiceProvidingGroupProductApplicationCommentUpdateRequest(content = "Edited by SP"),
                )
                updated.status shouldBe HttpStatusCode.OK
                updated.body<ServiceProvidingGroupProductApplicationCommentResponse>().content shouldBe "Edited by SP"
            }
        }

        // RLS: SPGPAC-SO003
        // RLS: SPGPAC-SP003
        // The revisions of a comment follow the latest visibility of the comment.
        context("the archived revisions of a comment") {
            test("with the visibility same_party are read by the party that wrote it, and not by the other party") {
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationWithParties() }
                val comment = seed { insertServiceProvidingGroupProductApplicationComment(parties.application, parties.so, "same_party", "Before") }
                seed { changeServiceProvidingGroupProductApplicationCommentContent(comment, "After") }

                val own = api.get("${PATH}_history", parties.so.token(), "replaced_at" to "not.is.null")
                own.body<List<ServiceProvidingGroupProductApplicationCommentHistoryResponse>>().map { it.content } shouldBe listOf("Before")
                api.get("${PATH}_history", parties.sp.token(), "replaced_at" to "not.is.null")
                    .body<List<ServiceProvidingGroupProductApplicationCommentHistoryResponse>>() shouldBe emptyList()
            }

            test("with the visibility any_involved_party are read by all the parties of the product application") {
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationWithParties() }
                val comment = seed { insertServiceProvidingGroupProductApplicationComment(parties.application, parties.so, "any_involved_party", "Before") }
                seed { changeServiceProvidingGroupProductApplicationCommentContent(comment, "After") }

                for (reader in listOf(parties.so, parties.sp)) {
                    val history = api.get("${PATH}_history", reader.token(), "replaced_at" to "not.is.null")
                    history.body<List<ServiceProvidingGroupProductApplicationCommentHistoryResponse>>().map { it.content } shouldBe listOf("Before")
                }
            }
        }

        // RLS: SPGPAC-SO003
        test("the archived revisions of a comment with the visibility any_involved_party are not read by a party that is not involved") {
            val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationWithParties() }
            val outsider = seed { insertActor(TestPartyRole.SO, "Outsider SO") }
            val comment = seed { insertServiceProvidingGroupProductApplicationComment(parties.application, parties.so, "any_involved_party", "Before") }
            seed { changeServiceProvidingGroupProductApplicationCommentContent(comment, "After") }

            api.get("${PATH}_history", outsider.token(), "replaced_at" to "not.is.null")
                .body<List<ServiceProvidingGroupProductApplicationCommentHistoryResponse>>() shouldBe emptyList()
        }

        // The other roles can read the view, but no policy lets them see a comment, also not when they are related to the group.
        for (role in TestPartyRole.rolesWithDataGrants - setOf(TestPartyRole.FISO, TestPartyRole.SO, TestPartyRole.SP)) {
            test("${role.type} sees no comments") {
                val actor = seed { insertActor(role) }
                val parties = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationWithParties() }
                seed { insertServiceProvidingGroupProductApplicationComment(parties.application, parties.so, "any_involved_party") }

                val response = api.get(PATH, actor.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProvidingGroupProductApplicationCommentResponse>>() shouldBe emptyList()
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the comments") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get(PATH, org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
