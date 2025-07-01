-- liquibase formatted sql
-- AUTO-GENERATED FILE (just permissions-to-db)


-- changeset flex:api-grant-entity-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    type,
    business_id,
    business_id_type,
    recorded_at,
    recorded_by
) ON TABLE api.entity
TO flex_balance_responsible_party;

-- changeset flex:api-grant-entity-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    type,
    business_id,
    business_id_type,
    recorded_at,
    recorded_by
) ON TABLE api.entity
TO flex_energy_supplier;

-- changeset flex:api-grant-entity-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    type,
    business_id,
    business_id_type,
    recorded_at,
    recorded_by
) ON TABLE api.entity
TO flex_end_user;

-- changeset flex:api-grant-entity-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    name,
    type,
    business_id,
    business_id_type
) ON TABLE api.entity
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-entity-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    type,
    business_id,
    business_id_type,
    recorded_at,
    recorded_by
) ON TABLE api.entity
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-entity-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    name
) ON TABLE api.entity
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-entity-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    type,
    business_id,
    business_id_type,
    recorded_at,
    recorded_by
) ON TABLE api.entity
TO flex_market_operator;

-- changeset flex:api-grant-entity-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    type,
    business_id,
    business_id_type,
    recorded_at,
    recorded_by
) ON TABLE api.entity
TO flex_system_operator;

-- changeset flex:api-grant-entity-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    type,
    business_id,
    business_id_type,
    recorded_at,
    recorded_by
) ON TABLE api.entity
TO flex_service_provider;

-- changeset flex:api-grant-entity-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    type,
    business_id,
    business_id_type,
    recorded_at,
    recorded_by
) ON TABLE api.entity
TO flex_third_party;

-- changeset flex:api-grant-entity-ent-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    type,
    business_id,
    business_id_type,
    recorded_at,
    recorded_by
) ON TABLE api.entity
TO flex_entity;

-- changeset flex:api-grant-entity-client-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    name,
    client_id,
    client_secret,
    public_key,
    recorded_at,
    recorded_by
) ON TABLE api.entity_client
TO flex_balance_responsible_party;

-- changeset flex:api-grant-entity-client-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    name,
    client_id,
    client_secret,
    public_key,
    recorded_at,
    recorded_by
) ON TABLE api.entity_client
TO flex_energy_supplier;

-- changeset flex:api-grant-entity-client-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    name,
    client_id,
    client_secret,
    public_key,
    recorded_at,
    recorded_by
) ON TABLE api.entity_client
TO flex_end_user;

-- changeset flex:api-grant-entity-client-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    name,
    client_id,
    client_secret,
    public_key,
    recorded_at,
    recorded_by
) ON TABLE api.entity_client
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-entity-client-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    name,
    client_id,
    client_secret,
    public_key,
    recorded_at,
    recorded_by
) ON TABLE api.entity_client
TO flex_market_operator;

-- changeset flex:api-grant-entity-client-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    name,
    client_id,
    client_secret,
    public_key,
    recorded_at,
    recorded_by
) ON TABLE api.entity_client
TO flex_system_operator;

-- changeset flex:api-grant-entity-client-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    name,
    client_id,
    client_secret,
    public_key,
    recorded_at,
    recorded_by
) ON TABLE api.entity_client
TO flex_service_provider;

-- changeset flex:api-grant-entity-client-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    name,
    client_id,
    client_secret,
    public_key,
    recorded_at,
    recorded_by
) ON TABLE api.entity_client
TO flex_third_party;

-- changeset flex:api-grant-entity-client-ent-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    entity_id,
    name,
    client_secret,
    public_key
) ON TABLE api.entity_client
TO flex_entity;

-- changeset flex:api-grant-entity-client-ent-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    name,
    client_id,
    client_secret,
    public_key,
    recorded_at,
    recorded_by
) ON TABLE api.entity_client
TO flex_entity;

-- changeset flex:api-grant-entity-client-ent-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    name,
    client_id,
    client_secret,
    public_key
) ON TABLE api.entity_client
TO flex_entity;

-- changeset flex:api-grant-entity-client-ent-delete endDelimiter:-- runAlways:true
GRANT DELETE ON TABLE api.entity_client
TO flex_entity;

-- changeset flex:api-grant-party-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.party
TO flex_balance_responsible_party;

-- changeset flex:api-grant-party-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.party
TO flex_energy_supplier;

-- changeset flex:api-grant-party-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.party
TO flex_end_user;

-- changeset flex:api-grant-party-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role
) ON TABLE api.party
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-party-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.party
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-party-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    name,
    status
) ON TABLE api.party
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-party-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.party
TO flex_market_operator;

-- changeset flex:api-grant-party-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.party
TO flex_system_operator;

-- changeset flex:api-grant-party-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.party
TO flex_service_provider;

-- changeset flex:api-grant-party-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.party
TO flex_third_party;

-- changeset flex:api-grant-party-ent-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.party
TO flex_entity;

-- changeset flex:api-grant-party-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.party
TO flex_internal_event_notification;

-- changeset flex:api-grant-party-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    party_id,
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.party_history
TO flex_balance_responsible_party;

-- changeset flex:api-grant-party-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    party_id,
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.party_history
TO flex_energy_supplier;

-- changeset flex:api-grant-party-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    party_id,
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.party_history
TO flex_end_user;

-- changeset flex:api-grant-party-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    party_id,
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.party_history
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-party-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    party_id,
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.party_history
TO flex_market_operator;

-- changeset flex:api-grant-party-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    party_id,
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.party_history
TO flex_system_operator;

-- changeset flex:api-grant-party-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    party_id,
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.party_history
TO flex_service_provider;

-- changeset flex:api-grant-party-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    party_id,
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.party_history
TO flex_third_party;

-- changeset flex:api-grant-party-history-ent-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    party_id,
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.party_history
TO flex_entity;

-- changeset flex:api-grant-party-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.party_history
TO flex_internal_event_notification;

-- changeset flex:api-grant-identity-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    entity_name,
    party_id,
    party_name
) ON TABLE api.identity
TO flex_balance_responsible_party;

-- changeset flex:api-grant-identity-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    entity_name,
    party_id,
    party_name
) ON TABLE api.identity
TO flex_energy_supplier;

-- changeset flex:api-grant-identity-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    entity_name,
    party_id,
    party_name
) ON TABLE api.identity
TO flex_end_user;

-- changeset flex:api-grant-identity-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    entity_name,
    party_id,
    party_name
) ON TABLE api.identity
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-identity-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    entity_name,
    party_id,
    party_name
) ON TABLE api.identity
TO flex_market_operator;

-- changeset flex:api-grant-identity-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    entity_name,
    party_id,
    party_name
) ON TABLE api.identity
TO flex_system_operator;

-- changeset flex:api-grant-identity-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    entity_name,
    party_id,
    party_name
) ON TABLE api.identity
TO flex_service_provider;

-- changeset flex:api-grant-identity-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    entity_name,
    party_id,
    party_name
) ON TABLE api.identity
TO flex_third_party;

-- changeset flex:api-grant-identity-ent-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    entity_name,
    party_id,
    party_name
) ON TABLE api.identity
TO flex_entity;

