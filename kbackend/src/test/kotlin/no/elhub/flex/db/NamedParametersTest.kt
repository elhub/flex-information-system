package no.elhub.flex.db

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import java.sql.Connection
import java.sql.PreparedStatement
import java.sql.ResultSet

class NamedParametersTest : FunSpec({

    fun mockConnection(stmt: PreparedStatement): Connection = mockk {
        every { prepareStatement(any()) } returns stmt
    }

    fun mockStatement(): PreparedStatement = mockk(relaxed = true)

    context("SQL transformation") {

        test("single named parameter is replaced with '?'") {
            val stmt = mockStatement()
            val sqlSlot = slot<String>()
            val conn = mockk<Connection> { every { prepareStatement(capture(sqlSlot)) } returns stmt }

            conn.prepareNamed("SELECT * FROM t WHERE id = :id", mapOf("id" to 1L))

            sqlSlot.captured shouldBe "SELECT * FROM t WHERE id = ?"
        }

        test("multiple distinct named parameters are each replaced with '?'") {
            val stmt = mockStatement()
            val sqlSlot = slot<String>()
            val conn = mockk<Connection> { every { prepareStatement(capture(sqlSlot)) } returns stmt }

            conn.prepareNamed(
                "SELECT * FROM t WHERE a = :alpha AND b = :beta",
                mapOf("alpha" to "x", "beta" to "y"),
            )

            sqlSlot.captured shouldBe "SELECT * FROM t WHERE a = ? AND b = ?"
        }

        test("PostgreSQL cast syntax '::type' is not treated as a named parameter") {
            val stmt = mockStatement()
            val sqlSlot = slot<String>()
            val conn = mockk<Connection> { every { prepareStatement(capture(sqlSlot)) } returns stmt }

            conn.prepareNamed(
                "SELECT :val::text, :num::bigint",
                mapOf("val" to "hello", "num" to 42L),
            )

            sqlSlot.captured shouldBe "SELECT ?::text, ?::bigint"
        }

        test("repeated parameter with a different parameter in between produces three '?' markers") {
            val stmt = mockStatement()
            val sqlSlot = slot<String>()
            val conn = mockk<Connection> { every { prepareStatement(capture(sqlSlot)) } returns stmt }

            conn.prepareNamed(
                "SELECT * FROM t WHERE a = :x AND b = :y AND c = :x",
                mapOf("x" to 1, "y" to 2),
            )

            sqlSlot.captured shouldBe "SELECT * FROM t WHERE a = ? AND b = ? AND c = ?"
        }
    }

    context("parameter binding") {

        test("single parameter is bound at index 1") {
            val stmt = mockStatement()
            mockConnection(stmt).prepareNamed("SELECT * FROM t WHERE id = :id", mapOf("id" to 7L))

            verify { stmt.setObject(1, 7L) }
        }

        test("multiple parameters are bound in left-to-right SQL order") {
            val stmt = mockStatement()
            mockConnection(stmt).prepareNamed(
                "SELECT * FROM t WHERE a = :alpha AND b = :beta",
                mapOf("alpha" to "first", "beta" to "second"),
            )

            verify { stmt.setObject(1, "first") }
            verify { stmt.setObject(2, "second") }
        }

        test("repeated parameter with a different parameter in between binds all three in order") {
            val stmt = mockStatement()
            val sqlSlot = slot<String>()
            val conn = mockk<Connection> { every { prepareStatement(capture(sqlSlot)) } returns stmt }

            conn.prepareNamed(
                "SELECT * FROM t WHERE a = :x AND b = :y AND c = :x",
                mapOf("x" to 1, "y" to 2),
            )

            sqlSlot.captured shouldBe "SELECT * FROM t WHERE a = ? AND b = ? AND c = ?"
            verify { stmt.setObject(1, 1) } // first :x
            verify { stmt.setObject(2, 2) } // :y
            verify { stmt.setObject(3, 1) } // second :x
        }

        test("null value is bound via setObject with null") {
            val stmt = mockStatement()
            mockConnection(stmt).prepareNamed("INSERT INTO t (x) VALUES (:x)", mapOf("x" to null))

            verify { stmt.setObject(1, null) }
        }
    }

    context("error handling") {

        test("missing parameter name throws IllegalArgumentException") {
            val stmt = mockStatement()
            val conn = mockConnection(stmt)

            shouldThrow<IllegalArgumentException> {
                conn.prepareNamed("SELECT * FROM t WHERE id = :id", emptyMap())
            }
        }

        test("error message names the missing parameter") {
            val stmt = mockStatement()
            val conn = mockConnection(stmt)

            val ex = shouldThrow<IllegalArgumentException> {
                conn.prepareNamed("SELECT * FROM t WHERE id = :myParam", emptyMap())
            }
            ex.message shouldBe "Named parameter ':myParam' is not present in the params map"
        }

        test("extra keys in params map beyond what SQL uses are silently ignored") {
            val stmt = mockStatement()
            mockConnection(stmt).prepareNamed(
                "SELECT * FROM t WHERE id = :id",
                mapOf("id" to 1L, "unused" to "ignored"),
            )

            verify(exactly = 1) { stmt.setObject(any(), any()) }
        }
    }

    context("result set helpers") {

        fun emptyStatement(): PreparedStatement {
            val rs = mockk<ResultSet>(relaxed = true)
            every { rs.next() } returns false
            return mockk(relaxed = true) { every { executeQuery() } returns rs }
        }

        fun multiRowStatement(rows: List<List<Any?>>): PreparedStatement {
            val rs = mockk<ResultSet>(relaxed = true)
            val callCount = intArrayOf(0)
            every { rs.next() } answers { callCount[0]++ < rows.size }
            every { rs.getString("name") } answers { rows[callCount[0] - 1][0] as String }
            every { rs.getLong("value") } answers { rows[callCount[0] - 1][1] as Long }
            return mockk(relaxed = true) { every { executeQuery() } returns rs }
        }

        context("query") {

            test("returns all rows mapped to a list") {
                val stmt = multiRowStatement(listOf(listOf("a", 1L), listOf("b", 2L)))

                val result = stmt.query { rs -> rs.getString("name") to rs.getLong("value") }

                result shouldBe listOf("a" to 1L, "b" to 2L)
            }

            test("returns empty list when result set is empty") {
                val result = emptyStatement().query { rs -> rs.getString("name") }

                result shouldBe emptyList()
            }
        }

        context("querySingle") {

            test("returns the mapped value when one row is present") {
                val rs = mockk<ResultSet>(relaxed = true)
                every { rs.next() } returnsMany listOf(true, false)
                every { rs.getLong("id") } returns 42L
                val stmt = mockk<PreparedStatement>(relaxed = true) { every { executeQuery() } returns rs }

                val result = stmt.querySingle { it.getLong("id") }

                result shouldBe 42L
            }

            test("returns null when result set is empty") {
                val result = emptyStatement().querySingle { rs -> rs.getLong("id") }

                result shouldBe null
            }
        }

        context("queryRequiredSingle") {

            test("returns the mapped value when one row is present") {
                val rs = mockk<ResultSet>(relaxed = true)
                every { rs.next() } returnsMany listOf(true, false)
                every { rs.getLong("id") } returns 99L
                val stmt = mockk<PreparedStatement>(relaxed = true) { every { executeQuery() } returns rs }

                val result = stmt.queryRequiredSingle { it.getLong("id") }

                result shouldBe 99L
            }

            test("throws IllegalStateException when result set is empty") {
                shouldThrow<IllegalStateException> {
                    emptyStatement().queryRequiredSingle { rs -> rs.getLong("id") }
                }
            }

            test("error message is 'Query returned no rows'") {
                val ex = shouldThrow<IllegalStateException> {
                    emptyStatement().queryRequiredSingle { rs -> rs.getLong("id") }
                }
                ex.message shouldBe "Query returned no rows"
            }
        }
    }
})
