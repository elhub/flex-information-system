package no.elhub.flex.jobs

import arrow.core.left
import arrow.core.right
import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.types.shouldBeInstanceOf
import io.mockk.clearAllMocks
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.config.MailConfig
import no.elhub.flex.email.MailClient
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.notice.db.NoticeRecipient
import no.elhub.flex.notice.db.NoticeRecipientRepository

class SendNoticeMailJobTest : FunSpec({
    val client = mockk<MailClient>()
    val repository = mockk<NoticeRecipientRepository>()
    val principal = FlexPrincipal.internalEventNotification
    val job = SendNoticeMailJob(repository, MailConfig("smtp.example.com", 587, "", "", "from@example.com", false), client)

    beforeTest { clearAllMocks() }

    test("sends one mail per recipient") {
        coEvery { with(principal) { repository.getActiveRecipients() } } returns listOf(NoticeRecipient(1, "Ola", "a@b.no"), NoticeRecipient(2, "Kari", "c@d.no")).right()
        coEvery { client.send(any()) } returns Unit
        job.run().shouldBeRight()
        coVerify(exactly = 1) { client.send(match { it.mailTo == "a@b.no" && "Hei Ola," in it.content }) }
        coVerify(exactly = 1) { client.send(match { it.mailTo == "c@d.no" && "Hei Kari," in it.content }) }
    }

    test("a failing send does not stop the remaining mails") {
        coEvery { with(principal) { repository.getActiveRecipients() } } returns listOf(NoticeRecipient(1, "Ola", "a@b.no"), NoticeRecipient(2, "Kari", "c@d.no")).right()
        coEvery { client.send(match { it.mailTo == "a@b.no" }) } throws RuntimeException("smtp down")
        coEvery { client.send(match { it.mailTo == "c@d.no" }) } returns Unit
        job.run().shouldBeRight()
        coVerify(exactly = 1) { client.send(match { it.mailTo == "c@d.no" }) }
    }

    test("missing mail config is returned as a config error") {
        val unconfigured = SendNoticeMailJob(repository, MailConfig("", 587, "", "", "", true), client)
        unconfigured.run().shouldBeLeft().shouldBeInstanceOf<JobError.ConfigError>()
        coVerify(exactly = 0) { client.send(any()) }
    }

    test("repository error is returned as a job error") {
        coEvery { with(principal) { repository.getActiveRecipients() } } returns DatabaseError("boom").left()
        job.run().shouldBeLeft().shouldBeInstanceOf<JobError.DatabaseError>()
        coVerify(exactly = 0) { client.send(any()) }
    }
})
