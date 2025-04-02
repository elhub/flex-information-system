SET search_path TO flex, public;

COMMENT ON SCHEMA flex IS
$$Flexibility Information System

This API is for the Norwegian Flexibility Information System.
It is used to register distributed flexibility resources in the Norwegian power grid
and support the processes in the value chain.$$;

\i flex/status_triggers.sql

-- resources

\i flex/entity_client.sql
\i flex/party_membership.sql
\i flex/grid_node.sql
\i flex/grid_edge.sql
\i flex/accounting_point.sql
\i flex/accounting_point_balance_responsible_party.sql
\i flex/accounting_point_end_user.sql
\i flex/accounting_point_energy_supplier.sql
\i flex/controllable_unit.sql
\i flex/controllable_unit_service_provider.sql
\i flex/notification.sql
\i flex/product_type.sql
\i flex/service_provider_product_application.sql
\i flex/system_operator_product_type.sql
\i flex/technical_resource.sql
\i flex/service_providing_group.sql
\i flex/service_providing_group_membership.sql
\i flex/service_providing_group_grid_prequalification.sql
\i flex/service_providing_group_product_application.sql
\i flex/service_provider_product_application_comment.sql
-- loaded last because it is built from the others
\i flex/notice.sql

-- history and audit

\i flex/accounting_point_balance_responsible_party_history.sql
\i flex/accounting_point_end_user_history.sql
\i flex/accounting_point_energy_supplier_history.sql
\i flex/accounting_point_history.sql
\i flex/controllable_unit_history.sql
\i flex/controllable_unit_service_provider_history.sql
\i flex/entity_client_history.sql
\i flex/notification_history.sql
\i flex/party_history.sql
\i flex/party_membership_history.sql
\i flex/service_provider_product_application_comment_history.sql
\i flex/service_provider_product_application_history.sql
\i flex/service_providing_group_grid_prequalification_history.sql
\i flex/service_providing_group_history.sql
\i flex/service_providing_group_membership_history.sql
\i flex/service_providing_group_product_application_history.sql
\i flex/system_operator_product_type_history.sql
\i flex/technical_resource_history.sql

-- security definer views for RLS

\i authz/controllable_unit_balance_responsible_party.sql
\i authz/controllable_unit_end_user.sql
\i authz/controllable_unit_energy_supplier.sql

-- RLS

\i flex/accounting_point_rls.sql
\i flex/accounting_point_balance_responsible_party_rls.sql
\i flex/accounting_point_end_user_rls.sql
\i flex/accounting_point_energy_supplier_rls.sql
\i flex/controllable_unit_rls.sql
\i flex/controllable_unit_service_provider_rls.sql
\i flex/entity_rls.sql
\i flex/entity_client_rls.sql
\i flex/event_rls.sql
\i flex/identity_rls.sql
\i flex/notification_rls.sql
\i flex/party_membership_rls.sql
\i flex/party_rls.sql
\i flex/product_type_rls.sql
\i flex/service_provider_product_application_rls.sql
\i flex/service_provider_product_application_comment_rls.sql
\i flex/service_providing_group_membership_rls.sql
\i flex/service_providing_group_grid_prequalification_rls.sql
\i flex/service_providing_group_rls.sql
\i flex/service_providing_group_product_application_rls.sql
\i flex/system_operator_product_type_rls.sql
\i flex/technical_resource_rls.sql
