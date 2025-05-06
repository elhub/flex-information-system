SET search_path TO api;

GRANT USAGE ON SCHEMA api TO flex_anonymous;

-- views

\i api/accounting_point.sql
\i api/accounting_point_balance_responsible_party.sql
\i api/accounting_point_end_user.sql
\i api/accounting_point_energy_supplier.sql
\i api/controllable_unit.sql
\i api/controllable_unit_lookup.sql
\i api/controllable_unit_service_provider.sql
\i api/entity.sql
\i api/entity_client.sql
\i api/event.sql
\i api/identity.sql
\i api/notice.sql
\i api/notification.sql
\i api/party.sql
\i api/party_membership.sql
\i api/product_type.sql
\i api/service_provider_product_application.sql
\i api/service_provider_product_application_comment.sql
\i api/service_providing_group.sql
\i api/service_providing_group_grid_prequalification.sql
\i api/service_providing_group_membership.sql
\i api/service_providing_group_product_application.sql
\i api/system_operator_product_type.sql
\i api/technical_resource.sql

-- triggers
\i api/controllable_unit_service_provider_triggers.sql
\i api/service_providing_group_triggers.sql
