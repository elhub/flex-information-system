package no.elhub.flex.util

import io.kotest.core.spec.style.FunSpec
import io.kotest.datatest.withData
import io.kotest.matchers.shouldBe

class Gs1Test :
    FunSpec({
        context("isValidGsrn") {
            context("valid GSRNs") {
                withData(
                    nameFn = { "GSRN $it is valid" },
                    // Known-valid 18-digit GSRN values taken from the Go backend test suite
                    "123456789012345675",
                    "133700000000000053",
                    "133700000000000060",
                ) { gsrn ->
                    isValidGsrn(gsrn) shouldBe true
                }
            }

            context("invalid GSRNs") {
                withData(
                    nameFn = { "'$it' is invalid" },
                    "", // empty
                    "1234567890", // too short
                    "12345678901234567890", // too long
                    "023456789012345675", // starts with 0
                    "12345678901234567X", // non-digit
                    "123456789012345670", // wrong check digit
                    "123456789012345602", // wrong check digit
                ) { gsrn ->
                    isValidGsrn(gsrn) shouldBe false
                }
            }
        }
    })
