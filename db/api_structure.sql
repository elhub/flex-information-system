SET role TO api;
SET search_path TO api;

-- views

\i api/accounting_point.sql
\i api/accounting_point_balance_responsible_party.sql
\i api/accounting_point_end_user.sql
\i api/accounting_point_energy_supplier.sql
\i api/controllable_unit.sql
\i api/controllable_unit_service_provider.sql
\i api/entity.sql
\i api/event.sql
\i api/identity.sql
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

CREATE OR REPLACE TRIGGER controllable_unit_service_provider_upsert_timeline
INSTEAD OF INSERT OR UPDATE
ON api.controllable_unit_service_provider
FOR EACH ROW
EXECUTE PROCEDURE flex.timeline_no_overlap(
    'flex.controllable_unit_service_provider',
    'controllable_unit_id',
    'service_provider_id,contract_reference'
);

CREATE OR REPLACE TRIGGER service_providing_group_membership_upsert_timeline
INSTEAD OF INSERT OR UPDATE
ON api.service_providing_group_membership
FOR EACH ROW
EXECUTE PROCEDURE flex.timeline_no_check(
    'flex.service_providing_group_membership',
    'controllable_unit_id,service_providing_group_id'
);
