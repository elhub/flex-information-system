package no.elhub.flex.party

import arrow.core.left
import arrow.core.right
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.model.domain.Party
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.NotFoundError
import no.elhub.flex.party.db.PartyRepository

class PartyServiceTest : FunSpec({

    val mockRepository = mockk<PartyRepository>()
    lateinit var service: PartyServiceImpl

    beforeTest {
        clearAllMocks(answers = false)
        service = PartyServiceImpl(mockRepository)
    }

    context("getParty") {

        test("returns the party on a successful lookup") {
            val party = Party(id = 42L, name = "Test Party", role = "flex_organisation", businessId = "123456789")
            coEvery {
                with(any<FlexPrincipal>()) { mockRepository.getById(42L) }
            } returns party.right()

            service.getParty(42L) shouldBe party
        }

        test("caches the result: a second call for the same party ID does not hit the repository again") {
            val party = Party(id = 42L, name = "Test Party", role = "flex_organisation", businessId = "123456789")
            coEvery {
                with(any<FlexPrincipal>()) { mockRepository.getById(42L) }
            } returns party.right()

            service.getParty(42L) shouldBe party
            service.getParty(42L) shouldBe party

            coVerify(exactly = 1) {
                with(any<FlexPrincipal>()) { mockRepository.getById(42L) }
            }
        }

        test("returns null and does not cache when the party is not found") {
            coEvery {
                with(any<FlexPrincipal>()) { mockRepository.getById(99L) }
            } returns NotFoundError("party does not exist in database").left()

            service.getParty(99L) shouldBe null
            service.getParty(99L) shouldBe null

            coVerify(exactly = 2) {
                with(any<FlexPrincipal>()) { mockRepository.getById(99L) }
            }
        }

        test("returns null and does not cache when the repository call fails") {
            coEvery {
                with(any<FlexPrincipal>()) { mockRepository.getById(7L) }
            } returns DatabaseError("boom").left()

            service.getParty(7L) shouldBe null

            coVerify(exactly = 1) {
                with(any<FlexPrincipal>()) { mockRepository.getById(7L) }
            }
        }
    }
})
