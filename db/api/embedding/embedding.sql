--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:controllable_unit-accounting_point_id-to-accounting_point runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.accounting_point(
    api.controllable_unit
)
RETURNS SETOF api.accounting_point ROWS 1 AS $$
  select * from api.accounting_point where id = $1.accounting_point_id
$$ STABLE LANGUAGE sql;

-- changeset flex:accounting_point-id-to-controllable_unit runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.controllable_unit(
    api.accounting_point
)
RETURNS SETOF api.controllable_unit AS $$
  select * from api.controllable_unit where accounting_point_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:controllable_unit_suspension-controllable_unit_id-to-controllable_unit runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.controllable_unit(
    api.controllable_unit_suspension
)
RETURNS SETOF api.controllable_unit ROWS 1 AS $$
  select * from api.controllable_unit where id = $1.controllable_unit_id
$$ STABLE LANGUAGE sql;

-- changeset flex:controllable_unit-id-to-controllable_unit_suspension runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.suspension(
    api.controllable_unit
)
RETURNS SETOF api.controllable_unit_suspension AS $$
  select * from api.controllable_unit_suspension where controllable_unit_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:controllable_unit_suspension-impacted_system_operator_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.impacted_system_operator(
    api.controllable_unit_suspension
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.impacted_system_operator_id
$$ STABLE LANGUAGE sql;

-- changeset flex:controllable_unit_service_provider-controllable_unit_id-to-controllable_unit runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.controllable_unit(
    api.controllable_unit_service_provider
)
RETURNS SETOF api.controllable_unit ROWS 1 AS $$
  select * from api.controllable_unit where id = $1.controllable_unit_id
$$ STABLE LANGUAGE sql;

-- changeset flex:controllable_unit-id-to-controllable_unit_service_provider runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_provider(
    api.controllable_unit
)
RETURNS SETOF api.controllable_unit_service_provider AS $$
  select * from api.controllable_unit_service_provider where controllable_unit_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:controllable_unit_service_provider-service_provider_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_provider(
    api.controllable_unit_service_provider
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.service_provider_id
$$ STABLE LANGUAGE sql;

-- changeset flex:controllable_unit_service_provider-end_user_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.end_user(
    api.controllable_unit_service_provider
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.end_user_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group-service_provider_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_provider(
    api.service_providing_group
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.service_provider_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_membership-controllable_unit_id-to-controllable_unit runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.controllable_unit(
    api.service_providing_group_membership
)
RETURNS SETOF api.controllable_unit ROWS 1 AS $$
  select * from api.controllable_unit where id = $1.controllable_unit_id
$$ STABLE LANGUAGE sql;

-- changeset flex:controllable_unit-id-to-service_providing_group_membership runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_providing_group_membership(
    api.controllable_unit
)
RETURNS SETOF api.service_providing_group_membership AS $$
  select * from api.service_providing_group_membership where controllable_unit_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_membership-service_providing_group_id-to-service_providing_group runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_providing_group(
    api.service_providing_group_membership
)
RETURNS SETOF api.service_providing_group ROWS 1 AS $$
  select * from api.service_providing_group where id = $1.service_providing_group_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group-id-to-service_providing_group_membership runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.membership(
    api.service_providing_group
)
RETURNS SETOF api.service_providing_group_membership AS $$
  select * from api.service_providing_group_membership where service_providing_group_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_grid_prequalification-service_providing_group_id-to-service_providing_group runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_providing_group(
    api.service_providing_group_grid_prequalification
)
RETURNS SETOF api.service_providing_group ROWS 1 AS $$
  select * from api.service_providing_group where id = $1.service_providing_group_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group-id-to-service_providing_group_grid_prequalification runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.grid_prequalification(
    api.service_providing_group
)
RETURNS SETOF api.service_providing_group_grid_prequalification AS $$
  select * from api.service_providing_group_grid_prequalification where service_providing_group_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_grid_prequalification-impacted_system_operator_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.impacted_system_operator(
    api.service_providing_group_grid_prequalification
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.impacted_system_operator_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_grid_suspension-impacted_system_operator_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.impacted_system_operator(
    api.service_providing_group_grid_suspension
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.impacted_system_operator_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_grid_suspension-service_providing_group_id-to-service_providing_group runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_providing_group(
    api.service_providing_group_grid_suspension
)
RETURNS SETOF api.service_providing_group ROWS 1 AS $$
  select * from api.service_providing_group where id = $1.service_providing_group_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group-id-to-service_providing_group_grid_suspension runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.grid_suspension(
    api.service_providing_group
)
RETURNS SETOF api.service_providing_group_grid_suspension AS $$
  select * from api.service_providing_group_grid_suspension where service_providing_group_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:entity_client-entity_id-to-entity runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.entity(
    api.entity_client
)
RETURNS SETOF api.entity ROWS 1 AS $$
  select * from api.entity where id = $1.entity_id
$$ STABLE LANGUAGE sql;

-- changeset flex:entity-id-to-entity_client runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.client(
    api.entity
)
RETURNS SETOF api.entity_client AS $$
  select * from api.entity_client where entity_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:entity_client-party_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.party(
    api.entity_client
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.party_id
$$ STABLE LANGUAGE sql;

-- changeset flex:party-entity_id-to-entity runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.entity(
    api.party
)
RETURNS SETOF api.entity ROWS 1 AS $$
  select * from api.entity where id = $1.entity_id
$$ STABLE LANGUAGE sql;

-- changeset flex:entity-id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.party(
    api.entity
)
RETURNS SETOF api.party AS $$
  select * from api.party where entity_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:party_membership-party_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.party(
    api.party_membership
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.party_id
$$ STABLE LANGUAGE sql;

-- changeset flex:party_membership-entity_id-to-entity runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.entity(
    api.party_membership
)
RETURNS SETOF api.entity ROWS 1 AS $$
  select * from api.entity where id = $1.entity_id
$$ STABLE LANGUAGE sql;

-- changeset flex:entity-id-to-party_membership runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.party_membership(
    api.entity
)
RETURNS SETOF api.party_membership AS $$
  select * from api.party_membership where entity_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:identity-entity_id-to-entity runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.entity(
    api.identity
)
RETURNS SETOF api.entity ROWS 1 AS $$
  select * from api.entity where id = $1.entity_id
$$ STABLE LANGUAGE sql;

-- changeset flex:entity-id-to-identity runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.identity(
    api.entity
)
RETURNS SETOF api.identity AS $$
  select * from api.identity where entity_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:identity-party_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.party(
    api.identity
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.party_id
$$ STABLE LANGUAGE sql;

-- changeset flex:technical_resource-controllable_unit_id-to-controllable_unit runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.controllable_unit(
    api.technical_resource
)
RETURNS SETOF api.controllable_unit ROWS 1 AS $$
  select * from api.controllable_unit where id = $1.controllable_unit_id
$$ STABLE LANGUAGE sql;

-- changeset flex:controllable_unit-id-to-technical_resource runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.technical_resource(
    api.controllable_unit
)
RETURNS SETOF api.technical_resource AS $$
  select * from api.technical_resource where controllable_unit_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:notification-event_id-to-event runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.event(
    api.notification
)
RETURNS SETOF api.event ROWS 1 AS $$
  select * from api.event where id = $1.event_id
$$ STABLE LANGUAGE sql;

-- changeset flex:event-id-to-notification runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.notification(
    api.event
)
RETURNS SETOF api.notification AS $$
  select * from api.notification where event_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:notification-party_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.party(
    api.notification
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.party_id
$$ STABLE LANGUAGE sql;

-- changeset flex:accounting_point-system_operator_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.system_operator(
    api.accounting_point
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.system_operator_id
$$ STABLE LANGUAGE sql;

-- changeset flex:accounting_point_balance_responsible_party-accounting_point_id-to-accounting_point runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.accounting_point(
    api.accounting_point_balance_responsible_party
)
RETURNS SETOF api.accounting_point ROWS 1 AS $$
  select * from api.accounting_point where id = $1.accounting_point_id
$$ STABLE LANGUAGE sql;

-- changeset flex:accounting_point-id-to-accounting_point_balance_responsible_party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.balance_responsible_party(
    api.accounting_point
)
RETURNS SETOF api.accounting_point_balance_responsible_party AS $$
  select * from api.accounting_point_balance_responsible_party where accounting_point_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:accounting_point_balance_responsible_party-balance_responsible_party_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.balance_responsible_party(
    api.accounting_point_balance_responsible_party
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.balance_responsible_party_id
$$ STABLE LANGUAGE sql;

-- changeset flex:accounting_point_bidding_zone-accounting_point_id-to-accounting_point runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.accounting_point(
    api.accounting_point_bidding_zone
)
RETURNS SETOF api.accounting_point ROWS 1 AS $$
  select * from api.accounting_point where id = $1.accounting_point_id
$$ STABLE LANGUAGE sql;

-- changeset flex:accounting_point-id-to-accounting_point_bidding_zone runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.bidding_zone(
    api.accounting_point
)
RETURNS SETOF api.accounting_point_bidding_zone AS $$
  select * from api.accounting_point_bidding_zone where accounting_point_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:accounting_point_end_user-accounting_point_id-to-accounting_point runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.accounting_point(
    api.accounting_point_end_user
)
RETURNS SETOF api.accounting_point ROWS 1 AS $$
  select * from api.accounting_point where id = $1.accounting_point_id
$$ STABLE LANGUAGE sql;

-- changeset flex:accounting_point-id-to-accounting_point_end_user runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.end_user(
    api.accounting_point
)
RETURNS SETOF api.accounting_point_end_user AS $$
  select * from api.accounting_point_end_user where accounting_point_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:accounting_point_end_user-end_user_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.end_user(
    api.accounting_point_end_user
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.end_user_id
$$ STABLE LANGUAGE sql;

-- changeset flex:accounting_point_energy_supplier-accounting_point_id-to-accounting_point runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.accounting_point(
    api.accounting_point_energy_supplier
)
RETURNS SETOF api.accounting_point ROWS 1 AS $$
  select * from api.accounting_point where id = $1.accounting_point_id
$$ STABLE LANGUAGE sql;

-- changeset flex:accounting_point-id-to-accounting_point_energy_supplier runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.energy_supplier(
    api.accounting_point
)
RETURNS SETOF api.accounting_point_energy_supplier AS $$
  select * from api.accounting_point_energy_supplier where accounting_point_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:accounting_point_energy_supplier-energy_supplier_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.energy_supplier(
    api.accounting_point_energy_supplier
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.energy_supplier_id
$$ STABLE LANGUAGE sql;

-- changeset flex:accounting_point_metering_grid_area-accounting_point_id-to-accounting_point runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.accounting_point(
    api.accounting_point_metering_grid_area
)
RETURNS SETOF api.accounting_point ROWS 1 AS $$
  select * from api.accounting_point where id = $1.accounting_point_id
$$ STABLE LANGUAGE sql;

-- changeset flex:accounting_point-id-to-accounting_point_metering_grid_area runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.metering_grid_area(
    api.accounting_point
)
RETURNS SETOF api.accounting_point_metering_grid_area AS $$
  select * from api.accounting_point_metering_grid_area where accounting_point_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:accounting_point_metering_grid_area-metering_grid_area_id-to-metering_grid_area runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.metering_grid_area(
    api.accounting_point_metering_grid_area
)
RETURNS SETOF api.metering_grid_area ROWS 1 AS $$
  select * from api.metering_grid_area where id = $1.metering_grid_area_id
$$ STABLE LANGUAGE sql;

-- changeset flex:metering_grid_area-id-to-accounting_point_metering_grid_area runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.accounting_point_metering_grid_area(
    api.metering_grid_area
)
RETURNS SETOF api.accounting_point_metering_grid_area AS $$
  select * from api.accounting_point_metering_grid_area where metering_grid_area_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:system_operator_product_type-system_operator_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.system_operator(
    api.system_operator_product_type
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.system_operator_id
$$ STABLE LANGUAGE sql;

-- changeset flex:system_operator_product_type-product_type_id-to-product_type runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.product_type(
    api.system_operator_product_type
)
RETURNS SETOF api.product_type ROWS 1 AS $$
  select * from api.product_type where id = $1.product_type_id
$$ STABLE LANGUAGE sql;

-- changeset flex:product_type-id-to-system_operator_product_type runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.system_operator_product_type(
    api.product_type
)
RETURNS SETOF api.system_operator_product_type AS $$
  select * from api.system_operator_product_type where product_type_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_provider_product_application-service_provider_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_provider(
    api.service_provider_product_application
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.service_provider_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_provider_product_application-system_operator_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.system_operator(
    api.service_provider_product_application
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.system_operator_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_provider_product_suspension-procuring_system_operator_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.procuring_system_operator(
    api.service_provider_product_suspension
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.procuring_system_operator_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_provider_product_suspension-service_provider_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_provider(
    api.service_provider_product_suspension
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.service_provider_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_product_application-service_providing_group_id-to-service_providing_group runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_providing_group(
    api.service_providing_group_product_application
)
RETURNS SETOF api.service_providing_group ROWS 1 AS $$
  select * from api.service_providing_group where id = $1.service_providing_group_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group-id-to-service_providing_group_product_application runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.product_application(
    api.service_providing_group
)
RETURNS SETOF api.service_providing_group_product_application AS $$
  select * from api.service_providing_group_product_application where service_providing_group_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_product_application-procuring_system_operator_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.procuring_system_operator(
    api.service_providing_group_product_application
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.procuring_system_operator_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_product_suspension-procuring_system_operator_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.procuring_system_operator(
    api.service_providing_group_product_suspension
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.procuring_system_operator_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group_product_suspension-service_providing_group_id-to-service_providing_group runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_providing_group(
    api.service_providing_group_product_suspension
)
RETURNS SETOF api.service_providing_group ROWS 1 AS $$
  select * from api.service_providing_group where id = $1.service_providing_group_id
$$ STABLE LANGUAGE sql;

-- changeset flex:service_providing_group-id-to-service_providing_group_product_suspension runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.product_suspension(
    api.service_providing_group
)
RETURNS SETOF api.service_providing_group_product_suspension AS $$
  select * from api.service_providing_group_product_suspension where service_providing_group_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:notice-party_id-to-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.party(
    api.notice
)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.party_id
$$ STABLE LANGUAGE sql;