-- changeset flex:api-grant-party-membership-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.party_membership
TO flex_balance_responsible_party;

-- changeset flex:api-grant-party-membership-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.party_membership
TO flex_energy_supplier;

-- changeset flex:api-grant-party-membership-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.party_membership
TO flex_end_user;

-- changeset flex:api-grant-party-membership-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    entity_id,
    party_id
) ON TABLE api.party_membership
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-party-membership-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.party_membership
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-party-membership-fiso-delete endDelimiter:-- runAlways:true
GRANT DELETE ON TABLE api.party_membership
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-party-membership-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.party_membership
TO flex_market_operator;

-- changeset flex:api-grant-party-membership-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.party_membership
TO flex_system_operator;

-- changeset flex:api-grant-party-membership-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.party_membership
TO flex_service_provider;

-- changeset flex:api-grant-party-membership-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.party_membership
TO flex_third_party;

-- changeset flex:api-grant-party-membership-ent-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    entity_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.party_membership
TO flex_entity;

-- changeset flex:api-grant-party-membership-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    party_membership_id,
    entity_id,
    party_id,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.party_membership_history
TO flex_balance_responsible_party;

-- changeset flex:api-grant-party-membership-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    party_membership_id,
    entity_id,
    party_id,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.party_membership_history
TO flex_energy_supplier;

-- changeset flex:api-grant-party-membership-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    party_membership_id,
    entity_id,
    party_id,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.party_membership_history
TO flex_end_user;

-- changeset flex:api-grant-party-membership-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    party_membership_id,
    entity_id,
    party_id,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.party_membership_history
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-party-membership-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    party_membership_id,
    entity_id,
    party_id,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.party_membership_history
TO flex_market_operator;

-- changeset flex:api-grant-party-membership-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    party_membership_id,
    entity_id,
    party_id,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.party_membership_history
TO flex_system_operator;

-- changeset flex:api-grant-party-membership-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    party_membership_id,
    entity_id,
    party_id,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.party_membership_history
TO flex_service_provider;

-- changeset flex:api-grant-party-membership-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    party_membership_id,
    entity_id,
    party_id,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.party_membership_history
TO flex_third_party;

-- changeset flex:api-grant-party-membership-history-ent-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    party_membership_id,
    entity_id,
    party_id,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.party_membership_history
TO flex_entity;

-- changeset flex:api-grant-controllable-unit-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    name,
    regulation_direction,
    maximum_available_capacity,
    is_small,
    start_date,
    status,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    accounting_point_id,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit
TO flex_balance_responsible_party;

-- changeset flex:api-grant-controllable-unit-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    name,
    regulation_direction,
    maximum_available_capacity,
    is_small,
    start_date,
    status,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    accounting_point_id,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit
TO flex_energy_supplier;

-- changeset flex:api-grant-controllable-unit-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    name,
    regulation_direction,
    maximum_available_capacity,
    is_small,
    start_date,
    status,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    accounting_point_id,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit
TO flex_end_user;

-- changeset flex:api-grant-controllable-unit-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    name,
    regulation_direction,
    maximum_available_capacity,
    start_date,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    accounting_point_id,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated
) ON TABLE api.controllable_unit
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-controllable-unit-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    name,
    regulation_direction,
    maximum_available_capacity,
    is_small,
    start_date,
    status,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    accounting_point_id,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-controllable-unit-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    name,
    regulation_direction,
    maximum_available_capacity,
    start_date,
    status,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated
) ON TABLE api.controllable_unit
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-controllable-unit-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    name,
    regulation_direction,
    maximum_available_capacity,
    is_small,
    start_date,
    status,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    accounting_point_id,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit
TO flex_market_operator;

-- changeset flex:api-grant-controllable-unit-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    name,
    regulation_direction,
    maximum_available_capacity,
    is_small,
    start_date,
    status,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    accounting_point_id,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit
TO flex_system_operator;

-- changeset flex:api-grant-controllable-unit-so-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated
) ON TABLE api.controllable_unit
TO flex_system_operator;

-- changeset flex:api-grant-controllable-unit-sp-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    name,
    regulation_direction,
    maximum_available_capacity,
    start_date,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    accounting_point_id
) ON TABLE api.controllable_unit
TO flex_service_provider;

-- changeset flex:api-grant-controllable-unit-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    name,
    regulation_direction,
    maximum_available_capacity,
    is_small,
    start_date,
    status,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    accounting_point_id,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit
TO flex_service_provider;

-- changeset flex:api-grant-controllable-unit-sp-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    name,
    regulation_direction,
    maximum_available_capacity,
    start_date,
    status,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate
) ON TABLE api.controllable_unit
TO flex_service_provider;

-- changeset flex:api-grant-controllable-unit-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    name,
    regulation_direction,
    maximum_available_capacity,
    is_small,
    start_date,
    status,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    accounting_point_id,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit
TO flex_third_party;

-- changeset flex:api-grant-controllable-unit-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.controllable_unit
TO flex_internal_event_notification;

-- changeset flex:api-grant-controllable-unit-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    business_id,
    name,
    regulation_direction,
    maximum_available_capacity,
    is_small,
    start_date,
    status,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    accounting_point_id,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_history
TO flex_balance_responsible_party;

-- changeset flex:api-grant-controllable-unit-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    business_id,
    name,
    regulation_direction,
    maximum_available_capacity,
    is_small,
    start_date,
    status,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    accounting_point_id,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_history
TO flex_energy_supplier;

-- changeset flex:api-grant-controllable-unit-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    business_id,
    name,
    regulation_direction,
    maximum_available_capacity,
    is_small,
    start_date,
    status,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    accounting_point_id,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_history
TO flex_end_user;

-- changeset flex:api-grant-controllable-unit-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    business_id,
    name,
    regulation_direction,
    maximum_available_capacity,
    is_small,
    start_date,
    status,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    accounting_point_id,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_history
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-controllable-unit-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    business_id,
    name,
    regulation_direction,
    maximum_available_capacity,
    is_small,
    start_date,
    status,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    accounting_point_id,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_history
TO flex_market_operator;

-- changeset flex:api-grant-controllable-unit-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    business_id,
    name,
    regulation_direction,
    maximum_available_capacity,
    is_small,
    start_date,
    status,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    accounting_point_id,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_history
TO flex_system_operator;

-- changeset flex:api-grant-controllable-unit-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    business_id,
    name,
    regulation_direction,
    maximum_available_capacity,
    is_small,
    start_date,
    status,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    accounting_point_id,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_history
TO flex_service_provider;

-- changeset flex:api-grant-controllable-unit-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    business_id,
    name,
    regulation_direction,
    maximum_available_capacity,
    is_small,
    start_date,
    status,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    accounting_point_id,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_history
TO flex_third_party;

-- changeset flex:api-grant-controllable-unit-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.controllable_unit_history
TO flex_internal_event_notification;

-- changeset flex:api-grant-controllable-unit-service-provider-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    service_provider_id,
    end_user_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit_service_provider
TO flex_balance_responsible_party;

