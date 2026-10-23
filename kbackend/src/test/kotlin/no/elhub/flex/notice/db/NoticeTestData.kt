package no.elhub.flex.notice.db

import java.sql.Connection
import java.util.UUID

internal fun Connection.insertEntity(businessId: String, businessIdType: String = "email"): Long =
    prepareStatement(
        "INSERT INTO flex.entity (name, type, business_id, business_id_type) VALUES (?, 'person', ?, ?) RETURNING id",
    ).use { stmt ->
        stmt.setString(1, "Person $businessId")
        stmt.setString(2, businessId)
        stmt.setString(3, businessIdType)
        stmt.executeQuery().use { rs ->
            rs.next()
            rs.getLong(1)
        }
    }

/** Inserts a party owned by a fresh entity. */
internal fun Connection.insertParty(partyStatus: String, ownerEmail: String = "owner-${UUID.randomUUID()}@example.com"): Long {
    val ownerId = insertEntity(ownerEmail)
    return prepareStatement(
        "INSERT INTO flex.party (entity_id, name, type, role, status) VALUES (?, ?, 'end_user', 'flex_end_user', ?) RETURNING id",
    ).use { stmt ->
        stmt.setLong(1, ownerId)
        stmt.setString(2, "Party $ownerEmail")
        stmt.setString(3, partyStatus)
        stmt.executeQuery().use { rs ->
            rs.next()
            rs.getLong(1)
        }
    }
}

internal fun Connection.insertMembership(partyId: Long, entityId: Long) {
    prepareStatement(
        "INSERT INTO flex.party_membership (party_id, entity_id, scopes) VALUES (?, ?, '{manage:auth}'::flex.scope[])",
    ).use { stmt ->
        stmt.setLong(1, partyId)
        stmt.setLong(2, entityId)
        stmt.execute()
    }
}

/** Creates an entity with the given business id and makes it a member of [partyId]. */
internal fun Connection.insertMember(partyId: Long, businessId: String, businessIdType: String = "email") {
    insertMembership(partyId, insertEntity(businessId, businessIdType))
}

internal fun Connection.insertNotice(partyId: Long, status: String, key: String = UUID.randomUUID().toString()) {
    prepareStatement(
        "INSERT INTO flex.notice (party_id, type, status, deduplication_key) VALUES (?, 'no.elhub.flex.test'::ltree, ?, ?)",
    ).use { stmt ->
        stmt.setLong(1, partyId)
        stmt.setString(2, status)
        stmt.setString(3, key)
        stmt.execute()
    }
}
