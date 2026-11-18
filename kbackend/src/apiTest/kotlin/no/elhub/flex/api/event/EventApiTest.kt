package no.elhub.flex.api.event

import io.kotest.matchers.shouldBe
import io.ktor.http.HttpStatusCode
import no.elhub.flex.ApiSpec
import no.elhub.flex.HIDDEN_BY_RLS
import no.elhub.flex.api.model.dto.generated.models.EventResponse
import no.elhub.flex.testutil.SeedScope
import no.elhub.flex.testutil.SeededActor
import no.elhub.flex.testutil.TestPartyRole
import no.elhub.flex.testutil.osloMidnight
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate
import no.elhub.flex.token

private const val PATH = "/event"

/**
 * Whether the events have one of the type `no.elhub.flex.<resource>.<operation>` that is about the resource. An event is
 * about its subject, or about its source when it has no subject.
 */
private fun List<EventResponse>.has(operation: String, resource: String, id: Long): Boolean =
    any { it.type == "no.elhub.flex.$resource.$operation" && (it.subject ?: it.source) == "/$resource/$id" }

/** The resources that are created in [insertServiceProviderWorld], by the name of their table. */
private val resourcesOfWorld = listOf(
    "controllable_unit",
    "controllable_unit_service_provider",
    "technical_resource",
    "system_operator_product_type",
    "service_provider_product_application",
    "service_provider_product_application_comment",
    "service_provider_product_suspension",
    "service_provider_product_suspension_comment",
    "service_providing_group",
    "service_providing_group_membership",
    "service_providing_group_grid_prequalification",
    "service_providing_group_grid_suspension",
    "service_providing_group_product_application",
)

/** Everything that a service provider and a system operator can have between them. */
@Suppress("LongParameterList")
private class ServiceProviderWorld(
    val controllableUnit: Long,
    val technicalResource: Long,
    val contract: Long,
    val systemOperatorProductType: Long,
    val productApplication: Long,
    val privateProductApplicationComment: Long,
    val publicProductApplicationComment: Long,
    val productSuspension: Long,
    val privateProductSuspensionComment: Long,
    val publicProductSuspensionComment: Long,
    val group: Long,
    val membership: Long,
    val gridPrequalification: Long,
    val gridSuspension: Long,
    val groupProductApplication: Long,
    val lookup: Long,
)

/**
 * Seeds one of each resource of the service provider, which is what the system operator is the owner of the accounting
 * point, the impacted system operator and the procuring system operator of. The triggers record an event for each. The
 * comments are written by [author], one that only the party of the author sees and one that the involved parties see.
 * The unit is looked up too, which is recorded as an event that is not about a resource.
 *
 * The order is that of the dependencies between the resources:
 *
 *     controllable unit, technical resource and contract
 *       -> product type of the system operator -> qualified application of the service provider -> suspension of the service provider
 *       -> group with the unit as member -> grid prequalification -> grid suspension
 *       -> product application of the group
 */
