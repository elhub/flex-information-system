package no.elhub.flex.email

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotContain

class MailTemplateTest : FunSpec({
    test("injects variables into subject and body within the layout") {
        val mail = MailTemplate("Hi {{name}}", "<title>{{subject}}</title>Count: {{count}}").render("a@b.no", mapOf("name" to "Ola", "count" to "3"))
        mail.mailTo shouldBe "a@b.no"
        mail.subject shouldBe "Hi Ola"
        mail.content shouldContain "<title>Hi Ola</title>Count: 3"
        mail.content shouldNotContain "{{"
    }

    test("escapes html in values but not in subject") {
        val mail = MailTemplate("S <{{x}}>", "<{{x}}>").render("a@b.no", mapOf("x" to "<b>"))
        mail.subject shouldBe "S <<b>>"
        mail.content shouldContain "<&lt;b&gt;>"
    }

    test("missing variable fails") {
        shouldThrow<IllegalArgumentException> { MailTemplate("s", "{{nope}}").render("a@b.no") }
    }

    test("active notices template renders with a user name") {
        val mail = MailTemplate.ACTIVE_NOTICES.render("a@b.no", mapOf("userName" to "Ola"))
        mail.subject shouldBe "Du har varsler i Fleksibilitetsregisteret"
        mail.content shouldContain "Du har åpne varsler"
        mail.content shouldContain "Hei Ola,"
        mail.content shouldNotContain "{{"
    }
})
