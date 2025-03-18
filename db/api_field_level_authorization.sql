-- AUTO-GENERATED FILE (just permissions-to-db)

SET search_path TO api;

GRANT SELECT (
    id,
    name,
    type,
    business_id,
    business_id_type,
    client_id,
    client_secret,
    client_public_key
) ON TABLE api.entity
TO flex_balance_responsible_party;

GRANT SELECT (
    id,
    name,
    type,
    business_id,
    business_id_type,
    client_id,
    client_secret,
    client_public_key
) ON TABLE api.entity
TO flex_energy_supplier;

GRANT SELECT (
    id,
    name,
    type,
    business_id,
    business_id_type,
    client_id,
    client_secret,
    client_public_key
) ON TABLE api.entity
TO flex_end_user;

GRANT SELECT (
    id,
    name,
    type,
    business_id,
    business_id_type,
    client_id,
    client_secret,
    client_public_key
) ON TABLE api.entity
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    name,
    type,
    business_id,
    business_id_type,
    client_id,
    client_secret,
    client_public_key
) ON TABLE api.entity
TO flex_market_operator;

GRANT SELECT (
    id,
    name,
    type,
    business_id,
    business_id_type,
    client_id,
    client_secret,
    client_public_key
) ON TABLE api.entity
TO flex_system_operator;

GRANT SELECT (
    id,
    name,
    type,
    business_id,
    business_id_type,
    client_id,
    client_secret,
    client_public_key
) ON TABLE api.entity
TO flex_service_provider;

GRANT SELECT (
    id,
    name,
    type,
    business_id,
    business_id_type,
    client_id,
    client_secret,
    client_public_key
) ON TABLE api.entity
TO flex_third_party;

GRANT SELECT (
    id,
    name,
    type,
    business_id,
    business_id_type,
    client_id,
    client_secret,
    client_public_key
) ON TABLE api.entity
TO flex_entity;

GRANT UPDATE (
    client_secret,
    client_public_key
) ON TABLE api.entity
TO flex_entity;

GRANT SELECT (
    id,
    entity_id,
    client_id,
    secret,
    public_key,
    recorded_at,
    recorded_by
) ON TABLE api.client
TO flex_balance_responsible_party;

GRANT SELECT (
    id,
    entity_id,
    client_id,
    secret,
    public_key,
    recorded_at,
    recorded_by
) ON TABLE api.client
TO flex_energy_supplier;

GRANT SELECT (
    id,
    entity_id,
    client_id,
    secret,
    public_key,
    recorded_at,
    recorded_by
) ON TABLE api.client
TO flex_end_user;

GRANT SELECT (
    id,
    entity_id,
    client_id,
    secret,
    public_key,
    recorded_at,
    recorded_by
) ON TABLE api.client
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    entity_id,
    client_id,
    secret,
    public_key,
    recorded_at,
    recorded_by
) ON TABLE api.client
TO flex_market_operator;

GRANT SELECT (
    id,
    entity_id,
    client_id,
    secret,
    public_key,
    recorded_at,
    recorded_by
) ON TABLE api.client
TO flex_system_operator;

GRANT SELECT (
    id,
    entity_id,
    client_id,
    secret,
    public_key,
    recorded_at,
    recorded_by
) ON TABLE api.client
TO flex_service_provider;

GRANT SELECT (
    id,
    entity_id,
    client_id,
    secret,
    public_key,
    recorded_at,
    recorded_by
) ON TABLE api.client
TO flex_third_party;

GRANT INSERT (
    entity_id,
    client_id,
    secret,
    public_key
) ON TABLE api.client
TO flex_entity;

GRANT SELECT (
    id,
    entity_id,
    client_id,
    secret,
    public_key,
    recorded_at,
    recorded_by
) ON TABLE api.client
TO flex_entity;

GRANT UPDATE (
    client_id,
    secret,
    public_key
) ON TABLE api.client
TO flex_entity;

