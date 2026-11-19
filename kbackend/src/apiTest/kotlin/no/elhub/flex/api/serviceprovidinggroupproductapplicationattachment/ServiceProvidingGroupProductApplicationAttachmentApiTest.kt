package no.elhub.flex.api.serviceprovidinggroupproductapplicationattachment

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiClient
import no.elhub.flex.ApiResponse
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ErrorMessage
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationAttachmentContentType
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationAttachmentResponse
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.SeededActor
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

private const val PATH = "/service_providing_group_product_application_attachment"

private const val APPLICATION_FIELD = "service_providing_group_product_application_id"

/** The attachments are a resource of their own, so a token needs the scope to manage them next to the data. */
private fun SeededActor.attachmentToken() = token(scope = "manage:data manage:attachment")

private const val MAXIMUM_FILE_SIZE_BYTES = 20_000_000

/** A structurally minimal but valid single-page PDF, padded with spaces to be at least [minimumSizeBytes] long. */
private fun minimalPdf(minimumSizeBytes: Int = 0): ByteArray {
    val stream = "BT /F1 12 Tf 72 720 Td (hello) Tj ET"
    val objects = listOf(
        "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
        "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R " +
            "/Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
        "4 0 obj\n<< /Length ${stream.length} >>\nstream\n$stream\nendstream\nendobj\n",
        "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    )
    val header = "%PDF-1.4\n"
    val offsets = objects.runningFold(header.length) { offset, obj -> offset + obj.length }
    val xref = "xref\n0 6\n0000000000 65535 f \n" + offsets.dropLast(1).joinToString("") { "%010d 00000 n \n".format(it) }
    val trailer = "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${offsets.last()}\n%%EOF\n"
    val pdf = (header + objects.joinToString("") + xref + trailer).toByteArray(Charsets.ISO_8859_1)
    return pdf + ByteArray(maxOf(0, minimumSizeBytes - pdf.size)) { ' '.code.toByte() }
}

/**
 * A product application of the group of a service provider, to a system operator. Seed it with [Triggers.OFF]: the
 * triggers would require an active group with a member and a product type that the system operator has registered,
 * which the attachments do not depend on.
 */
private fun SeedScope.insertServiceProvidingGroupProductApplicationOf(
    serviceProvider: Long = insertParty(TestPartyRole.SP),
    systemOperator: Long = insertParty(TestPartyRole.SO),
): Long = insertServiceProvidingGroupProductApplication(
    insertServiceProvidingGroup(serviceProvider),
    systemOperator,
    listOf(insertProductType()),
)

private suspend fun ApiClient.uploadPdf(token: String, application: Long, fileName: String = "test.pdf", bytes: ByteArray = minimalPdf()) =
    upload(PATH, token, listOf(APPLICATION_FIELD to application.toString()), fileName, "application/pdf", bytes)

class ServiceProvidingGroupProductApplicationAttachmentApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.service_providing_group",
                "flex.attachment",
                "flex.party",
                "flex.entity",
            )
        }

        context("a FISO") {
            // RLS: SPGPAA-FISO001
            test("can upload a PDF to the application of any group") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val application = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationOf() }

                val response = api.uploadPdf(fiso.attachmentToken(), application, "hello.pdf")

                response.status shouldBe HttpStatusCode.Created
                val attachment = response.body<ServiceProvidingGroupProductApplicationAttachmentResponse>()
                attachment.filename shouldBe "hello.pdf"
                attachment.contentType shouldBe ServiceProvidingGroupProductApplicationAttachmentContentType.APPLICATION_PDF
                attachment.serviceProvidingGroupProductApplicationId shouldBe application
            }

            test("can upload more than one file to the same application") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val application = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationOf() }

                val first = api.uploadPdf(fiso.attachmentToken(), application, "first.pdf")
                val second = api.uploadPdf(fiso.attachmentToken(), application, "second.pdf")

                first.status shouldBe HttpStatusCode.Created
                second.status shouldBe HttpStatusCode.Created
                val attachments = api.get(PATH, fiso.attachmentToken(), APPLICATION_FIELD to "eq.$application")
                    .body<List<ServiceProvidingGroupProductApplicationAttachmentResponse>>()
                attachments.map { it.filename } shouldContainExactlyInAnyOrder listOf("first.pdf", "second.pdf")
            }

            // The file is a valid PDF, so that only its size can make the upload fail.
            test("cannot upload a file that is larger than 20 MB") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val application = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationOf() }

                val response = api.uploadPdf(fiso.attachmentToken(), application, "big.pdf", minimalPdf(MAXIMUM_FILE_SIZE_BYTES + 1))

                response.status shouldBe HttpStatusCode.BadRequest
            }

            test("is redirected to the file when it downloads an attachment") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val attachment = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationAttachment(insertServiceProvidingGroupProductApplicationOf()) }

                val response = api.get("$PATH/$attachment/download", fiso.attachmentToken())

                response.status shouldBe HttpStatusCode.Found
                response.headers[HttpHeaders.Location] shouldNotBe null
            }

            test("cannot download an attachment that does not exist") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }

                val response = api.get("$PATH/999999999/download", fiso.attachmentToken())

                response.status shouldBe HttpStatusCode.NotFound
            }

            test("can delete an attachment, which can no longer be downloaded") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val attachment = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationAttachment(insertServiceProvidingGroupProductApplicationOf()) }

                api.delete("$PATH/$attachment", fiso.attachmentToken()).status shouldBe HttpStatusCode.NoContent

                api.get("$PATH/$attachment/download", fiso.attachmentToken()).status shouldBe HttpStatusCode.NotFound
            }

            test("cannot delete an attachment that does not exist") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }

                api.delete("$PATH/999999999", fiso.attachmentToken()).status shouldBe HttpStatusCode.NotFound
            }
        }

        // RLS: SPGPAA-SP001
        context("a service provider") {
            test("can upload a PDF to the application of its group") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val application = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationOf(serviceProvider = sp.partyId!!) }

                val response = api.uploadPdf(sp.attachmentToken(), application, "sp.pdf")

                response.status shouldBe HttpStatusCode.Created
                response.body<ServiceProvidingGroupProductApplicationAttachmentResponse>().filename shouldBe "sp.pdf"
            }

            test("cannot upload a PDF to the application of the group of another service provider") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val application = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationOf(serviceProvider = insertParty(TestPartyRole.SP, "Other SP")) }

                val response = api.uploadPdf(sp.attachmentToken(), application)

                response.status shouldBe HttpStatusCode.Forbidden
            }

            test("can delete an attachment of the application of its group") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val attachment = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationAttachment(insertServiceProvidingGroupProductApplicationOf(serviceProvider = sp.partyId!!)) }

                api.delete("$PATH/$attachment", sp.attachmentToken()).status shouldBe HttpStatusCode.NoContent
            }

            test("cannot delete an attachment of the application of the group of another service provider") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val attachment = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationAttachment(insertServiceProvidingGroupProductApplicationOf(serviceProvider = insertParty(TestPartyRole.SP, "Other SP"))) }

                // the policy hides the attachment from the service provider, so there is nothing to delete
                api.delete("$PATH/$attachment", sp.attachmentToken()).status shouldBe HttpStatusCode.NotFound
            }
        }

        // RLS: SPGPAA-COM001
        // The parties of the application can read its attachments: the service provider of the group, and the system
        // operator that is applied to.
        context("the parties of the application") {
            test("can list, read and download its attachments, and a party that is not involved cannot") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val so = seed { insertActor(TestPartyRole.SO) }
                val outsider = seed { insertActor(TestPartyRole.SO, "Outsider SO") }
                val application = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationOf(sp.partyId!!, so.partyId!!) }
                val attachment = seed { insertServiceProvidingGroupProductApplicationAttachment(application) }

                for (party in listOf(sp, so)) {
                    val list = api.get(PATH, party.attachmentToken(), APPLICATION_FIELD to "eq.$application")
                    list.status shouldBe HttpStatusCode.OK
                    list.body<List<ServiceProvidingGroupProductApplicationAttachmentResponse>>().map { it.id } shouldBe listOf(attachment)
                    api.get("$PATH/$attachment", party.attachmentToken()).status shouldBe HttpStatusCode.OK
                    api.get("$PATH/$attachment/download", party.attachmentToken()).status shouldBe HttpStatusCode.Found
                }

                val hiddenList = api.get(PATH, outsider.attachmentToken(), APPLICATION_FIELD to "eq.$application")
                hiddenList.status shouldBe HttpStatusCode.OK
                hiddenList.body<List<ServiceProvidingGroupProductApplicationAttachmentResponse>>() shouldBe emptyList()
                api.get("$PATH/$attachment", outsider.attachmentToken()).status shouldBe HIDDEN_BY_RLS
                api.get("$PATH/$attachment/download", outsider.attachmentToken()).status shouldBe HttpStatusCode.NotFound
            }
        }

        // The route only lets the FISO and the service provider change attachments.
        for (role in TestPartyRole.common - setOf(TestPartyRole.FISO, TestPartyRole.SP)) {
            test("${role.type} cannot upload or delete an attachment") {
                val actor = seed { insertActor(role) }
                val application = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationOf() }
                val attachment = seed { insertServiceProvidingGroupProductApplicationAttachment(application) }

                val upload: ApiResponse = api.uploadPdf(actor.attachmentToken(), application)
                val delete: ApiResponse = api.delete("$PATH/$attachment", actor.attachmentToken())

                upload.status shouldBe HttpStatusCode.Forbidden
                upload.body<ErrorMessage>().code shouldBe "HTTP403"
                delete.status shouldBe HttpStatusCode.Forbidden
                delete.body<ErrorMessage>().code shouldBe "HTTP403"
            }
        }

        context("a token") {
            test("that can only read attachments can read them, and cannot upload or delete one") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val application = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationOf() }
                val attachment = seed { insertServiceProvidingGroupProductApplicationAttachment(application) }
                val token = fiso.token(scope = "read:data read:attachment")

                api.get("$PATH/$attachment/download", token).status shouldBe HttpStatusCode.Found
                api.get("$PATH/$attachment", token).status shouldBe HttpStatusCode.OK
                api.uploadPdf(token, application).status shouldBe HttpStatusCode.Forbidden
                api.delete("$PATH/$attachment", token).status shouldBe HttpStatusCode.Forbidden
            }

            test("without the scope for attachments cannot do anything with one") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val application = seed(Triggers.OFF) { insertServiceProvidingGroupProductApplicationOf() }
                val attachment = seed { insertServiceProvidingGroupProductApplicationAttachment(application) }

                api.get("$PATH/$attachment/download", fiso.token()).status shouldBe HttpStatusCode.Forbidden
                api.get("$PATH/$attachment", fiso.token()).status shouldBe HttpStatusCode.Forbidden
                api.uploadPdf(fiso.token(), application).status shouldBe HttpStatusCode.Forbidden
                api.delete("$PATH/$attachment", fiso.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        test("listing the attachments needs the application") {
            val fiso = seed { insertActor(TestPartyRole.FISO) }

            api.get(PATH, fiso.attachmentToken()).status shouldBe HttpStatusCode.BadRequest
        }
    })