-- changeset flex:api-grant-controllable-unit-service-provider-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    service_provider_id,
    end_user_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit_service_provider
TO flex_energy_supplier;

-- changeset flex:api-grant-controllable-unit-service-provider-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    service_provider_id,
    end_user_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit_service_provider
TO flex_end_user;

-- changeset flex:api-grant-controllable-unit-service-provider-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    controllable_unit_id,
    service_provider_id,
    end_user_id,
    contract_reference,
    valid_from,
    valid_to
) ON TABLE api.controllable_unit_service_provider
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-controllable-unit-service-provider-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    service_provider_id,
    end_user_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit_service_provider
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-controllable-unit-service-provider-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    contract_reference,
    valid_from,
    valid_to
) ON TABLE api.controllable_unit_service_provider
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-controllable-unit-service-provider-fiso-delete endDelimiter:-- runAlways:true
GRANT DELETE ON TABLE api.controllable_unit_service_provider
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-controllable-unit-service-provider-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    service_provider_id,
    end_user_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit_service_provider
TO flex_market_operator;

-- changeset flex:api-grant-controllable-unit-service-provider-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    service_provider_id,
    end_user_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit_service_provider
TO flex_system_operator;

-- changeset flex:api-grant-controllable-unit-service-provider-sp-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    controllable_unit_id,
    service_provider_id,
    end_user_id,
    contract_reference,
    valid_from,
    valid_to
) ON TABLE api.controllable_unit_service_provider
TO flex_service_provider;

-- changeset flex:api-grant-controllable-unit-service-provider-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    service_provider_id,
    end_user_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit_service_provider
TO flex_service_provider;

-- changeset flex:api-grant-controllable-unit-service-provider-sp-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    contract_reference,
    valid_from,
    valid_to
) ON TABLE api.controllable_unit_service_provider
TO flex_service_provider;

-- changeset flex:api-grant-controllable-unit-service-provider-sp-delete endDelimiter:-- runAlways:true
GRANT DELETE ON TABLE api.controllable_unit_service_provider
TO flex_service_provider;

-- changeset flex:api-grant-controllable-unit-service-provider-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    service_provider_id,
    end_user_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit_service_provider
TO flex_third_party;

-- changeset flex:api-grant-controllable-unit-service-provider-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.controllable_unit_service_provider
TO flex_internal_event_notification;

-- changeset flex:api-grant-controllable-unit-service-provider-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_service_provider_id,
    controllable_unit_id,
    service_provider_id,
    end_user_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_service_provider_history
TO flex_balance_responsible_party;

-- changeset flex:api-grant-controllable-unit-service-provider-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_service_provider_id,
    controllable_unit_id,
    service_provider_id,
    end_user_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_service_provider_history
TO flex_energy_supplier;

-- changeset flex:api-grant-controllable-unit-service-provider-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_service_provider_id,
    controllable_unit_id,
    service_provider_id,
    end_user_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_service_provider_history
TO flex_end_user;

-- changeset flex:api-grant-controllable-unit-service-provider-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_service_provider_id,
    controllable_unit_id,
    service_provider_id,
    end_user_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_service_provider_history
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-controllable-unit-service-provider-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_service_provider_id,
    controllable_unit_id,
    service_provider_id,
    end_user_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_service_provider_history
TO flex_market_operator;

-- changeset flex:api-grant-controllable-unit-service-provider-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_service_provider_id,
    controllable_unit_id,
    service_provider_id,
    end_user_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_service_provider_history
TO flex_system_operator;

-- changeset flex:api-grant-controllable-unit-service-provider-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_service_provider_id,
    controllable_unit_id,
    service_provider_id,
    end_user_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_service_provider_history
TO flex_service_provider;

-- changeset flex:api-grant-controllable-unit-service-provider-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_service_provider_id,
    controllable_unit_id,
    service_provider_id,
    end_user_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_service_provider_history
TO flex_third_party;

-- changeset flex:api-grant-controllable-unit-service-provider-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.controllable_unit_service_provider_history
TO flex_internal_event_notification;

-- changeset flex:api-grant-service-providing-group-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    service_provider_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group
TO flex_balance_responsible_party;

-- changeset flex:api-grant-service-providing-group-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    service_provider_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group
TO flex_energy_supplier;

-- changeset flex:api-grant-service-providing-group-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    service_provider_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group
TO flex_end_user;

-- changeset flex:api-grant-service-providing-group-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    name,
    service_provider_id
) ON TABLE api.service_providing_group
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-providing-group-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    service_provider_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-providing-group-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    name,
    status
) ON TABLE api.service_providing_group
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-providing-group-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    service_provider_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group
TO flex_market_operator;

-- changeset flex:api-grant-service-providing-group-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    service_provider_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group
TO flex_system_operator;

-- changeset flex:api-grant-service-providing-group-sp-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    name,
    service_provider_id
) ON TABLE api.service_providing_group
TO flex_service_provider;

-- changeset flex:api-grant-service-providing-group-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    service_provider_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group
TO flex_service_provider;

-- changeset flex:api-grant-service-providing-group-sp-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    name,
    status
) ON TABLE api.service_providing_group
TO flex_service_provider;

-- changeset flex:api-grant-service-providing-group-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    service_provider_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group
TO flex_third_party;

-- changeset flex:api-grant-service-providing-group-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.service_providing_group
TO flex_internal_event_notification;

-- changeset flex:api-grant-service-providing-group-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    name,
    service_provider_id,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_history
TO flex_balance_responsible_party;

-- changeset flex:api-grant-service-providing-group-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    name,
    service_provider_id,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_history
TO flex_energy_supplier;

-- changeset flex:api-grant-service-providing-group-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    name,
    service_provider_id,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_history
TO flex_end_user;

-- changeset flex:api-grant-service-providing-group-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    name,
    service_provider_id,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_history
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-providing-group-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    name,
    service_provider_id,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_history
TO flex_market_operator;

-- changeset flex:api-grant-service-providing-group-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    name,
    service_provider_id,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_history
TO flex_system_operator;

-- changeset flex:api-grant-service-providing-group-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    name,
    service_provider_id,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_history
TO flex_service_provider;

-- changeset flex:api-grant-service-providing-group-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    name,
    service_provider_id,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_history
TO flex_third_party;

-- changeset flex:api-grant-service-providing-group-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.service_providing_group_history
TO flex_internal_event_notification;

-- changeset flex:api-grant-service-providing-group-membership-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_membership
TO flex_balance_responsible_party;

-- changeset flex:api-grant-service-providing-group-membership-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_membership
TO flex_energy_supplier;

-- changeset flex:api-grant-service-providing-group-membership-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_membership
TO flex_end_user;

-- changeset flex:api-grant-service-providing-group-membership-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to
) ON TABLE api.service_providing_group_membership
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-providing-group-membership-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_membership
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-providing-group-membership-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    valid_from,
    valid_to
) ON TABLE api.service_providing_group_membership
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-providing-group-membership-fiso-delete endDelimiter:-- runAlways:true
GRANT DELETE ON TABLE api.service_providing_group_membership
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-providing-group-membership-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_membership
TO flex_market_operator;