GRANT DELETE ON TABLE api.client
TO flex_entity;

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

GRANT INSERT (
    name,
    business_id,
    business_id_type,
    entity_id,
    type,
    role
) ON TABLE api.party
TO flex_flexibility_information_system_operator;

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

GRANT UPDATE (
    name,
    status
) ON TABLE api.party
TO flex_flexibility_information_system_operator;

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

GRANT SELECT ON TABLE api.party
TO flex_internal_event_notification;

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

GRANT SELECT ON TABLE api.party_history
TO flex_internal_event_notification;

GRANT SELECT (
    id,
    entity_id,
    entity_name,
    party_id,
    party_name
) ON TABLE api.identity
TO flex_balance_responsible_party;

GRANT SELECT (
    id,
    entity_id,
    entity_name,
    party_id,
    party_name
) ON TABLE api.identity
TO flex_energy_supplier;

GRANT SELECT (
    id,
    entity_id,
    entity_name,
    party_id,
    party_name
) ON TABLE api.identity
TO flex_end_user;

GRANT SELECT (
    id,
    entity_id,
    entity_name,
    party_id,
    party_name
) ON TABLE api.identity
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    entity_id,
    entity_name,
    party_id,
    party_name
) ON TABLE api.identity
TO flex_market_operator;

GRANT SELECT (
    id,
    entity_id,
    entity_name,
    party_id,
    party_name
) ON TABLE api.identity
TO flex_system_operator;

GRANT SELECT (
    id,
    entity_id,
    entity_name,
    party_id,
    party_name
) ON TABLE api.identity
TO flex_service_provider;

GRANT SELECT (
    id,
    entity_id,
    entity_name,
    party_id,
    party_name
) ON TABLE api.identity
TO flex_third_party;

GRANT SELECT (
    id,
    entity_id,
    entity_name,
    party_id,
    party_name
) ON TABLE api.identity
TO flex_entity;

