package no.elhub.flex.jobs.sendspgparejectedmail

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import no.elhub.flex.MailpitTestContainer
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.jobs.sendnoticemail.MailConfig
import no.elhub.flex.jobs.sendnoticemail.email.SmtpMailClient
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import java.time.OffsetDateTime

private val NOW = OffsetDateTime.parse("2026-01-10T12:30:00Z")
private val IN_WINDOW = OffsetDateTime.parse("2026-01-10T11:15:00Z")
private val BEFORE_WINDOW = OffsetDateTime.parse("2026-01-10T10:15:00Z")

/** Runs [SendSpgpaRejectedMailJob] with the real repository and SMTP client against Mailpit. */
class SendSpgpaRejectedMailJobIntegrationTest : FunSpec({

    val config = MailConfig(
        host = MailpitTestContainer.host,
        port = MailpitTestContainer.smtpPort,
        username = "",
        password = "",
        from = "flex@example.com",
        startTls = false,
        dryRun = false,
    )
    val job = SendSpgpaRejectedMailJob(RejectedSpgpaRecipientRepositoryImpl(), config, SmtpMailClient(config))

    beforeEach {
        MailpitTestContainer.clearMessages()
        truncate(
            "flex.service_providing_group_product_application",
            "flex.service_providing_group",
            "flex.party",
            "flex.entity",
        )
    }

    test("mails the SP members when the SO rejects an application in the window") {
        seedRejection(IN_WINDOW, rejectedBySo = true, spEmails = listOf("a@example.com", "b@example.com"))

        job.run(NOW)

        val mails = MailpitTestContainer.messages()
        mails.flatMap { it.to }.sorted() shouldContainExactly listOf("a@example.com", "b@example.com")
        mails.forEach {
            it.subject shouldBe "Produktsøknad avslått i Statnetts fleksregister"
            it.html shouldContain "avslått"
        }
    }

    test("does not mail when the rejection is outside the window") {
        seedRejection(BEFORE_WINDOW, rejectedBySo = true)

        job.run(NOW)

        MailpitTestContainer.messages().shouldBeEmpty()
    }

    test("does not mail when the rejection was not made by the SO") {
        seedRejection(IN_WINDOW, rejectedBySo = false)

        job.run(NOW)

        MailpitTestContainer.messages().shouldBeEmpty()
    }

    test("does not mail when the status did not change") {
        seedRejection(IN_WINDOW, rejectedBySo = true, previousStatus = "rejected")

        job.run(NOW)

        MailpitTestContainer.messages().shouldBeEmpty()
    }

    test("does not mail members of an inactive SP party") {
        seedRejection(IN_WINDOW, rejectedBySo = true, spStatus = "new")

        job.run(NOW)

        MailpitTestContainer.messages().shouldBeEmpty()
    }
})

/**

 * Seeds an SPG product application that is currently rejected (recorded at [rejectedAt]). Seeded without triggers, so the audit columns are set explicitly.
 */
private fun seedRejection(
    rejectedAt: OffsetDateTime,
    rejectedBySo: Boolean,
    previousStatus: String = "requested",
    spEmails: List<String> = listOf("sp@example.com"),
    spStatus: String = "active",
) {
    seed(Triggers.OFF) {
        val sp = insertServiceProvider()
        execute("UPDATE flex.party SET status = ? WHERE id = ?", spStatus, sp)
        spEmails.forEach { insertPartyMember(sp, it) }
        val spg = insertServiceProvidingGroup(serviceProviderId = sp)
        val so = insertSystemOperator("SO")
        val other = insertSystemOperator("Other SO")
        val applicationId = insertServiceProvidingGroupProductApplication(spg, so.partyId, listOf(insertProductType()))
        val actorEid = if (rejectedBySo) so.principal.eid else other.principal.eid
        recordRejection(applicationId, actorEid, rejectedAt, previousStatus)
    }
}

/** Writes the history row for the previous version, then makes the current version the rejected one. */
private fun SeedScope.recordRejection(applicationId: Long, actorEid: String, rejectedAt: OffsetDateTime, previousStatus: String) {
    val table = "flex.service_providing_group_product_application"
    execute(
        "INSERT INTO ${table}_history (id, created_at, service_providing_group_id, procuring_system_operator_id, " +
            "product_type_ids, status, maximum_active_power_up, maximum_active_power_down, recorded_by, " +
            "record_time_range, replaced_by) " +
            "SELECT id, created_at, service_providing_group_id, procuring_system_operator_id, product_type_ids, ?, " +
            "maximum_active_power_up, maximum_active_power_down, 0, " +
            "tstzrange(?::timestamptz - interval '1 day', ?::timestamptz), 0 FROM $table WHERE id = ?",
        previousStatus,
        rejectedAt,
        rejectedAt,
        applicationId,
    )
    execute(
        "UPDATE $table SET status = 'rejected', " +
            "recorded_by = (SELECT id FROM flex.identity WHERE eid::text = ?), " +
            "record_time_range = tstzrange(?::timestamptz, NULL) WHERE id = ?",
        actorEid,
        rejectedAt,
        applicationId,
    )
}
