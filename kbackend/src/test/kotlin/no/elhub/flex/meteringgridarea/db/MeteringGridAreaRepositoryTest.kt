package no.elhub.flex.meteringgridarea.db

import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.maps.shouldContainKey
import io.kotest.matchers.maps.shouldHaveSize
import io.kotest.matchers.shouldBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.model.domain.MeteringGridArea
import no.elhub.flex.model.domain.MeteringGridAreaStatus
import no.elhub.flex.model.domain.db.NotFoundError
import no.elhub.flex.util.uniqueEicY

class MeteringGridAreaRepositoryTest : FunSpec({

    val repo = MeteringGridAreaRepositoryImpl()

    val principal = FlexPrincipal(role = "flex_flexibility_information_system_operator", eid = "0")

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute("TRUNCATE flex.metering_grid_area CASCADE")
            }
        }
    }

    context("getMeteringGridAreasByBusinessIds") {

        test("returns a map of all requested MGAs when they all exist") {
            // given
            val mga1 = insertMeteringGridArea("MGA One")
            val mga2 = insertMeteringGridArea("MGA Two")
            insertMeteringGridArea("Noise MGA")

            // when
            val result = with(principal) {
                repo.getMeteringGridAreasByBusinessIds(listOf(mga1.businessId, mga2.businessId))
            }.shouldBeRight()

            // then
            result shouldHaveSize 2
            result shouldContainKey mga1.businessId
            result shouldContainKey mga2.businessId
            result[mga1.businessId] shouldBe mga1
            result[mga2.businessId] shouldBe mga2
        }

        test("includes MGAs with inactive status") {
            // given
            val inactive = insertMeteringGridArea("Inactive MGA", status = "inactive")

            // when
            val result = with(principal) {
                repo.getMeteringGridAreasByBusinessIds(listOf(inactive.businessId))
            }.shouldBeRight()

            // then
            result[inactive.businessId] shouldBe inactive
        }

        test("returns an empty map for an empty input list") {
            // when
            val result = with(principal) {
                repo.getMeteringGridAreasByBusinessIds(emptyList())
            }.shouldBeRight()

            // then
            result shouldHaveSize 0
        }

        test("returns NotFoundError when any requested business ID does not exist") {
            // given
            val existing = insertMeteringGridArea("Existing MGA")
            val missingId = "UNKNOWN-MGA-ID"

            // when
            val result = with(principal) {
                repo.getMeteringGridAreasByBusinessIds(listOf(existing.businessId, missingId))
            }

            // then
            result.shouldBeLeft() shouldBe NotFoundError("Metering grid areas not found: $missingId")
        }

        test("returns NotFoundError when none of the requested business IDs exist") {
            // given
            val missingId = "UNKNOWN-MGA-ID"

            // when
            val result = with(principal) {
                repo.getMeteringGridAreasByBusinessIds(listOf(missingId))
            }

            // then
            result.shouldBeLeft() shouldBe NotFoundError("Metering grid areas not found: $missingId")
        }
    }
})

private fun insertMeteringGridArea(name: String, status: String = "active"): MeteringGridArea =
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
        val row = conn.prepareStatement(
            """
            INSERT INTO flex.metering_grid_area (business_id, name, status)
            VALUES (?, ?, ?)
            RETURNING id, business_id
            """.trimIndent(),
        ).use { stmt ->
            stmt.setString(1, uniqueEicY())
            stmt.setString(2, name)
            stmt.setString(3, status)
            stmt.executeQuery().use { rs ->
                rs.next()
                MeteringGridArea(
                    id = rs.getLong("id"),
                    businessId = rs.getString("business_id"),
                    name = name,
                    status = MeteringGridAreaStatus.valueOf(status.uppercase()),
                )
            }
        }
        conn.commit()
        row
    }