-- changeset flex:api-grant-service-providing-group-membership-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_membership
TO flex_system_operator;

-- changeset flex:api-grant-service-providing-group-membership-sp-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to
) ON TABLE api.service_providing_group_membership
TO flex_service_provider;

-- changeset flex:api-grant-service-providing-group-membership-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_membership
TO flex_service_provider;

-- changeset flex:api-grant-service-providing-group-membership-sp-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    valid_from,
    valid_to
) ON TABLE api.service_providing_group_membership
TO flex_service_provider;

-- changeset flex:api-grant-service-providing-group-membership-sp-delete endDelimiter:-- runAlways:true
GRANT DELETE ON TABLE api.service_providing_group_membership
TO flex_service_provider;

-- changeset flex:api-grant-service-providing-group-membership-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_membership
TO flex_third_party;

-- changeset flex:api-grant-service-providing-group-membership-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.service_providing_group_membership
TO flex_internal_event_notification;

-- changeset flex:api-grant-service-providing-group-membership-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_membership_id,
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_membership_history
TO flex_balance_responsible_party;

-- changeset flex:api-grant-service-providing-group-membership-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_membership_id,
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_membership_history
TO flex_energy_supplier;

-- changeset flex:api-grant-service-providing-group-membership-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_membership_id,
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_membership_history
TO flex_end_user;

-- changeset flex:api-grant-service-providing-group-membership-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_membership_id,
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_membership_history
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-providing-group-membership-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_membership_id,
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_membership_history
TO flex_market_operator;

-- changeset flex:api-grant-service-providing-group-membership-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_membership_id,
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_membership_history
TO flex_system_operator;

-- changeset flex:api-grant-service-providing-group-membership-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_membership_id,
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_membership_history
TO flex_service_provider;

-- changeset flex:api-grant-service-providing-group-membership-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_membership_id,
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_membership_history
TO flex_third_party;

-- changeset flex:api-grant-service-providing-group-membership-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.service_providing_group_membership_history
TO flex_internal_event_notification;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    impacted_system_operator_id,
    status,
    notes,
    last_prequalified,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_grid_prequalification
TO flex_balance_responsible_party;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    impacted_system_operator_id,
    status,
    notes,
    last_prequalified,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_grid_prequalification
TO flex_energy_supplier;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    impacted_system_operator_id,
    status,
    notes,
    last_prequalified,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_grid_prequalification
TO flex_end_user;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    service_providing_group_id,
    impacted_system_operator_id
) ON TABLE api.service_providing_group_grid_prequalification
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    impacted_system_operator_id,
    status,
    notes,
    last_prequalified,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_grid_prequalification
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    status,
    last_prequalified
) ON TABLE api.service_providing_group_grid_prequalification
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    impacted_system_operator_id,
    status,
    notes,
    last_prequalified,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_grid_prequalification
TO flex_market_operator;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    impacted_system_operator_id,
    status,
    notes,
    last_prequalified,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_grid_prequalification
TO flex_system_operator;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-so-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    status,
    notes,
    last_prequalified
) ON TABLE api.service_providing_group_grid_prequalification
TO flex_system_operator;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    impacted_system_operator_id,
    status,
    notes,
    last_prequalified,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_grid_prequalification
TO flex_service_provider;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    impacted_system_operator_id,
    status,
    notes,
    last_prequalified,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_grid_prequalification
TO flex_third_party;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.service_providing_group_grid_prequalification
TO flex_internal_event_notification;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_grid_prequalification_id,
    service_providing_group_id,
    impacted_system_operator_id,
    status,
    notes,
    last_prequalified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_grid_prequalification_history
TO flex_balance_responsible_party;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_grid_prequalification_id,
    service_providing_group_id,
    impacted_system_operator_id,
    status,
    notes,
    last_prequalified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_grid_prequalification_history
TO flex_energy_supplier;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_grid_prequalification_id,
    service_providing_group_id,
    impacted_system_operator_id,
    status,
    notes,
    last_prequalified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_grid_prequalification_history
TO flex_end_user;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_grid_prequalification_id,
    service_providing_group_id,
    impacted_system_operator_id,
    status,
    notes,
    last_prequalified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_grid_prequalification_history
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_grid_prequalification_id,
    service_providing_group_id,
    impacted_system_operator_id,
    status,
    notes,
    last_prequalified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_grid_prequalification_history
TO flex_market_operator;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_grid_prequalification_id,
    service_providing_group_id,
    impacted_system_operator_id,
    status,
    notes,
    last_prequalified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_grid_prequalification_history
TO flex_system_operator;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_grid_prequalification_id,
    service_providing_group_id,
    impacted_system_operator_id,
    status,
    notes,
    last_prequalified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_grid_prequalification_history
TO flex_service_provider;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_grid_prequalification_id,
    service_providing_group_id,
    impacted_system_operator_id,
    status,
    notes,
    last_prequalified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_grid_prequalification_history
TO flex_third_party;

-- changeset flex:api-grant-service-providing-group-grid-prequalification-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.service_providing_group_grid_prequalification_history
TO flex_internal_event_notification;

-- changeset flex:api-grant-technical-resource-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    recorded_by
) ON TABLE api.technical_resource
TO flex_balance_responsible_party;

-- changeset flex:api-grant-technical-resource-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    recorded_by
) ON TABLE api.technical_resource
TO flex_energy_supplier;

-- changeset flex:api-grant-technical-resource-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    recorded_by
) ON TABLE api.technical_resource
TO flex_end_user;

-- changeset flex:api-grant-technical-resource-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    name,
    controllable_unit_id,
    details
) ON TABLE api.technical_resource
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-technical-resource-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    recorded_by
) ON TABLE api.technical_resource
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-technical-resource-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    name,
    details
) ON TABLE api.technical_resource
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-technical-resource-fiso-delete endDelimiter:-- runAlways:true
GRANT DELETE ON TABLE api.technical_resource
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-technical-resource-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    recorded_by
) ON TABLE api.technical_resource
TO flex_market_operator;

-- changeset flex:api-grant-technical-resource-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    recorded_by
) ON TABLE api.technical_resource
TO flex_system_operator;

-- changeset flex:api-grant-technical-resource-sp-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    name,
    controllable_unit_id,
    details
) ON TABLE api.technical_resource
TO flex_service_provider;

-- changeset flex:api-grant-technical-resource-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    recorded_by
) ON TABLE api.technical_resource
TO flex_service_provider;

-- changeset flex:api-grant-technical-resource-sp-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    name,
    details
) ON TABLE api.technical_resource
TO flex_service_provider;

-- changeset flex:api-grant-technical-resource-sp-delete endDelimiter:-- runAlways:true
GRANT DELETE ON TABLE api.technical_resource
TO flex_service_provider;

-- changeset flex:api-grant-technical-resource-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    recorded_by
) ON TABLE api.technical_resource
TO flex_third_party;

-- changeset flex:api-grant-technical-resource-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.technical_resource
TO flex_internal_event_notification;

-- changeset flex:api-grant-technical-resource-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    technical_resource_id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.technical_resource_history
TO flex_balance_responsible_party;

