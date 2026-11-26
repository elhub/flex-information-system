package no.elhub.flex.api.accountingpoint

import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.SeededActor
import no.elhub.flex.testutil.TestPartyRole

/**
 * Seeds an accounting point that the [actor] is related to in every way that its [role] allows: as system operator of
 * its metering grid area, as energy supplier, as balance responsible party, as end user, or as service provider with a
 * contract on a controllable unit there. The other parties of the accounting point are new parties.
 *
 * Use it to show that a role has no access to a view even for an accounting point that it is related to.
 */
fun SeedScope.insertAccountingPointRelatedTo(actor: SeededActor, role: TestPartyRole): Long {
    fun partyOr(actorRole: TestPartyRole): Long = if (role == actorRole) actor.partyId!! else insertParty(actorRole, "Other ${actorRole.abbreviation}")

    val meteringGridArea = insertMeteringGridArea()
    insertMeteringGridAreaPriceArea(meteringGridArea)
    insertMeteringGridAreaSystemOperator(meteringGridArea, partyOr(TestPartyRole.SO))

    val accountingPoint = insertAccountingPoint()
    insertAccountingPointMeteringGridArea(accountingPoint, meteringGridArea)

    val energySupplier = partyOr(TestPartyRole.ES)
    insertAccountingPointEnergySupplier(accountingPoint, energySupplier)
    insertEnergySupplierBalanceResponsibility(meteringGridArea, energySupplier, partyOr(TestPartyRole.BRP))

    val endUser = partyOr(TestPartyRole.EU)
    insertAccountingPointEndUser(accountingPoint, endUser)
    insertControllableUnitServiceProvider(insertControllableUnit(accountingPoint), partyOr(TestPartyRole.SP), endUser)
    return accountingPoint
}
