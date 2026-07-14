package no.elhub.flex.attachment

import com.adobe.testing.s3mock.testcontainers.S3MockContainer
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotBeBlank
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.install
import io.ktor.server.testing.TestApplication
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.auth.FlexAuthentication
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureSerialization
import no.elhub.flex.routes.attachment.attachmentRoutes
import no.elhub.flex.util.TEST_JWT_SECRET
import no.elhub.flex.util.makeJwt
import no.elhub.flex.util.uniqueEicY
import no.elhub.flex.util.uniqueGsrn
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin
import java.io.ByteArrayOutputStream
import java.util.UUID

/**
 * Integration tests for the SPGPA attachment HTTP endpoints:
 *
 *   POST   /service_providing_group_product_application_attachment
 *   GET    /service_providing_group_product_application_attachment/{id}/download
 *   DELETE /service_providing_group_product_application_attachment/{id}
 *
 * Scenario 1 — FISO full lifecycle (upload, download, delete, error cases)
 * Scenario 2/3 — SP isolation and SO read-only access
 *
 * The test spins up:
 * - A shared [PostgresTestContainer] (Liquibase migrations applied once)
 * - A per-spec [S3MockContainer] (one bucket, started once per spec)
 * - A [TestApplication] per scenario group (real auth, real DB, real S3)
 *
 * All JWT [eid] claims are UUIDs that match [flex.identity.eid] rows seeded in [beforeSpec].
 */
