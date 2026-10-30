package no.elhub.flex.jobs

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import no.elhub.flex.MailpitTestContainer
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.config.MailConfig
import no.elhub.flex.notice.db.NoticeRecipientRepositoryImpl
import no.elhub.flex.util.SeedScope
import no.elhub.flex.util.seed

/** Runs [SendNoticeMailJob] with the real DB repository and SMTP client against Mailpit. */
class SendNoticeMailJobIntegrationTest : FunSpec({

    val config = MailConfig(
        host = MailpitTestContainer.host,
        port = MailpitTestContainer.smtpPort,
        username = "",
        password = "",
        from = "flex@example.com",
        startTls = false,
        dryRun = false,
    )
    val job = SendNoticeMailJob(NoticeRecipientRepositoryImpl(), config)

    beforeTest {
        MailpitTestContainer.clearMessages()
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use { it.execute("TRUNCATE flex.notice, flex.party, flex.entity CASCADE") }
        }
    }

    test("sends one mail to each recipient with an active notice") {
        seed {
            insertEndUserWithNotice("a@example.com", "active")
            insertEndUserWithNotice("b@example.com", "active")
            insertEndUserWithNotice("c@example.com", "resolved")
        }

        job.run()

        val mails = MailpitTestContainer.messages()
        mails.flatMap { it.to } shouldContainExactlyInAnyOrder listOf("a@example.com", "b@example.com")
        mails.forEach {
            it.subject shouldBe "Du har varsler i Fleksibilitetsregisteret"
            it.html shouldContain "Fleksibilitetsregisteret"
            it.html shouldContain "Hei Person "
        }
    }

    test("sends nothing when there are no active notices") {
        job.run()

        MailpitTestContainer.messages().shouldBeEmpty()
    }
})

private fun SeedScope.insertEndUserWithNotice(email: String, noticeStatus: String) {
    val partyId = insertEndUserParty(status = "active")
    insertPartyMember(partyId, email)
    insertNotice(partyId, noticeStatus, "key-$email")
}
