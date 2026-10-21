package no.elhub.flex.notice.db

import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.auth.FlexPrincipal

class NoticeRecipientRepositoryTest : FunSpec({

    val repo = NoticeRecipientRepositoryImpl()
    val principal = FlexPrincipal.internalEventNotification

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use { it.execute("TRUNCATE flex.notice, flex.party, flex.entity CASCADE") }
        }
    }

    test("returns email of entity that is a member of a party with an active notice") {
        PostgresTestContainer.withConnection { conn ->
            val party = conn.insertParty(partyStatus = "active")
            conn.insertMember(party, "a@example.com")
            conn.insertNotice(party, "active")
        }

        with(principal) { repo.getActiveRecipientEmails() }
            .shouldBeRight() shouldContainExactlyInAnyOrder listOf("a@example.com")
    }

    test("returns every member with an email") {
        PostgresTestContainer.withConnection { conn ->
            val party = conn.insertParty(partyStatus = "active")
            conn.insertMember(party, "a@example.com")
            conn.insertMember(party, "b@example.com")
            conn.insertNotice(party, "active")
        }

        with(principal) { repo.getActiveRecipientEmails() }
            .shouldBeRight() shouldContainExactlyInAnyOrder listOf("a@example.com", "b@example.com")
    }

    test("ignores the email of the party's own entity when it is not a member") {
        PostgresTestContainer.withConnection { conn ->
            val party = conn.insertParty(partyStatus = "active", ownerEmail = "owner@example.com")
            conn.insertNotice(party, "active")
        }

        with(principal) { repo.getActiveRecipientEmails() }.shouldBeRight().shouldBeEmpty()
    }

    test("ignores members of parties without active notices") {
        PostgresTestContainer.withConnection { conn ->
            val withActive = conn.insertParty(partyStatus = "active")
            conn.insertMember(withActive, "a@example.com")
            conn.insertNotice(withActive, "active")
            val withResolved = conn.insertParty(partyStatus = "active")
            conn.insertMember(withResolved, "b@example.com")
            conn.insertNotice(withResolved, "resolved")
            val withoutNotice = conn.insertParty(partyStatus = "active")
            conn.insertMember(withoutNotice, "c@example.com")
        }

        with(principal) { repo.getActiveRecipientEmails() }
            .shouldBeRight() shouldContainExactlyInAnyOrder listOf("a@example.com")
    }

    test("ignores members of parties that are not active") {
        PostgresTestContainer.withConnection { conn ->
            val party = conn.insertParty(partyStatus = "suspended")
            conn.insertMember(party, "a@example.com")
            conn.insertNotice(party, "active")
        }

        with(principal) { repo.getActiveRecipientEmails() }.shouldBeRight().shouldBeEmpty()
    }

    test("ignores members that do not use email as business id") {
        PostgresTestContainer.withConnection { conn ->
            val party = conn.insertParty(partyStatus = "active")
            conn.insertMember(party, "12345678901", businessIdType = "pid")
            conn.insertNotice(party, "active")
        }

        with(principal) { repo.getActiveRecipientEmails() }.shouldBeRight().shouldBeEmpty()
    }

    test("returns each email once when a member has several parties and notices") {
        PostgresTestContainer.withConnection { conn ->
            val entity = conn.insertEntity("a@example.com")
            val party1 = conn.insertParty(partyStatus = "active")
            val party2 = conn.insertParty(partyStatus = "active")
            conn.insertMembership(party1, entity)
            conn.insertMembership(party2, entity)
            conn.insertNotice(party1, "active", "key-1")
            conn.insertNotice(party1, "active", "key-2")
            conn.insertNotice(party2, "active", "key-3")
        }

        with(principal) { repo.getActiveRecipientEmails() }
            .shouldBeRight() shouldContainExactlyInAnyOrder listOf("a@example.com")
    }
})
