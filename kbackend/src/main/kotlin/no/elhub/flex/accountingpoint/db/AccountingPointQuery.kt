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

val UPSERT_ACCOUNTING_POINT = """
    WITH ins AS (
        INSERT INTO flex.accounting_point (business_id)
        VALUES (?)
        ON CONFLICT (business_id) DO NOTHING
        RETURNING id
    )
    SELECT id FROM ins
    UNION ALL
    SELECT id FROM flex.accounting_point WHERE business_id = ? AND NOT EXISTS (SELECT 1 FROM ins)
""".trimIndent()

const val SELECT_ENTITY_BY_BUSINESS_ID =
    "SELECT id FROM flex.entity WHERE business_id = ?"

const val INSERT_ENTITY =
    "INSERT INTO flex.entity (name, type, business_id, business_id_type) VALUES (?, ?, ?, ?) ON CONFLICT (business_id) DO NOTHING"

const val SELECT_END_USER_PARTY_BY_ENTITY =
    "SELECT id FROM flex.party WHERE entity_id = ? AND type = 'end_user'"

val INSERT_END_USER_PARTY = """
    INSERT INTO flex.party (entity_id, name, type, role)
    VALUES (?, ?, 'end_user', 'flex_end_user')
    ON CONFLICT (entity_id) WHERE type = 'end_user' DO NOTHING
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

val MERGE_AP_END_USER = """
    MERGE INTO flex.accounting_point_end_user AS apeu
    USING (VALUES (?::bigint, ?::bigint, ?::timestamptz, ?::timestamptz))
        AS src(accounting_point_id, end_user_id, valid_from, valid_to)
    ON (
        apeu.accounting_point_id = src.accounting_point_id
        AND lower(apeu.valid_time_range) = src.valid_from
    )
    WHEN MATCHED AND (
        apeu.end_user_id IS DISTINCT FROM src.end_user_id
        OR upper(apeu.valid_time_range) IS DISTINCT FROM src.valid_to
    ) THEN UPDATE SET
        end_user_id      = src.end_user_id,
        valid_time_range = tstzrange(src.valid_from, src.valid_to, '[)')
    WHEN NOT MATCHED
    THEN INSERT (accounting_point_id, end_user_id, valid_time_range)
    VALUES (src.accounting_point_id, src.end_user_id, tstzrange(src.valid_from, src.valid_to, '[)'))
""".trimIndent()

val DELETE_STALE_AP_ENERGY_SUPPLIERS = """
    DELETE FROM flex.accounting_point_energy_supplier
    WHERE accounting_point_id = ?
    AND lower(valid_time_range) != ALL(?::timestamptz[])
""".trimIndent()

val MERGE_AP_ENERGY_SUPPLIER = """
    MERGE INTO flex.accounting_point_energy_supplier AS apes
    USING (VALUES (?::bigint, ?::bigint, ?::timestamptz, ?::timestamptz))
        AS src(accounting_point_id, energy_supplier_id, valid_from, valid_to)
    ON (
        apes.accounting_point_id = src.accounting_point_id
        AND lower(apes.valid_time_range) = src.valid_from
    )
    WHEN MATCHED AND (
        apes.energy_supplier_id IS DISTINCT FROM src.energy_supplier_id
        OR upper(apes.valid_time_range) IS DISTINCT FROM src.valid_to
    ) THEN UPDATE SET
        energy_supplier_id = src.energy_supplier_id,
        valid_time_range   = tstzrange(src.valid_from, src.valid_to, '[)')
    WHEN NOT MATCHED
    THEN INSERT (accounting_point_id, energy_supplier_id, valid_time_range)
    VALUES (src.accounting_point_id, src.energy_supplier_id, tstzrange(src.valid_from, src.valid_to, '[)'))
""".trimIndent()

const val MARK_SYNC_COMPLETE =
    "UPDATE flex.accounting_point_sync SET last_synced_at = now(), last_sync_start = NULL, version = version + 1 WHERE accounting_point_id = ?"

const val SET_LOCK_TIMEOUT_1S = "SET LOCAL lock_timeout = '1s'"

val LOCK_SYNC_ROW_AND_MARK_START = """
    WITH lock AS (
        SELECT accounting_point_id FROM flex.accounting_point_sync WHERE accounting_point_id = ? FOR UPDATE
    )
    UPDATE flex.accounting_point_sync
    SET last_sync_start = now()
    WHERE accounting_point_id = ? AND EXISTS (SELECT 1 FROM lock)
    RETURNING accounting_point_id
""".trimIndent()