-- changeset flex:api-grant-technical-resource-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    technical_resource_id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.technical_resource_history
TO flex_energy_supplier;

-- changeset flex:api-grant-technical-resource-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    technical_resource_id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.technical_resource_history
TO flex_end_user;

-- changeset flex:api-grant-technical-resource-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    technical_resource_id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.technical_resource_history
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-technical-resource-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    technical_resource_id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.technical_resource_history
TO flex_market_operator;

-- changeset flex:api-grant-technical-resource-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    technical_resource_id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.technical_resource_history
TO flex_system_operator;

-- changeset flex:api-grant-technical-resource-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    technical_resource_id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.technical_resource_history
TO flex_service_provider;

-- changeset flex:api-grant-technical-resource-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    technical_resource_id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.technical_resource_history
TO flex_third_party;

-- changeset flex:api-grant-technical-resource-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.technical_resource_history
TO flex_internal_event_notification;

-- changeset flex:api-grant-event-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    specversion,
    time,
    type,
    source,
    data
) ON TABLE api.event
TO flex_balance_responsible_party;

-- changeset flex:api-grant-event-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    specversion,
    time,
    type,
    source,
    data
) ON TABLE api.event
TO flex_energy_supplier;

-- changeset flex:api-grant-event-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    specversion,
    time,
    type,
    source,
    data
) ON TABLE api.event
TO flex_end_user;

-- changeset flex:api-grant-event-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    specversion,
    time,
    type,
    source,
    data
) ON TABLE api.event
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-event-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    specversion,
    time,
    type,
    source,
    data
) ON TABLE api.event
TO flex_market_operator;

-- changeset flex:api-grant-event-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    specversion,
    time,
    type,
    source,
    data
) ON TABLE api.event
TO flex_system_operator;

-- changeset flex:api-grant-event-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    specversion,
    time,
    type,
    source,
    data
) ON TABLE api.event
TO flex_service_provider;

-- changeset flex:api-grant-event-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    specversion,
    time,
    type,
    source,
    data
) ON TABLE api.event
TO flex_third_party;

-- changeset flex:api-grant-event-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.event
TO flex_internal_event_notification;

-- changeset flex:api-grant-notification-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    acknowledged,
    event_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.notification
TO flex_balance_responsible_party;

-- changeset flex:api-grant-notification-brp-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    acknowledged
) ON TABLE api.notification
TO flex_balance_responsible_party;

-- changeset flex:api-grant-notification-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    acknowledged,
    event_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.notification
TO flex_energy_supplier;

-- changeset flex:api-grant-notification-es-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    acknowledged
) ON TABLE api.notification
TO flex_energy_supplier;

-- changeset flex:api-grant-notification-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    acknowledged,
    event_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.notification
TO flex_end_user;

-- changeset flex:api-grant-notification-eu-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    acknowledged
) ON TABLE api.notification
TO flex_end_user;

-- changeset flex:api-grant-notification-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    acknowledged,
    event_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.notification
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-notification-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    acknowledged
) ON TABLE api.notification
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-notification-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    acknowledged,
    event_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.notification
TO flex_market_operator;

-- changeset flex:api-grant-notification-mo-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    acknowledged
) ON TABLE api.notification
TO flex_market_operator;

-- changeset flex:api-grant-notification-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    acknowledged,
    event_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.notification
TO flex_system_operator;

-- changeset flex:api-grant-notification-so-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    acknowledged
) ON TABLE api.notification
TO flex_system_operator;

-- changeset flex:api-grant-notification-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    acknowledged,
    event_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.notification
TO flex_service_provider;

-- changeset flex:api-grant-notification-sp-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    acknowledged
) ON TABLE api.notification
TO flex_service_provider;

-- changeset flex:api-grant-notification-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    acknowledged,
    event_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.notification
TO flex_third_party;

-- changeset flex:api-grant-notification-tp-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    acknowledged
) ON TABLE api.notification
TO flex_third_party;

-- changeset flex:api-grant-notification-ien-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    event_id,
    party_id
) ON TABLE api.notification
TO flex_internal_event_notification;

-- changeset flex:api-grant-notification-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.notification
TO flex_internal_event_notification;

-- changeset flex:api-grant-accounting-point-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    system_operator_id,
    recorded_at,
    recorded_by
) ON TABLE api.accounting_point
TO flex_balance_responsible_party;

-- changeset flex:api-grant-accounting-point-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    system_operator_id,
    recorded_at,
    recorded_by
) ON TABLE api.accounting_point
TO flex_energy_supplier;

-- changeset flex:api-grant-accounting-point-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    system_operator_id,
    recorded_at,
    recorded_by
) ON TABLE api.accounting_point
TO flex_end_user;

-- changeset flex:api-grant-accounting-point-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    system_operator_id,
    recorded_at,
    recorded_by
) ON TABLE api.accounting_point
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-accounting-point-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    system_operator_id,
    recorded_at,
    recorded_by
) ON TABLE api.accounting_point
TO flex_market_operator;

-- changeset flex:api-grant-accounting-point-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    system_operator_id,
    recorded_at,
    recorded_by
) ON TABLE api.accounting_point
TO flex_system_operator;

-- changeset flex:api-grant-accounting-point-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    system_operator_id,
    recorded_at,
    recorded_by
) ON TABLE api.accounting_point
TO flex_service_provider;

-- changeset flex:api-grant-accounting-point-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    system_operator_id,
    recorded_at,
    recorded_by
) ON TABLE api.accounting_point
TO flex_third_party;

-- changeset flex:api-grant-accounting-point-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.accounting_point
TO flex_internal_event_notification;

-- changeset flex:api-grant-accounting-point-balance-responsible-party-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    accounting_point_id,
    balance_responsible_party_id,
    energy_direction,
    valid_from,
    valid_to
) ON TABLE api.accounting_point_balance_responsible_party
TO flex_balance_responsible_party;

-- changeset flex:api-grant-accounting-point-balance-responsible-party-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    accounting_point_id,
    balance_responsible_party_id,
    energy_direction,
    valid_from,
    valid_to
) ON TABLE api.accounting_point_balance_responsible_party
TO flex_energy_supplier;

-- changeset flex:api-grant-accounting-point-balance-responsible-party-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    accounting_point_id,
    balance_responsible_party_id,
    energy_direction,
    valid_from,
    valid_to
) ON TABLE api.accounting_point_balance_responsible_party
TO flex_end_user;

-- changeset flex:api-grant-accounting-point-balance-responsible-party-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    accounting_point_id,
    balance_responsible_party_id,
    energy_direction,
    valid_from,
    valid_to
) ON TABLE api.accounting_point_balance_responsible_party
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-accounting-point-balance-responsible-party-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    accounting_point_id,
    balance_responsible_party_id,
    energy_direction,
    valid_from,
    valid_to
) ON TABLE api.accounting_point_balance_responsible_party
TO flex_market_operator;

-- changeset flex:api-grant-accounting-point-balance-responsible-party-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    accounting_point_id,
    balance_responsible_party_id,
    energy_direction,
    valid_from,
    valid_to
) ON TABLE api.accounting_point_balance_responsible_party
TO flex_system_operator;