GRANT SELECT (
    id,
    entity_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.party_membership
TO flex_balance_responsible_party;

GRANT SELECT (
    id,
    entity_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.party_membership
TO flex_energy_supplier;

GRANT SELECT (
    id,
    entity_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.party_membership
TO flex_end_user;

GRANT INSERT (
    entity_id,
    party_id
) ON TABLE api.party_membership
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    entity_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.party_membership
TO flex_flexibility_information_system_operator;

GRANT DELETE ON TABLE api.party_membership
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    entity_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.party_membership
TO flex_market_operator;

GRANT SELECT (
    id,
    entity_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.party_membership
TO flex_system_operator;

GRANT SELECT (
    id,
    entity_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.party_membership
TO flex_service_provider;

GRANT SELECT (
    id,
    entity_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.party_membership
TO flex_third_party;

GRANT SELECT (
    id,
    entity_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.party_membership
TO flex_entity;

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
    connecting_system_operator_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit
TO flex_balance_responsible_party;

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
    connecting_system_operator_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit
TO flex_energy_supplier;

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
    connecting_system_operator_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit
TO flex_end_user;

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
    connecting_system_operator_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit
TO flex_flexibility_information_system_operator;

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
    connecting_system_operator_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit
TO flex_market_operator;

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
    connecting_system_operator_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit
TO flex_system_operator;

GRANT UPDATE (
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated
) ON TABLE api.controllable_unit
TO flex_system_operator;

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
    connecting_system_operator_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit
TO flex_service_provider;

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
    connecting_system_operator_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit
TO flex_third_party;

GRANT SELECT ON TABLE api.controllable_unit
TO flex_internal_event_notification;

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
    connecting_system_operator_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_history
TO flex_balance_responsible_party;

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
    connecting_system_operator_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_history
TO flex_energy_supplier;

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
    connecting_system_operator_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_history
TO flex_end_user;

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
    connecting_system_operator_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_history
TO flex_flexibility_information_system_operator;

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
    connecting_system_operator_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_history
TO flex_market_operator;

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
    connecting_system_operator_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_history
TO flex_system_operator;

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
    connecting_system_operator_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_history
TO flex_service_provider;

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
    connecting_system_operator_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_history
TO flex_third_party;

GRANT SELECT ON TABLE api.controllable_unit_history
TO flex_internal_event_notification;

GRANT SELECT (
    id,
    controllable_unit_id,
    service_provider_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit_service_provider
TO flex_balance_responsible_party;

GRANT SELECT (
    id,
    controllable_unit_id,
    service_provider_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit_service_provider
TO flex_energy_supplier;

GRANT SELECT (
    id,
    controllable_unit_id,
    service_provider_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit_service_provider
TO flex_end_user;

GRANT INSERT (
    controllable_unit_id,
    service_provider_id,
    contract_reference,
    valid_from,
    valid_to
) ON TABLE api.controllable_unit_service_provider
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    controllable_unit_id,
    service_provider_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit_service_provider
TO flex_flexibility_information_system_operator;

GRANT UPDATE (
    contract_reference,
    valid_from,
    valid_to
) ON TABLE api.controllable_unit_service_provider
TO flex_flexibility_information_system_operator;

GRANT DELETE ON TABLE api.controllable_unit_service_provider
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    controllable_unit_id,
    service_provider_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit_service_provider
TO flex_market_operator;

GRANT SELECT (
    id,
    controllable_unit_id,
    service_provider_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit_service_provider
TO flex_system_operator;

GRANT INSERT (
    controllable_unit_id,
    service_provider_id,
    contract_reference,
    valid_from,
    valid_to
) ON TABLE api.controllable_unit_service_provider
TO flex_service_provider;

GRANT SELECT (
    id,
    controllable_unit_id,
    service_provider_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit_service_provider
TO flex_service_provider;

GRANT UPDATE (
    contract_reference,
    valid_from,
    valid_to
) ON TABLE api.controllable_unit_service_provider
TO flex_service_provider;

GRANT DELETE ON TABLE api.controllable_unit_service_provider
TO flex_service_provider;

GRANT SELECT (
    id,
    controllable_unit_id,
    service_provider_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    recorded_by
) ON TABLE api.controllable_unit_service_provider
TO flex_third_party;

GRANT SELECT ON TABLE api.controllable_unit_service_provider
TO flex_internal_event_notification;

GRANT SELECT (
    id,
    controllable_unit_service_provider_id,
    controllable_unit_id,
    service_provider_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_service_provider_history
TO flex_balance_responsible_party;

GRANT SELECT (
    id,
    controllable_unit_service_provider_id,
    controllable_unit_id,
    service_provider_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_service_provider_history
TO flex_energy_supplier;

GRANT SELECT (
    id,
    controllable_unit_service_provider_id,
    controllable_unit_id,
    service_provider_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_service_provider_history
TO flex_end_user;

GRANT SELECT (
    id,
    controllable_unit_service_provider_id,
    controllable_unit_id,
    service_provider_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_service_provider_history
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    controllable_unit_service_provider_id,
    controllable_unit_id,
    service_provider_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_service_provider_history
TO flex_market_operator;

GRANT SELECT (
    id,
    controllable_unit_service_provider_id,
    controllable_unit_id,
    service_provider_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_service_provider_history
TO flex_system_operator;

GRANT SELECT (
    id,
    controllable_unit_service_provider_id,
    controllable_unit_id,
    service_provider_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_service_provider_history
TO flex_service_provider;

GRANT SELECT (
    id,
    controllable_unit_service_provider_id,
    controllable_unit_id,
    service_provider_id,
    contract_reference,
    valid_from,
    valid_to,
    recorded_at,
    replaced_at,
    recorded_by,
    replaced_by
) ON TABLE api.controllable_unit_service_provider_history
TO flex_third_party;

GRANT SELECT ON TABLE api.controllable_unit_service_provider_history
TO flex_internal_event_notification;

GRANT SELECT (
    id,
    name,
    service_provider_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group
TO flex_balance_responsible_party;

GRANT SELECT (
    id,
    name,
    service_provider_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group
TO flex_energy_supplier;

GRANT SELECT (
    id,
    name,
    service_provider_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group
TO flex_end_user;

GRANT INSERT (
    name,
    service_provider_id
) ON TABLE api.service_providing_group
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    name,
    service_provider_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group
TO flex_flexibility_information_system_operator;

GRANT UPDATE (
    name,
    status
) ON TABLE api.service_providing_group
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    name,
    service_provider_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group
TO flex_market_operator;

GRANT SELECT (
    id,
    name,
    service_provider_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group
TO flex_system_operator;

GRANT INSERT (
    name,
    service_provider_id
) ON TABLE api.service_providing_group
TO flex_service_provider;

GRANT SELECT (
    id,
    name,
    service_provider_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group
TO flex_service_provider;

GRANT UPDATE (
    name,
    status
) ON TABLE api.service_providing_group
TO flex_service_provider;

GRANT SELECT (
    id,
    name,
    service_provider_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.service_providing_group
TO flex_third_party;

GRANT SELECT ON TABLE api.service_providing_group
TO flex_internal_event_notification;

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

GRANT SELECT ON TABLE api.service_providing_group_history
TO flex_internal_event_notification;

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

GRANT INSERT (
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to
) ON TABLE api.service_providing_group_membership
TO flex_flexibility_information_system_operator;

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

GRANT UPDATE (
    valid_from,
    valid_to
) ON TABLE api.service_providing_group_membership
TO flex_flexibility_information_system_operator;

GRANT DELETE ON TABLE api.service_providing_group_membership
TO flex_flexibility_information_system_operator;

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

GRANT INSERT (
    controllable_unit_id,
    service_providing_group_id,
    valid_from,
    valid_to
) ON TABLE api.service_providing_group_membership
TO flex_service_provider;

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

GRANT UPDATE (
    valid_from,
    valid_to
) ON TABLE api.service_providing_group_membership
TO flex_service_provider;

GRANT DELETE ON TABLE api.service_providing_group_membership
TO flex_service_provider;

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

GRANT SELECT ON TABLE api.service_providing_group_membership
TO flex_internal_event_notification;

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

GRANT SELECT ON TABLE api.service_providing_group_membership_history
TO flex_internal_event_notification;

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

GRANT INSERT (
    service_providing_group_id,
    impacted_system_operator_id
) ON TABLE api.service_providing_group_grid_prequalification
TO flex_flexibility_information_system_operator;

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

GRANT UPDATE (
    status,
    last_prequalified
) ON TABLE api.service_providing_group_grid_prequalification
TO flex_flexibility_information_system_operator;

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

GRANT UPDATE (
    status,
    notes,
    last_prequalified
) ON TABLE api.service_providing_group_grid_prequalification
TO flex_system_operator;

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

GRANT SELECT ON TABLE api.service_providing_group_grid_prequalification
TO flex_internal_event_notification;

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

GRANT SELECT ON TABLE api.service_providing_group_grid_prequalification_history
TO flex_internal_event_notification;

GRANT SELECT (
    id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    recorded_by
) ON TABLE api.technical_resource
TO flex_balance_responsible_party;

GRANT SELECT (
    id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    recorded_by
) ON TABLE api.technical_resource
TO flex_energy_supplier;

GRANT SELECT (
    id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    recorded_by
) ON TABLE api.technical_resource
TO flex_end_user;

GRANT INSERT (
    name,
    controllable_unit_id,
    details
) ON TABLE api.technical_resource
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    recorded_by
) ON TABLE api.technical_resource
TO flex_flexibility_information_system_operator;

GRANT UPDATE (
    name,
    details
) ON TABLE api.technical_resource
TO flex_flexibility_information_system_operator;

GRANT DELETE ON TABLE api.technical_resource
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    recorded_by
) ON TABLE api.technical_resource
TO flex_market_operator;

GRANT SELECT (
    id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    recorded_by
) ON TABLE api.technical_resource
TO flex_system_operator;

GRANT INSERT (
    name,
    controllable_unit_id,
    details
) ON TABLE api.technical_resource
TO flex_service_provider;

GRANT SELECT (
    id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    recorded_by
) ON TABLE api.technical_resource
TO flex_service_provider;

GRANT UPDATE (
    name,
    details
) ON TABLE api.technical_resource
TO flex_service_provider;

GRANT DELETE ON TABLE api.technical_resource
TO flex_service_provider;

GRANT SELECT (
    id,
    name,
    controllable_unit_id,
    details,
    recorded_at,
    recorded_by
) ON TABLE api.technical_resource
TO flex_third_party;

GRANT SELECT ON TABLE api.technical_resource
TO flex_internal_event_notification;

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

GRANT SELECT ON TABLE api.technical_resource_history
TO flex_internal_event_notification;

GRANT SELECT (
    id,
    specversion,
    time,
    type,
    source,
    data
) ON TABLE api.event
TO flex_balance_responsible_party;

GRANT SELECT (
    id,
    specversion,
    time,
    type,
    source,
    data
) ON TABLE api.event
TO flex_energy_supplier;

GRANT SELECT (
    id,
    specversion,
    time,
    type,
    source,
    data
) ON TABLE api.event
TO flex_end_user;

GRANT SELECT (
    id,
    specversion,
    time,
    type,
    source,
    data
) ON TABLE api.event
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    specversion,
    time,
    type,
    source,
    data
) ON TABLE api.event
TO flex_market_operator;

GRANT SELECT (
    id,
    specversion,
    time,
    type,
    source,
    data
) ON TABLE api.event
TO flex_system_operator;

GRANT SELECT (
    id,
    specversion,
    time,
    type,
    source,
    data
) ON TABLE api.event
TO flex_service_provider;

GRANT SELECT (
    id,
    specversion,
    time,
    type,
    source,
    data
) ON TABLE api.event
TO flex_third_party;

GRANT SELECT ON TABLE api.event
TO flex_internal_event_notification;

GRANT SELECT (
    id,
    acknowledged,
    event_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.notification
TO flex_balance_responsible_party;

GRANT UPDATE (
    acknowledged
) ON TABLE api.notification
TO flex_balance_responsible_party;

GRANT SELECT (
    id,
    acknowledged,
    event_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.notification
TO flex_energy_supplier;

GRANT UPDATE (
    acknowledged
) ON TABLE api.notification
TO flex_energy_supplier;

GRANT SELECT (
    id,
    acknowledged,
    event_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.notification
TO flex_end_user;

GRANT UPDATE (
    acknowledged
) ON TABLE api.notification
TO flex_end_user;

GRANT SELECT (
    id,
    acknowledged,
    event_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.notification
TO flex_flexibility_information_system_operator;

GRANT UPDATE (
    acknowledged
) ON TABLE api.notification
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    acknowledged,
    event_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.notification
TO flex_market_operator;

GRANT UPDATE (
    acknowledged
) ON TABLE api.notification
TO flex_market_operator;

GRANT SELECT (
    id,
    acknowledged,
    event_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.notification
TO flex_system_operator;

GRANT UPDATE (
    acknowledged
) ON TABLE api.notification
TO flex_system_operator;

GRANT SELECT (
    id,
    acknowledged,
    event_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.notification
TO flex_service_provider;

GRANT UPDATE (
    acknowledged
) ON TABLE api.notification
TO flex_service_provider;

GRANT SELECT (
    id,
    acknowledged,
    event_id,
    party_id,
    recorded_at,
    recorded_by
) ON TABLE api.notification
TO flex_third_party;

GRANT UPDATE (
    acknowledged
) ON TABLE api.notification
TO flex_third_party;

GRANT INSERT (
    event_id,
    party_id
) ON TABLE api.notification
TO flex_internal_event_notification;

GRANT SELECT ON TABLE api.notification
TO flex_internal_event_notification;

GRANT SELECT (
    id,
    business_id,
    system_operator_id
) ON TABLE api.accounting_point
TO flex_balance_responsible_party;

GRANT SELECT (
    id,
    business_id,
    system_operator_id
) ON TABLE api.accounting_point
TO flex_energy_supplier;

GRANT SELECT (
    id,
    business_id,
    system_operator_id
) ON TABLE api.accounting_point
TO flex_end_user;

GRANT SELECT (
    id,
    business_id,
    system_operator_id
) ON TABLE api.accounting_point
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    business_id,
    system_operator_id
) ON TABLE api.accounting_point
TO flex_market_operator;

GRANT SELECT (
    id,
    business_id,
    system_operator_id
) ON TABLE api.accounting_point
TO flex_system_operator;

GRANT SELECT (
    id,
    business_id,
    system_operator_id
) ON TABLE api.accounting_point
TO flex_service_provider;

GRANT SELECT (
    id,
    business_id,
    system_operator_id
) ON TABLE api.accounting_point
TO flex_third_party;

GRANT SELECT ON TABLE api.accounting_point
TO flex_internal_event_notification;

GRANT SELECT (
    id,
    business_id,
    category,
    market,
    market_type,
    examples,
    notes
) ON TABLE api.product_type
TO flex_balance_responsible_party;

GRANT SELECT (
    id,
    business_id,
    category,
    market,
    market_type,
    examples,
    notes
) ON TABLE api.product_type
TO flex_energy_supplier;

GRANT SELECT (
    id,
    business_id,
    category,
    market,
    market_type,
    examples,
    notes
) ON TABLE api.product_type
TO flex_end_user;

GRANT SELECT (
    id,
    business_id,
    category,
    market,
    market_type,
    examples,
    notes
) ON TABLE api.product_type
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    business_id,
    category,
    market,
    market_type,
    examples,
    notes
) ON TABLE api.product_type
TO flex_market_operator;

GRANT SELECT (
    id,
    business_id,
    category,
    market,
    market_type,
    examples,
    notes
) ON TABLE api.product_type
TO flex_system_operator;

GRANT SELECT (
    id,
    business_id,
    category,
    market,
    market_type,
    examples,
    notes
) ON TABLE api.product_type
TO flex_service_provider;

GRANT SELECT (
    id,
    business_id,
    category,
    market,
    market_type,
    examples,
    notes
) ON TABLE api.product_type
TO flex_third_party;

GRANT SELECT (
    id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.system_operator_product_type
TO flex_balance_responsible_party;

GRANT SELECT (
    id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.system_operator_product_type
TO flex_energy_supplier;

GRANT SELECT (
    id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.system_operator_product_type
TO flex_end_user;

GRANT INSERT (
    system_operator_id,
    product_type_id
) ON TABLE api.system_operator_product_type
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.system_operator_product_type
TO flex_flexibility_information_system_operator;

GRANT UPDATE (
    status
) ON TABLE api.system_operator_product_type
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.system_operator_product_type
TO flex_market_operator;

GRANT INSERT (
    system_operator_id,
    product_type_id
) ON TABLE api.system_operator_product_type
TO flex_system_operator;

GRANT SELECT (
    id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.system_operator_product_type
TO flex_system_operator;

GRANT UPDATE (
    status
) ON TABLE api.system_operator_product_type
TO flex_system_operator;

GRANT SELECT (
    id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.system_operator_product_type
TO flex_service_provider;

GRANT SELECT (
    id,
    system_operator_id,
    product_type_id,
    status,
    recorded_at,
    recorded_by
) ON TABLE api.system_operator_product_type
TO flex_third_party;

GRANT SELECT ON TABLE api.system_operator_product_type
TO flex_internal_event_notification;

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

GRANT SELECT ON TABLE api.system_operator_product_type_history
TO flex_internal_event_notification;

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

GRANT UPDATE (
    product_type_ids,
    status,
    notes,
    last_qualified
) ON TABLE api.service_provider_product_application
TO flex_flexibility_information_system_operator;

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

GRANT UPDATE (
    status,
    notes,
    last_qualified
) ON TABLE api.service_provider_product_application
TO flex_system_operator;

GRANT INSERT (
    service_provider_id,
    system_operator_id,
    product_type_ids
) ON TABLE api.service_provider_product_application
TO flex_service_provider;

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

GRANT UPDATE (
    product_type_ids
) ON TABLE api.service_provider_product_application
TO flex_service_provider;

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

GRANT SELECT ON TABLE api.service_provider_product_application
TO flex_internal_event_notification;

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

GRANT SELECT ON TABLE api.service_provider_product_application_history
TO flex_internal_event_notification;

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

GRANT UPDATE (
    status,
    notes,
    last_prequalified,
    last_verified
) ON TABLE api.service_providing_group_product_application
TO flex_flexibility_information_system_operator;

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

GRANT UPDATE (
    status,
    notes,
    last_prequalified,
    last_verified
) ON TABLE api.service_providing_group_product_application
TO flex_system_operator;

GRANT INSERT (
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_id
) ON TABLE api.service_providing_group_product_application
TO flex_service_provider;

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

GRANT UPDATE (
    status
) ON TABLE api.service_providing_group_product_application
TO flex_service_provider;

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

GRANT SELECT ON TABLE api.service_providing_group_product_application
TO flex_internal_event_notification;

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

GRANT SELECT ON TABLE api.service_providing_group_product_application_history
TO flex_internal_event_notification;

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

GRANT INSERT (
    service_provider_product_application_id,
    visibility,
    content
) ON TABLE api.service_provider_product_application_comment
TO flex_flexibility_information_system_operator;

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

GRANT UPDATE (
    visibility,
    content
) ON TABLE api.service_provider_product_application_comment
TO flex_flexibility_information_system_operator;

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

GRANT INSERT (
    service_provider_product_application_id,
    visibility,
    content
) ON TABLE api.service_provider_product_application_comment
TO flex_system_operator;

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

GRANT UPDATE (
    visibility,
    content
) ON TABLE api.service_provider_product_application_comment
TO flex_system_operator;

GRANT INSERT (
    service_provider_product_application_id,
    visibility,
    content
) ON TABLE api.service_provider_product_application_comment
TO flex_service_provider;

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

GRANT UPDATE (
    visibility,
    content
) ON TABLE api.service_provider_product_application_comment
TO flex_service_provider;

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

GRANT SELECT ON TABLE api.service_provider_product_application_comment
TO flex_internal_event_notification;

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

GRANT SELECT ON TABLE api.service_provider_product_application_comment_history
TO flex_internal_event_notification;

GRANT SELECT (
    id,
    party_id,
    type,
    source,
    data
) ON TABLE api.notice
TO flex_balance_responsible_party;

GRANT SELECT (
    id,
    party_id,
    type,
    source,
    data
) ON TABLE api.notice
TO flex_energy_supplier;

GRANT SELECT (
    id,
    party_id,
    type,
    source,
    data
) ON TABLE api.notice
TO flex_end_user;

GRANT SELECT (
    id,
    party_id,
    type,
    source,
    data
) ON TABLE api.notice
TO flex_flexibility_information_system_operator;

GRANT SELECT (
    id,
    party_id,
    type,
    source,
    data
) ON TABLE api.notice
TO flex_market_operator;

GRANT SELECT (
    id,
    party_id,
    type,
    source,
    data
) ON TABLE api.notice
TO flex_system_operator;

GRANT SELECT (
    id,
    party_id,
    type,
    source,
    data
) ON TABLE api.notice
TO flex_service_provider;

GRANT SELECT (
    id,
    party_id,
    type,
    source,
    data
) ON TABLE api.notice
TO flex_third_party;
