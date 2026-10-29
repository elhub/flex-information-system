package no.elhub.flex.notice.db

import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.util.seed

class NoticeRecipientRepositoryTest : FunSpec({

    val repo = NoticeRecipientRepositoryImpl()
    val principal = FlexPrincipal.internalEventNotification

    beforeTest {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use { it.execute("TRUNCATE flex.notice, flex.party, flex.entity CASCADE") }
        }
    }

    test("returns email of entity that is a member of a party with an active notice") {
        seed {
            val party = insertEndUserParty(status = "active")
            insertPartyMember(party, "a@example.com")
            insertNotice(party, "active")
        }

        with(principal) { repo.getActiveRecipients() }
            .shouldBeRight().map { it.email } shouldContainExactlyInAnyOrder listOf("a@example.com")
    }

    test("returns every member with an email") {
        seed {
            val party = insertEndUserParty(status = "active")
            insertPartyMember(party, "a@example.com")
            insertPartyMember(party, "b@example.com")
            insertNotice(party, "active")
        }

        with(principal) { repo.getActiveRecipients() }
            .shouldBeRight().map { it.email } shouldContainExactlyInAnyOrder listOf("a@example.com", "b@example.com")
    }

    test("ignores the email of the party's own entity when it is not a member") {
        seed {
            val party = insertEndUserParty(status = "active", ownerEmail = "owner@example.com")
            insertNotice(party, "active")
        }

        with(principal) { repo.getActiveRecipients() }.shouldBeRight().shouldBeEmpty()
    }

    test("ignores members of parties without active notices") {
        seed {
            val withActive = insertEndUserParty(status = "active")
            insertPartyMember(withActive, "a@example.com")
            insertNotice(withActive, "active")
            val withResolved = insertEndUserParty(status = "active")
            insertPartyMember(withResolved, "b@example.com")
            insertNotice(withResolved, "resolved")
            val withoutNotice = insertEndUserParty(status = "active")
            insertPartyMember(withoutNotice, "c@example.com")
        }

        with(principal) { repo.getActiveRecipients() }
            .shouldBeRight().map { it.email } shouldContainExactlyInAnyOrder listOf("a@example.com")
    }

    test("ignores members of parties that are not active") {
        seed {
            val party = insertEndUserParty(status = "suspended")
            insertPartyMember(party, "a@example.com")
            insertNotice(party, "active")
        }

        with(principal) { repo.getActiveRecipients() }.shouldBeRight().shouldBeEmpty()
    }

    test("ignores members that do not use email as business id") {
        seed {
            val party = insertEndUserParty(status = "active")
            insertPartyMember(party, "12345678901", businessIdType = "pid")
            insertNotice(party, "active")
        }

        with(principal) { repo.getActiveRecipients() }.shouldBeRight().shouldBeEmpty()
    }

    test("returns each email once when a member has several parties and notices") {
        seed {
            val entity = insertPerson("a@example.com")
            val party1 = insertEndUserParty(status = "active")
            val party2 = insertEndUserParty(status = "active")
            insertPartyMembership(party1, entity)
            insertPartyMembership(party2, entity)
            insertNotice(party1, "active", "key-1")
            insertNotice(party1, "active", "key-2")
            insertNotice(party2, "active", "key-3")
        }

        with(principal) { repo.getActiveRecipients() }
            .shouldBeRight().map { it.email } shouldContainExactlyInAnyOrder listOf("a@example.com")
    }
})
