package no.elhub.flex.api.entity.db

import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.shared.auth.FlexPrincipal

class EntityRepositoryTest :
    FunSpec({
        val repo = EntityRepositoryImpl()
        val principal = FlexPrincipal(role = "flex_organisation", eid = "0")

        beforeTest {
            PostgresTestContainer.withConnection { conn ->
                conn.createStatement().use { it.execute("TRUNCATE flex.entity CASCADE") }
            }
        }

        test("creates the entity when missing, then finds it") {
            val created = with(principal) {
                repo.lookup("someone@example.com", "Some One", "person", "email")
            }.shouldBeRight()

            created.found shouldBe false

            val found = with(principal) {
                repo.lookup("someone@example.com", "Some One", "person", "email")
            }.shouldBeRight()

            found shouldBe EntityLookupResult(entityId = created.entityId, found = true)
        }

        test("different business IDs are different entities") {
            val first = with(principal) { repo.lookup("a@example.com", "A", "person", "email") }.shouldBeRight()
            val second = with(principal) { repo.lookup("123456789", "B AS", "organisation", "org") }.shouldBeRight()

            (first.entityId == second.entityId) shouldBe false
        }
    })
