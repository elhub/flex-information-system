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
import no.elhub.flex.email.MailClient
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.notice.db.NoticeRecipientRepository

class SendNoticeMailJobTest : FunSpec({
    val client = mockk<MailClient>()
    val repository = mockk<NoticeRecipientRepository>()
    val principal = FlexPrincipal.internalEventNotification
    val job = SendNoticeMailJob(client, repository)

    beforeTest { clearAllMocks() }

    test("sends one mail per recipient") {
        coEvery { with(principal) { repository.getActiveRecipientEmails() } } returns listOf("a@b.no", "c@d.no").right()
        coEvery { client.send(any()) } returns Unit
        job.run().shouldBeRight()
        coVerify(exactly = 1) { client.send(match { it.mailTo == "a@b.no" }) }
        coVerify(exactly = 1) { client.send(match { it.mailTo == "c@d.no" }) }
    }

    test("a failing send does not stop the remaining mails") {
        coEvery { with(principal) { repository.getActiveRecipientEmails() } } returns listOf("a@b.no", "c@d.no").right()
        coEvery { client.send(match { it.mailTo == "a@b.no" }) } throws RuntimeException("smtp down")
        coEvery { client.send(match { it.mailTo == "c@d.no" }) } returns Unit
        job.run().shouldBeRight()
        coVerify(exactly = 1) { client.send(match { it.mailTo == "c@d.no" }) }
    }

    test("repository error is returned as a job error") {
        coEvery { with(principal) { repository.getActiveRecipientEmails() } } returns DatabaseError("boom").left()
        job.run().shouldBeLeft().shouldBeInstanceOf<JobError.DatabaseError>()
        coVerify(exactly = 0) { client.send(any()) }
    }
})
