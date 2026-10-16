package no.elhub.flex.email

import io.kotest.core.spec.style.FunSpec
import io.mockk.coVerify
import io.mockk.mockk

class MailServiceTest : FunSpec({
    test("run does nothing yet and does not send mail") {
        val client = mockk<MailClient>()
        MailService(client).run()
        coVerify(exactly = 0) { client.send(any()) }
    }
})
