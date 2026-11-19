package no.elhub.flex.api.serviceprovidinggroupgridprequalificationcomment

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupGridPrequalificationCommentCreateRequest
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupGridPrequalificationCommentHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupGridPrequalificationCommentResponse
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupGridPrequalificationCommentUpdateRequest
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupGridPrequalificationCommentVisibility
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.SeededActor
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

private fun createRequest(prequalification: Long, visibility: ServiceProvidingGroupGridPrequalificationCommentVisibility, content: String = "New comment") =
    ServiceProvidingGroupGridPrequalificationCommentCreateRequest(
        serviceProvidingGroupGridPrequalificationId = prequalification,
        visibility = visibility,
        content = content,
    )

/**
 * The parties of a grid prequalification: the system operator that is impacted by it (the ISO) and the service provider
 * of the group. Both are involved in the grid prequalification, and can comment on it.
 */
private class PrequalificationParties(val prequalification: Long, val iso: SeededActor, val sp: SeededActor)

private fun SeedScope.insertPrequalificationWithParties(): PrequalificationParties {
    val iso = insertActor(TestPartyRole.SO, "ISO")
    val sp = insertActor(TestPartyRole.SP, "SP")
    val group = insertServiceProvidingGroup(sp.partyId!!)
    return PrequalificationParties(insertGridPrequalification(group, iso.partyId!!), iso, sp)
}