private fun SeedScope.insertServiceProviderWorld(serviceProvider: Long, systemOperator: Long, author: SeededActor): ServiceProviderWorld {
    val meteringGridArea = insertMeteringGridArea()
    insertMeteringGridAreaPriceArea(meteringGridArea, "NO3")
    insertMeteringGridAreaSystemOperator(meteringGridArea, systemOperator)
    val accountingPoint = insertAccountingPoint().also { insertAccountingPointMeteringGridArea(it, meteringGridArea) }
    val endUser = insertParty(TestPartyRole.EU)
    insertAccountingPointEndUser(accountingPoint, endUser)
    val controllableUnit = insertControllableUnit(accountingPoint)
    val technicalResource = insertTechnicalResource(controllableUnit)
    val contract = insertControllableUnitServiceProvider(controllableUnit, serviceProvider, endUser)
    // the lookup of a controllable unit is recorded about its accounting point
    val lookup = insertEvent("no.elhub.flex.controllable_unit.lookup", "accounting_point", accountingPoint, "controllable_unit", controllableUnit)

    val productType = insertProductType()
    val systemOperatorProductType = insertSystemOperatorProductType(systemOperator, productType)
    val productApplication = insertServiceProviderProductApplication(serviceProvider, systemOperator, listOf(productType))
    qualifyServiceProviderProductApplication(productApplication)
    val privateProductApplicationComment = insertServiceProviderProductApplicationComment(productApplication, author, "same_party")
    val publicProductApplicationComment = insertServiceProviderProductApplicationComment(productApplication, author, "any_involved_party")
    val productSuspension = insertServiceProviderProductSuspension(serviceProvider, systemOperator, listOf(productType))
    val privateProductSuspensionComment = insertServiceProviderProductSuspensionComment(productSuspension, author, "same_party")
    val publicProductSuspensionComment = insertServiceProviderProductSuspensionComment(productSuspension, author, "any_involved_party")

    val group = insertServiceProvidingGroup(serviceProvider)
    activateControllableUnit(controllableUnit)
    val membership = insertMembership(controllableUnit, group, osloMidnight("2024-01-01"))
    activateServiceProvidingGroup(group)
    val gridPrequalification = insertApprovedGridPrequalification(group, systemOperator)
    val gridSuspension = insertGridSuspension(group, systemOperator)
    val groupProductApplication = insertServiceProvidingGroupProductApplication(group, systemOperator, listOf(productType))

    return ServiceProviderWorld(
        controllableUnit,
        technicalResource,
        contract,
        systemOperatorProductType,
        productApplication,
        privateProductApplicationComment,
        publicProductApplicationComment,
        productSuspension,
        privateProductSuspensionComment,
        publicProductSuspensionComment,
        group,
        membership,
        gridPrequalification,
        gridSuspension,
        groupProductApplication,
        lookup,
    )
}

