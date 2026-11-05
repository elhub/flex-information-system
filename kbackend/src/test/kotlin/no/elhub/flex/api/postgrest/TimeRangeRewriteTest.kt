package no.elhub.flex.api.postgrest

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.datatest.withData
import io.kotest.matchers.shouldBe

private const val PARAM = "ts_at"
private const val FROM = "ts_from"
private const val TO = "ts_to"

private fun filter(value: String) = "($FROM.lte.$value,or($TO.gt.$value,$TO.is.null))"

class TimeRangeRewriteTest :
    FunSpec({
        context("isValidDatetime") {
            withData(
                nameFn = { "'${it.first}' is ${if (it.second) "valid" else "invalid"}" },
                "2024-01-15T10:30:00+01:00" to true,
                "2024-01-15T10:30:00.123+01:00" to true,
                "2024-01-15T10:30:00Z" to true,
                "2024-01-15T10:30:00.123Z" to true,
                "2024-01-15 10:30:00 Europe/Oslo" to true,
                "2024-01-15 10:30:00.123 Europe/Oslo" to true,
                "2024-01-15 10:30:00 UTC" to true,
                "2024-01-15" to false,
                "2024-01-15T10:30:00" to false,
                "not-a-date" to false,
                "" to false,
                "2024-01-15T10:30" to false,
                "2024-01-15 10:30" to false,
                "2024-01-15 10:30 FOOBAR" to false,
                "2024-13-45T10:30:00Z" to false,
            ) { (value, valid) ->
                isValidDatetime(value) shouldBe valid
            }
        }

        context("timeRangeQueryRewrite") {
            test("leaves queries without the parameter alone") {
                val query = newQuery().also { it.add("status", "eq.active") }
                timeRangeQueryRewrite(query, PARAM, FROM, TO)
                query shouldBe mapOf("status" to listOf("eq.active"))
            }

            test("rewrites the parameter into a single and-filter") {
                val query = newQuery().also { it.add(PARAM, "2024-01-15T10:30:00+01:00") }
                timeRangeQueryRewrite(query, PARAM, FROM, TO)
                query shouldBe mapOf("and" to listOf(filter("2024-01-15T10:30:00+01:00")))
            }

            test("supports the extended format") {
                val query = newQuery().also { it.add(PARAM, "2024-01-15 10:30:00 UTC") }
                timeRangeQueryRewrite(query, PARAM, FROM, TO)
                query shouldBe mapOf("and" to listOf(filter("2024-01-15 10:30:00 UTC")))
            }

            test("an empty value leaves the query unchanged") {
                val query = newQuery().also {
                    it.add(PARAM, "")
                    it.add("and", "(some_other_filter)")
                }
                timeRangeQueryRewrite(query, PARAM, FROM, TO)
                query shouldBe mapOf(PARAM to listOf(""), "and" to listOf("(some_other_filter)"))
            }

            test("prefixed parameters rewrite prefixed keys") {
                val query = newQuery().also { it.add("some_table.$PARAM", "2024-06-01T12:00:00+00:00") }
                timeRangeQueryRewrite(query, PARAM, FROM, TO)
                query shouldBe mapOf("some_table.and" to listOf(filter("2024-06-01T12:00:00+00:00")))
            }

            test("adds to a pre-existing and-filter") {
                val query = newQuery().also {
                    it.add(PARAM, "2024-03-10T08:00:00Z")
                    it.add("and", "(some_old_filter)")
                }
                timeRangeQueryRewrite(query, PARAM, FROM, TO)
                query shouldBe mapOf("and" to listOf("(some_old_filter)", filter("2024-03-10T08:00:00Z")))
            }

            test("rejects invalid values, also when prefixed") {
                shouldThrow<InvalidTimeRangeException> {
                    timeRangeQueryRewrite(newQuery().also { it.add(PARAM, "2024-01-15") }, PARAM, FROM, TO)
                }
                shouldThrow<InvalidTimeRangeException> {
                    timeRangeQueryRewrite(newQuery().also { it.add("t.$PARAM", "not-a-date") }, PARAM, FROM, TO)
                }
            }

            test("valid_at and as_of use their own columns") {
                val validAt = newQuery().also { it.add("valid_at", "2024-01-15T10:30:00Z") }
                validAtQueryRewrite(validAt)
                validAt shouldBe mapOf(
                    "and" to listOf(
                        "(valid_from.lte.2024-01-15T10:30:00Z,or(valid_to.gt.2024-01-15T10:30:00Z,valid_to.is.null))",
                    ),
                )

                val asOf = newQuery().also { it.add("as_of", "2024-01-15T10:30:00Z") }
                asOfQueryRewrite(asOf)
                asOf shouldBe mapOf(
                    "and" to listOf(
                        "(recorded_at.lte.2024-01-15T10:30:00Z,or(replaced_at.gt.2024-01-15T10:30:00Z,replaced_at.is.null))",
                    ),
                )
            }
        }
    })
