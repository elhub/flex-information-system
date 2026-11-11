package no.elhub.flex.testutil

import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.api.model.dto.generated.models.ControllableUnitRegulationDirection
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupBiddingZone
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupGridPrequalificationStatus
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupProductApplicationStatus
import no.elhub.flex.api.model.dto.generated.models.ServiceProvidingGroupStatus
import no.elhub.flex.shared.accountingpoint.model.AccountingPointGridLocationQuality
import no.elhub.flex.shared.accountingpoint.model.AccountingPointGridLocationSource
import no.elhub.flex.shared.auth.FlexPrincipal
import java.sql.Connection
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset
import java.util.UUID
import java.util.concurrent.atomic.AtomicLong

/** Whether database triggers are active while seeding. */
enum class Triggers { ON, OFF }

/** A seeded system operator party, and a principal that acts as it (resolved through its identity). */
data class SeededSystemOperator(val partyId: Long, val principal: FlexPrincipal)

/** A seeded party with an identity, and a principal that acts as it. */
data class SeededParty(val entityId: Long, val partyId: Long, val principal: FlexPrincipal)

/**
 * Someone who calls the API: an identity of [entityId] that has assumed [partyId], or none for a bare entity.
 * [ownerEntityId] is the entity that owns the party. [eid] is what a token refers to.
 */
data class SeededActor(
    val entityId: Long,
    val partyId: Long?,
    val role: String,
    val eid: String,
    val ownerEntityId: Long? = null,
)

/** A seeded entity client, with the UUID that it is known by outside the database. */
data class SeededEntityClient(val id: Long, val clientId: String)

/** A seeded entity with an identity but no assumed party, and a principal that acts as it. */
data class SeededEntity(val entityId: Long, val principal: FlexPrincipal)

private val orgCounter = AtomicLong(200_000_000L)
private val glnCounter = AtomicLong(20_000_000L)

private fun uniqueOrgNumber(): String = orgCounter.getAndIncrement().toString()

@Suppress("MagicNumber")
fun uniqueGln(): String {
    val prefix = "7081" + glnCounter.getAndIncrement().toString().padStart(8, '0')
    return prefix + gs1CheckDigit(prefix)
}

/**
 * Runs [block] as one transaction with a system identity set, so that seeded rows get a valid `recorded_by`.
 *
 * With [Triggers.OFF] all triggers (including foreign key checks) are disabled for the transaction through
 * `public.disable_triggers()`. Use it when the test only needs rows to exist and not the validation
 * and side effects of the triggers. Unique and check constraints are still enforced.
 *
 * Everything inside one block is committed together, or not at all if the block throws.
 */
fun <T> seed(triggers: Triggers = Triggers.ON, block: SeedScope.() -> T): T =
    PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
        if (triggers == Triggers.OFF) {
            conn.createStatement().use { it.execute("SELECT public.disable_triggers()") }
        }
        val result = SeedScope(conn).block()
        conn.commit()
        result
    }

/**
 * Empties [tables] and, through CASCADE, every table that references them. Call it from a `beforeEach`
 * with the tables the test class seeds, so that data does not leak from one test into the next.
 */
fun truncate(vararg tables: String) {
    PostgresTestContainer.withConnection { conn ->
        conn.createStatement().use { it.execute("TRUNCATE ${tables.joinToString()} CASCADE") }
    }
}

/**
 * Insert helpers for test data. Every helper inserts one row and returns its id.
 * Values that do not matter to most tests have defaults; pass them when the test depends on them.
 */
@Suppress("TooManyFunctions")
class SeedScope(private val conn: Connection) {

    fun insertAccountingPoint(businessId: String = uniqueGsrn()): Long =
        queryLong("INSERT INTO flex.accounting_point (business_id) VALUES (?) RETURNING id", businessId)

