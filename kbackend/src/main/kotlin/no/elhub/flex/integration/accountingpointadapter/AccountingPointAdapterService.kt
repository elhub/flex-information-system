package no.elhub.flex.integration.accountingpointadapter

import arrow.core.Either

interface AccountingPointAdapterService {
    suspend fun getAccountingPoint(accountingPointBusinessId: String): Either<String, String>
}
