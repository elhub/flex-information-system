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
TO flex_balance_responsible_party;

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
TO flex_energy_supplier;

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
TO flex_end_user;

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
TO flex_market_operator;

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
    averaged_position,
    area,
    status,
    recorded_at,
    recorded_by
) ON TABLE
grid.substation_cluster
TO flex_service_provider;

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
TO flex_third_party;

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
TO flex_balance_responsible_party;

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
TO flex_energy_supplier;

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
TO flex_end_user;

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
TO flex_market_operator;

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
TO flex_service_provider;

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
TO flex_third_party;

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
TO flex_balance_responsible_party;

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
TO flex_energy_supplier;

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
TO flex_end_user;

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
TO flex_market_operator;

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
TO flex_service_provider;

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
TO flex_third_party;
