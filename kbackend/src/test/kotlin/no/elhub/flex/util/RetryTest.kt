package no.elhub.flex.util

import arrow.core.left
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe

class RetryTest : FunSpec({

    context("retry") {
        test("returns Right immediately on first success without retrying") {
            var callCount = 0
            val result = retry(times = 3u, description = "test") {
                callCount++
                "ok".right()
            }
            result.shouldBeRight() shouldBe "ok"
            callCount shouldBe 1
        }

        test("retries on Left and returns Right when a retry succeeds") {
            var callCount = 0
            val result = retry(times = 3u, description = "test") {
                callCount++
                if (callCount < 3) "error".left() else "ok".right()
            }
            result.shouldBeRight() shouldBe "ok"
            callCount shouldBe 3
        }

        test("returns last Left after exhausting all retries") {
            var callCount = 0
            val result = retry(times = 3u, description = "test") {
                callCount++
                "error".left()
            }
            result.shouldBeLeft() shouldBe "error"
            callCount shouldBe 4 // 1 initial + 3 retries
        }

        test("does not retry when times is 0") {
            var callCount = 0
            val result = retry(times = 0u, description = "test") {
                callCount++
                "error".left()
            }
            result.shouldBeLeft()
            callCount shouldBe 1
        }
    }
})
