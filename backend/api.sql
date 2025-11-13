-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE SCHEMA api;

CREATE TABLE api.controllable_unit (
    id bigint NOT NULL,
    business_id text NOT NULL,
    name text NOT NULL,
    start_date date NULL,
    status text NOT NULL,
    regulation_direction text NOT NULL,
    maximum_available_capacity decimal NOT NULL,
    is_small boolean NOT NULL,
    minimum_duration bigint NULL,
    maximum_duration bigint NULL,
    recovery_duration bigint NULL,
    ramp_rate decimal NULL,
    accounting_point_id bigint NOT NULL,
    grid_node_id text NULL,
    grid_validation_status text NOT NULL,
    grid_validation_notes text NULL,
    validated_at timestamp with time zone NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.controllable_unit_history (
    controllable_unit_id bigint NOT NULL,
    id bigint NOT NULL,
    business_id text NOT NULL,
    name text NOT NULL,
    start_date date NULL,
    status text NOT NULL,
    regulation_direction text NOT NULL,
    maximum_available_capacity decimal NOT NULL,
    is_small boolean NOT NULL,
    minimum_duration bigint NULL,
    maximum_duration bigint NULL,
    recovery_duration bigint NULL,
    ramp_rate decimal NULL,
    accounting_point_id bigint NOT NULL,
    grid_node_id text NULL,
    grid_validation_status text NOT NULL,
    grid_validation_notes text NULL,
    validated_at timestamp with time zone NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);
CREATE TABLE api.controllable_unit_suspension (
    id bigint NOT NULL,
    controllable_unit_id bigint NOT NULL,
    impacted_system_operator_id bigint NOT NULL,
    reason text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.controllable_unit_suspension_history (
    controllable_unit_suspension_id bigint NOT NULL,
    id bigint NOT NULL,
    controllable_unit_id bigint NOT NULL,
    impacted_system_operator_id bigint NOT NULL,
    reason text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);
CREATE TABLE api.controllable_unit_service_provider (
    id bigint NOT NULL,
    controllable_unit_id bigint NOT NULL,
    service_provider_id bigint NOT NULL,
    end_user_id bigint NOT NULL,
    contract_reference text NOT NULL,
    valid_from timestamp with time zone NULL,
    valid_to timestamp with time zone NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.controllable_unit_service_provider_history (
    controllable_unit_service_provider_id bigint NOT NULL,
    id bigint NOT NULL,
    controllable_unit_id bigint NOT NULL,
    service_provider_id bigint NOT NULL,
    end_user_id bigint NOT NULL,
    contract_reference text NOT NULL,
    valid_from timestamp with time zone NULL,
    valid_to timestamp with time zone NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);
CREATE TABLE api.service_providing_group (
    id bigint NOT NULL,
    name text NOT NULL,
    service_provider_id bigint NOT NULL,
    status text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.service_providing_group_history (
    service_providing_group_id bigint NOT NULL,
    id bigint NOT NULL,
    name text NOT NULL,
    service_provider_id bigint NOT NULL,
    status text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);
CREATE TABLE api.service_providing_group_membership (
    id bigint NOT NULL,
    controllable_unit_id bigint NOT NULL,
    service_providing_group_id bigint NOT NULL,
    valid_from timestamp with time zone NOT NULL,
    valid_to timestamp with time zone NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.service_providing_group_membership_history (
    service_providing_group_membership_id bigint NOT NULL,
    id bigint NOT NULL,
    controllable_unit_id bigint NOT NULL,
    service_providing_group_id bigint NOT NULL,
    valid_from timestamp with time zone NOT NULL,
    valid_to timestamp with time zone NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);
CREATE TABLE api.service_providing_group_grid_prequalification (
    id bigint NOT NULL,
    service_providing_group_id bigint NOT NULL,
    impacted_system_operator_id bigint NOT NULL,
    status text NOT NULL,
    notes text NULL,
    prequalified_at timestamp with time zone NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.service_providing_group_grid_prequalification_history (
    service_providing_group_grid_prequalification_id bigint NOT NULL,
    id bigint NOT NULL,
    service_providing_group_id bigint NOT NULL,
    impacted_system_operator_id bigint NOT NULL,
    status text NOT NULL,
    notes text NULL,
    prequalified_at timestamp with time zone NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);
CREATE TABLE api.service_providing_group_grid_suspension (
    id bigint NOT NULL,
    impacted_system_operator_id bigint NOT NULL,
    service_providing_group_id bigint NOT NULL,
    reason text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.service_providing_group_grid_suspension_history (
    service_providing_group_grid_suspension_id bigint NOT NULL,
    id bigint NOT NULL,
    impacted_system_operator_id bigint NOT NULL,
    service_providing_group_id bigint NOT NULL,
    reason text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);
CREATE TABLE api.service_providing_group_grid_suspension_comment (
    id bigint NOT NULL,
    service_providing_group_grid_suspension_id bigint NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    visibility text NOT NULL,
    content text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.service_providing_group_grid_suspension_comment_history (
    service_providing_group_grid_suspension_comment_id bigint NOT NULL,
    id bigint NOT NULL,
    service_providing_group_grid_suspension_id bigint NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    visibility text NOT NULL,
    content text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);
CREATE TABLE api.entity (
    id bigint NOT NULL,
    business_id text NOT NULL,
    business_id_type text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.entity_client (
    id bigint NOT NULL,
    entity_id bigint NOT NULL,
    name text NULL,
    client_id text NOT NULL,
    party_id bigint NOT NULL,
    scopes text [] NOT NULL,
    client_secret text NULL,
    public_key text NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.party (
    id bigint NOT NULL,
    business_id text NOT NULL,
    business_id_type text NOT NULL,
    entity_id bigint NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    type text NOT NULL,
    status text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.party_history (
    party_id bigint NOT NULL,
    id bigint NOT NULL,
    business_id text NOT NULL,
    business_id_type text NOT NULL,
    entity_id bigint NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    type text NOT NULL,
    status text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);
CREATE TABLE api.party_membership (
    id bigint NOT NULL,
    party_id bigint NOT NULL,
    entity_id bigint NOT NULL,
    scopes text [] NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.party_membership_history (
    party_membership_id bigint NOT NULL,
    id bigint NOT NULL,
    party_id bigint NOT NULL,
    entity_id bigint NOT NULL,
    scopes text [] NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);
CREATE TABLE api.identity (
    id bigint NOT NULL,
    entity_id bigint NOT NULL,
    entity_name text NOT NULL,
    party_id bigint NULL,
    party_name text NULL
);
CREATE TABLE api.technical_resource (
    id bigint NOT NULL,
    name text NOT NULL,
    controllable_unit_id bigint NOT NULL,
    details text NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.technical_resource_history (
    technical_resource_id bigint NOT NULL,
    id bigint NOT NULL,
    name text NOT NULL,
    controllable_unit_id bigint NOT NULL,
    details text NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);
CREATE TABLE api.event (
    id bigint NOT NULL,
    specversion text NOT NULL,
    time timestamp with time zone NOT NULL,
    type text NOT NULL,
    source text NOT NULL,
    data text NULL
);
CREATE TABLE api.notification (
    id bigint NOT NULL,
    acknowledged boolean NOT NULL,
    event_id bigint NOT NULL,
    party_id bigint NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.accounting_point (
    id bigint NOT NULL,
    business_id text NOT NULL,
    system_operator_id bigint NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.accounting_point_balance_responsible_party (
    accounting_point_id bigint NOT NULL,
    balance_responsible_party_id bigint NOT NULL,
    energy_direction text NOT NULL,
    valid_from timestamp with time zone NOT NULL,
    valid_to timestamp with time zone NULL
);
CREATE TABLE api.accounting_point_energy_supplier (
    accounting_point_id bigint NOT NULL,
    energy_supplier_id bigint NOT NULL,
    valid_from timestamp with time zone NOT NULL,
    valid_to timestamp with time zone NULL
);
CREATE TABLE api.product_type (
    id bigint NOT NULL,
    business_id text NOT NULL,
    name text NOT NULL,
    service text NOT NULL,
    products text NOT NULL
);
CREATE TABLE api.system_operator_product_type (
    id bigint NOT NULL,
    system_operator_id bigint NOT NULL,
    product_type_id bigint NOT NULL,
    status text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.system_operator_product_type_history (
    system_operator_product_type_id bigint NOT NULL,
    id bigint NOT NULL,
    system_operator_id bigint NOT NULL,
    product_type_id bigint NOT NULL,
    status text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);
CREATE TABLE api.service_provider_product_application (
    id bigint NOT NULL,
    service_provider_id bigint NOT NULL,
    system_operator_id bigint NOT NULL,
    product_type_ids bigint [] NOT NULL,
    status text NOT NULL,
    notes text NULL,
    qualified_at timestamp with time zone NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.service_provider_product_application_history (
    service_provider_product_application_id bigint NOT NULL,
    id bigint NOT NULL,
    service_provider_id bigint NOT NULL,
    system_operator_id bigint NOT NULL,
    product_type_ids bigint [] NOT NULL,
    status text NOT NULL,
    notes text NULL,
    qualified_at timestamp with time zone NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);
CREATE TABLE api.service_provider_product_application_comment (
    id bigint NOT NULL,
    service_provider_product_application_id bigint NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    visibility text NOT NULL,
    content text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.service_provider_product_application_comment_history (
    service_provider_product_application_comment_id bigint NOT NULL,
    id bigint NOT NULL,
    service_provider_product_application_id bigint NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    visibility text NOT NULL,
    content text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);
CREATE TABLE api.service_provider_product_suspension (
    id bigint NOT NULL,
    procuring_system_operator_id bigint NOT NULL,
    service_provider_id bigint NOT NULL,
    product_type_ids bigint [] NOT NULL,
    reason text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.service_provider_product_suspension_history (
    service_provider_product_suspension_id bigint NOT NULL,
    id bigint NOT NULL,
    procuring_system_operator_id bigint NOT NULL,
    service_provider_id bigint NOT NULL,
    product_type_ids bigint [] NOT NULL,
    reason text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);
CREATE TABLE api.service_provider_product_suspension_comment (
    id bigint NOT NULL,
    service_provider_product_suspension_id bigint NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    visibility text NOT NULL,
    content text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.service_provider_product_suspension_comment_history (
    service_provider_product_suspension_comment_id bigint NOT NULL,
    id bigint NOT NULL,
    service_provider_product_suspension_id bigint NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    visibility text NOT NULL,
    content text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);
CREATE TABLE api.service_providing_group_product_application (
    id bigint NOT NULL,
    service_providing_group_id bigint NOT NULL,
    procuring_system_operator_id bigint NOT NULL,
    product_type_ids bigint [] NOT NULL,
    status text NOT NULL,
    notes text NULL,
    prequalified_at timestamp with time zone NULL,
    verified_at timestamp with time zone NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.service_providing_group_product_application_history (
    service_providing_group_product_application_id bigint NOT NULL,
    id bigint NOT NULL,
    service_providing_group_id bigint NOT NULL,
    procuring_system_operator_id bigint NOT NULL,
    product_type_ids bigint [] NOT NULL,
    status text NOT NULL,
    notes text NULL,
    prequalified_at timestamp with time zone NULL,
    verified_at timestamp with time zone NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);
CREATE TABLE api.service_providing_group_product_suspension (
    id bigint NOT NULL,
    procuring_system_operator_id bigint NOT NULL,
    service_providing_group_id bigint NOT NULL,
    product_type_ids bigint [] NOT NULL,
    reason text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.service_providing_group_product_suspension_history (
    service_providing_group_product_suspension_id bigint NOT NULL,
    id bigint NOT NULL,
    procuring_system_operator_id bigint NOT NULL,
    service_providing_group_id bigint NOT NULL,
    product_type_ids bigint [] NOT NULL,
    reason text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);
CREATE TABLE api.service_providing_group_product_suspension_comment (
    id bigint NOT NULL,
    service_providing_group_product_suspension_id bigint NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    visibility text NOT NULL,
    content text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL
);
CREATE TABLE api.service_providing_group_product_suspension_comment_history (
    service_providing_group_product_suspension_comment_id bigint NOT NULL,
    id bigint NOT NULL,
    service_providing_group_product_suspension_id bigint NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    visibility text NOT NULL,
    content text NOT NULL,
    recorded_by bigint NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    replaced_by bigint NULL,
    replaced_at timestamp with time zone NULL
);
CREATE TABLE api.notice (
    party_id bigint NOT NULL,
    type text NOT NULL,
    source text NOT NULL,
    data jsonb NULL
);