    @Suppress("LongParameterList")
    fun insertGridLocation(
        accountingPointId: Long,
        name: String = "Test Substation",
        businessId: UUID = UUID.randomUUID(),
        nominalVoltage: Double = 22.0,
        source: AccountingPointGridLocationSource = AccountingPointGridLocationSource.CSO,
        quality: AccountingPointGridLocationQuality = AccountingPointGridLocationQuality.CONFIRMED,
    ): Long =
        queryLong(
            """
            INSERT INTO flex.accounting_point_grid_location (
                accounting_point_id, object_type, business_id, name, nominal_voltage, source, quality
            )
            VALUES (?, 'substation', ?, ?, ?, ?, ?)
            RETURNING id
            """.trimIndent(),
            accountingPointId,
            businessId.toString(),
            name,
            nominalVoltage,
            source.name.lowercase(),
            quality.name.lowercase(),
        )

    fun insertControllableUnit(
        accountingPointId: Long,
        name: String = "Test CU",
        startDate: LocalDate = LocalDate.of(2024, 1, 1),
        regulationDirection: ControllableUnitRegulationDirection = ControllableUnitRegulationDirection.BOTH,
        status: String = "new",
    ): Long =
        queryLong(
            """
            INSERT INTO flex.controllable_unit (
                business_id, name, start_date, regulation_direction, maximum_active_power, accounting_point_id, status
            )
            VALUES (?::uuid, ?, ?::date, ?, 1.0, ?, ?)
            RETURNING id
            """.trimIndent(),
            UUID.randomUUID().toString(),
            name,
            startDate.toString(),
            regulationDirection.value,
            accountingPointId,
            status,
        )

    /** Inserts an organisation entity and a party of the given type, returning the entity id and party id. */
    private fun insertEntityAndParty(name: String, type: String, role: String): Pair<Long, Long> {
        val entityId = queryLong(
            "INSERT INTO flex.entity (name, type, business_id, business_id_type) " +
                "VALUES (?, 'organisation', ?, 'org') RETURNING id",
            "$name - ENT",
            uniqueOrgNumber(),
        )
        return entityId to insertParty(entityId, name, type, role)
    }

    /** Inserts a party owned by [ownerEntityId], with a business id that fits the [type]. */
    fun insertParty(ownerEntityId: Long, name: String, type: String, role: String): Long {
        val (businessId, businessIdType) = when (type) {
            "end_user" -> UUID.randomUUID().toString() to "uuid"
            "organisation" -> uniqueOrgNumber() to "org"
            else -> uniqueGln() to "gln"
        }
        return queryLong(
            "INSERT INTO flex.party (entity_id, name, type, role, business_id, business_id_type) " +
                "VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
            ownerEntityId,
            name,
            type,
            role,
            businessId,
            businessIdType,
        )
    }

    /** Inserts an entity of any type, with the given business id. */
    fun insertEntity(name: String, type: String, businessId: String, businessIdType: String): Long =
        queryLong(
            "INSERT INTO flex.entity (name, type, business_id, business_id_type) VALUES (?, ?, ?, ?) RETURNING id",
            name,
            type,
            businessId,
            businessIdType,
        )

