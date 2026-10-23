package no.elhub.flex.email

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe

class SmtpMailClientTest : FunSpec({
    fun config(startTls: Boolean = true, username: String = "user") =
        MailConfig("smtp.example.com", 587, username, "pw", "from@example.com", startTls)

    test("requires STARTTLS and modern TLS when startTls is enabled") {
        val props = smtpProperties(config())
        props["mail.smtp.starttls.enable"] shouldBe "true"
        props["mail.smtp.starttls.required"] shouldBe "true"
        props["mail.smtp.ssl.protocols"] shouldBe "TLSv1.2 TLSv1.3"
    }

    test("does not require STARTTLS when disabled") {
        smtpProperties(config(startTls = false))["mail.smtp.starttls.required"] shouldBe "false"
    }

    test("sets connection, read and write timeouts") {
        val props = smtpProperties(config())
        props["mail.smtp.connectiontimeout"] shouldBe "10000"
        props["mail.smtp.timeout"] shouldBe "30000"
        props["mail.smtp.writetimeout"] shouldBe "30000"
    }

    test("auth is enabled only when a username is set") {
        smtpProperties(config())["mail.smtp.auth"] shouldBe "true"
        smtpProperties(config(username = ""))["mail.smtp.auth"] shouldBe "false"
    }
})
