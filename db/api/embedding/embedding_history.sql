--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:controllable_unit_suspension_history-controllable_unit_id-to-controllable_unit_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.controllable_unit_history(
    api.controllable_unit_suspension_history
)
RETURNS SETOF api.controllable_unit_history AS $$
  select *
  from api.controllable_unit_history
  where controllable_unit_id = $1.controllable_unit_id
$$ STABLE LANGUAGE sql;

-- changeset flex:controllable_unit_suspension_history-controllable_unit_id-to-controllable_unit_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.controllable_unit_history(
    api.controllable_unit_suspension_history
)
TO flex_common, flex_entity;

-- changeset flex:controllable_unit_history-controllable_unit_id-to-controllable_unit_suspension_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.suspension_history(
    api.controllable_unit_history
)
RETURNS SETOF api.controllable_unit_suspension_history AS $$
  select *
  from api.controllable_unit_suspension_history
  where controllable_unit_id = $1.controllable_unit_id
$$ STABLE LANGUAGE sql;

-- changeset flex:controllable_unit_history-controllable_unit_id-to-controllable_unit_suspension_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.suspension_history(
    api.controllable_unit_history
)
TO flex_common, flex_entity;

-- changeset flex:controllable_unit_suspension_history-impacted_system_operator_id-to-party_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.impacted_system_operator_history(
    api.controllable_unit_suspension_history
)
RETURNS SETOF api.party_history AS $$
  select *
  from api.party_history
  where party_id = $1.impacted_system_operator_id
$$ STABLE LANGUAGE sql;

-- changeset flex:controllable_unit_suspension_history-impacted_system_operator_id-to-party_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.impacted_system_operator_history(
    api.controllable_unit_suspension_history
)
TO flex_common, flex_entity;

-- changeset flex:controllable_unit_service_provider_history-controllable_unit_id-to-controllable_unit_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.controllable_unit_history(
    api.controllable_unit_service_provider_history
)
RETURNS SETOF api.controllable_unit_history AS $$
  select *
  from api.controllable_unit_history
  where controllable_unit_id = $1.controllable_unit_id
$$ STABLE LANGUAGE sql;

-- changeset flex:controllable_unit_service_provider_history-controllable_unit_id-to-controllable_unit_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.controllable_unit_history(
    api.controllable_unit_service_provider_history
)
TO flex_common, flex_entity;

-- changeset flex:controllable_unit_history-controllable_unit_id-to-controllable_unit_service_provider_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_provider_history(
    api.controllable_unit_history
)
RETURNS SETOF api.controllable_unit_service_provider_history AS $$
  select *
  from api.controllable_unit_service_provider_history
  where controllable_unit_id = $1.controllable_unit_id
$$ STABLE LANGUAGE sql;

-- changeset flex:controllable_unit_history-controllable_unit_id-to-controllable_unit_service_provider_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.service_provider_history(
    api.controllable_unit_history
)
TO flex_common, flex_entity;

-- changeset flex:controllable_unit_service_provider_history-service_provider_id-to-party_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_provider_history(
    api.controllable_unit_service_provider_history
)
RETURNS SETOF api.party_history AS $$
  select *
  from api.party_history
  where party_id = $1.service_provider_id
$$ STABLE LANGUAGE sql;

-- changeset flex:controllable_unit_service_provider_history-service_provider_id-to-party_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.service_provider_history(
    api.controllable_unit_service_provider_history
)
TO flex_common, flex_entity;

-- changeset flex:controllable_unit_service_provider_history-end_user_id-to-party_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.end_user_history(
    api.controllable_unit_service_provider_history
)
RETURNS SETOF api.party_history AS $$
  select *
  from api.party_history
  where party_id = $1.end_user_id
$$ STABLE LANGUAGE sql;

-- changeset flex:controllable_unit_service_provider_history-end_user_id-to-party_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.end_user_history(
    api.controllable_unit_service_provider_history
)
TO flex_common, flex_entity;

-- changeset flex:service_providing_group_history-service_provider_id-to-party_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_provider_history(
    api.service_providing_group_history
)
RETURNS SETOF api.party_history AS $$
  select *
  from api.party_history
  where party_id = $1.service_provider_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_history-service_provider_id-to-party_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.service_provider_history(
    api.service_providing_group_history
)
TO flex_common, flex_entity;