    /** Inserts an identity and returns its external id. */
    fun insertIdentity(entityId: Long, partyId: Long? = null, clientId: Long? = null): String =
        conn.prepareStatement(
            "INSERT INTO flex.identity (entity_id, party_id, client_id) VALUES (?, ?, ?) RETURNING eid::text",
        ).use { stmt ->
            stmt.setLong(1, entityId)
            stmt.setObject(2, partyId)
            stmt.setObject(3, clientId)
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getString(1)
            }
        }

    /**
     * Inserts a party of [role] with an actor that has assumed it. By default the party is owned by a new
     * organisation entity and the actor is a new person entity; pass [ownerEntityId] or [entityId] to reuse entities.
     * As in production, the actor's entity is a member of the party, with [scopes], unless [member] is false.
     * With [clientId] the actor acts as that entity client, which makes it a non-human actor.
     */
    fun insertActor(
        role: TestPartyRole,
        name: String = "Test ${role.abbreviation}",
        ownerEntityId: Long = insertOrganisationEntity("$name - ENT"),
        entityId: Long = insertPersonEntity("$name - person"),
        member: Boolean = true,
        scopes: List<String> = listOf("manage:data", "manage:auth"),
        clientId: Long? = null,
    ): SeededActor {
        val partyId = insertParty(ownerEntityId, name, role.type, role.role)
        if (member) insertPartyMembership(partyId, entityId, scopes)
        return SeededActor(entityId, partyId, role.role, insertIdentity(entityId, partyId, clientId), ownerEntityId)
    }

    /** Inserts an actor that is a bare entity (the role `flex_entity`). With [clientId] it acts as that entity client. */
    fun insertEntityActor(
        entityId: Long = insertPersonEntity("Test entity"),
        clientId: Long? = null,
    ): SeededActor = SeededActor(entityId, null, "flex_entity", insertIdentity(entityId, null, clientId))

    /** Inserts a person entity with a unique email address as business id. */
    fun insertPersonEntity(name: String = "Test person"): Long =
        insertPerson("person-${UUID.randomUUID()}@example.com", name = name)

    fun insertEntityClient(
        entityId: Long,
        name: String = "Test client",
        scopes: List<String> = listOf("manage:data", "manage:auth"),
        partyId: Long? = null,
    ): SeededEntityClient =
        conn.prepareStatement(
            "INSERT INTO flex.entity_client (entity_id, name, scopes, party_id) " +
                "VALUES (?, ?, ?::flex.scope[], ?) RETURNING id, client_id::text",
        ).use { stmt ->
            stmt.setLong(1, entityId)
            stmt.setString(2, name)
            stmt.setString(3, scopes.joinToString(",", "{", "}"))
            stmt.setObject(4, partyId)
            stmt.executeQuery().use { rs ->
                rs.next()
                SeededEntityClient(rs.getLong(1), rs.getString(2))
            }
        }

    fun insertServiceProvider(name: String = "Test SP"): Long =
        insertEntityAndParty(name, "service_provider", "flex_service_provider").second

    /** Inserts a party of the given type and role with an identity, so that a principal for it can be used in RLS and API tests. */
    fun insertPartyWithIdentity(name: String, type: String, role: String): SeededParty {
        val (entityId, partyId) = insertEntityAndParty(name, type, role)
        val eid = conn.prepareStatement(
            "INSERT INTO flex.identity (entity_id, party_id) VALUES (?, ?) RETURNING eid::text",
        ).use { stmt ->
            stmt.setLong(1, entityId)
            stmt.setLong(2, partyId)
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getString(1)
            }
        }
        return SeededParty(entityId, partyId, FlexPrincipal(role = role, eid = eid))
    }

    /** Inserts a system operator party with an identity, so that a principal for it can be used in RLS tests. */
    fun insertSystemOperator(name: String = "Test SO"): SeededSystemOperator {
        val party = insertPartyWithIdentity(name, "system_operator", "flex_system_operator")
        return SeededSystemOperator(party.partyId, party.principal)
    }

    /** Inserts an organisation entity that is not tied to a party. */
    fun insertOrganisationEntity(name: String = "Org entity ${UUID.randomUUID()}"): Long =
        queryLong(
            "INSERT INTO flex.entity (name, type, business_id, business_id_type) " +
                "VALUES (?, 'organisation', ?, 'org') RETURNING id",
            name,
            uniqueOrgNumber(),
        )

    /** Inserts an entity with an identity that has no party, and a principal that acts as the bare entity. */
    fun insertEntityIdentity(name: String = "Test Entity"): SeededEntity {
        val entityId = insertOrganisationEntity(name)
        val eid = conn.prepareStatement(
            "INSERT INTO flex.identity (entity_id) VALUES (?) RETURNING eid::text",
        ).use { stmt ->
            stmt.setLong(1, entityId)
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getString(1)
            }
        }
        return SeededEntity(entityId, FlexPrincipal(role = "flex_entity", eid = eid))
    }

    fun insertFiso(name: String = "Test FISO"): Long =
        insertEntityAndParty(name, "flexibility_information_system_operator", "flex_flexibility_information_system_operator").second

    fun insertServiceProvidingGroup(
        serviceProviderId: Long = insertServiceProvider(),
        name: String = "Test SPG",
        biddingZone: ServiceProvidingGroupBiddingZone = ServiceProvidingGroupBiddingZone.NO3,
        status: ServiceProvidingGroupStatus = ServiceProvidingGroupStatus.NEW,
    ): Long =
        queryLong(
            "INSERT INTO flex.service_providing_group (name, service_provider_id, bidding_zone, status) " +
                "VALUES (?, ?, ?, ?) RETURNING id",
            name,
            serviceProviderId,
            biddingZone.value,
            status.value,
        )

    /** Adds the controllable unit to the group. A null [validTo] means the membership has no end. */
    fun insertMembership(
        controllableUnitId: Long,
        serviceProvidingGroupId: Long,
        validFrom: Instant = Instant.parse("2024-01-01T00:00:00Z"),
        validTo: Instant? = null,
    ): Long =
        queryLong(
            "INSERT INTO flex.service_providing_group_membership " +
                "(controllable_unit_id, service_providing_group_id, valid_time_range) " +
                "VALUES (?, ?, tstzrange(?::timestamptz, ?::timestamptz, '[)')) RETURNING id",
            controllableUnitId,
            serviceProvidingGroupId,
            validFrom.atOffset(ZoneOffset.UTC),
            validTo?.atOffset(ZoneOffset.UTC),
        )

    /**
     * Deletes the membership. Seed with [Triggers.ON] so that the audit trigger moves the deleted row
     * to the history table, like it does when a user removes the CU from the group.
     */
    fun deleteMembership(membershipId: Long) {
        conn.prepareStatement("DELETE FROM flex.service_providing_group_membership WHERE id = ?").use { stmt ->
            stmt.setLong(1, membershipId)
            stmt.executeUpdate()
        }
    }

    fun insertGridPrequalification(
        serviceProvidingGroupId: Long,
        impactedSystemOperatorId: Long,
        status: ServiceProvidingGroupGridPrequalificationStatus =
            ServiceProvidingGroupGridPrequalificationStatus.REQUESTED,
    ): Long =
        queryLong(
            "INSERT INTO flex.service_providing_group_grid_prequalification " +
                "(service_providing_group_id, impacted_system_operator_id, status) VALUES (?, ?, ?) RETURNING id",
            serviceProvidingGroupId,
            impactedSystemOperatorId,
            status.value,
        )

    fun insertMeteringGridArea(name: String = "Test MGA", businessId: String = uniqueEicY()): Long =
        queryLong(
            "INSERT INTO flex.metering_grid_area (business_id, name) VALUES (?, ?) RETURNING id",
            businessId,
            name,
        )

    /** Puts the accounting point in the metering grid area. A null [validTo] means no end. */
    fun insertAccountingPointMeteringGridArea(
        accountingPointId: Long,
        meteringGridAreaId: Long,
        validFrom: Instant = Instant.parse("2024-01-01T00:00:00Z"),
        validTo: Instant? = null,
    ): Long =
        queryLong(
            "INSERT INTO flex.accounting_point_metering_grid_area " +
                "(accounting_point_id, metering_grid_area_id, valid_time_range) " +
                "VALUES (?, ?, tstzrange(?::timestamptz, ?::timestamptz, '[)')) RETURNING id",
            accountingPointId,
            meteringGridAreaId,
            validFrom.atOffset(ZoneOffset.UTC),
            validTo?.atOffset(ZoneOffset.UTC),
        )

    /** Makes the system operator the owner of the metering grid area. A null [validTo] means no end. */
    fun insertMeteringGridAreaSystemOperator(
        meteringGridAreaId: Long,
        systemOperatorId: Long,
        validFrom: Instant = Instant.parse("2024-01-01T00:00:00Z"),
        validTo: Instant? = null,
    ): Long =
        queryLong(
            "INSERT INTO flex.metering_grid_area_system_operator " +
                "(metering_grid_area_id, system_operator_id, valid_time_range) " +
                "VALUES (?, ?, tstzrange(?::timestamptz, ?::timestamptz, '[)')) RETURNING id",
            meteringGridAreaId,
            systemOperatorId,
            validFrom.atOffset(ZoneOffset.UTC),
            validTo?.atOffset(ZoneOffset.UTC),
        )

    fun insertProductType(name: String = "Test product type"): Long =
        queryLong(
            "INSERT INTO flex.product_type (business_id, name, service) VALUES (?, ?, 'test') RETURNING id",
            UUID.randomUUID().toString(),
            name,
        )

    /**
     * Note: the trigger that creates grid prequalifications from product applications
     * does not run when seeding with [Triggers.OFF], so this does not make the SO an ISO.
     */
    fun insertServiceProvidingGroupProductApplication(
        serviceProvidingGroupId: Long,
        procuringSystemOperatorId: Long,
        productTypeIds: List<Long>,
        status: ServiceProvidingGroupProductApplicationStatus = ServiceProvidingGroupProductApplicationStatus.REQUESTED,
    ): Long =
        queryLong(
            "INSERT INTO flex.service_providing_group_product_application " +
                "(service_providing_group_id, procuring_system_operator_id, product_type_ids, status, " +
                "maximum_active_power_up, maximum_active_power_down) " +
                "VALUES (?, ?, ?::bigint[], ?, 1.0, 1.0) RETURNING id",
            serviceProvidingGroupId,
            procuringSystemOperatorId,
            conn.createArrayOf("bigint", productTypeIds.toTypedArray()),
            status.value,
        )

    /** Inserts a person entity. Uses [businessId] as the name suffix so entities are easy to tell apart. */
    fun insertPerson(businessId: String, businessIdType: String = "email", name: String = "Person $businessId"): Long =
        queryLong(
            "INSERT INTO flex.entity (name, type, business_id, business_id_type) " +
                "VALUES (?, 'person', ?, ?) RETURNING id",
            name,
            businessId,
            businessIdType,
        )

    /** Inserts an end user party owned by a fresh person entity. */
    fun insertEndUserParty(
        status: String = "active",
        ownerEmail: String = "owner-${UUID.randomUUID()}@example.com",
    ): Long =
        queryLong(
            "INSERT INTO flex.party (entity_id, name, type, role, status) " +
                "VALUES (?, ?, 'end_user', 'flex_end_user', ?) RETURNING id",
            insertPerson(ownerEmail),
            "Party $ownerEmail",
            status,
        )

    fun insertPartyMembership(partyId: Long, entityId: Long, scopes: List<String> = listOf("manage:auth")): Long =
        queryLong(
            "INSERT INTO flex.party_membership (party_id, entity_id, scopes) " +
                "VALUES (?, ?, ?::flex.scope[]) RETURNING id",
            partyId,
            entityId,
            scopes.joinToString(",", "{", "}"),
        )

    /** Creates a person entity with the given business id and makes it a member of [partyId]. */
    fun insertPartyMember(partyId: Long, businessId: String, businessIdType: String = "email", name: String = "Person $businessId") {
        insertPartyMembership(partyId, insertPerson(businessId, businessIdType, name))
    }

    fun insertNotice(partyId: Long, status: String, key: String = UUID.randomUUID().toString()): Long =
        queryLong(
            "INSERT INTO flex.notice (party_id, type, status, deduplication_key) " +
                "VALUES (?, 'no.elhub.flex.test'::ltree, ?, ?) RETURNING id",
            partyId,
            status,
            key,
        )

    private fun queryLong(sql: String, vararg params: Any?): Long =
        conn.prepareStatement(sql).use { stmt ->
            params.forEachIndexed { i, p -> stmt.setObject(i + 1, p) }
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getLong(1)
            }
        }
}
