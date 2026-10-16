package no.elhub.flex.notice.db

import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.auth.FlexPrincipal
import java.sql.Connection
import java.util.UUID

class NoticeRecipientRepositoryTest : FunSpec({

    val repo = NoticeRecipientRepositoryImpl()
    val principal = FlexPrincipal.internalEventNotification()

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use { it.execute("TRUNCATE flex.notice, flex.party, flex.entity CASCADE") }
        }
    }

    test("returns email of entity whose party has an active notice") {
        PostgresTestContainer.withConnection { conn ->
            val party = conn.insertEndUser("a@example.com", partyStatus = "active")
            conn.insertNotice(party, "active")
        }

        with(principal) { repo.getActiveRecipientEmails() }
            .shouldBeRight() shouldContainExactlyInAnyOrder listOf("a@example.com")
    }

    test("ignores resolved notices") {
        PostgresTestContainer.withConnection { conn ->
            val party = conn.insertEndUser("a@example.com", partyStatus = "active")
            conn.insertNotice(party, "resolved")
        }

        with(principal) { repo.getActiveRecipientEmails() }.shouldBeRight().shouldBeEmpty()
    }

    test("ignores parties that are not active") {
        PostgresTestContainer.withConnection { conn ->
            val party = conn.insertEndUser("a@example.com", partyStatus = "suspended")
            conn.insertNotice(party, "active")
        }

        with(principal) { repo.getActiveRecipientEmails() }.shouldBeRight().shouldBeEmpty()
    }

    test("ignores entities that do not use email as business id") {
        PostgresTestContainer.withConnection { conn ->
            val party = conn.insertEndUser("12345678901", businessIdType = "pid", partyStatus = "active")
            conn.insertNotice(party, "active")
        }

        with(principal) { repo.getActiveRecipientEmails() }.shouldBeRight().shouldBeEmpty()
    }

    test("returns each email once when an entity has several notices") {
        PostgresTestContainer.withConnection { conn ->
            val party = conn.insertEndUser("a@example.com", partyStatus = "active")
            conn.insertNotice(party, "active", "key-1")
            conn.insertNotice(party, "active", "key-2")
        }

        with(principal) { repo.getActiveRecipientEmails() }
            .shouldBeRight() shouldContainExactlyInAnyOrder listOf("a@example.com")
    }
})

private fun Connection.insertEndUser(businessId: String, businessIdType: String = "email", partyStatus: String): Long {
    val entityId = prepareStatement(
        "INSERT INTO flex.entity (name, type, business_id, business_id_type) VALUES (?, 'person', ?, ?) RETURNING id",
    ).use { stmt ->
        stmt.setString(1, "Person $businessId")
        stmt.setString(2, businessId)
        stmt.setString(3, businessIdType)
        stmt.executeQuery().use { rs ->
            rs.next()
            rs.getLong(1)
        }
    }
    return prepareStatement(
        "INSERT INTO flex.party (entity_id, name, type, role, status) VALUES (?, ?, 'end_user', 'flex_end_user', ?) RETURNING id",
    ).use { stmt ->
        stmt.setLong(1, entityId)
        stmt.setString(2, "Party $businessId")
        stmt.setString(3, partyStatus)
        stmt.executeQuery().use { rs ->
            rs.next()
            rs.getLong(1)
        }
    }
}

private fun Connection.insertNotice(partyId: Long, status: String, key: String = UUID.randomUUID().toString()) {
    prepareStatement(
        "INSERT INTO flex.notice (party_id, type, status, deduplication_key) VALUES (?, 'no.elhub.flex.test'::ltree, ?, ?)",
    ).use { stmt ->
        stmt.setLong(1, partyId)
        stmt.setString(2, status)
        stmt.setString(3, key)
        stmt.execute()
    }
}
