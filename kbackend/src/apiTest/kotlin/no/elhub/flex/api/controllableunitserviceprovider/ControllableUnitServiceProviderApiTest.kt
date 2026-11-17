package no.elhub.flex.api.controllableunitserviceprovider

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitServiceProviderCreateRequest
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitServiceProviderHistoryResponse
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitServiceProviderResponse
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitServiceProviderUpdateRequest
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.osloMidnight
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import kotlin.time.toKotlinInstant

private val jan1 = osloMidnight("2024-01-01")
private val jul1 = osloMidnight("2024-07-01")

/** Midnight in Oslo, [days] days from today. */
private fun inDays(days: Long): Instant = osloMidnight(LocalDate.now(ZoneId.of("Europe/Oslo")).plusDays(days).toString())

private fun createRequest(
    controllableUnit: Long,
    serviceProvider: Long,
    endUser: Long,
    validFrom: Instant? = jan1,
    validTo: Instant? = null,
) = ControllableUnitServiceProviderCreateRequest(
    controllableUnitId = controllableUnit,
    serviceProviderId = serviceProvider,
    endUserId = endUser,
    contractReference = "New contract",
    validFrom = validFrom?.toKotlinInstant(),
    validTo = validTo?.toKotlinInstant(),
)

/** A controllable unit whose accounting point is owned by [endUser] from 2024-01-01. */
private fun SeedScope.insertUnitOwnedBy(endUser: Long) = insertControllableUnitAtNewAccountingPoint().also {
    insertAccountingPointEndUser(it.accountingPoint, endUser)
}

class ControllableUnitServiceProviderApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.accounting_point",
                "flex.metering_grid_area",
                "flex.party",
                "flex.entity",
                "flex.controllable_unit_service_provider_history",
            )
        }

        // RLS: CUSP-FISO001
        context("a FISO") {
            test("can list the contracts of all controllable units") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val contracts = seed {
                    List(2) {
                        val endUser = insertParty(TestPartyRole.EU)
                        insertControllableUnitServiceProvider(insertUnitOwnedBy(endUser).id, insertParty(TestPartyRole.SP), endUser)
                    }
                }

                val response = api.get("/controllable_unit_service_provider", fiso.token())

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ControllableUnitServiceProviderResponse>>().map { it.id } shouldContainExactlyInAnyOrder contracts
            }

            test("can create a contract with the end user that owns the accounting point") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val endUser = seed { insertParty(TestPartyRole.EU) }
                val unit = seed { insertUnitOwnedBy(endUser) }

                val response = api.post("/controllable_unit_service_provider", fiso.token(), createRequest(unit.id, sp, endUser))

                response.status shouldBe HttpStatusCode.Created
                response.body<ControllableUnitServiceProviderResponse>().serviceProviderId shouldBe sp
            }

            // CUSP-VAL004
            test("cannot create a contract with an end user that does not own the accounting point") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val owner = seed { insertParty(TestPartyRole.EU, "Owner") }
                val otherEndUser = seed { insertParty(TestPartyRole.EU, "Other EU") }
                val unit = seed { insertUnitOwnedBy(owner) }

                val response = api.post("/controllable_unit_service_provider", fiso.token(), createRequest(unit.id, sp, otherEndUser))

                response.status shouldBe HttpStatusCode.BadRequest
            }

            test("can update and delete a contract") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val endUser = seed { insertParty(TestPartyRole.EU) }
                val contract = seed {
                    insertControllableUnitServiceProvider(insertUnitOwnedBy(endUser).id, insertParty(TestPartyRole.SP), endUser)
                }

                val updated = api.patch(
                    "/controllable_unit_service_provider/$contract",
                    fiso.token(),
                    ControllableUnitServiceProviderUpdateRequest(validTo = jul1.toKotlinInstant()),
                )
                updated.status shouldBe HttpStatusCode.OK
                updated.body<ControllableUnitServiceProviderResponse>().validTo shouldBe jul1.toKotlinInstant()

                api.delete("/controllable_unit_service_provider/$contract", fiso.token()).status shouldBe HttpStatusCode.NoContent
            }

            // RLS: CUSP-FISO002
            test("can read the archived revisions of the contracts") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val endUser = seed { insertParty(TestPartyRole.EU) }
                val contract = seed {
                    insertControllableUnitServiceProvider(insertUnitOwnedBy(endUser).id, insertParty(TestPartyRole.SP), endUser, "Before")
                }
                // the view of the history also lists the current rows, so an archived revision is needed
                seed { renameContract(contract, "After") }

                val response = api.get("/controllable_unit_service_provider_history", fiso.token(), "replaced_at" to "not.is.null")

                response.status shouldBe HttpStatusCode.OK
                response.body<List<ControllableUnitServiceProviderHistoryResponse>>().map { it.contractReference } shouldBe listOf("Before")
            }
        }

        // RLS: CUSP-SO001
        // RLS: CUSP-SO002
        // The system operator sees a contract when it sees the controllable unit, here as the CSO of its accounting point.
        context("a system operator") {
            test("sees the contracts of the controllable units in its area, and no others") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val endUser = seed { insertParty(TestPartyRole.EU) }
                val own = seed {
                    val accountingPoint = insertAccountingPointOwnedBy(so.partyId!!)
                    insertAccountingPointEndUser(accountingPoint, endUser)
                    insertControllableUnitServiceProvider(insertControllableUnit(accountingPoint), insertParty(TestPartyRole.SP), endUser)
                }
                val other = seed {
                    val accountingPoint = insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO, "Other SO"))
                    insertAccountingPointEndUser(accountingPoint, endUser)
                    insertControllableUnitServiceProvider(insertControllableUnit(accountingPoint), insertParty(TestPartyRole.SP), endUser)
                }

                val list = api.get("/controllable_unit_service_provider", so.token())
                list.status shouldBe HttpStatusCode.OK
                list.body<List<ControllableUnitServiceProviderResponse>>().map { it.id } shouldBe listOf(own)
                api.get("/controllable_unit_service_provider/$own", so.token()).status shouldBe HttpStatusCode.OK
                api.get("/controllable_unit_service_provider/$other", so.token()).status shouldBe HIDDEN_BY_RLS
            }

            test("cannot create, update or delete a contract") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val endUser = seed { insertParty(TestPartyRole.EU) }
                val unit = seed {
                    val accountingPoint = insertAccountingPointOwnedBy(so.partyId!!)
                    insertAccountingPointEndUser(accountingPoint, endUser)
                    insertControllableUnit(accountingPoint)
                }
                val contract = seed { insertControllableUnitServiceProvider(unit, sp, endUser) }

                api.post("/controllable_unit_service_provider", so.token(), createRequest(unit, sp, endUser)).status shouldBe HttpStatusCode.Forbidden
                api.patch(
                    "/controllable_unit_service_provider/$contract",
                    so.token(),
                    ControllableUnitServiceProviderUpdateRequest(contractReference = "Updated by SO"),
                ).status shouldBe HttpStatusCode.Forbidden
                api.delete("/controllable_unit_service_provider/$contract", so.token()).status shouldBe HttpStatusCode.Forbidden
            }

            // RLS: CUSP-SO002
            test("can read the archived revisions of the contracts in its area") {
                val so = seed { insertActor(TestPartyRole.SO) }
                val endUser = seed { insertParty(TestPartyRole.EU) }
                val own = seed {
                    val accountingPoint = insertAccountingPointOwnedBy(so.partyId!!)
                    insertAccountingPointEndUser(accountingPoint, endUser)
                    insertControllableUnitServiceProvider(insertControllableUnit(accountingPoint), insertParty(TestPartyRole.SP), endUser, "Own before")
                }
                val other = seed {
                    val accountingPoint = insertAccountingPointOwnedBy(insertParty(TestPartyRole.SO, "Other SO"))
                    insertAccountingPointEndUser(accountingPoint, endUser)
                    insertControllableUnitServiceProvider(insertControllableUnit(accountingPoint), insertParty(TestPartyRole.SP), endUser, "Other before")
                }
                seed {
                    renameContract(own, "Own after")
                    renameContract(other, "Other after")
                }

                val list = api.get("/controllable_unit_service_provider_history", so.token(), "replaced_at" to "not.is.null")

                list.status shouldBe HttpStatusCode.OK
                list.body<List<ControllableUnitServiceProviderHistoryResponse>>().map { it.contractReference } shouldBe listOf("Own before")
            }
        }

        // RLS: CUSP-SP001
        // RLS: CUSP-SP002
        context("a service provider") {
            test("sees its own contracts and their archived revisions, and no others") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val endUser = seed { insertParty(TestPartyRole.EU) }
                val own = seed { insertControllableUnitServiceProvider(insertUnitOwnedBy(endUser).id, sp.partyId!!, endUser, "Own before") }
                val other = seed {
                    insertControllableUnitServiceProvider(insertUnitOwnedBy(endUser).id, insertParty(TestPartyRole.SP, "Other SP"), endUser, "Other before")
                }
                seed {
                    renameContract(own, "Own after")
                    renameContract(other, "Other after")
                }

                val list = api.get("/controllable_unit_service_provider", sp.token())
                list.body<List<ControllableUnitServiceProviderResponse>>().map { it.id } shouldBe listOf(own)
                api.get("/controllable_unit_service_provider/$other", sp.token()).status shouldBe HIDDEN_BY_RLS

                val history = api.get("/controllable_unit_service_provider_history", sp.token(), "replaced_at" to "not.is.null")
                history.body<List<ControllableUnitServiceProviderHistoryResponse>>().map { it.contractReference } shouldBe listOf("Own before")
            }

            test("can create a contract for itself on a unit without contracts, without seeing the unit") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val endUser = seed { insertParty(TestPartyRole.EU) }
                val unit = seed { insertUnitOwnedBy(endUser) }

                val response = api.post(
                    "/controllable_unit_service_provider",
                    sp.token(),
                    createRequest(unit.id, sp.partyId!!, endUser, validFrom = inDays(-5)),
                )

                response.status shouldBe HttpStatusCode.Created
            }

            test("cannot create a contract for another service provider") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val otherSp = seed { insertParty(TestPartyRole.SP, "Other SP") }
                val endUser = seed { insertParty(TestPartyRole.EU) }
                val unit = seed { insertUnitOwnedBy(endUser) }

                val response = api.post("/controllable_unit_service_provider", sp.token(), createRequest(unit.id, otherSp, endUser, inDays(-5)))

                response.status shouldBe HttpStatusCode.Forbidden
            }

            // CUSP-VAL002
            // When the unit has contracts, a new one must start between 2 and 4 weeks ahead.
            test("can create a contract that starts in the window of 2 to 4 weeks ahead, and not before or after it") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val endUser = seed { insertParty(TestPartyRole.EU) }
                val unit = seed {
                    insertUnitOwnedBy(endUser).also {
                        insertControllableUnitServiceProvider(it.id, sp.partyId!!, endUser, validFrom = jan1, validTo = inDays(1))
                    }
                }

                api.post("/controllable_unit_service_provider", sp.token(), createRequest(unit.id, sp.partyId!!, endUser, inDays(10)))
                    .status shouldBe HttpStatusCode.BadRequest
                api.post("/controllable_unit_service_provider", sp.token(), createRequest(unit.id, sp.partyId!!, endUser, inDays(30)))
                    .status shouldBe HttpStatusCode.BadRequest
                api.post("/controllable_unit_service_provider", sp.token(), createRequest(unit.id, sp.partyId!!, endUser, inDays(16)))
                    .status shouldBe HttpStatusCode.Created
            }

            // CUSP-VAL003
            test("cannot create a contract that duplicates its existing contract with the same end user") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val endUser = seed { insertParty(TestPartyRole.EU) }
                val unit = seed {
                    insertUnitOwnedBy(endUser).also { insertControllableUnitServiceProvider(it.id, sp.partyId!!, endUser, validFrom = jan1) }
                }

                val response = api.post("/controllable_unit_service_provider", sp.token(), createRequest(unit.id, sp.partyId!!, endUser, inDays(1)))

                response.status shouldBe HttpStatusCode.BadRequest
            }

            test("can update its contract, also one that started long ago") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val endUser = seed { insertParty(TestPartyRole.EU) }
                val contract = seed { insertControllableUnitServiceProvider(insertUnitOwnedBy(endUser).id, sp.partyId!!, endUser, validFrom = jan1) }

                val response = api.patch(
                    "/controllable_unit_service_provider/$contract",
                    sp.token(),
                    ControllableUnitServiceProviderUpdateRequest(validTo = inDays(0).toKotlinInstant()),
                )

                response.status shouldBe HttpStatusCode.OK
                response.body<ControllableUnitServiceProviderResponse>().validTo shouldBe inDays(0).toKotlinInstant()
            }

            test("cannot update the contract of another service provider") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val endUser = seed { insertParty(TestPartyRole.EU) }
                val other = seed {
                    insertControllableUnitServiceProvider(insertUnitOwnedBy(endUser).id, insertParty(TestPartyRole.SP, "Other SP"), endUser)
                }

                api.patch(
                    "/controllable_unit_service_provider/$other",
                    sp.token(),
                    ControllableUnitServiceProviderUpdateRequest(contractReference = "Updated by SP"),
                ).status shouldBe HIDDEN_BY_RLS
            }

            test("cannot delete its contract") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val endUser = seed { insertParty(TestPartyRole.EU) }
                val contract = seed { insertControllableUnitServiceProvider(insertUnitOwnedBy(endUser).id, sp.partyId!!, endUser) }

                api.delete("/controllable_unit_service_provider/$contract", sp.token()).status shouldBe HttpStatusCode.Forbidden
            }

            // Removing the end date makes the contract run on, which soft-deletes the future contracts it now overlaps.
            test("removes a future contract when it removes the end date of its contract") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val endUser = seed { insertParty(TestPartyRole.EU) }
                val unit = seed { insertUnitOwnedBy(endUser) }
                val contract = seed { insertControllableUnitServiceProvider(unit.id, sp.partyId!!, endUser, validFrom = inDays(-5), validTo = inDays(2)) }
                val future = seed {
                    insertControllableUnitServiceProvider(unit.id, insertParty(TestPartyRole.SP, "Future SP"), endUser, validFrom = inDays(16))
                }

                val updated = api.patch(
                    "/controllable_unit_service_provider/$contract",
                    sp.token(),
                    JsonObject(mapOf("valid_to" to JsonNull)),
                )

                updated.status shouldBe HttpStatusCode.OK
                updated.body<ControllableUnitServiceProviderResponse>().validTo shouldBe null
                val removed = api.get("/controllable_unit_service_provider/$future", fiso.token()).body<ControllableUnitServiceProviderResponse>()
                removed.validFrom shouldBe null
                removed.validTo shouldBe null
            }
        }

        // RLS: CUSP-EU001
        // RLS: CUSP-EU002
        // The end user sees the contracts that overlap its period as end user of the accounting point.
        context("an end user") {
            test("sees the contracts in its period, and their revisions, and not those that follow it") {
                val endUser = seed { insertActor(TestPartyRole.EU) }
                val newEndUser = seed { insertParty(TestPartyRole.EU, "New EU") }
                val sp = seed { insertParty(TestPartyRole.SP) }
                // the actor owns the accounting point until 2024-07-01, and the new end user from then on
                val unit = seed {
                    insertControllableUnitAtNewAccountingPoint().also {
                        insertAccountingPointEndUser(it.accountingPoint, endUser.partyId!!, validTo = jul1)
                        insertAccountingPointEndUser(it.accountingPoint, newEndUser, validFrom = jul1)
                    }
                }
                val inPeriod = seed { insertControllableUnitServiceProvider(unit.id, sp, endUser.partyId!!, "In period before", validFrom = jan1, validTo = jul1) }
                val after = seed { insertControllableUnitServiceProvider(unit.id, sp, newEndUser, "After before", validFrom = jul1) }
                seed {
                    renameContract(inPeriod, "In period after")
                    renameContract(after, "After after")
                }

                val current = api.get("/controllable_unit_service_provider", endUser.token())
                current.body<List<ControllableUnitServiceProviderResponse>>().map { it.id } shouldBe listOf(inPeriod)
                api.get("/controllable_unit_service_provider/$after", endUser.token()).status shouldBe HIDDEN_BY_RLS

                val history = api.get("/controllable_unit_service_provider_history", endUser.token(), "replaced_at" to "not.is.null")
                history.body<List<ControllableUnitServiceProviderHistoryResponse>>().map { it.contractReference } shouldBe listOf("In period before")
            }

            test("cannot create, update or delete a contract") {
                val endUser = seed { insertActor(TestPartyRole.EU) }
                val sp = seed { insertParty(TestPartyRole.SP) }
                val unit = seed { insertUnitOwnedBy(endUser.partyId!!) }
                val contract = seed { insertControllableUnitServiceProvider(unit.id, sp, endUser.partyId!!) }

                api.post("/controllable_unit_service_provider", endUser.token(), createRequest(unit.id, sp, endUser.partyId!!)).status shouldBe
                    HttpStatusCode.Forbidden
                api.patch(
                    "/controllable_unit_service_provider/$contract",
                    endUser.token(),
                    ControllableUnitServiceProviderUpdateRequest(contractReference = "Updated by EU"),
                ).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // RLS: CUSP-BRP001
        // RLS: CUSP-BRP002
        // The balance responsible party sees the current contracts of the unit while it is the balance responsible party of
        // the accounting point, and the revisions that overlap its period.
        context("a balance responsible party") {
            test("sees the current contracts of a unit while it is related to it, and no others") {
                val brp = seed { insertActor(TestPartyRole.BRP) }
                val endUser = seed { insertParty(TestPartyRole.EU) }
                val related = seed { insertUnitOwnedBy(endUser) }
                val unrelated = seed { insertUnitOwnedBy(endUser) }
                seed { insertPartyRelatedToControllableUnit(TestPartyRole.BRP, brp.partyId!!, related) }
                val own = seed { insertControllableUnitServiceProvider(related.id, insertParty(TestPartyRole.SP), endUser) }
                val other = seed { insertControllableUnitServiceProvider(unrelated.id, insertParty(TestPartyRole.SP, "Other SP"), endUser) }

                val list = api.get("/controllable_unit_service_provider", brp.token())
                list.body<List<ControllableUnitServiceProviderResponse>>().map { it.id } shouldBe listOf(own)
                api.get("/controllable_unit_service_provider/$other", brp.token()).status shouldBe HIDDEN_BY_RLS
            }

            test("does not see the current contracts of a unit after its period has ended, but sees the revisions of the period") {
                val brp = seed { insertActor(TestPartyRole.BRP) }
                val endUser = seed { insertParty(TestPartyRole.EU) }
                val unit = seed { insertUnitOwnedBy(endUser) }
                seed { insertPartyRelatedToControllableUnit(TestPartyRole.BRP, brp.partyId!!, unit, validTo = jul1) }
                // the contract ends when the period of the party does, so that the revision overlaps the period
                val contract = seed {
                    insertControllableUnitServiceProvider(unit.id, insertParty(TestPartyRole.SP), endUser, "Before", validFrom = jan1, validTo = jul1)
                }
                val later = seed {
                    insertControllableUnitServiceProvider(unit.id, insertParty(TestPartyRole.SP, "Later SP"), endUser, "Later before", validFrom = jul1)
                }
                seed {
                    renameContract(contract, "After")
                    renameContract(later, "Later after")
                }

                api.get("/controllable_unit_service_provider", brp.token()).body<List<ControllableUnitServiceProviderResponse>>() shouldBe emptyList()
                val history = api.get("/controllable_unit_service_provider_history", brp.token(), "replaced_at" to "not.is.null")
                history.body<List<ControllableUnitServiceProviderHistoryResponse>>().map { it.contractReference } shouldBe listOf("Before")
            }
        }

        // The energy supplier has no grant on the view, and the other roles have no policy of their own.
        for (role in listOf(TestPartyRole.ES, TestPartyRole.MO, TestPartyRole.TP)) {
            test("${role.type} cannot list the contracts") {
                val actor = seed { insertActor(role) }

                api.get("/controllable_unit_service_provider", actor.token()).status shouldBe HttpStatusCode.Forbidden
            }
        }

        // The organisation inherits flex_common, but the view has no grant for its role.
        test("an organisation cannot list the contracts") {
            val org = seed { insertActor(TestPartyRole.ORG) }

            api.get("/controllable_unit_service_provider", org.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
