package no.elhub.flex.jobs

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import no.elhub.flex.MailpitTestContainer
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.email.MailConfig
import no.elhub.flex.email.SmtpMailClient
import no.elhub.flex.notice.db.NoticeRecipientRepositoryImpl
import java.sql.Connection

/** Runs [SendNoticeMailJob] with the real DB repository and SMTP client against Mailpit. */
class SendNoticeMailJobIntegrationTest : FunSpec({

    val config = MailConfig(
        host = MailpitTestContainer.host,
        port = MailpitTestContainer.smtpPort,
        username = "",
        password = "",
        from = "flex@example.com",
        startTls = false,
    )
    val job = SendNoticeMailJob(SmtpMailClient(config), NoticeRecipientRepositoryImpl())

    beforeTest {
        MailpitTestContainer.clearMessages()
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use { it.execute("TRUNCATE flex.notice, flex.party, flex.entity CASCADE") }
        }
    }

    test("sends one mail to each recipient with an active notice") {
        PostgresTestContainer.withConnection { conn ->
            conn.insertEndUserWithNotice("a@example.com", "active")
            conn.insertEndUserWithNotice("b@example.com", "active")
            conn.insertEndUserWithNotice("c@example.com", "resolved")
        }

        job.run()

        val mails = MailpitTestContainer.messages()
        mails.flatMap { it.to } shouldContainExactlyInAnyOrder listOf("a@example.com", "b@example.com")
        mails.forEach {
            it.subject shouldBe "You have notices in the Flexibility Information System"
            it.html shouldContain "Flexibility Information System"
        }
    }

    test("sends nothing when there are no active notices") {
        job.run()

        MailpitTestContainer.messages().shouldBeEmpty()
    }
})

private fun Connection.insertEndUserWithNotice(email: String, noticeStatus: String) {
    val entityId = prepareStatement(
        "INSERT INTO flex.entity (name, type, business_id, business_id_type) VALUES (?, 'person', ?, 'email') RETURNING id",
    ).use { stmt ->
        stmt.setString(1, "Person $email")
        stmt.setString(2, email)
        stmt.executeQuery().use { rs ->
            rs.next()
            rs.getLong(1)
        }
    }
    val partyId = prepareStatement(
        "INSERT INTO flex.party (entity_id, name, type, role, status) VALUES (?, ?, 'end_user', 'flex_end_user', 'active') RETURNING id",
    ).use { stmt ->
        stmt.setLong(1, entityId)
        stmt.setString(2, "Party $email")
        stmt.executeQuery().use { rs ->
            rs.next()
            rs.getLong(1)
        }
    }
    prepareStatement(
        "INSERT INTO flex.notice (party_id, type, status, deduplication_key) VALUES (?, 'no.elhub.flex.test'::ltree, ?, ?)",
    ).use { stmt ->
        stmt.setLong(1, partyId)
        stmt.setString(2, noticeStatus)
        stmt.setString(3, "key-$email")
        stmt.execute()
    }
}
