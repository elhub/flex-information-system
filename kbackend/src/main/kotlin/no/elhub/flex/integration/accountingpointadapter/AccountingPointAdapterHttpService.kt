package no.elhub.flex.integration.accountingpointadapter

import arrow.core.Either
import arrow.core.left

class AccountingPointAdapterHttpService(private val baseUrl: String) : AccountingPointAdapterService {

    override suspend fun getAccountingPoint(accountingPointBusinessId: String): Either<String, String> = "not implemented".left()
}