-- changeset flex:service_providing_group_membership_history-controllable_unit_id-to-controllable_unit_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.controllable_unit_history(
    api.service_providing_group_membership_history
)
RETURNS SETOF api.controllable_unit_history AS $$
  select *
  from api.controllable_unit_history
  where controllable_unit_id = $1.controllable_unit_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_membership_history-controllable_unit_id-to-controllable_unit_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.controllable_unit_history(
    api.service_providing_group_membership_history
)
TO flex_common, flex_entity;

-- changeset flex:controllable_unit_history-controllable_unit_id-to-service_providing_group_membership_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_providing_group_membership_history(
    api.controllable_unit_history
)
RETURNS SETOF api.service_providing_group_membership_history AS $$
  select *
  from api.service_providing_group_membership_history
  where controllable_unit_id = $1.controllable_unit_id
$$ STABLE LANGUAGE sql;

-- changeset flex:controllable_unit_history-controllable_unit_id-to-service_providing_group_membership_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.service_providing_group_membership_history(
    api.controllable_unit_history
)
TO flex_common, flex_entity;

-- changeset flex:service_providing_group_membership_history-service_providing_group_id-to-service_providing_group_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_providing_group_history(
    api.service_providing_group_membership_history
)
RETURNS SETOF api.service_providing_group_history AS $$
  select *
  from api.service_providing_group_history
  where service_providing_group_id = $1.service_providing_group_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_membership_history-service_providing_group_id-to-service_providing_group_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.service_providing_group_history(
    api.service_providing_group_membership_history
)
TO flex_common, flex_entity;

-- changeset flex:service_providing_group_history-service_providing_group_id-to-service_providing_group_membership_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.membership_history(
    api.service_providing_group_history
)
RETURNS SETOF api.service_providing_group_membership_history AS $$
  select *
  from api.service_providing_group_membership_history
  where service_providing_group_id = $1.service_providing_group_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_history-service_providing_group_id-to-service_providing_group_membership_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.membership_history(
    api.service_providing_group_history
)
TO flex_common, flex_entity;

-- changeset flex:service_providing_group_grid_prequalification_history-service_providing_group_id-to-service_providing_group_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_providing_group_history(
    api.service_providing_group_grid_prequalification_history
)
RETURNS SETOF api.service_providing_group_history AS $$
  select *
  from api.service_providing_group_history
  where service_providing_group_id = $1.service_providing_group_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_grid_prequalification_history-service_providing_group_id-to-service_providing_group_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.service_providing_group_history(
    api.service_providing_group_grid_prequalification_history
)
TO flex_common, flex_entity;

-- changeset flex:service_providing_group_history-service_providing_group_id-to-service_providing_group_grid_prequalification_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.grid_prequalification_history(
    api.service_providing_group_history
)
RETURNS SETOF api.service_providing_group_grid_prequalification_history AS $$
  select *
  from api.service_providing_group_grid_prequalification_history
  where service_providing_group_id = $1.service_providing_group_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_history-service_providing_group_id-to-service_providing_group_grid_prequalification_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.grid_prequalification_history(
    api.service_providing_group_history
)
TO flex_common, flex_entity;

-- changeset flex:service_providing_group_grid_prequalification_history-impacted_system_operator_id-to-party_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.impacted_system_operator_history(
    api.service_providing_group_grid_prequalification_history
)
RETURNS SETOF api.party_history AS $$
  select *
  from api.party_history
  where party_id = $1.impacted_system_operator_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_grid_prequalification_history-impacted_system_operator_id-to-party_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.impacted_system_operator_history(
    api.service_providing_group_grid_prequalification_history
)
TO flex_common, flex_entity;

-- changeset flex:service_providing_group_grid_suspension_history-impacted_system_operator_id-to-party_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.impacted_system_operator_history(
    api.service_providing_group_grid_suspension_history
)
RETURNS SETOF api.party_history AS $$
  select *
  from api.party_history
  where party_id = $1.impacted_system_operator_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_grid_suspension_history-impacted_system_operator_id-to-party_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.impacted_system_operator_history(
    api.service_providing_group_grid_suspension_history
)
TO flex_common, flex_entity;

