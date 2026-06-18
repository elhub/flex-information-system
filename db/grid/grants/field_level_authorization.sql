-- liquibase formatted sql
-- AUTO-GENERATED FILE (just permissions-to-db)

-- changeset flex:grid-field-level-authorization runOnChange:true

GRANT SELECT (
    id,
    name,
    business_id,
    business_id_type,
    averaged_position,
    area,
    status,
    recorded_at,
    recorded_by
) ON TABLE
grid.substation_cluster
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    name,
    business_id,
    business_id_type,
    averaged_position,
    area,
    status,
    recorded_at,
    recorded_by
) ON TABLE
grid.substation_cluster
TO flex_system_operator;

GRANT SELECT (
    id,
    name,
    business_id,
    business_id_type,
    kind,
    primary_concessionaire,
    substation_cluster_id,
    voltage_levels,
    position,
    status,
    recorded_at,
    recorded_by
) ON TABLE
grid.substation
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    name,
    business_id,
    business_id_type,
    kind,
    primary_concessionaire,
    substation_cluster_id,
    voltage_levels,
    position,
    status,
    recorded_at,
    recorded_by
) ON TABLE
grid.substation
TO flex_system_operator;

GRANT SELECT (
    id,
    name,
    business_id,
    business_id_type,
    from_substation_cluster_id,
    to_substation_cluster_id,
    line,
    status,
    recorded_at,
    recorded_by
) ON TABLE
grid.line
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    name,
    business_id,
    business_id_type,
    from_substation_cluster_id,
    to_substation_cluster_id,
    line,
    status,
    recorded_at,
    recorded_by
) ON TABLE
grid.line
TO flex_system_operator;

GRANT SELECT (
    accounting_point_id,
    substation_id
) ON TABLE
grid.accounting_point_near_transformer
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    accounting_point_id,
    substation_id
) ON TABLE
grid.accounting_point_near_transformer
TO flex_system_operator;
