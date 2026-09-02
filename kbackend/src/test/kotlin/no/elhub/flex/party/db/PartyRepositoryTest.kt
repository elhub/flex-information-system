package no.elhub.flex.party.db

import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.model.domain.Party
import no.elhub.flex.model.domain.db.NotFoundError
import java.sql.Connection

class PartyRepositoryTest : FunSpec({

    val repo = PartyRepositoryImpl()

    val principal = FlexPrincipal.internalData()

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute("TRUNCATE flex.party CASCADE")
                it.execute("TRUNCATE flex.entity CASCADE")
            }
        }
    }

    context("getById") {

        test("returns the party when it exists") {
            // given
            val (partyId, orgNumber) = PostgresTestContainer.withConnection { conn ->
                insertOrganisationParty(conn, "Test Organisation")
            }

            // when
            val result = with(principal) {
                repo.getById(partyId)
            }.shouldBeRight()

            // then
            result shouldBe Party(id = partyId, name = "Test Organisation", role = "flex_organisation", businessId = orgNumber)
        }

        test("returns NotFoundError when the party does not exist") {
            // given
            val nonExistentId = 999_999_999L

            // when
            val result = with(principal) {
                repo.getById(nonExistentId)
            }

            // then
            result.shouldBeLeft() shouldBe NotFoundError("party does not exist in database")
        }
    }
})

private fun uniqueOrgNumber(): String = "1" + (0..99_999_999L).random().toString().padStart(8, '0')

/** Inserts a flex.entity + flex.party (type='organisation') row, returning the party ID and its business ID. */
private fun insertOrganisationParty(conn: Connection, name: String): Pair<Long, String> {
    conn.autoCommit = false
    conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
    val orgNumber = uniqueOrgNumber()

    val entityId = conn.prepareStatement(
        "INSERT INTO flex.entity (name, type, business_id, business_id_type) VALUES (?, 'organisation', ?, 'org') RETURNING id",
    ).use { stmt ->
        stmt.setString(1, "$name - ENT")
        stmt.setString(2, orgNumber)
        stmt.executeQuery().use { rs ->
            rs.next()
            rs.getLong(1)
        }
    }

    val partyId = conn.prepareStatement(
        "INSERT INTO flex.party (entity_id, name, type, role, business_id, business_id_type) VALUES (?, ?, 'organisation', 'flex_organisation', ?, 'org') RETURNING id",
    ).use { stmt ->
        stmt.setLong(1, entityId)
        stmt.setString(2, name)
        stmt.setString(3, orgNumber)
        stmt.executeQuery().use { rs ->
            rs.next()
            rs.getLong(1)
        }
    }

    conn.commit()
    return partyId to orgNumber
}
