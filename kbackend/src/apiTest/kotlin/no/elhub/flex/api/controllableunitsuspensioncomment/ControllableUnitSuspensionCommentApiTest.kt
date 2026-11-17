package no.elhub.flex.api.controllableunitsuspensioncomment

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitSuspensionCommentCreateRequest
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitSuspensionCommentHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitSuspensionCommentResponse
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitSuspensionCommentUpdateRequest
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitSuspensionCommentVisibility
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.SeededActor
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

private fun createRequest(suspension: Long, visibility: ControllableUnitSuspensionCommentVisibility, content: String = "New comment") =
    ControllableUnitSuspensionCommentCreateRequest(
        controllableUnitSuspensionId = suspension,
        visibility = visibility,
        content = content,
    )

/**
 * The parties of a suspension: the system operator that made it (the ISO) and the service provider that has a contract
 * on the suspended unit. Both are involved in the suspension, and can comment on it.
 */
private class SuspensionParties(val suspension: Long, val iso: SeededActor, val sp: SeededActor)

private fun SeedScope.insertSuspensionWithParties(): SuspensionParties {
    val iso = insertActor(TestPartyRole.SO, "ISO")
    val sp = insertActor(TestPartyRole.SP, "SP")
    val unit = insertControllableUnitAtNewAccountingPoint()
    activateControllableUnit(unit.id)
    insertPartyRelatedToControllableUnit(TestPartyRole.SP, sp.partyId!!, unit)
    return SuspensionParties(insertControllableUnitSuspension(unit.id, iso.partyId!!), iso, sp)
}

class ControllableUnitSuspensionCommentApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.accounting_point",
                "flex.metering_grid_area",
                "flex.party",
                "flex.entity",
                "flex.controllable_unit_suspension_comment_history",
            )
        }

        context("a FISO") {
            // RLS: CUSC-FISO001
            test("can list, create and update the comments of all parties") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val parties = seed { insertSuspensionWithParties() }
                val comment = seed { insertControllableUnitSuspensionComment(parties.suspension, parties.sp, "same_party") }

                val list = api.get("/controllable_unit_suspension_comment", fiso.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ControllableUnitSuspensionCommentResponse>>().map { it.id } shouldBe listOf(comment)

                val created = api.post(
                    "/controllable_unit_suspension_comment",
                    fiso.token(),
                    createRequest(parties.suspension, ControllableUnitSuspensionCommentVisibility.SAME_PARTY),
                )
                created.status shouldBe HttpStatusCode.Created

                val updated = api.patch(
                    "/controllable_unit_suspension_comment/$comment",
                    fiso.token(),
                    ControllableUnitSuspensionCommentUpdateRequest(content = "Edited by FISO"),
                )
                updated.status shouldBe HttpStatusCode.OK
            }

            // RLS: CUSC-FISO002
            test("can read the archived revisions of the comments of all parties") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val parties = seed { insertSuspensionWithParties() }
                val comment = seed { insertControllableUnitSuspensionComment(parties.suspension, parties.sp, "same_party", "Before") }
                // the view of the history also lists the current rows, so an archived revision is needed
                seed { changeCommentContent(comment, "After") }

                val response = api.get("/controllable_unit_suspension_comment_history", fiso.token(), "replaced_at" to "not.is.null")

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ControllableUnitSuspensionCommentHistoryResponse>>().map { it.content } shouldBe listOf("Before")
            }
        }

        // RLS: CUSC-SO001
        // RLS: CUSC-SP001
        context("an involved party") {
            test("can comment on the suspension, which a party that is not involved cannot") {
                val parties = seed { insertSuspensionWithParties() }
                val outsiderSo = seed { insertActor(TestPartyRole.SO, "Outsider SO") }
                val outsiderSp = seed { insertActor(TestPartyRole.SP, "Outsider SP") }
                val visibility = ControllableUnitSuspensionCommentVisibility.SAME_PARTY

                for (involved in listOf(parties.iso, parties.sp)) {
                    api.post("/controllable_unit_suspension_comment", involved.token(), createRequest(parties.suspension, visibility)).status shouldBe
                        HttpStatusCode.Created
                }
                for (outsider in listOf(outsiderSo, outsiderSp)) {
                    api.post("/controllable_unit_suspension_comment", outsider.token(), createRequest(parties.suspension, visibility)).status shouldBe
                        HttpStatusCode.Forbidden
                }
            }
        }

        // RLS: CUSC-SO002
        // RLS: CUSC-SP002
        // A comment with the visibility same_party can only be read by the party that wrote it, and a comment with the
        // visibility any_involved_party by all the parties of the suspension.
        context("a comment") {
            test("with the visibility same_party is read by the party that wrote it, and not by the other party") {
                val parties = seed { insertSuspensionWithParties() }
                val byIso = seed { insertControllableUnitSuspensionComment(parties.suspension, parties.iso, "same_party") }
                val bySp = seed { insertControllableUnitSuspensionComment(parties.suspension, parties.sp, "same_party") }

                api.get("/controllable_unit_suspension_comment", parties.iso.token()).body<List<ControllableUnitSuspensionCommentResponse>>()
                    .map { it.id } shouldBe listOf(byIso)
                api.get("/controllable_unit_suspension_comment", parties.sp.token()).body<List<ControllableUnitSuspensionCommentResponse>>()
                    .map { it.id } shouldBe listOf(bySp)
                api.get("/controllable_unit_suspension_comment/$bySp", parties.iso.token()).status shouldBe HIDDEN_BY_RLS
                api.get("/controllable_unit_suspension_comment/$byIso", parties.sp.token()).status shouldBe HIDDEN_BY_RLS
            }

            test("with the visibility any_involved_party is read by all the parties of the suspension") {
                val parties = seed { insertSuspensionWithParties() }
                val byIso = seed { insertControllableUnitSuspensionComment(parties.suspension, parties.iso, "any_involved_party") }
                val bySp = seed { insertControllableUnitSuspensionComment(parties.suspension, parties.sp, "any_involved_party") }

                for (reader in listOf(parties.iso, parties.sp)) {
                    api.get("/controllable_unit_suspension_comment", reader.token()).body<List<ControllableUnitSuspensionCommentResponse>>()
                        .map { it.id } shouldContainExactlyInAnyOrder listOf(byIso, bySp)
                }
            }

            test("with the visibility any_involved_party is not read by a party that is not involved") {
                val parties = seed { insertSuspensionWithParties() }
                val outsider = seed { insertActor(TestPartyRole.SO, "Outsider SO") }
                val comment = seed { insertControllableUnitSuspensionComment(parties.suspension, parties.iso, "any_involved_party") }

                api.get("/controllable_unit_suspension_comment", outsider.token()).body<List<ControllableUnitSuspensionCommentResponse>>() shouldBe
                    emptyList()
                api.get("/controllable_unit_suspension_comment/$comment", outsider.token()).status shouldBe HIDDEN_BY_RLS
            }
        }

        // RLS: CUSC-COM001
        context("the author of a comment") {
            test("can update it, but nobody else can, also not when the comment is visible to them") {
                val parties = seed { insertSuspensionWithParties() }
                val comment = seed { insertControllableUnitSuspensionComment(parties.suspension, parties.sp, "any_involved_party", "Original") }
                val fiso = seed { insertActor(TestPartyRole.FISO) }

                api.patch(
                    "/controllable_unit_suspension_comment/$comment",
                    parties.iso.token(),
                    ControllableUnitSuspensionCommentUpdateRequest(content = "Edited by ISO"),
                ).status shouldBe HIDDEN_BY_RLS
                api.get("/controllable_unit_suspension_comment/$comment", fiso.token()).body<ControllableUnitSuspensionCommentResponse>().content shouldBe
                    "Original"

                val updated = api.patch(
                    "/controllable_unit_suspension_comment/$comment",
                    parties.sp.token(),
                    ControllableUnitSuspensionCommentUpdateRequest(content = "Edited by SP"),
                )
                updated.status shouldBe HttpStatusCode.OK
                updated.body<ControllableUnitSuspensionCommentResponse>().content shouldBe "Edited by SP"
            }
        }

        // RLS: CUSC-SO003
        // RLS: CUSC-SP003
        // The revisions of a comment follow the latest visibility of the comment.
        context("the archived revisions of a comment") {
            test("with the visibility same_party are read by the party that wrote it, and not by the other party") {
                val parties = seed { insertSuspensionWithParties() }
                val comment = seed { insertControllableUnitSuspensionComment(parties.suspension, parties.iso, "same_party", "Before") }
                seed { changeCommentContent(comment, "After") }

                val own = api.get("/controllable_unit_suspension_comment_history", parties.iso.token(), "replaced_at" to "not.is.null")
                own.body<List<ControllableUnitSuspensionCommentHistoryResponse>>().map { it.content } shouldBe listOf("Before")
                api.get("/controllable_unit_suspension_comment_history", parties.sp.token(), "replaced_at" to "not.is.null")
                    .body<List<ControllableUnitSuspensionCommentHistoryResponse>>() shouldBe emptyList()
            }

            test("with the visibility any_involved_party are read by all the parties of the suspension") {
                val parties = seed { insertSuspensionWithParties() }
                val comment = seed { insertControllableUnitSuspensionComment(parties.suspension, parties.iso, "any_involved_party", "Before") }
                seed { changeCommentContent(comment, "After") }

                for (reader in listOf(parties.iso, parties.sp)) {
                    val history = api.get("/controllable_unit_suspension_comment_history", reader.token(), "replaced_at" to "not.is.null")
                    history.body<List<ControllableUnitSuspensionCommentHistoryResponse>>().map { it.content } shouldBe listOf("Before")
                }
            }
        }

        // RLS: CUSC-SO003
        test("the archived revisions of a comment with the visibility any_involved_party are not read by a party that is not involved") {
            val parties = seed { insertSuspensionWithParties() }
            val outsider = seed { insertActor(TestPartyRole.SO, "Outsider SO") }
            val comment = seed { insertControllableUnitSuspensionComment(parties.suspension, parties.iso, "any_involved_party", "Before") }
            seed { changeCommentContent(comment, "After") }

            api.get("/controllable_unit_suspension_comment_history", outsider.token(), "replaced_at" to "not.is.null")
                .body<List<ControllableUnitSuspensionCommentHistoryResponse>>() shouldBe emptyList()
        }

        // The other roles can read the view, but no policy lets them see a comment, also not when they are related to the unit.
        for (role in TestPartyRole.rolesWithDataGrants - setOf(TestPartyRole.FISO, TestPartyRole.SO, TestPartyRole.SP)) {
            test("${role.type} sees no comments") {
                val actor = seed { insertActor(role) }
                val parties = seed { insertSuspensionWithParties() }
                seed { insertControllableUnitSuspensionComment(parties.suspension, parties.iso, "any_involved_party") }

                val response = api.get("/controllable_unit_suspension_comment", actor.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ControllableUnitSuspensionCommentResponse>>() shouldBe emptyList()
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the comments") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get("/controllable_unit_suspension_comment", org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