class ServiceProvidingGroupGridPrequalificationCommentApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.party",
                "flex.entity",
                "flex.service_providing_group",
                "flex.service_providing_group_grid_prequalification_comment_history",
            )
        }

        context("a FISO") {
            // RLS: SPGGPC-FISO001
            test("can list, create and update the comments of all parties") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val parties = seed { insertPrequalificationWithParties() }
                val comment = seed { insertGridPrequalificationComment(parties.prequalification, parties.sp, "same_party") }

                val list = api.get("/service_providing_group_grid_prequalification_comment", fiso.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ServiceProvidingGroupGridPrequalificationCommentResponse>>().map { it.id } shouldBe listOf(comment)

                val created = api.post(
                    "/service_providing_group_grid_prequalification_comment",
                    fiso.token(),
                    createRequest(parties.prequalification, ServiceProvidingGroupGridPrequalificationCommentVisibility.SAME_PARTY),
                )
                created.status shouldBe HttpStatusCode.Created

                val updated = api.patch(
                    "/service_providing_group_grid_prequalification_comment/$comment",
                    fiso.token(),
                    ServiceProvidingGroupGridPrequalificationCommentUpdateRequest(content = "Edited by FISO"),
                )
                updated.status shouldBe HttpStatusCode.OK
            }

            // RLS: SPGGPC-FISO002
            test("can read the archived revisions of the comments of all parties") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val parties = seed { insertPrequalificationWithParties() }
                val comment = seed { insertGridPrequalificationComment(parties.prequalification, parties.sp, "same_party", "Before") }
                // the view of the history also lists the current rows, so an archived revision is needed
                seed { changeGridPrequalificationCommentContent(comment, "After") }

                val response = api.get("/service_providing_group_grid_prequalification_comment_history", fiso.token(), "replaced_at" to "not.is.null")

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProvidingGroupGridPrequalificationCommentHistoryResponse>>().map { it.content } shouldBe listOf("Before")
            }
        }

        // RLS: SPGGPC-SO001
        // RLS: SPGGPC-SP001
        context("an involved party") {
            test("can comment on the grid prequalification, which a party that is not involved cannot") {
                val parties = seed { insertPrequalificationWithParties() }
                val outsiderSo = seed { insertActor(TestPartyRole.SO, "Outsider SO") }
                val outsiderSp = seed { insertActor(TestPartyRole.SP, "Outsider SP") }
                val visibility = ServiceProvidingGroupGridPrequalificationCommentVisibility.SAME_PARTY

                for (involved in listOf(parties.iso, parties.sp)) {
                    api.post("/service_providing_group_grid_prequalification_comment", involved.token(), createRequest(parties.prequalification, visibility)).status shouldBe
                        HttpStatusCode.Created
                }
                for (outsider in listOf(outsiderSo, outsiderSp)) {
                    api.post("/service_providing_group_grid_prequalification_comment", outsider.token(), createRequest(parties.prequalification, visibility)).status shouldBe
                        HttpStatusCode.Forbidden
                }
            }
        }

        // RLS: SPGGPC-SO002
        // RLS: SPGGPC-SP002
        // A comment with the visibility same_party can only be read by the party that wrote it, and a comment with the
        // visibility any_involved_party by all the parties of the grid prequalification.
        context("a comment") {
            test("with the visibility same_party is read by the party that wrote it, and not by the other party") {
                val parties = seed { insertPrequalificationWithParties() }
                val byIso = seed { insertGridPrequalificationComment(parties.prequalification, parties.iso, "same_party") }
                val bySp = seed { insertGridPrequalificationComment(parties.prequalification, parties.sp, "same_party") }

                api.get("/service_providing_group_grid_prequalification_comment", parties.iso.token()).body<List<ServiceProvidingGroupGridPrequalificationCommentResponse>>()
                    .map { it.id } shouldBe listOf(byIso)
                api.get("/service_providing_group_grid_prequalification_comment", parties.sp.token()).body<List<ServiceProvidingGroupGridPrequalificationCommentResponse>>()
                    .map { it.id } shouldBe listOf(bySp)
                api.get("/service_providing_group_grid_prequalification_comment/$bySp", parties.iso.token()).status shouldBe HIDDEN_BY_RLS
                api.get("/service_providing_group_grid_prequalification_comment/$byIso", parties.sp.token()).status shouldBe HIDDEN_BY_RLS
            }

            test("with the visibility any_involved_party is read by all the parties of the grid prequalification") {
                val parties = seed { insertPrequalificationWithParties() }
                val byIso = seed { insertGridPrequalificationComment(parties.prequalification, parties.iso, "any_involved_party") }
                val bySp = seed { insertGridPrequalificationComment(parties.prequalification, parties.sp, "any_involved_party") }

                for (reader in listOf(parties.iso, parties.sp)) {
                    api.get("/service_providing_group_grid_prequalification_comment", reader.token()).body<List<ServiceProvidingGroupGridPrequalificationCommentResponse>>()
                        .map { it.id } shouldContainExactlyInAnyOrder listOf(byIso, bySp)
                }
            }

            test("with the visibility any_involved_party is not read by a party that is not involved") {
                val parties = seed { insertPrequalificationWithParties() }
                val outsider = seed { insertActor(TestPartyRole.SO, "Outsider SO") }
                val comment = seed { insertGridPrequalificationComment(parties.prequalification, parties.iso, "any_involved_party") }

                api.get("/service_providing_group_grid_prequalification_comment", outsider.token()).body<List<ServiceProvidingGroupGridPrequalificationCommentResponse>>() shouldBe
                    emptyList()
                api.get("/service_providing_group_grid_prequalification_comment/$comment", outsider.token()).status shouldBe HIDDEN_BY_RLS
            }
        }

        // RLS: SPGGPC-COM001
        context("the author of a comment") {
            test("can update it, but nobody else can, also not when the comment is visible to them") {
                val parties = seed { insertPrequalificationWithParties() }
                val comment = seed { insertGridPrequalificationComment(parties.prequalification, parties.sp, "any_involved_party", "Original") }
                val fiso = seed { insertActor(TestPartyRole.FISO) }

                api.patch(
                    "/service_providing_group_grid_prequalification_comment/$comment",
                    parties.iso.token(),
                    ServiceProvidingGroupGridPrequalificationCommentUpdateRequest(content = "Edited by ISO"),
                ).status shouldBe HIDDEN_BY_RLS
                api.get("/service_providing_group_grid_prequalification_comment/$comment", fiso.token()).body<ServiceProvidingGroupGridPrequalificationCommentResponse>().content shouldBe
                    "Original"

                val updated = api.patch(
                    "/service_providing_group_grid_prequalification_comment/$comment",
                    parties.sp.token(),
                    ServiceProvidingGroupGridPrequalificationCommentUpdateRequest(content = "Edited by SP"),
                )
                updated.status shouldBe HttpStatusCode.OK
                updated.body<ServiceProvidingGroupGridPrequalificationCommentResponse>().content shouldBe "Edited by SP"
            }
        }

        // RLS: SPGGPC-SO003
        // RLS: SPGGPC-SP003
        // The revisions of a comment follow the latest visibility of the comment.
        context("the archived revisions of a comment") {
            test("with the visibility same_party are read by the party that wrote it, and not by the other party") {
                val parties = seed { insertPrequalificationWithParties() }
                val comment = seed { insertGridPrequalificationComment(parties.prequalification, parties.iso, "same_party", "Before") }
                seed { changeGridPrequalificationCommentContent(comment, "After") }

                val own = api.get("/service_providing_group_grid_prequalification_comment_history", parties.iso.token(), "replaced_at" to "not.is.null")
                own.body<List<ServiceProvidingGroupGridPrequalificationCommentHistoryResponse>>().map { it.content } shouldBe listOf("Before")
                api.get("/service_providing_group_grid_prequalification_comment_history", parties.sp.token(), "replaced_at" to "not.is.null")
                    .body<List<ServiceProvidingGroupGridPrequalificationCommentHistoryResponse>>() shouldBe emptyList()
            }

            test("with the visibility any_involved_party are read by all the parties of the grid prequalification") {
                val parties = seed { insertPrequalificationWithParties() }
                val comment = seed { insertGridPrequalificationComment(parties.prequalification, parties.iso, "any_involved_party", "Before") }
                seed { changeGridPrequalificationCommentContent(comment, "After") }

                for (reader in listOf(parties.iso, parties.sp)) {
                    val history = api.get("/service_providing_group_grid_prequalification_comment_history", reader.token(), "replaced_at" to "not.is.null")
                    history.body<List<ServiceProvidingGroupGridPrequalificationCommentHistoryResponse>>().map { it.content } shouldBe listOf("Before")
                }
            }
        }

        // RLS: SPGGPC-SO003
        test("the archived revisions of a comment with the visibility any_involved_party are not read by a party that is not involved") {
            val parties = seed { insertPrequalificationWithParties() }
            val outsider = seed { insertActor(TestPartyRole.SO, "Outsider SO") }
            val comment = seed { insertGridPrequalificationComment(parties.prequalification, parties.iso, "any_involved_party", "Before") }
            seed { changeGridPrequalificationCommentContent(comment, "After") }

            api.get("/service_providing_group_grid_prequalification_comment_history", outsider.token(), "replaced_at" to "not.is.null")
                .body<List<ServiceProvidingGroupGridPrequalificationCommentHistoryResponse>>() shouldBe emptyList()
        }

        // The other roles can read the view, but no policy lets them see a comment, also not when they are related to the group.
        for (role in TestPartyRole.rolesWithDataGrants - setOf(TestPartyRole.FISO, TestPartyRole.SO, TestPartyRole.SP)) {
            test("${role.type} sees no comments") {
                val actor = seed { insertActor(role) }
                val parties = seed { insertPrequalificationWithParties() }
                seed { insertGridPrequalificationComment(parties.prequalification, parties.iso, "any_involved_party") }

                val response = api.get("/service_providing_group_grid_prequalification_comment", actor.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ServiceProvidingGroupGridPrequalificationCommentResponse>>() shouldBe emptyList()
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the comments") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get("/service_providing_group_grid_prequalification_comment", org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
