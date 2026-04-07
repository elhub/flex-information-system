package no.elhub.flex.accountingpoint.db

val CURRENT_CONTROLLABLE_UNIT_ACCOUNTING_POINT = """
    SELECT accounting_point_id::bigint, accounting_point_business_id::text
    FROM api.current_controllable_unit_accounting_point(?::text)
""".trimIndent()

const val GET_ACCOUNTING_POINT_BY_BUSINESS_ID =
    "SELECT id, business_id FROM flex.accounting_point WHERE business_id = ?"

val CHECK_END_USER_MATCHES_ACCOUNTING_POINT = """
    SELECT end_user_id::bigint
    FROM api.controllable_unit_lookup_check_end_user_matches_accounting_point(?::text, ?::text)
""".trimIndent()

const val UPSERT_ACCOUNTING_POINT =
    "INSERT INTO flex.accounting_point (business_id) VALUES (?) ON CONFLICT (business_id) DO NOTHING"

const val SELECT_ENTITY_BY_BUSINESS_ID =
    "SELECT id FROM flex.entity WHERE business_id = ?"

const val INSERT_ENTITY =
    "INSERT INTO flex.entity (name, type, business_id, business_id_type) VALUES (?, ?, ?, ?) ON CONFLICT (business_id) DO NOTHING"

const val SELECT_END_USER_PARTY_BY_ENTITY =
    "SELECT id FROM flex.party WHERE entity_id = ? AND type = 'end_user'"

val INSERT_END_USER_PARTY = """
    INSERT INTO flex.party (entity_id, name, type, role)
    SELECT ?, ?, 'end_user', 'flex_end_user'
    WHERE NOT EXISTS (
        SELECT 1 FROM flex.party WHERE entity_id = ? AND type = 'end_user'
    )
    RETURNING id
""".trimIndent()

const val ACTIVATE_PARTY =
    "UPDATE flex.party SET status = 'active' WHERE id = ? AND status = 'new'"

const val SELECT_ENERGY_SUPPLIER_PARTY_IDS_BY_BUSINESS_IDS =
    "SELECT business_id, id FROM flex.party WHERE business_id = ANY(?) AND type = 'energy_supplier'"

val DELETE_STALE_AP_END_USERS = """
    DELETE FROM flex.accounting_point_end_user
    WHERE accounting_point_id = ?
    AND lower(valid_time_range) != ALL(?::timestamptz[])
""".trimIndent()

val UPDATE_CHANGED_AP_END_USER = """
    UPDATE flex.accounting_point_end_user
    SET end_user_id = ?,
        valid_time_range = tstzrange(?::timestamptz, ?::timestamptz, '[)')
    WHERE accounting_point_id = ?
    AND lower(valid_time_range) = ?::timestamptz
    AND (
        end_user_id IS DISTINCT FROM ?
        OR upper(valid_time_range) IS DISTINCT FROM ?::timestamptz
    )
""".trimIndent()

val INSERT_NEW_AP_END_USER = """
    INSERT INTO flex.accounting_point_end_user (accounting_point_id, end_user_id, valid_time_range)
    SELECT ?, ?, tstzrange(?::timestamptz, ?::timestamptz, '[)')
    WHERE NOT EXISTS (
        SELECT 1 FROM flex.accounting_point_end_user
        WHERE accounting_point_id = ? AND lower(valid_time_range) = ?::timestamptz
    )
""".trimIndent()

val DELETE_STALE_AP_ENERGY_SUPPLIERS = """
    DELETE FROM flex.accounting_point_energy_supplier
    WHERE accounting_point_id = ?
    AND lower(valid_time_range) != ALL(?::timestamptz[])
""".trimIndent()

val UPDATE_CHANGED_AP_ENERGY_SUPPLIER = """
    UPDATE flex.accounting_point_energy_supplier
    SET energy_supplier_id = ?,
        valid_time_range = tstzrange(?::timestamptz, ?::timestamptz, '[)')
    WHERE accounting_point_id = ?
    AND lower(valid_time_range) = ?::timestamptz
    AND (
        energy_supplier_id IS DISTINCT FROM ?
        OR upper(valid_time_range) IS DISTINCT FROM ?::timestamptz
    )
""".trimIndent()

val INSERT_NEW_AP_ENERGY_SUPPLIER = """
    INSERT INTO flex.accounting_point_energy_supplier (accounting_point_id, energy_supplier_id, valid_time_range)
    SELECT ?, ?, tstzrange(?::timestamptz, ?::timestamptz, '[)')
    WHERE NOT EXISTS (
        SELECT 1 FROM flex.accounting_point_energy_supplier
        WHERE accounting_point_id = ? AND lower(valid_time_range) = ?::timestamptz
    )
""".trimIndent()
