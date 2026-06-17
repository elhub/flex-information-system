package no.elhub.flex.accountingpoint.db

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe

class AnonymizePersonIdTest : FunSpec({

    test("returns first 6 characters of an 11-digit person ID") {
        anonymizePersonId("12345678901") shouldBe "123456"
    }

    test("returns first 6 characters when PID starts with zeros") {
        anonymizePersonId("00000112345") shouldBe "000001"
    }
})