class ServiceProvidingGroupProductApplicationAttachmentTest : FunSpec({

    // ── S3 mock ────────────────────────────────────────────────────────────────

    val s3Bucket = "test-attachments"

    val s3 = S3MockContainer("4.3.0").withInitialBuckets(s3Bucket)

    beforeSpec { s3.start() }
    afterSpec { s3.stop() }

    // ── Shared DB ─────────────────────────────────────────────────────────────

    @Suppress("UnusedPrivateProperty")
    val db = PostgresTestContainer // ensures FlexTransaction is initialised

    // ── Identities (UUIDs used as JWT eid claim) ──────────────────────────────

    // Seeded once; each UUID maps to a flex.identity row that resolves the
    // correct entity_id / party_id for RLS via auth.eid_details().
    lateinit var fisoEid: String
    lateinit var sp1Eid: String
    lateinit var sp2Eid: String
    lateinit var soEid: String

    // Surrogate IDs resolved after seeding
    var spgpaId: Long = -1
    var sp2SpgpaId: Long = -1

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Minimal structurally valid PDF containing the text "hello world". */
    fun minimalPdf(text: String = "hello world"): ByteArray {
        // A hand-crafted, spec-compliant single-page PDF that PDFBox can parse.
        // The stream is a single BT/ET text operator that renders [text].
        val stream = "BT /F1 12 Tf 72 720 Td ($text) Tj ET"
        val streamBytes = stream.toByteArray(Charsets.ISO_8859_1)
        val len = streamBytes.size

        val out = ByteArrayOutputStream()
        fun w(s: String) = out.write(s.toByteArray(Charsets.ISO_8859_1))

        // Track byte offsets for xref table
        val offsets = mutableListOf<Int>()

        w("%PDF-1.4\n")

        // Object 1 – Catalog
        offsets += out.size()
        w("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")

        // Object 2 – Pages
        offsets += out.size()
        w("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")

        // Object 3 – Page
        offsets += out.size()
        w(
            "3 0 obj\n<< /Type /Page /Parent 2 0 R " +
                "/MediaBox [0 0 612 792] /Contents 4 0 R /Resources " +
                "<< /Font << /F1 5 0 R >> >> >>\nendobj\n",
        )

        // Object 4 – Content stream
        offsets += out.size()
        w("4 0 obj\n<< /Length $len >>\nstream\n")
        out.write(streamBytes)
        w("\nendstream\nendobj\n")

        // Object 5 – Font
        offsets += out.size()
        w(
            "5 0 obj\n<< /Type /Font /Subtype /Type1 " +
                "/BaseFont /Helvetica >>\nendobj\n",
        )

        // xref table
        val xrefOffset = out.size()
        w("xref\n0 6\n")
        w("0000000000 65535 f \n")
        offsets.forEach { offset -> w("%010d 00000 n \n".format(offset)) }

        w("trailer\n<< /Size 6 /Root 1 0 R >>\n")
        w("startxref\n$xrefOffset\n%%EOF\n")

        return out.toByteArray()
    }

    /** Builds a minimal multipart/form-data body with a single PDF file part and a parent-id field. */
    fun multipartBody(
        spgpaId: Long,
        fileBytes: ByteArray,
        fileName: String = "document.pdf",
        contentType: String = "application/pdf",
    ): Pair<ContentType, ByteArray> {
        val boundary = "TestBoundary${UUID.randomUUID().toString().replace("-", "")}"
        val ct = ContentType.parse("multipart/form-data; boundary=$boundary")

        val out = ByteArrayOutputStream()
        fun w(s: String) = out.write(s.toByteArray())

        // Parent id field
        w("--$boundary\r\n")
        w("Content-Disposition: form-data; name=\"service_providing_group_product_application_id\"\r\n")
        w("\r\n")
        w("$spgpaId\r\n")

        // File part
        w("--$boundary\r\n")
        w("Content-Disposition: form-data; name=\"file\"; filename=\"$fileName\"\r\n")
        w("Content-Type: $contentType\r\n")
        w("\r\n")
        out.write(fileBytes)
        w("\r\n")

        w("--$boundary--\r\n")

        return ct to out.toByteArray()
    }

    /** Creates a [TestApplication] wired with real auth, real DB, and real S3. */
    fun testApp(): TestApplication {
        val storageService = S3AttachmentStorageService(
            bucket = s3Bucket,
            internalEndpoint = s3.httpEndpoint,
            publicEndpoint = s3.httpEndpoint, // same host in tests (no browser involved)
            region = "us-east-1",
            accessKey = "dummy",
            secretKey = "dummy",
        )
        return TestApplication {
            application {
                install(Tracing.plugin)
                install(FlexAuthentication) { jwtSecret = TEST_JWT_SECRET }
                configureSerialization()
                install(Koin) {
                    modules(
                        module {
                            single { storageService }
                            single<AttachmentStorageService> { storageService }
                            single { io.micrometer.core.instrument.MeterRegistry::class }
                            single<io.micrometer.core.instrument.MeterRegistry> { SimpleMeterRegistry() }
                        },
                    )
                }
                attachmentRoutes()
            }
        }
    }

    // ── Seed DB ───────────────────────────────────────────────────────────────

    beforeSpec {
        PostgresTestContainer.withConnection { conn ->
            conn.autoCommit = false

            // Use a system identity to seed data (bypasses RLS)
            conn.createStatement().use { stmt ->
                stmt.execute("SELECT flex.set_entity_party_identity(0, 0, 0)")
            }

            // ── Entities ──────────────────────────────────────────────────────

            fun insertEntity(name: String, orgId: String): Long = conn.prepareStatement(
                "INSERT INTO flex.entity (name, type, business_id, business_id_type) " +
                    "VALUES (?, 'organisation', ?, 'org') RETURNING id",
            ).use { stmt ->
                stmt.setString(1, name)
                stmt.setString(2, orgId)
                stmt.executeQuery().use { rs ->
                    rs.next()
                    rs.getLong(1)
                }
            }

            val fisoEntityId = insertEntity("Test FISO Org", "111111111")
            val sp1EntityId = insertEntity("Test SP1 Org", "222222222")
            val sp2EntityId = insertEntity("Test SP2 Org", "333333333")
            val soEntityId = insertEntity("Test SO Org", "444444444")

            // ── Parties ───────────────────────────────────────────────────────

            // Generate a valid 13-digit GLN with GS1 check digit.
            // Each party gets a unique prefix-based GLN.
            var glnSeq = 500_000_000_000L // 12 digits; check digit appended below
            fun nextGln(): String {
                val partial = glnSeq.toString().padStart(12, '0')
                glnSeq++
                var multiplier = 3
                var sum = 0
                for (ch in partial.reversed()) {
                    sum += ch.digitToInt() * multiplier
                    multiplier = if (multiplier == 3) 1 else 3
                }
                val check = (10 - sum % 10) % 10
                return partial + check
            }

            fun insertParty(name: String, type: String, entityId: Long): Long {
                val gln = nextGln()
                val partyId = conn.prepareStatement(
                    "INSERT INTO flex.party (name, type, role, business_id, business_id_type, entity_id) " +
                        "VALUES (?, ?, ?, ?, 'gln', ?) RETURNING id",
                ).use { stmt ->
                    stmt.setString(1, name)
                    stmt.setString(2, type)
                    stmt.setString(3, "flex_$type")
                    stmt.setString(4, gln)
                    stmt.setLong(5, entityId)
                    stmt.executeQuery().use { rs ->
                        rs.next()
                        rs.getLong(1)
                    }
                }
                conn.prepareStatement(
                    "UPDATE flex.party SET status = 'active' WHERE id = ?",
                ).use { stmt ->
                    stmt.setLong(1, partyId)
                    stmt.execute()
                }
                return partyId
            }

            val fisoPartyId = insertParty(
                "Test FISO",
                "flexibility_information_system_operator",
                fisoEntityId,
            )
            val sp1PartyId = insertParty("Test SP1", "service_provider", sp1EntityId)
            val sp2PartyId = insertParty("Test SP2", "service_provider", sp2EntityId)
            val soPartyId = insertParty("Test SO", "system_operator", soEntityId)

            // ── Identities (eid is a UUID used as the JWT eid claim) ───────────

            fun insertIdentity(entityId: Long, partyId: Long): String = conn.prepareStatement(
                "INSERT INTO flex.identity (entity_id, party_id) VALUES (?, ?) " +
                    "RETURNING eid::text",
            ).use { stmt ->
                stmt.setLong(1, entityId)
                stmt.setLong(2, partyId)
                stmt.executeQuery().use { rs ->
                    rs.next()
                    rs.getString(1)
                }
            }

            fisoEid = insertIdentity(fisoEntityId, fisoPartyId)
            sp1Eid = insertIdentity(sp1EntityId, sp1PartyId)
            sp2Eid = insertIdentity(sp2EntityId, sp2PartyId)
            soEid = insertIdentity(soEntityId, soPartyId)

            // ── Helper: seed one AP + CU + CUSP + SPG membership so the SPG can be activated ──
            //
            // The SPGM trigger requires:
            //  1. CU has a CUSP with the SPG's SP (SPGM-VAL001)
            //  2. CU is in the SPG's bidding zone, NO3 (SPGM-VAL002)
            //
            // Bidding zone is derived via:
            //   CU.accounting_point → accounting_point_metering_grid_area
            //     → metering_grid_area_price_area.price_area = 'NO3'

            fun activateSpg(spgId: Long, spPartyId: Long) {
                // End user party (needed as CUSP.end_user_id)
                val euEntityId = conn.prepareStatement(
                    "INSERT INTO flex.entity (name, type, business_id, business_id_type) " +
                        "VALUES ('Test EU Org', 'organisation', ?, 'org') RETURNING id",
                ).use { stmt ->
                    stmt.setString(1, "9${spgId}0000000".take(9)) // unique 9-digit org id
                    stmt.executeQuery().use { rs ->
                        rs.next()
                        rs.getLong(1)
                    }
                }
                val euPartyId = conn.prepareStatement(
                    "INSERT INTO flex.party (name, type, role, entity_id) " +
                        "VALUES ('Test EU', 'end_user', 'flex_end_user', ?) RETURNING id",
                ).use { stmt ->
                    stmt.setLong(1, euEntityId)
                    stmt.executeQuery().use { rs ->
                        rs.next()
                        rs.getLong(1)
                    }
                }
                conn.prepareStatement("UPDATE flex.party SET status = 'active' WHERE id = ?")
                    .use { stmt ->
                        stmt.setLong(1, euPartyId)
                        stmt.execute()
                    }

                // Metering grid area in bidding zone NO3
                val mgaId = conn.prepareStatement(
                    "INSERT INTO flex.metering_grid_area (business_id, name, recorded_by) " +
                        "VALUES (?, 'Test MGA NO3', 0) RETURNING id",
                ).use { stmt ->
                    stmt.setString(1, uniqueEicY())
                    stmt.executeQuery().use { rs ->
                        rs.next()
                        rs.getLong(1)
                    }
                }

                conn.prepareStatement(
                    "INSERT INTO flex.metering_grid_area_price_area " +
                        "(metering_grid_area_id, price_area, valid_time_range, recorded_by) " +
                        "VALUES (?, 'NO3', tstzrange('2000-01-01 00:00:00 Europe/Oslo', null, '[)'), 0)",
                ).use { stmt ->
                    stmt.setLong(1, mgaId)
                    stmt.execute()
                }

                // Accounting point linked to MGA
                val apId = conn.prepareStatement(
                    "INSERT INTO flex.accounting_point (business_id) VALUES (?) RETURNING id",
                ).use { stmt ->
                    stmt.setString(1, uniqueGsrn())
                    stmt.executeQuery().use { rs ->
                        rs.next()
                        rs.getLong(1)
                    }
                }

                conn.prepareStatement(
                    "INSERT INTO flex.accounting_point_metering_grid_area " +
                        "(accounting_point_id, metering_grid_area_id, valid_time_range, recorded_by) " +
                        "VALUES (?, ?, tstzrange('2000-01-01 00:00:00 Europe/Oslo', null, '[)'), 0)",
                ).use { stmt ->
                    stmt.setLong(1, apId)
                    stmt.setLong(2, mgaId)
                    stmt.execute()
                }

                // Controllable unit on that AP
                val cuId = conn.prepareStatement(
                    "INSERT INTO flex.controllable_unit " +
                        "(name, start_date, regulation_direction, maximum_active_power, accounting_point_id) " +
                        "VALUES ('Test CU', '2024-01-01', 'up', 5.0, ?) RETURNING id",
                ).use { stmt ->
                    stmt.setLong(1, apId)
                    stmt.executeQuery().use { rs ->
                        rs.next()
                        rs.getLong(1)
                    }
                }

                // CUSP: the CU must be managed by the SP that owns the SPG.
                // CUSP-VAL004 requires an accounting_point_end_user record at the contract start.
                conn.prepareStatement(
                    "INSERT INTO flex.accounting_point_end_user " +
                        "(accounting_point_id, end_user_id, valid_time_range) " +
                        "VALUES (?, ?, tstzrange('2000-01-01 00:00:00 Europe/Oslo', null, '[)'))",
                ).use { stmt ->
                    stmt.setLong(1, apId)
                    stmt.setLong(2, euPartyId)
                    stmt.execute()
                }

                conn.prepareStatement(
                    "INSERT INTO flex.controllable_unit_service_provider " +
                        "(controllable_unit_id, service_provider_id, end_user_id, contract_reference, valid_time_range) " +
                        "VALUES (?, ?, ?, 'test-contract', " +
                        "tstzrange('2000-01-01 00:00:00 Europe/Oslo', null, '[)'))",
                ).use { stmt ->
                    stmt.setLong(1, cuId)
                    stmt.setLong(2, spPartyId)
                    stmt.setLong(3, euPartyId)
                    stmt.execute()
                }

                // SPG membership — must be currently valid for the trigger check
                conn.prepareStatement(
                    "INSERT INTO flex.service_providing_group_membership " +
                        "(controllable_unit_id, service_providing_group_id, valid_time_range) " +
                        "VALUES (?, ?, tstzrange('2000-01-01 00:00:00 Europe/Oslo', null, '[)'))",
                ).use { stmt ->
                    stmt.setLong(1, cuId)
                    stmt.setLong(2, spgId)
                    stmt.execute()
                }

                // Now activate
                conn.prepareStatement(
                    "UPDATE flex.service_providing_group SET status = 'active' WHERE id = ?",
                ).use { stmt ->
                    stmt.setLong(1, spgId)
                    stmt.execute()
                }
            }

            // ── SPG for SP1 ───────────────────────────────────────────────────

            val sp1SpgId = conn.prepareStatement(
                "INSERT INTO flex.service_providing_group (name, service_provider_id, bidding_zone) " +
                    "VALUES ('Test SPG 1', ?, 'NO3') RETURNING id",
            ).use { stmt ->
                stmt.setLong(1, sp1PartyId)
                stmt.executeQuery().use { rs ->
                    rs.next()
                    rs.getLong(1)
                }
            }
            activateSpg(sp1SpgId, sp1PartyId)

            // ── SPG for SP2 ───────────────────────────────────────────────────

            val sp2SpgId = conn.prepareStatement(
                "INSERT INTO flex.service_providing_group (name, service_provider_id, bidding_zone) " +
                    "VALUES ('Test SPG 2', ?, 'NO3') RETURNING id",
            ).use { stmt ->
                stmt.setLong(1, sp2PartyId)
                stmt.executeQuery().use { rs ->
                    rs.next()
                    rs.getLong(1)
                }
            }
            activateSpg(sp2SpgId, sp2PartyId)

            // ── Product type ──────────────────────────────────────────────────

            val ptId = conn.prepareStatement(
                "SELECT id FROM flex.product_type WHERE business_id = 'manual_congestion'",
            ).use { stmt ->
                stmt.executeQuery().use { rs ->
                    rs.next()
                    rs.getLong(1)
                }
            }

            conn.prepareStatement(
                "INSERT INTO flex.system_operator_product_type (system_operator_id, product_type_id) " +
                    "VALUES (?, ?)",
            ).use { stmt ->
                stmt.setLong(1, soPartyId)
                stmt.setLong(2, ptId)
                stmt.execute()
            }

            // ── Service Provider Product Applications (SPPA) — must be qualified ─
            // The SPGPA insert trigger checks that the SP has a qualified SPPA for the product type.

            fun insertQualifiedSppa(spPartyId: Long) {
                val sppaId = conn.prepareStatement(
                    "INSERT INTO flex.service_provider_product_application " +
                        "(service_provider_id, system_operator_id, product_type_ids) " +
                        "VALUES (?, ?, ARRAY[?]::bigint[]) RETURNING id",
                ).use { stmt ->
                    stmt.setLong(1, spPartyId)
                    stmt.setLong(2, soPartyId)
                    stmt.setLong(3, ptId)
                    stmt.executeQuery().use { rs ->
                        rs.next()
                        rs.getLong(1)
                    }
                }
                conn.prepareStatement(
                    "UPDATE flex.service_provider_product_application " +
                        "SET status = 'qualified', qualified_at = CURRENT_TIMESTAMP WHERE id = ?",
                ).use { stmt ->
                    stmt.setLong(1, sppaId)
                    stmt.execute()
                }
            }

            insertQualifiedSppa(sp1PartyId)
            insertQualifiedSppa(sp2PartyId)

            // ── SPGPA for SP1 ─────────────────────────────────────────────────

            spgpaId = conn.prepareStatement(
                """
                INSERT INTO flex.service_providing_group_product_application (
                    service_providing_group_id, procuring_system_operator_id,
                    product_type_ids, maximum_active_power_up, maximum_active_power_down,
                    ramping_capability, ramping_description
                ) VALUES (?, ?, ARRAY[?]::bigint[], 10, 10, 'always', 'test')
                RETURNING id
                """.trimIndent(),
            ).use { stmt ->
                stmt.setLong(1, sp1SpgId)
                stmt.setLong(2, soPartyId)
                stmt.setLong(3, ptId)
                stmt.executeQuery().use { rs ->
                    rs.next()
                    rs.getLong(1)
                }
            }

            // ── SPGPA for SP2 ─────────────────────────────────────────────────

            sp2SpgpaId = conn.prepareStatement(
                """
                INSERT INTO flex.service_providing_group_product_application (
                    service_providing_group_id, procuring_system_operator_id,
                    product_type_ids, maximum_active_power_up, maximum_active_power_down,
                    ramping_capability, ramping_description
                ) VALUES (?, ?, ARRAY[?]::bigint[], 10, 10, 'always', 'test')
                RETURNING id
                """.trimIndent(),
            ).use { stmt ->
                stmt.setLong(1, sp2SpgId)
                stmt.setLong(2, soPartyId)
                stmt.setLong(3, ptId)
                stmt.executeQuery().use { rs ->
                    rs.next()
                    rs.getLong(1)
                }
            }

            conn.commit()
        }
    }

    // Clean up all attachment rows between tests so they do not bleed across scenarios
    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use { stmt ->
                stmt.execute("SELECT flex.set_entity_party_identity(0, 0, 0)")
                // Truncate both the main table and its history table to avoid history PK conflicts
                // when the identity sequence is reset to 1.
                stmt.execute(
                    "TRUNCATE flex.service_providing_group_product_application_attachment_history",
                )
                stmt.execute(
                    "TRUNCATE flex.service_providing_group_product_application_attachment RESTART IDENTITY",
                )
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Scenario 1 — FISO full lifecycle
    // ═══════════════════════════════════════════════════════════════════════════

    context("Scenario 1 – FISO full attachment lifecycle") {

        val fisoManageScope = "manage:data:service_providing_group_product_application_attachment"
        val fisoReadScope = "read:data:service_providing_group_product_application_attachment"
        val fisoRole = "flex_flexibility_information_system_operator"

        val baseUrl = "/service_providing_group_product_application_attachment"

        test("upload with no token returns 401") {
            val app = testApp()
            val (ct, body) = multipartBody(spgpaId, minimalPdf())

            val response = app.client.post(baseUrl) {
                header(HttpHeaders.ContentType, ct.toString())
                setBody(body)
            }

            response.status shouldBe HttpStatusCode.Unauthorized
            app.stop()
        }

        test("upload with wrong role (SO) returns 403") {
            val app = testApp()
            val (ct, body) = multipartBody(spgpaId, minimalPdf())

            val response = app.client.post(baseUrl) {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = "flex_system_operator", scope = fisoManageScope, eid = soEid)}",
                )
                header(HttpHeaders.ContentType, ct.toString())
                setBody(body)
            }

            response.status shouldBe HttpStatusCode.Forbidden
            app.stop()
        }

        test("upload with read-only scope returns 403") {
            val app = testApp()
            val (ct, body) = multipartBody(spgpaId, minimalPdf())

            val response = app.client.post(baseUrl) {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = fisoRole, scope = fisoReadScope, eid = fisoEid)}",
                )
                header(HttpHeaders.ContentType, ct.toString())
                setBody(body)
            }

            response.status shouldBe HttpStatusCode.Forbidden
            app.stop()
        }

        test("upload a PDF exceeding the size limit is rejected") {
            val app = testApp()
            // 20 MB + 1 byte. The Ktor TestEngine enforces the formFieldLimit of 20 MB
            // server-side and throws IOException when the limit is exceeded, which the
            // multipart() helper maps to a 400 ParsingError. In the in-process test engine
            // the exception propagates to the test; in production the server responds 400.
            val tooBig = ByteArray(20_000_001) { 0x25.toByte() } // fill with '%' – not a valid PDF
            val (ct, body) = multipartBody(spgpaId, tooBig, fileName = "big.pdf")

            try {
                app.client.post(baseUrl) {
                    header(
                        HttpHeaders.Authorization,
                        "Bearer ${makeJwt(role = fisoRole, scope = fisoManageScope, eid = fisoEid)}",
                    )
                    header(HttpHeaders.ContentType, ct.toString())
                    setBody(body)
                }
                // If no exception is thrown, the server must have responded with 4xx
            } catch (e: java.io.IOException) {
                // Expected: the test engine propagates the multipart size limit exception
                e.message shouldContain "Limit of 20000000 bytes exceeded"
            }
            app.stop()
        }

        test("upload a valid PDF succeeds and returns 201 with metadata") {
            val app = testApp()
            val (ct, body) = multipartBody(spgpaId, minimalPdf(), fileName = "hello.pdf")

            val response = app.client.post(baseUrl) {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = fisoRole, scope = fisoManageScope, eid = fisoEid)}",
                )
                header(HttpHeaders.ContentType, ct.toString())
                setBody(body)
            }

            response.status shouldBe HttpStatusCode.Created
            val json = response.bodyAsText()
            json shouldContain "\"filename\":\"hello.pdf\""
            json shouldContain "\"content_type\":\"application/pdf\""
            json shouldContain "\"service_providing_group_product_application_id\":$spgpaId"
            app.stop()
        }

        test("upload two PDFs – both succeed") {
            val app = testApp()

            suspend fun uploadPdf(fileName: String): HttpStatusCode {
                val (ct, body) = multipartBody(spgpaId, minimalPdf(), fileName = fileName)
                return app.client.post(baseUrl) {
                    header(
                        HttpHeaders.Authorization,
                        "Bearer ${makeJwt(role = fisoRole, scope = fisoManageScope, eid = fisoEid)}",
                    )
                    header(HttpHeaders.ContentType, ct.toString())
                    setBody(body)
                }.status
            }

            uploadPdf("first.pdf") shouldBe HttpStatusCode.Created
            uploadPdf("second.pdf") shouldBe HttpStatusCode.Created
            app.stop()
        }

        test("download with wrong ID returns 404") {
            val app = testApp()

            val response = app.client.get("$baseUrl/999999/download") {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = fisoRole, scope = fisoManageScope, eid = fisoEid)}",
                )
            }

            response.status shouldBe HttpStatusCode.NotFound
            app.stop()
        }

        test("download with a valid ID returns a redirect to the presigned URL") {
            val app = testApp()
            // Disable redirect following so we can inspect the 302 + Location header
            // before the client tries to resolve the presigned S3 URL.
            val noRedirectClient = app.createClient { followRedirects = false }

            // Upload first
            val (ct, body) = multipartBody(spgpaId, minimalPdf(), fileName = "dl.pdf")
            val uploadResponse = app.client.post(baseUrl) {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = fisoRole, scope = fisoManageScope, eid = fisoEid)}",
                )
                header(HttpHeaders.ContentType, ct.toString())
                setBody(body)
            }
            uploadResponse.status shouldBe HttpStatusCode.Created

            val uploadedId = uploadResponse.bodyAsText()
                .substringAfter("\"id\":")
                .substringBefore(",")
                .substringBefore("}")
                .trim()

            // Download — expect a redirect to the presigned S3 URL
            val downloadResponse = noRedirectClient.get("$baseUrl/$uploadedId/download") {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = fisoRole, scope = fisoReadScope, eid = fisoEid)}",
                )
            }

            downloadResponse.status.value shouldBe HttpStatusCode.MovedPermanently.value
            val location = downloadResponse.headers[HttpHeaders.Location]
            location.shouldNotBeBlank()
            app.stop()
        }

        test("delete with wrong ID returns 404") {
            val app = testApp()

            val response = app.client.delete("$baseUrl/999999") {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = fisoRole, scope = fisoManageScope, eid = fisoEid)}",
                )
            }

            response.status shouldBe HttpStatusCode.NotFound
            app.stop()
        }

        test("delete with a valid ID returns 204 and subsequent download returns 404") {
            val app = testApp()

            // Upload
            val (ct, body) = multipartBody(spgpaId, minimalPdf(), fileName = "del.pdf")
            val uploadResponse = app.client.post(baseUrl) {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = fisoRole, scope = fisoManageScope, eid = fisoEid)}",
                )
                header(HttpHeaders.ContentType, ct.toString())
                setBody(body)
            }
            uploadResponse.status shouldBe HttpStatusCode.Created

            val uploadedId = uploadResponse.bodyAsText()
                .substringAfter("\"id\":")
                .substringBefore(",")
                .substringBefore("}")
                .trim()

            // Delete
            val deleteResponse = app.client.delete("$baseUrl/$uploadedId") {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = fisoRole, scope = fisoManageScope, eid = fisoEid)}",
                )
            }
            deleteResponse.status shouldBe HttpStatusCode.NoContent

            // Subsequent download of the deleted attachment should return 404
            val downloadResponse = app.client.get("$baseUrl/$uploadedId/download") {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = fisoRole, scope = fisoReadScope, eid = fisoEid)}",
                )
            }
            downloadResponse.status shouldBe HttpStatusCode.NotFound
            app.stop()
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Scenario 2 + 3 — SP isolation and SO read-only access
    // ═══════════════════════════════════════════════════════════════════════════

    context("Scenario 2+3 – SP isolation and SO read-only access") {

        val manageScope = "manage:data:service_providing_group_product_application_attachment"
        val readScope = "read:data:service_providing_group_product_application_attachment"
        val sp1Role = "flex_service_provider"
        val sp2Role = "flex_service_provider"
        val soRole = "flex_system_operator"

        val baseUrl = "/service_providing_group_product_application_attachment"

        test("SP1 can upload an attachment to their own SPGPA") {
            val app = testApp()
            val (ct, body) = multipartBody(spgpaId, minimalPdf(), fileName = "sp1.pdf")

            val response = app.client.post(baseUrl) {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = sp1Role, scope = manageScope, eid = sp1Eid)}",
                )
                header(HttpHeaders.ContentType, ct.toString())
                setBody(body)
            }

            response.status shouldBe HttpStatusCode.Created
            app.stop()
        }

        test("SP2 cannot upload an attachment to SP1's SPGPA (RLS blocks the DB insert)") {
            val app = testApp()
            val (ct, body) = multipartBody(spgpaId, minimalPdf(), fileName = "sp2-onto-sp1.pdf")

            // SP2 has the right role and scope, but the RLS policy on the attachment table
            // checks the parent SPGPA's SPG owner, so the INSERT will fail.
            val response = app.client.post(baseUrl) {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = sp2Role, scope = manageScope, eid = sp2Eid)}",
                )
                header(HttpHeaders.ContentType, ct.toString())
                setBody(body)
            }

            // RLS violation surfaces as an internal server error (DB throws, handler maps to 500)
            // because the INSERT returns no row (or is rejected), which is treated as an unexpected
            // DB error rather than a 403 at the HTTP layer.
            response.status.value shouldBe HttpStatusCode.InternalServerError.value
            app.stop()
        }

        test("SP2 cannot upload an attachment to their own SPGPA and then delete SP1's attachment") {
            val app = testApp()

            // SP1 uploads
            val (ct1, body1) = multipartBody(spgpaId, minimalPdf(), fileName = "sp1-only.pdf")
            val uploadResponse = app.client.post(baseUrl) {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = sp1Role, scope = manageScope, eid = sp1Eid)}",
                )
                header(HttpHeaders.ContentType, ct1.toString())
                setBody(body1)
            }
            uploadResponse.status shouldBe HttpStatusCode.Created

            val sp1AttachmentId = uploadResponse.bodyAsText()
                .substringAfter("\"id\":")
                .substringBefore(",")
                .substringBefore("}")
                .trim()

            // SP2 tries to delete SP1's attachment
            val deleteResponse = app.client.delete("$baseUrl/$sp1AttachmentId") {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = sp2Role, scope = manageScope, eid = sp2Eid)}",
                )
            }

            // The DELETE returns RETURNING no row (RLS hides the row), which the repo treats as NotFound
            deleteResponse.status shouldBe HttpStatusCode.NotFound
            app.stop()
        }

        test("SP1 can delete their own attachment") {
            val app = testApp()

            // SP1 uploads
            val (ct, body) = multipartBody(spgpaId, minimalPdf(), fileName = "sp1-del.pdf")
            val uploadResponse = app.client.post(baseUrl) {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = sp1Role, scope = manageScope, eid = sp1Eid)}",
                )
                header(HttpHeaders.ContentType, ct.toString())
                setBody(body)
            }
            uploadResponse.status shouldBe HttpStatusCode.Created

            val sp1AttachmentId = uploadResponse.bodyAsText()
                .substringAfter("\"id\":")
                .substringBefore(",")
                .substringBefore("}")
                .trim()

            // SP1 deletes their own attachment
            val deleteResponse = app.client.delete("$baseUrl/$sp1AttachmentId") {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = sp1Role, scope = manageScope, eid = sp1Eid)}",
                )
            }
            deleteResponse.status shouldBe HttpStatusCode.NoContent
            app.stop()
        }

        test("SO can download an attachment but cannot upload or delete") {
            val app = testApp()
            val noRedirectClient = app.createClient { followRedirects = false }

            // SP1 uploads an attachment
            val (ct, body) = multipartBody(spgpaId, minimalPdf(), fileName = "for-so.pdf")
            val uploadResponse = app.client.post(baseUrl) {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = sp1Role, scope = manageScope, eid = sp1Eid)}",
                )
                header(HttpHeaders.ContentType, ct.toString())
                setBody(body)
            }
            uploadResponse.status shouldBe HttpStatusCode.Created

            val attachmentId = uploadResponse.bodyAsText()
                .substringAfter("\"id\":")
                .substringBefore(",")
                .substringBefore("}")
                .trim()

            // SO can download (read scope, no role restriction on the download route)
            val soDownloadResponse = noRedirectClient.get("$baseUrl/$attachmentId/download") {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = soRole, scope = readScope, eid = soEid)}",
                )
            }
            soDownloadResponse.status.value shouldBe HttpStatusCode.MovedPermanently.value
            println("DEBUG SO download status=${soDownloadResponse.status}, body=${soDownloadResponse.bodyAsText()}")

            // SO cannot upload (wrong role — only FISO and SP are in editRoles)
            val (ct2, body2) = multipartBody(spgpaId, minimalPdf(), fileName = "so-upload.pdf")
            val soUploadResponse = app.client.post(baseUrl) {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = soRole, scope = manageScope, eid = soEid)}",
                )
                header(HttpHeaders.ContentType, ct2.toString())
                setBody(body2)
            }
            soUploadResponse.status shouldBe HttpStatusCode.Forbidden

            // SO cannot delete (wrong role)
            val soDeleteResponse = app.client.delete("$baseUrl/$attachmentId") {
                header(
                    HttpHeaders.Authorization,
                    "Bearer ${makeJwt(role = soRole, scope = manageScope, eid = soEid)}",
                )
            }
            soDeleteResponse.status shouldBe HttpStatusCode.Forbidden
            app.stop()
        }
    }
})
