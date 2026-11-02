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
import no.elhub.flex.shared.accountingpoint.model.AccountingPointId
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.error.InternalServerError
import kotlin.time.Instant
import no.elhub.flex.shared.accountingpoint.AccountingPointService as SharedAccountingPointService

class AccountingPointServiceTest : FunSpec({

    @Suppress("UnusedPrivateProperty")
    val db = PostgresTestContainer // ensure FlexTransaction is initialised

    val accountingPointRepository = mockk<AccountingPointRepository>()
    val sharedAccountingPointService = mockk<SharedAccountingPointService>()
    val service = AccountingPointServiceImpl(accountingPointRepository, sharedAccountingPointService)

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

    context("getAccountingPointStartDate") {

        val apId = 10L

        test("returns the start date for the accounting point from the shared service") {
            // given
            val start = Instant.parse("2024-01-01T00:00:00Z")
            with(internalPrincipal) {
                coEvery { sharedAccountingPointService.getAccountingPointStartDates(listOf(apId)) } returns
                    mapOf(AccountingPointId(apId) to start).right()
            }

            // when
            val result = with(internalPrincipal) { service.getAccountingPointStartDate(apId) }

            // then
            result.shouldBeRight() shouldBe start
        }

        test("returns null when the shared service has no start date for it") {
            // given
            with(internalPrincipal) {
                coEvery { sharedAccountingPointService.getAccountingPointStartDates(listOf(apId)) } returns
                    emptyMap<AccountingPointId, Instant?>().right()
            }

            // when
            val result = with(internalPrincipal) { service.getAccountingPointStartDate(apId) }

            // then
            result.shouldBeRight() shouldBe null
        }

        test("propagates errors from the shared service") {
            // given
            with(internalPrincipal) {
                coEvery { sharedAccountingPointService.getAccountingPointStartDates(any()) } returns
                    InternalServerError("trace-id").left()
            }

            // when
            val result = with(internalPrincipal) { service.getAccountingPointStartDate(apId) }

            // then
            result.shouldBeLeft().shouldBeInstanceOf<InternalServerError>()
        }
    }
})
