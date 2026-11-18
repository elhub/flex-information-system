package no.elhub.flex.api.controllableunitlookup

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitLookupRequest
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitLookupResponse
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitServiceProviderCreateRequest
import no.elhub.flex.api.model.dto.generated.models.ErrorMessage
import no.elhub.flex.api.model.dto.generated.models.EventResponse
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.Triggers
import no.elhub.flex.testutil.osloMidnight
import no.elhub.flex.testutil.randomOrg
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.testutil.uniqueGsrn
import no.elhub.flex.testutil.uniquePid
import no.elhub.flex.token
import java.time.LocalDate
import java.time.ZoneId
import java.util.UUID
import kotlin.time.toKotlinInstant

private const val PATH = "/controllable_unit/lookup"

private const val BIRTH_DATE = "010190"

private const val OTHER_BIRTH_DATE = "020290"

private const val UNKNOWN_CONTROLLABLE_UNIT = "00000000-0000-4000-8000-000000000000"

/** The party of a person whose PID starts with the [birthDate], which is how the end user is found by a lookup. */
private fun SeedScope.insertPersonEndUser(birthDate: String): Long {
    val person = insertEntity("Person born $birthDate", "person", birthDate + uniquePid().takeLast(5), "pid")
    return insertParty(person, "End user born $birthDate", "end_user", "flex_end_user")
}

/** An accounting point of the end user born on [BIRTH_DATE], which makes a lookup of it valid. Returns its business id. */
private fun SeedScope.insertAccountingPointOfPersonEndUser(): String {
    val endUser = insertPersonEndUser(BIRTH_DATE)
    val businessId = uniqueGsrn()
    insertAccountingPoint(businessId).also { insertAccountingPointEndUser(it, endUser) }
    return businessId
}

class ControllableUnitLookupApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.accounting_point",
                "flex.metering_grid_area",
                "flex.party",
                "flex.entity",
                "flex.event",
            )
        }

        context("a FISO") {
            context("cannot look up an ill formed request") {
                val accountingPoint = uniqueGsrn()
                val illFormed = mapOf(
                    "without an accounting point or a controllable unit" to
                        (
                            ControllableUnitLookupRequest(endUser = BIRTH_DATE) to
                                "missing business ID for accounting point or controllable unit"
                            ),
                    "with an end user that is not a birth date or an organisation number" to
                        (
                            ControllableUnitLookupRequest(endUser = "badformat", accountingPoint = accountingPoint) to
                                "ill formed end user business ID"
                            ),
                    "with a PID instead of a birth date" to
                        (
                            ControllableUnitLookupRequest(endUser = "01019012345", accountingPoint = accountingPoint) to
                                "ill formed end user business ID"
                            ),
                    "with an accounting point that is not a GSRN" to
                        (
                            ControllableUnitLookupRequest(endUser = BIRTH_DATE, accountingPoint = "badformat") to
                                "ill formed accounting point business ID"
                            ),
                    "with a controllable unit that is not a UUID" to
                        (
                            ControllableUnitLookupRequest(endUser = BIRTH_DATE, controllableUnit = "badformat") to
                                "ill formed controllable unit business ID"
                            ),
                    "with both an accounting point and a controllable unit" to
                        (
                            ControllableUnitLookupRequest(
                                endUser = BIRTH_DATE,
                                accountingPoint = accountingPoint,
                                controllableUnit = UNKNOWN_CONTROLLABLE_UNIT,
                            ) to "request contains business IDs for both accounting point and controllable unit"
                            ),
                )
                for ((description, case) in illFormed) {
                    val (request, message) = case
                    test(description) {
                        val fiso = seed { insertActor(TestPartyRole.FISO) }

                        val response = api.post(PATH, fiso.token(), request)

                        response.status shouldBe HttpStatusCode.BadRequest
                        response.body<ErrorMessage>().code shouldBe "HTTP400"
                        response.body<ErrorMessage>().message shouldBe "Bad input for '$message'"
                    }
                }
            }

            context("looking up a controllable unit") {
                test("finds it when the end user is the end user of its accounting point") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }
                    val endUser = seed { insertPersonEndUser(BIRTH_DATE) }
                    val accountingPointBusinessId = uniqueGsrn()
                    val accountingPoint = seed {
                        insertAccountingPoint(accountingPointBusinessId).also { insertAccountingPointEndUser(it, endUser) }
                    }
                    val controllableUnitBusinessId = UUID.randomUUID().toString()
                    val controllableUnit = seed { insertControllableUnit(accountingPoint, businessId = controllableUnitBusinessId) }

                    val response = api.post(
                        PATH,
                        fiso.token(),
                        ControllableUnitLookupRequest(BIRTH_DATE, controllableUnit = controllableUnitBusinessId),
                    )

                    response.status shouldBe HttpStatusCode.OK
                    val lookup = response.body<ControllableUnitLookupResponse>()
                    lookup.accountingPoint.id shouldBe accountingPoint
                    lookup.accountingPoint.businessId shouldBe accountingPointBusinessId
                    lookup.endUser.id shouldBe endUser
                    lookup.controllableUnits.map { it.id } shouldBe listOf(controllableUnit)
                }

                test("does not find one that does not exist") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }

                    val response = api.post(
                        PATH,
                        fiso.token(),
                        ControllableUnitLookupRequest(BIRTH_DATE, controllableUnit = UNKNOWN_CONTROLLABLE_UNIT),
                    )

                    response.status shouldBe HttpStatusCode.NotFound
                    response.body<ErrorMessage>().code shouldBe "HTTP404"
                }

                test("is refused when the end user is not the end user of its accounting point") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }
                    val endUser = seed { insertPersonEndUser(BIRTH_DATE) }
                    val controllableUnitBusinessId = UUID.randomUUID().toString()
                    seed {
                        val accountingPoint = insertAccountingPoint().also { insertAccountingPointEndUser(it, endUser) }
                        insertControllableUnit(accountingPoint, businessId = controllableUnitBusinessId)
                    }

                    val response = api.post(
                        PATH,
                        fiso.token(),
                        ControllableUnitLookupRequest(OTHER_BIRTH_DATE, controllableUnit = controllableUnitBusinessId),
                    )

                    response.status shouldBe HttpStatusCode.Forbidden
                    response.body<ErrorMessage>().code shouldBe "HTTP403"
                }

                test("does not find a controllable unit that is terminated") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }
                    val endUser = seed { insertPersonEndUser(BIRTH_DATE) }
                    val controllableUnitBusinessId = UUID.randomUUID().toString()
                    // the status of a new controllable unit must be new, which Triggers.OFF skips the check of
                    seed(Triggers.OFF) {
                        val accountingPoint = insertAccountingPoint().also { insertAccountingPointEndUser(it, endUser) }
                        insertControllableUnit(accountingPoint, status = "terminated", businessId = controllableUnitBusinessId)
                    }

                    val response = api.post(
                        PATH,
                        fiso.token(),
                        ControllableUnitLookupRequest(BIRTH_DATE, controllableUnit = controllableUnitBusinessId),
                    )

                    response.status shouldBe HttpStatusCode.NotFound
                    response.body<ErrorMessage>().code shouldBe "HTTP404"
                }
            }

            context("looking up an accounting point") {
                test("finds all its controllable units that are not terminated") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }
                    val endUser = seed { insertPersonEndUser(BIRTH_DATE) }
                    val accountingPointBusinessId = uniqueGsrn()
                    val accountingPoint = seed {
                        insertAccountingPoint(accountingPointBusinessId).also { insertAccountingPointEndUser(it, endUser) }
                    }
                    val controllableUnits = seed { List(2) { insertControllableUnit(accountingPoint, "CU $it") } }
                    // the status of a new controllable unit must be new, which Triggers.OFF skips the check of
                    seed(Triggers.OFF) { insertControllableUnit(accountingPoint, "Terminated CU", status = "terminated") }

                    val response = api.post(
                        PATH,
                        fiso.token(),
                        ControllableUnitLookupRequest(BIRTH_DATE, accountingPoint = accountingPointBusinessId),
                    )

                    response.status shouldBe HttpStatusCode.OK
                    response.body<ControllableUnitLookupResponse>().controllableUnits.map { it.id } shouldContainExactlyInAnyOrder
                        controllableUnits
                }

                test("finds an accounting point that has no controllable units") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }
                    val endUser = seed { insertPersonEndUser(BIRTH_DATE) }
                    val accountingPointBusinessId = uniqueGsrn()
                    seed { insertAccountingPoint(accountingPointBusinessId).also { insertAccountingPointEndUser(it, endUser) } }

                    val response = api.post(
                        PATH,
                        fiso.token(),
                        ControllableUnitLookupRequest(BIRTH_DATE, accountingPoint = accountingPointBusinessId),
                    )

                    response.status shouldBe HttpStatusCode.OK
                    response.body<ControllableUnitLookupResponse>().controllableUnits shouldBe emptyList()
                }

                test("is refused when the end user is not the end user of the accounting point") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }
                    val endUser = seed { insertPersonEndUser(BIRTH_DATE) }
                    val accountingPointBusinessId = uniqueGsrn()
                    seed { insertAccountingPoint(accountingPointBusinessId).also { insertAccountingPointEndUser(it, endUser) } }

                    val response = api.post(
                        PATH,
                        fiso.token(),
                        ControllableUnitLookupRequest(OTHER_BIRTH_DATE, accountingPoint = accountingPointBusinessId),
                    )

                    response.status shouldBe HttpStatusCode.Forbidden
                    response.body<ErrorMessage>().code shouldBe "HTTP403"
                }

                test("finds an end user that is an organisation by its organisation number") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }
                    val organisationNumber = randomOrg()
                    val endUser = seed {
                        insertParty(insertEntity("Organisation", "organisation", organisationNumber, "org"), "End user organisation", "end_user", "flex_end_user")
                    }
                    val accountingPointBusinessId = uniqueGsrn()
                    seed { insertAccountingPoint(accountingPointBusinessId).also { insertAccountingPointEndUser(it, endUser) } }

                    val response = api.post(
                        PATH,
                        fiso.token(),
                        ControllableUnitLookupRequest(organisationNumber, accountingPoint = accountingPointBusinessId),
                    )

                    response.status shouldBe HttpStatusCode.OK
                    response.body<ControllableUnitLookupResponse>().endUser.id shouldBe endUser
                }
            }
        }

        context("a lookup") {
            test("of a controllable unit is recorded as an event about its accounting point and the unit") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val endUser = seed { insertPersonEndUser(BIRTH_DATE) }
                val controllableUnitBusinessId = UUID.randomUUID().toString()
                val (accountingPoint, controllableUnit) = seed {
                    val accountingPoint = insertAccountingPoint().also { insertAccountingPointEndUser(it, endUser) }
                    accountingPoint to insertControllableUnit(accountingPoint, businessId = controllableUnitBusinessId)
                }

                api.post(PATH, fiso.token(), ControllableUnitLookupRequest(BIRTH_DATE, controllableUnit = controllableUnitBusinessId))

                val lookups = api.get("/event", fiso.token(), "type" to "eq.no.elhub.flex.controllable_unit.lookup").body<List<EventResponse>>()
                lookups.map { it.source to it.subject } shouldBe listOf("/accounting_point/$accountingPoint" to "/controllable_unit/$controllableUnit")
            }

            test("of an accounting point is recorded as an event about the accounting point") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val endUser = seed { insertPersonEndUser(BIRTH_DATE) }
                val accountingPointBusinessId = uniqueGsrn()
                val accountingPoint = seed {
                    insertAccountingPoint(accountingPointBusinessId).also { insertAccountingPointEndUser(it, endUser) }
                }

                api.post(PATH, fiso.token(), ControllableUnitLookupRequest(BIRTH_DATE, accountingPoint = accountingPointBusinessId))

                val lookups = api.get("/event", fiso.token(), "type" to "eq.no.elhub.flex.controllable_unit.lookup").body<List<EventResponse>>()
                lookups.map { it.source to it.subject } shouldBe listOf("/accounting_point/$accountingPoint" to null)
            }
        }

        // The service provider can look up the controllable units that it does not see yet, to be able to start a contract.
        context("a service provider") {
            test("finds a controllable unit that it cannot read, and can then create a contract on it") {
                val sp = seed { insertActor(TestPartyRole.SP) }
                val endUser = seed { insertPersonEndUser(BIRTH_DATE) }
                val controllableUnitBusinessId = UUID.randomUUID().toString()
                val controllableUnit = seed {
                    val accountingPoint = insertAccountingPoint().also { insertAccountingPointEndUser(it, endUser) }
                    insertControllableUnit(accountingPoint, businessId = controllableUnitBusinessId)
                }

                api.get("/controllable_unit/$controllableUnit", sp.token()).status shouldBe HIDDEN_BY_RLS

                val lookup = api.post(
                    PATH,
                    sp.token(),
                    ControllableUnitLookupRequest(BIRTH_DATE, controllableUnit = controllableUnitBusinessId),
                )
                lookup.status shouldBe HttpStatusCode.OK
                val found = lookup.body<ControllableUnitLookupResponse>().controllableUnits.single().id
                found shouldBe controllableUnit

                val contract = api.post(
                    "/controllable_unit_service_provider",
                    sp.token(),
                    ControllableUnitServiceProviderCreateRequest(
                        controllableUnitId = found,
                        serviceProviderId = sp.partyId!!,
                        endUserId = endUser,
                        contractReference = "TEST-CONTRACT",
                        validFrom = osloMidnight(LocalDate.now(ZoneId.of("Europe/Oslo")).minusDays(5).toString()).toKotlinInstant(),
                    ),
                )
                contract.status shouldBe HttpStatusCode.Created
            }
        }

        // Only the FISO and the service provider can look up controllable units. The accounting point is the end user's, so that
        // only the role can make the lookup fail.
        for (role in TestPartyRole.rolesWithDataGrants - setOf(TestPartyRole.FISO, TestPartyRole.SP)) {
            test("${role.type} cannot look up a controllable unit") {
                val actor = seed { insertActor(role) }
                val accountingPointBusinessId = seed { insertAccountingPointOfPersonEndUser() }

                val response = api.post(PATH, actor.token(), ControllableUnitLookupRequest(BIRTH_DATE, accountingPoint = accountingPointBusinessId))

                response.status shouldBe HttpStatusCode.Forbidden
                response.body<ErrorMessage>().message shouldBe "Role '${role.role}' is not authorized to perform this operation"
            }
        }

        context("a token") {
            test("with the scope to use the lookup can look up a controllable unit") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val accountingPointBusinessId = seed { insertAccountingPointOfPersonEndUser() }

                val response = api.post(
                    PATH,
                    fiso.token(scope = "use:data:controllable_unit:lookup"),
                    ControllableUnitLookupRequest(BIRTH_DATE, accountingPoint = accountingPointBusinessId),
                )

                response.status shouldBe HttpStatusCode.OK
            }

            for (scope in listOf("read:data", "use:data:entity:lookup")) {
                test("with the scope $scope cannot look up a controllable unit") {
                    val fiso = seed { insertActor(TestPartyRole.FISO) }
                    val accountingPointBusinessId = seed { insertAccountingPointOfPersonEndUser() }

                    val response = api.post(
                        PATH,
                        fiso.token(scope = scope),
                        ControllableUnitLookupRequest(BIRTH_DATE, accountingPoint = accountingPointBusinessId),
                    )

                    response.status shouldBe HttpStatusCode.Forbidden
                }
            }
        }
    })