-- changeset flex:service_providing_group_grid_suspension_history-service_providing_group_id-to-service_providing_group_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_providing_group_history(
    api.service_providing_group_grid_suspension_history
)
RETURNS SETOF api.service_providing_group_history AS $$
  select *
  from api.service_providing_group_history
  where service_providing_group_id = $1.service_providing_group_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_grid_suspension_history-service_providing_group_id-to-service_providing_group_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.service_providing_group_history(
    api.service_providing_group_grid_suspension_history
)
TO flex_common, flex_entity;

-- changeset flex:service_providing_group_history-service_providing_group_id-to-service_providing_group_grid_suspension_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.grid_suspension_history(
    api.service_providing_group_history
)
RETURNS SETOF api.service_providing_group_grid_suspension_history AS $$
  select *
  from api.service_providing_group_grid_suspension_history
  where service_providing_group_id = $1.service_providing_group_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_history-service_providing_group_id-to-service_providing_group_grid_suspension_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.grid_suspension_history(
    api.service_providing_group_history
)
TO flex_common, flex_entity;

-- changeset flex:party_membership_history-party_id-to-party_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.party_history(
    api.party_membership_history
)
RETURNS SETOF api.party_history AS $$
  select *
  from api.party_history
  where party_id = $1.party_id
$$ STABLE LANGUAGE sql;

-- changeset flex:party_membership_history-party_id-to-party_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.party_history(
    api.party_membership_history
)
TO flex_common, flex_entity;

-- changeset flex:party_history-party_id-to-party_membership_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.membership_history(
    api.party_history
)
RETURNS SETOF api.party_membership_history AS $$
  select *
  from api.party_membership_history
  where party_id = $1.party_id
$$ STABLE LANGUAGE sql;

-- changeset flex:party_history-party_id-to-party_membership_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.membership_history(
    api.party_history
)
TO flex_common, flex_entity;

-- changeset flex:technical_resource_history-controllable_unit_id-to-controllable_unit_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.controllable_unit_history(
    api.technical_resource_history
)
RETURNS SETOF api.controllable_unit_history AS $$
  select *
  from api.controllable_unit_history
  where controllable_unit_id = $1.controllable_unit_id
$$ STABLE LANGUAGE sql;

-- changeset flex:technical_resource_history-controllable_unit_id-to-controllable_unit_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.controllable_unit_history(
    api.technical_resource_history
)
TO flex_common, flex_entity;

-- changeset flex:controllable_unit_history-controllable_unit_id-to-technical_resource_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.technical_resource_history(
    api.controllable_unit_history
)
RETURNS SETOF api.technical_resource_history AS $$
  select *
  from api.technical_resource_history
  where controllable_unit_id = $1.controllable_unit_id
$$ STABLE LANGUAGE sql;

-- changeset flex:controllable_unit_history-controllable_unit_id-to-technical_resource_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.technical_resource_history(
    api.controllable_unit_history
)
TO flex_common, flex_entity;

-- changeset flex:system_operator_product_type_history-system_operator_id-to-party_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.system_operator_history(
    api.system_operator_product_type_history
)
RETURNS SETOF api.party_history AS $$
  select *
  from api.party_history
  where party_id = $1.system_operator_id
$$ STABLE LANGUAGE sql;

-- changeset flex:system_operator_product_type_history-system_operator_id-to-party_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.system_operator_history(
    api.system_operator_product_type_history
)
TO flex_common, flex_entity;

-- changeset flex:party_history-party_id-to-system_operator_product_type_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.system_operator_product_type_history(
    api.party_history
)
RETURNS SETOF api.system_operator_product_type_history AS $$
  select *
  from api.system_operator_product_type_history
  where system_operator_id = $1.party_id
$$ STABLE LANGUAGE sql;

-- changeset flex:party_history-party_id-to-system_operator_product_type_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.system_operator_product_type_history(
    api.party_history
)
TO flex_common, flex_entity;

-- changeset flex:service_provider_product_application_history-service_provider_id-to-party_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_provider_history(
    api.service_provider_product_application_history
)
RETURNS SETOF api.party_history AS $$
  select *
  from api.party_history
  where party_id = $1.service_provider_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_provider_product_application_history-service_provider_id-to-party_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.service_provider_history(
    api.service_provider_product_application_history
)
TO flex_common, flex_entity;

