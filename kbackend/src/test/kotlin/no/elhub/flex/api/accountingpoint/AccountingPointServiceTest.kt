package no.elhub.flex.api.accountingpoint

import arrow.core.left
import arrow.core.right
import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import io.mockk.coEvery
import io.mockk.mockk
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.api.accountingpoint.db.AccountingPointRepository
import no.elhub.flex.shared.accountingpoint.model.AccountingPoint
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.error.InternalServerError

class AccountingPointServiceTest : FunSpec({

    @Suppress("UnusedPrivateProperty")
    val db = PostgresTestContainer // ensure FlexTransaction is initialised

    val accountingPointRepository = mockk<AccountingPointRepository>()
    val service = AccountingPointServiceImpl(accountingPointRepository)

    val internalPrincipal = FlexPrincipal.internalData

    context("getByIds") {

        val ap1 = AccountingPoint(id = 1L, businessId = "133700000000000001")
        val ap2 = AccountingPoint(id = 2L, businessId = "133700000000000002")

        test("returns accounting points from repository on success") {
            // given
            with(internalPrincipal) {
                coEvery { accountingPointRepository.getByIds(listOf(ap1.id, ap2.id)) } returns listOf(ap1, ap2).right()
            }

            // when
            val result = with(internalPrincipal) { service.getByIds(listOf(ap1.id, ap2.id)) }

            // then
            result.shouldBeRight() shouldBe listOf(ap1, ap2)
        }

        test("maps repository error to InternalServerError") {
            // given
            with(internalPrincipal) {
                coEvery { accountingPointRepository.getByIds(any()) } returns DatabaseError("db failure").left()
            }

            // when
            val result = with(internalPrincipal) { service.getByIds(listOf(ap1.id)) }

            // then
            result.shouldBeLeft().shouldBeInstanceOf<InternalServerError>()
        }
    }
})
