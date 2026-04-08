package no.elhub.flex.db

import arrow.core.raise.either
import arrow.core.right
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.util.uniqueGsrn

class FlexTransactionTest : FunSpec({

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute("TRUNCATE flex.accounting_point CASCADE")
            }
        }
    }

    val internalPrincipal = FlexPrincipal.internalData()

    context("preamble") {

        test("top-level transaction applies the RLS preamble (flex.current_entity is set)") {
            // The internalData principal has eid="0"
            val entity = with(internalPrincipal) {
                flexTransaction { conn ->
                    conn.prepareStatement("SELECT current_setting('flex.current_entity', true)").use { stmt ->
                        stmt.executeQuery().use { rs ->
                            rs.next()
                            rs.getString(1)
                        }
                    }.right()
                }
            }.shouldBeRight()

            entity shouldBe "0"
        }

        test("nested flexTransaction does not overwrite the outer preamble settings") {
            val innerValue = with(internalPrincipal) {
                flexTransaction { conn ->
                    either {
                        // Manually change the session variable to a sentinel after the outer preamble ran.
                        conn.prepareStatement("SELECT set_config('flex.current_entity', '99', true)").use { it.execute() }

                        // Now open a nested flexTransaction — it must NOT call the preamble again.
                        with(internalPrincipal) {
                            flexTransaction { innerConn ->
                                innerConn.prepareStatement("SELECT current_setting('flex.current_entity', true)")
                                    .use { stmt ->
                                        stmt.executeQuery().use { rs ->
                                            rs.next()
                                            rs.getString(1)
                                        }
                                    }.right()
                            }
                        }.bind()
                    }
                }
            }.shouldBeRight()

            // If the preamble had run again it would have reset the value back to '0'.
            innerValue shouldBe "99"
        }
    }

    context("transaction sharing") {

        test("write inside nested flexTransaction is visible in outer transaction before commit") {
            // Open the outer transaction and insert a row from inside a nested flexTransaction.
            // Then read it back within the same outer transaction without any intermediate commit.
            val businessId = uniqueGsrn()

            val found = with(internalPrincipal) {
                flexTransaction { outerConn ->
                    either {
                        // Nested call — joins the outer transaction.
                        with(internalPrincipal) {
                            flexTransaction { innerConn ->
                                innerConn.prepareStatement(
                                    "INSERT INTO flex.accounting_point (business_id) VALUES (?)"
                                ).use { stmt ->
                                    stmt.setString(1, businessId)
                                    stmt.execute()
                                }
                                Unit.right()
                            }
                        }.bind()

                        // Read the row back on the *same* outer connection — must see the insert.
                        outerConn.prepareStatement(
                            "SELECT count(*) FROM flex.accounting_point WHERE business_id = ?"
                        ).use { stmt ->
                            stmt.setString(1, businessId)
                            stmt.executeQuery().use { rs ->
                                rs.next()
                                rs.getLong(1)
                            }
                        }
                    }
                }
            }.shouldBeRight()

            found shouldBe 1L
        }

        test("outer transaction is rolled back when block throws an exception") {
            val businessId = uniqueGsrn()

            runCatching {
                with(internalPrincipal) {
                    flexTransaction<Nothing, Unit> { _ ->
                        with(internalPrincipal) {
                            flexTransaction { innerConn ->
                                innerConn.prepareStatement(
                                    "INSERT INTO flex.accounting_point (business_id) VALUES (?)"
                                ).use { stmt ->
                                    stmt.setString(1, businessId)
                                    stmt.execute()
                                }
                                Unit.right()
                            }
                        }
                        error("deliberate rollback")
                    }
                }
            }

            val count = PostgresTestContainer.withConnection { conn ->
                conn.prepareStatement(
                    "SELECT count(*) FROM flex.accounting_point WHERE business_id = ?"
                ).use { stmt ->
                    stmt.setString(1, businessId)
                    stmt.executeQuery().use { rs ->
                        rs.next()
                        rs.getLong(1)
                    }
                }
            }

            count shouldBe 0L
        }
    }
})