class EventApiTest :
    ApiSpec({
        beforeEach {
            truncate(
                "flex.event",
                "flex.accounting_point",
                "flex.metering_grid_area",
                "flex.service_providing_group",
                "flex.product_type",
                "flex.party",
                "flex.entity",
            )
        }

        // RLS: EVENT-EU001
        // RLS: EVENT-EU002
        // RLS: EVENT-EU003
        context("an end user") {
            test("sees the creation of its controllable unit, of the contract and of the technical resource on it, and no other end user does") {
                val endUser = seed { insertActor(TestPartyRole.EU) }
                val otherEndUser = seed { insertActor(TestPartyRole.EU, "Other EU") }
                val serviceProvider = seed { insertParty(TestPartyRole.SP) }
                val (controllableUnit, technicalResource, contract) = seed {
                    val unit = insertControllableUnitAtNewAccountingPoint()
                    insertAccountingPointEndUser(unit.accountingPoint, endUser.partyId!!)
                    Triple(
                        unit.id,
                        insertTechnicalResource(unit.id),
                        insertControllableUnitServiceProvider(unit.id, serviceProvider, endUser.partyId!!),
                    )
                }

                val events = api.get(PATH, endUser.token()).body<List<EventResponse>>()
                events.has("create", "controllable_unit", controllableUnit) shouldBe true
                events.has("create", "controllable_unit_service_provider", contract) shouldBe true
                events.has("create", "technical_resource", technicalResource) shouldBe true

                val otherEvents = api.get(PATH, otherEndUser.token()).body<List<EventResponse>>()
                otherEvents.has("create", "controllable_unit", controllableUnit) shouldBe false
                otherEvents.has("create", "controllable_unit_service_provider", contract) shouldBe false
                otherEvents.has("create", "technical_resource", technicalResource) shouldBe false
            }

            test("sees the lookups of the accounting points of its controllable units, and no other end user does") {
                val endUser = seed { insertActor(TestPartyRole.EU) }
                val otherEndUser = seed { insertActor(TestPartyRole.EU, "Other EU") }
                val accountingPoint = seed {
                    val unit = insertControllableUnitAtNewAccountingPoint()
                    insertAccountingPointEndUser(unit.accountingPoint, endUser.partyId!!)
                    unit.accountingPoint
                }
                // the lookup of a controllable unit is recorded about the accounting point
                seed { insertEvent("no.elhub.flex.controllable_unit.lookup", "accounting_point", accountingPoint) }

                val events = api.get(PATH, endUser.token()).body<List<EventResponse>>()
                events.filter { it.type == "no.elhub.flex.controllable_unit.lookup" }.map { it.source } shouldBe listOf("/accounting_point/$accountingPoint")

                val otherEvents = api.get(PATH, otherEndUser.token()).body<List<EventResponse>>()
                otherEvents.any { it.type == "no.elhub.flex.controllable_unit.lookup" } shouldBe false
            }
        }

        // RLS: EVENT-COM001
        // A party sees the events of the resources that it sees, as they were when the event was recorded.
        context("a service provider") {
            // Timeline:
            //   1. the controllable unit and its technical resource are created
            //   2. the service provider gets a contract on the controllable unit
            test("sees the creation of a controllable unit and of its technical resource once it has a contract on the unit") {
                val serviceProvider = seed { insertActor(TestPartyRole.SP) }
                val endUser = seed { insertParty(TestPartyRole.EU) }
                val (controllableUnit, technicalResource) = seed {
                    val unit = insertControllableUnitAtNewAccountingPoint()
                    insertAccountingPointEndUser(unit.accountingPoint, endUser)
                    unit.id to insertTechnicalResource(unit.id)
                }

                val before = api.get(PATH, serviceProvider.token()).body<List<EventResponse>>()
                before.has("create", "controllable_unit", controllableUnit) shouldBe false
                before.has("create", "technical_resource", technicalResource) shouldBe false

                seed { insertControllableUnitServiceProvider(controllableUnit, serviceProvider.partyId!!, endUser) }

                val after = api.get(PATH, serviceProvider.token()).body<List<EventResponse>>()
                after.has("create", "controllable_unit", controllableUnit) shouldBe true
                after.has("create", "technical_resource", technicalResource) shouldBe true
            }

            test("sees the creation of its resources, but not the comments for the system operator only, nor the lookups") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val serviceProvider = seed { insertActor(TestPartyRole.SP) }
                val otherServiceProvider = seed { insertActor(TestPartyRole.SP, "Other SP") }
                val systemOperator = seed { insertParty(TestPartyRole.SO) }
                val world = seed { insertServiceProviderWorld(serviceProvider.partyId!!, systemOperator, fiso) }

                val events = api.get(PATH, serviceProvider.token()).body<List<EventResponse>>()
                events.has("create", "controllable_unit", world.controllableUnit) shouldBe true
                events.has("create", "technical_resource", world.technicalResource) shouldBe true
                events.has("create", "controllable_unit_service_provider", world.contract) shouldBe true
                events.has("create", "system_operator_product_type", world.systemOperatorProductType) shouldBe true
                events.has("create", "service_provider_product_application", world.productApplication) shouldBe true
                events.has("create", "service_provider_product_application_comment", world.publicProductApplicationComment) shouldBe true
                events.has("create", "service_provider_product_application_comment", world.privateProductApplicationComment) shouldBe false
                events.has("create", "service_provider_product_suspension", world.productSuspension) shouldBe true
                events.has("create", "service_provider_product_suspension_comment", world.publicProductSuspensionComment) shouldBe true
                events.has("create", "service_provider_product_suspension_comment", world.privateProductSuspensionComment) shouldBe false
                events.has("create", "service_providing_group", world.group) shouldBe true
                events.has("create", "service_providing_group_membership", world.membership) shouldBe true
                events.has("create", "service_providing_group_grid_prequalification", world.gridPrequalification) shouldBe true
                events.has("create", "service_providing_group_grid_suspension", world.gridSuspension) shouldBe true
                events.has("create", "service_providing_group_product_application", world.groupProductApplication) shouldBe true
                events.any { it.id == world.lookup } shouldBe false

                // the product types of a system operator are visible to every service provider
                val otherEvents = api.get(PATH, otherServiceProvider.token()).body<List<EventResponse>>()
                (resourcesOfWorld - "system_operator_product_type").filter { resource -> otherEvents.any { it.type == "no.elhub.flex.$resource.create" } } shouldBe emptyList()
            }

            // Timeline:
            //   1. the resources are created
            //   2. the technical resource, the membership and the two suspensions are deleted
            test("still sees the creation of a resource that has been deleted, and sees the deletion") {
                val fiso = seed { insertActor(TestPartyRole.FISO) }
                val serviceProvider = seed { insertActor(TestPartyRole.SP) }
                val systemOperator = seed { insertParty(TestPartyRole.SO) }
                val world = seed { insertServiceProviderWorld(serviceProvider.partyId!!, systemOperator, fiso) }
                seed {
                    deleteTechnicalResource(world.technicalResource)
                    deleteMembership(world.membership)
                    deleteServiceProviderProductSuspension(world.productSuspension)
                    deleteGridSuspension(world.gridSuspension)
                }

                val events = api.get(PATH, serviceProvider.token()).body<List<EventResponse>>()

                events.has("create", "technical_resource", world.technicalResource) shouldBe true
                events.has("delete", "technical_resource", world.technicalResource) shouldBe true
                events.has("create", "service_providing_group_membership", world.membership) shouldBe true
                events.has("delete", "service_providing_group_membership", world.membership) shouldBe true
                events.has("create", "service_provider_product_suspension", world.productSuspension) shouldBe true
                events.has("delete", "service_provider_product_suspension", world.productSuspension) shouldBe true
                events.has("create", "service_providing_group_grid_suspension", world.gridSuspension) shouldBe true
                events.has("delete", "service_providing_group_grid_suspension", world.gridSuspension) shouldBe true
            }

            test("can read an event that it sees, and cannot read one that it does not see") {
                val serviceProvider = seed { insertActor(TestPartyRole.SP) }
                val otherServiceProvider = seed { insertActor(TestPartyRole.SP, "Other SP") }
                val endUser = seed { insertParty(TestPartyRole.EU) }
                seed {
                    val unit = insertControllableUnitAtNewAccountingPoint()
                    insertAccountingPointEndUser(unit.accountingPoint, endUser)
                    insertControllableUnitServiceProvider(unit.id, serviceProvider.partyId!!, endUser)
                }
                val event = api.get(PATH, serviceProvider.token()).body<List<EventResponse>>()
                    .first { it.type == "no.elhub.flex.controllable_unit.create" }.id

                api.get("$PATH/$event", serviceProvider.token()).status shouldBe HttpStatusCode.OK
                api.get("$PATH/$event", otherServiceProvider.token()).status shouldBe HIDDEN_BY_RLS
            }
        }

        // RLS: EVENT-FISO001
        test("a FISO sees the creation of all resources") {
            val fiso = seed { insertActor(TestPartyRole.FISO) }
            val serviceProvider = seed { insertParty(TestPartyRole.SP) }
            val systemOperator = seed { insertParty(TestPartyRole.SO) }
            val world = seed { insertServiceProviderWorld(serviceProvider, systemOperator, fiso) }

            val events = api.get(PATH, fiso.token()).body<List<EventResponse>>()

            resourcesOfWorld.filter { resource -> events.none { it.type == "no.elhub.flex.$resource.create" } } shouldBe emptyList()
            events.any { it.id == world.lookup } shouldBe true
        }

        // RLS: EVENT-COM001
        test("a system operator that is involved sees the creation of the resources it is involved in") {
            val fiso = seed { insertActor(TestPartyRole.FISO) }
            val serviceProvider = seed { insertParty(TestPartyRole.SP) }
            val systemOperator = seed { insertActor(TestPartyRole.SO) }
            val world = seed { insertServiceProviderWorld(serviceProvider, systemOperator.partyId!!, fiso) }

            val events = api.get(PATH, systemOperator.token()).body<List<EventResponse>>()

            resourcesOfWorld.filter { resource -> events.none { it.type == "no.elhub.flex.$resource.create" } } shouldBe emptyList()
            events.any { it.id == world.lookup } shouldBe false
        }

        test("an anonymous caller cannot list the events") {
            api.get(PATH, null).status shouldBe HttpStatusCode.Unauthorized
        }

        test("an entity that has not assumed a party cannot list the events") {
            val entity = seed { insertEntityActor() }

            api.get(PATH, entity.token()).status shouldBe HttpStatusCode.Forbidden
        }
    })