-- changeset flex:api-grant-accounting-point-balance-responsible-party-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    accounting_point_id,
    balance_responsible_party_id,
    energy_direction,
    valid_from,
    valid_to
) ON TABLE api.accounting_point_balance_responsible_party
TO flex_service_provider;

-- changeset flex:api-grant-accounting-point-balance-responsible-party-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    accounting_point_id,
    balance_responsible_party_id,
    energy_direction,
    valid_from,
    valid_to
) ON TABLE api.accounting_point_balance_responsible_party
TO flex_third_party;

-- changeset flex:api-grant-accounting-point-energy-supplier-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    accounting_point_id,
    energy_supplier_id,
    valid_from,
    valid_to
) ON TABLE api.accounting_point_energy_supplier
TO flex_balance_responsible_party;

-- changeset flex:api-grant-accounting-point-energy-supplier-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    accounting_point_id,
    energy_supplier_id,
    valid_from,
    valid_to
) ON TABLE api.accounting_point_energy_supplier
TO flex_energy_supplier;

-- changeset flex:api-grant-accounting-point-energy-supplier-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    accounting_point_id,
    energy_supplier_id,
    valid_from,
    valid_to
) ON TABLE api.accounting_point_energy_supplier
TO flex_end_user;

-- changeset flex:api-grant-accounting-point-energy-supplier-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    accounting_point_id,
    energy_supplier_id,
    valid_from,
    valid_to
) ON TABLE api.accounting_point_energy_supplier
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-accounting-point-energy-supplier-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    accounting_point_id,
    energy_supplier_id,
    valid_from,
    valid_to
) ON TABLE api.accounting_point_energy_supplier
TO flex_market_operator;

-- changeset flex:api-grant-accounting-point-energy-supplier-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    accounting_point_id,
    energy_supplier_id,
    valid_from,
    valid_to
) ON TABLE api.accounting_point_energy_supplier
TO flex_system_operator;

-- changeset flex:api-grant-accounting-point-energy-supplier-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    accounting_point_id,
    energy_supplier_id,
    valid_from,
    valid_to
) ON TABLE api.accounting_point_energy_supplier
TO flex_service_provider;

-- changeset flex:api-grant-accounting-point-energy-supplier-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    accounting_point_id,
    energy_supplier_id,
    valid_from,
    valid_to
) ON TABLE api.accounting_point_energy_supplier
TO flex_third_party;

-- changeset flex:api-grant-product-type-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    name,
    service,
    products
) ON TABLE api.product_type
TO flex_balance_responsible_party;

-- changeset flex:api-grant-product-type-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    name,
    service,
    products
) ON TABLE api.product_type
TO flex_energy_supplier;

-- changeset flex:api-grant-product-type-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    name,
    service,
    products
) ON TABLE api.product_type
TO flex_end_user;

-- changeset flex:api-grant-product-type-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    name,
    service,
    products
) ON TABLE api.product_type
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-product-type-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    name,
    service,
    products
) ON TABLE api.product_type
TO flex_market_operator;

-- changeset flex:api-grant-product-type-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    name,
    service,
    products
) ON TABLE api.product_type
TO flex_system_operator;

-- changeset flex:api-grant-product-type-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    name,
    service,
    products
) ON TABLE api.product_type
TO flex_service_provider;

-- changeset flex:api-grant-product-type-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    business_id,
    name,
    service,
    products
) ON TABLE api.product_type
TO flex_third_party;

-- changeset flex:api-grant-system-operator-product-type-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.system_operator_product_type
TO flex_balance_responsible_party;

-- changeset flex:api-grant-system-operator-product-type-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.system_operator_product_type
TO flex_energy_supplier;

-- changeset flex:api-grant-system-operator-product-type-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.system_operator_product_type
TO flex_end_user;

-- changeset flex:api-grant-system-operator-product-type-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    system_operator_id,
    product_type_id
) ON TABLE api.system_operator_product_type
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-system-operator-product-type-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.system_operator_product_type
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-system-operator-product-type-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    status
) ON TABLE api.system_operator_product_type
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-system-operator-product-type-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.system_operator_product_type
TO flex_market_operator;

-- changeset flex:api-grant-system-operator-product-type-so-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    system_operator_id,
    product_type_id
) ON TABLE api.system_operator_product_type
TO flex_system_operator;

-- changeset flex:api-grant-system-operator-product-type-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.system_operator_product_type
TO flex_system_operator;

-- changeset flex:api-grant-system-operator-product-type-so-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    status
) ON TABLE api.system_operator_product_type
TO flex_system_operator;

-- changeset flex:api-grant-system-operator-product-type-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.system_operator_product_type
TO flex_service_provider;

-- changeset flex:api-grant-system-operator-product-type-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.system_operator_product_type
TO flex_third_party;

-- changeset flex:api-grant-system-operator-product-type-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.system_operator_product_type
TO flex_internal_event_notification;

-- changeset flex:api-grant-system-operator-product-type-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    system_operator_product_type_id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.system_operator_product_type_history
TO flex_balance_responsible_party;

-- changeset flex:api-grant-system-operator-product-type-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    system_operator_product_type_id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.system_operator_product_type_history
TO flex_energy_supplier;

-- changeset flex:api-grant-system-operator-product-type-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    system_operator_product_type_id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.system_operator_product_type_history
TO flex_end_user;

-- changeset flex:api-grant-system-operator-product-type-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    system_operator_product_type_id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.system_operator_product_type_history
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-system-operator-product-type-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    system_operator_product_type_id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.system_operator_product_type_history
TO flex_market_operator;

-- changeset flex:api-grant-system-operator-product-type-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    system_operator_product_type_id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.system_operator_product_type_history
TO flex_system_operator;

-- changeset flex:api-grant-system-operator-product-type-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    system_operator_product_type_id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.system_operator_product_type_history
TO flex_service_provider;

-- changeset flex:api-grant-system-operator-product-type-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    system_operator_product_type_id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.system_operator_product_type_history
TO flex_third_party;

-- changeset flex:api-grant-system-operator-product-type-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.system_operator_product_type_history
TO flex_internal_event_notification;

-- changeset flex:api-grant-service-provider-product-application-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_id,
    system_operator_id,
    product_type_ids,
    status,
    notes,
    last_qualified,
    recorded_at,
    recorded_by
) ON TABLE api.service_provider_product_application
TO flex_balance_responsible_party;

-- changeset flex:api-grant-service-provider-product-application-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_id,
    system_operator_id,
    product_type_ids,
    status,
    notes,
    last_qualified,
    recorded_at,
    recorded_by
) ON TABLE api.service_provider_product_application
TO flex_energy_supplier;

-- changeset flex:api-grant-service-provider-product-application-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_id,
    system_operator_id,
    product_type_ids,
    status,
    notes,
    last_qualified,
    recorded_at,
    recorded_by
) ON TABLE api.service_provider_product_application
TO flex_end_user;

