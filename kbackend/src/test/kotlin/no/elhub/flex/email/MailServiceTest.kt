package no.elhub.flex.email

import arrow.core.left
import arrow.core.right
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.notice.db.NoticeRecipientRepository

class MailServiceTest : FunSpec({
    val client = mockk<MailClient>()
    val repository = mockk<NoticeRecipientRepository>()
    val principal = FlexPrincipal.internalEventNotification()
    val service = MailService(client, repository)

    beforeTest { clearAllMocks() }

    test("sends one mail per recipient") {
        coEvery { with(principal) { repository.getActiveRecipientEmails() } } returns listOf("a@b.no", "c@d.no").right()
        coEvery { client.send(any()) } returns Unit
        service.run()
        coVerify(exactly = 1) { client.send(match { it.mailTo == "a@b.no" }) }
        coVerify(exactly = 1) { client.send(match { it.mailTo == "c@d.no" }) }
    }

    test("a failing send does not stop the remaining mails") {
        coEvery { with(principal) { repository.getActiveRecipientEmails() } } returns listOf("a@b.no", "c@d.no").right()
        coEvery { client.send(match { it.mailTo == "a@b.no" }) } throws RuntimeException("smtp down")
        coEvery { client.send(match { it.mailTo == "c@d.no" }) } returns Unit
        service.run()
        coVerify(exactly = 1) { client.send(match { it.mailTo == "c@d.no" }) }
    }

    test("repository error does not throw") {
        coEvery { with(principal) { repository.getActiveRecipientEmails() } } returns DatabaseError("boom").left()
        service.run()
        coVerify(exactly = 0) { client.send(any()) }
    }
})