-- changeset flex:service_provider_product_application_history-system_operator_id-to-party_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.system_operator_history(
    api.service_provider_product_application_history
)
RETURNS SETOF api.party_history AS $$
  select *
  from api.party_history
  where party_id = $1.system_operator_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_provider_product_application_history-system_operator_id-to-party_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.system_operator_history(
    api.service_provider_product_application_history
)
TO flex_common, flex_entity;

-- changeset flex:service_provider_product_suspension_history-procuring_system_operator_id-to-party_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.procuring_system_operator_history(
    api.service_provider_product_suspension_history
)
RETURNS SETOF api.party_history AS $$
  select *
  from api.party_history
  where party_id = $1.procuring_system_operator_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_provider_product_suspension_history-procuring_system_operator_id-to-party_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.procuring_system_operator_history(
    api.service_provider_product_suspension_history
)
TO flex_common, flex_entity;

-- changeset flex:service_provider_product_suspension_history-service_provider_id-to-party_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_provider_history(
    api.service_provider_product_suspension_history
)
RETURNS SETOF api.party_history AS $$
  select *
  from api.party_history
  where party_id = $1.service_provider_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_provider_product_suspension_history-service_provider_id-to-party_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.service_provider_history(
    api.service_provider_product_suspension_history
)
TO flex_common, flex_entity;

-- changeset flex:service_providing_group_product_application_history-service_providing_group_id-to-service_providing_group_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_providing_group_history(
    api.service_providing_group_product_application_history
)
RETURNS SETOF api.service_providing_group_history AS $$
  select *
  from api.service_providing_group_history
  where service_providing_group_id = $1.service_providing_group_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_product_application_history-service_providing_group_id-to-service_providing_group_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.service_providing_group_history(
    api.service_providing_group_product_application_history
)
TO flex_common, flex_entity;

-- changeset flex:service_providing_group_history-service_providing_group_id-to-service_providing_group_product_application_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.product_application_history(
    api.service_providing_group_history
)
RETURNS SETOF api.service_providing_group_product_application_history AS $$
  select *
  from api.service_providing_group_product_application_history
  where service_providing_group_id = $1.service_providing_group_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_history-service_providing_group_id-to-service_providing_group_product_application_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.product_application_history(
    api.service_providing_group_history
)
TO flex_common, flex_entity;

-- changeset flex:service_providing_group_product_application_history-procuring_system_operator_id-to-party_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.procuring_system_operator_history(
    api.service_providing_group_product_application_history
)
RETURNS SETOF api.party_history AS $$
  select *
  from api.party_history
  where party_id = $1.procuring_system_operator_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_product_application_history-procuring_system_operator_id-to-party_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.procuring_system_operator_history(
    api.service_providing_group_product_application_history
)
TO flex_common, flex_entity;

-- changeset flex:service_providing_group_product_suspension_history-procuring_system_operator_id-to-party_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.procuring_system_operator_history(
    api.service_providing_group_product_suspension_history
)
RETURNS SETOF api.party_history AS $$
  select *
  from api.party_history
  where party_id = $1.procuring_system_operator_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_product_suspension_history-procuring_system_operator_id-to-party_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.procuring_system_operator_history(
    api.service_providing_group_product_suspension_history
)
TO flex_common, flex_entity;

-- changeset flex:service_providing_group_product_suspension_history-service_providing_group_id-to-service_providing_group_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_providing_group_history(
    api.service_providing_group_product_suspension_history
)
RETURNS SETOF api.service_providing_group_history AS $$
  select *
  from api.service_providing_group_history
  where service_providing_group_id = $1.service_providing_group_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_product_suspension_history-service_providing_group_id-to-service_providing_group_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.service_providing_group_history(
    api.service_providing_group_product_suspension_history
)
TO flex_common, flex_entity;

-- changeset flex:service_providing_group_history-service_providing_group_id-to-service_providing_group_product_suspension_history runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.product_suspension_history(
    api.service_providing_group_history
)
RETURNS SETOF api.service_providing_group_product_suspension_history AS $$
  select *
  from api.service_providing_group_product_suspension_history
  where service_providing_group_id = $1.service_providing_group_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_history-service_providing_group_id-to-service_providing_group_product_suspension_history-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.product_suspension_history(
    api.service_providing_group_history
)
TO flex_common, flex_entity;