-- changeset flex:api-grant-service-provider-product-application-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_id,
    system_operator_id,
    product_type_ids,
    status,
    notes,
    last_qualified,
    recorded_at,
    recorded_by
) ON TABLE api.service_provider_product_application
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-provider-product-application-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    product_type_ids,
    status,
    notes,
    last_qualified
) ON TABLE api.service_provider_product_application
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-provider-product-application-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_id,
    system_operator_id,
    product_type_ids,
    status,
    notes,
    last_qualified,
    recorded_at,
    recorded_by
) ON TABLE api.service_provider_product_application
TO flex_market_operator;

-- changeset flex:api-grant-service-provider-product-application-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_id,
    system_operator_id,
    product_type_ids,
    status,
    notes,
    last_qualified,
    recorded_at,
    recorded_by
) ON TABLE api.service_provider_product_application
TO flex_system_operator;

-- changeset flex:api-grant-service-provider-product-application-so-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    status,
    notes,
    last_qualified
) ON TABLE api.service_provider_product_application
TO flex_system_operator;

-- changeset flex:api-grant-service-provider-product-application-sp-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    service_provider_id,
    system_operator_id,
    product_type_ids
) ON TABLE api.service_provider_product_application
TO flex_service_provider;

-- changeset flex:api-grant-service-provider-product-application-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_id,
    system_operator_id,
    product_type_ids,
    status,
    notes,
    last_qualified,
    recorded_at,
    recorded_by
) ON TABLE api.service_provider_product_application
TO flex_service_provider;

-- changeset flex:api-grant-service-provider-product-application-sp-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    product_type_ids
) ON TABLE api.service_provider_product_application
TO flex_service_provider;

-- changeset flex:api-grant-service-provider-product-application-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_id,
    system_operator_id,
    product_type_ids,
    status,
    notes,
    last_qualified,
    recorded_at,
    recorded_by
) ON TABLE api.service_provider_product_application
TO flex_third_party;

-- changeset flex:api-grant-service-provider-product-application-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.service_provider_product_application
TO flex_internal_event_notification;

-- changeset flex:api-grant-service-provider-product-application-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_id,
    service_provider_id,
    system_operator_id,
    product_type_ids,
    status,
    notes,
    last_qualified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_provider_product_application_history
TO flex_balance_responsible_party;

-- changeset flex:api-grant-service-provider-product-application-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_id,
    service_provider_id,
    system_operator_id,
    product_type_ids,
    status,
    notes,
    last_qualified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_provider_product_application_history
TO flex_energy_supplier;

-- changeset flex:api-grant-service-provider-product-application-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_id,
    service_provider_id,
    system_operator_id,
    product_type_ids,
    status,
    notes,
    last_qualified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_provider_product_application_history
TO flex_end_user;

-- changeset flex:api-grant-service-provider-product-application-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_id,
    service_provider_id,
    system_operator_id,
    product_type_ids,
    status,
    notes,
    last_qualified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_provider_product_application_history
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-provider-product-application-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_id,
    service_provider_id,
    system_operator_id,
    product_type_ids,
    status,
    notes,
    last_qualified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_provider_product_application_history
TO flex_market_operator;

-- changeset flex:api-grant-service-provider-product-application-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_id,
    service_provider_id,
    system_operator_id,
    product_type_ids,
    status,
    notes,
    last_qualified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_provider_product_application_history
TO flex_system_operator;

-- changeset flex:api-grant-service-provider-product-application-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_id,
    service_provider_id,
    system_operator_id,
    product_type_ids,
    status,
    notes,
    last_qualified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_provider_product_application_history
TO flex_service_provider;

-- changeset flex:api-grant-service-provider-product-application-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_id,
    service_provider_id,
    system_operator_id,
    product_type_ids,
    status,
    notes,
    last_qualified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_provider_product_application_history
TO flex_third_party;

-- changeset flex:api-grant-service-provider-product-application-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.service_provider_product_application_history
TO flex_internal_event_notification;

-- changeset flex:api-grant-service-providing-group-product-application-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_id,
    status,
    notes,
    last_prequalified,
    last_verified,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_product_application
TO flex_balance_responsible_party;

-- changeset flex:api-grant-service-providing-group-product-application-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_id,
    status,
    notes,
    last_prequalified,
    last_verified,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_product_application
TO flex_energy_supplier;

-- changeset flex:api-grant-service-providing-group-product-application-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_id,
    status,
    notes,
    last_prequalified,
    last_verified,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_product_application
TO flex_end_user;

-- changeset flex:api-grant-service-providing-group-product-application-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_id,
    status,
    notes,
    last_prequalified,
    last_verified,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_product_application
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-providing-group-product-application-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    status,
    notes,
    last_prequalified,
    last_verified
) ON TABLE api.service_providing_group_product_application
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-providing-group-product-application-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_id,
    status,
    notes,
    last_prequalified,
    last_verified,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_product_application
TO flex_market_operator;

-- changeset flex:api-grant-service-providing-group-product-application-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_id,
    status,
    notes,
    last_prequalified,
    last_verified,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_product_application
TO flex_system_operator;

-- changeset flex:api-grant-service-providing-group-product-application-so-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    status,
    notes,
    last_prequalified,
    last_verified
) ON TABLE api.service_providing_group_product_application
TO flex_system_operator;

-- changeset flex:api-grant-service-providing-group-product-application-sp-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_id
) ON TABLE api.service_providing_group_product_application
TO flex_service_provider;

-- changeset flex:api-grant-service-providing-group-product-application-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_id,
    status,
    notes,
    last_prequalified,
    last_verified,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_product_application
TO flex_service_provider;

-- changeset flex:api-grant-service-providing-group-product-application-sp-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    status
) ON TABLE api.service_providing_group_product_application
TO flex_service_provider;

-- changeset flex:api-grant-service-providing-group-product-application-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_id,
    status,
    notes,
    last_prequalified,
    last_verified,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group_product_application
TO flex_third_party;

-- changeset flex:api-grant-service-providing-group-product-application-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.service_providing_group_product_application
TO flex_internal_event_notification;

-- changeset flex:api-grant-service-providing-group-product-application-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_product_application_id,
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_id,
    status,
    notes,
    last_prequalified,
    last_verified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_product_application_history
TO flex_balance_responsible_party;

-- changeset flex:api-grant-service-providing-group-product-application-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_product_application_id,
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_id,
    status,
    notes,
    last_prequalified,
    last_verified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_product_application_history
TO flex_energy_supplier;

-- changeset flex:api-grant-service-providing-group-product-application-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_product_application_id,
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_id,
    status,
    notes,
    last_prequalified,
    last_verified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_product_application_history
TO flex_end_user;

-- changeset flex:api-grant-service-providing-group-product-application-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_product_application_id,
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_id,
    status,
    notes,
    last_prequalified,
    last_verified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_product_application_history
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-providing-group-product-application-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_product_application_id,
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_id,
    status,
    notes,
    last_prequalified,
    last_verified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_product_application_history
TO flex_market_operator;

-- changeset flex:api-grant-service-providing-group-product-application-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_product_application_id,
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_id,
    status,
    notes,
    last_prequalified,
    last_verified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_product_application_history
TO flex_system_operator;

-- changeset flex:api-grant-service-providing-group-product-application-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_product_application_id,
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_id,
    status,
    notes,
    last_prequalified,
    last_verified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_product_application_history
TO flex_service_provider;

-- changeset flex:api-grant-service-providing-group-product-application-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_providing_group_product_application_id,
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_id,
    status,
    notes,
    last_prequalified,
    last_verified,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_providing_group_product_application_history
TO flex_third_party;

-- changeset flex:api-grant-service-providing-group-product-application-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.service_providing_group_product_application_history
TO flex_internal_event_notification;

-- changeset flex:api-grant-service-provider-product-application-comment-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_id,
    created_by,
    created_at,
    visibility,
    content,
    recorded_at,
    recorded_by
) ON TABLE api.service_provider_product_application_comment
TO flex_balance_responsible_party;

-- changeset flex:api-grant-service-provider-product-application-comment-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_id,
    created_by,
    created_at,
    visibility,
    content,
    recorded_at,
    recorded_by
) ON TABLE api.service_provider_product_application_comment
TO flex_energy_supplier;

-- changeset flex:api-grant-service-provider-product-application-comment-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_id,
    created_by,
    created_at,
    visibility,
    content,
    recorded_at,
    recorded_by
) ON TABLE api.service_provider_product_application_comment
TO flex_end_user;

-- changeset flex:api-grant-service-provider-product-application-comment-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    service_provider_product_application_id,
    visibility,
    content
) ON TABLE api.service_provider_product_application_comment
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-provider-product-application-comment-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_id,
    created_by,
    created_at,
    visibility,
    content,
    recorded_at,
    recorded_by
) ON TABLE api.service_provider_product_application_comment
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-provider-product-application-comment-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    visibility,
    content
) ON TABLE api.service_provider_product_application_comment
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-provider-product-application-comment-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_id,
    created_by,
    created_at,
    visibility,
    content,
    recorded_at,
    recorded_by
) ON TABLE api.service_provider_product_application_comment
TO flex_market_operator;

-- changeset flex:api-grant-service-provider-product-application-comment-so-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    service_provider_product_application_id,
    visibility,
    content
) ON TABLE api.service_provider_product_application_comment
TO flex_system_operator;

-- changeset flex:api-grant-service-provider-product-application-comment-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_id,
    created_by,
    created_at,
    visibility,
    content,
    recorded_at,
    recorded_by
) ON TABLE api.service_provider_product_application_comment
TO flex_system_operator;

-- changeset flex:api-grant-service-provider-product-application-comment-so-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    visibility,
    content
) ON TABLE api.service_provider_product_application_comment
TO flex_system_operator;

-- changeset flex:api-grant-service-provider-product-application-comment-sp-insert endDelimiter:-- runAlways:true
GRANT INSERT (
    service_provider_product_application_id,
    visibility,
    content
) ON TABLE api.service_provider_product_application_comment
TO flex_service_provider;

-- changeset flex:api-grant-service-provider-product-application-comment-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_id,
    created_by,
    created_at,
    visibility,
    content,
    recorded_at,
    recorded_by
) ON TABLE api.service_provider_product_application_comment
TO flex_service_provider;

-- changeset flex:api-grant-service-provider-product-application-comment-sp-update endDelimiter:-- runAlways:true
GRANT UPDATE (
    visibility,
    content
) ON TABLE api.service_provider_product_application_comment
TO flex_service_provider;

-- changeset flex:api-grant-service-provider-product-application-comment-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_id,
    created_by,
    created_at,
    visibility,
    content,
    recorded_at,
    recorded_by
) ON TABLE api.service_provider_product_application_comment
TO flex_third_party;

-- changeset flex:api-grant-service-provider-product-application-comment-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.service_provider_product_application_comment
TO flex_internal_event_notification;

-- changeset flex:api-grant-service-provider-product-application-comment-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_comment_id,
    service_provider_product_application_id,
    created_by,
    created_at,
    visibility,
    content,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_provider_product_application_comment_history
TO flex_balance_responsible_party;

-- changeset flex:api-grant-service-provider-product-application-comment-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_comment_id,
    service_provider_product_application_id,
    created_by,
    created_at,
    visibility,
    content,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_provider_product_application_comment_history
TO flex_energy_supplier;

-- changeset flex:api-grant-service-provider-product-application-comment-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_comment_id,
    service_provider_product_application_id,
    created_by,
    created_at,
    visibility,
    content,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_provider_product_application_comment_history
TO flex_end_user;

-- changeset flex:api-grant-service-provider-product-application-comment-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_comment_id,
    service_provider_product_application_id,
    created_by,
    created_at,
    visibility,
    content,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_provider_product_application_comment_history
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-service-provider-product-application-comment-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_comment_id,
    service_provider_product_application_id,
    created_by,
    created_at,
    visibility,
    content,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_provider_product_application_comment_history
TO flex_market_operator;

-- changeset flex:api-grant-service-provider-product-application-comment-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_comment_id,
    service_provider_product_application_id,
    created_by,
    created_at,
    visibility,
    content,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_provider_product_application_comment_history
TO flex_system_operator;

-- changeset flex:api-grant-service-provider-product-application-comment-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_comment_id,
    service_provider_product_application_id,
    created_by,
    created_at,
    visibility,
    content,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_provider_product_application_comment_history
TO flex_service_provider;

-- changeset flex:api-grant-service-provider-product-application-comment-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    id,
    service_provider_product_application_comment_id,
    service_provider_product_application_id,
    created_by,
    created_at,
    visibility,
    content,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.service_provider_product_application_comment_history
TO flex_third_party;

-- changeset flex:api-grant-service-provider-product-application-comment-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE api.service_provider_product_application_comment_history
TO flex_internal_event_notification;

-- changeset flex:api-grant-notice-brp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    party_id,
    type,
    source,
    data
) ON TABLE api.notice
TO flex_balance_responsible_party;

-- changeset flex:api-grant-notice-es-select endDelimiter:-- runAlways:true
GRANT SELECT (
    party_id,
    type,
    source,
    data
) ON TABLE api.notice
TO flex_energy_supplier;

-- changeset flex:api-grant-notice-eu-select endDelimiter:-- runAlways:true
GRANT SELECT (
    party_id,
    type,
    source,
    data
) ON TABLE api.notice
TO flex_end_user;

-- changeset flex:api-grant-notice-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT (
    party_id,
    type,
    source,
    data
) ON TABLE api.notice
TO flex_flexibility_information_system_operator;

-- changeset flex:api-grant-notice-mo-select endDelimiter:-- runAlways:true
GRANT SELECT (
    party_id,
    type,
    source,
    data
) ON TABLE api.notice
TO flex_market_operator;

-- changeset flex:api-grant-notice-so-select endDelimiter:-- runAlways:true
GRANT SELECT (
    party_id,
    type,
    source,
    data
) ON TABLE api.notice
TO flex_system_operator;

-- changeset flex:api-grant-notice-sp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    party_id,
    type,
    source,
    data
) ON TABLE api.notice
TO flex_service_provider;

-- changeset flex:api-grant-notice-tp-select endDelimiter:-- runAlways:true
GRANT SELECT (
    party_id,
    type,
    source,
    data
) ON TABLE api.notice
TO flex_third_party;
