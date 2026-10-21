--liquibase formatted sql

-- changeset flex:flex-field-level-authorization-revokes endDelimiter:;
-- One-off cleanup of grants that are no longer generated, because the roles
-- have no read policies on these resources (see permissions.csv).

REVOKE ALL ON TABLE
flex.accounting_point
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.accounting_point
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.accounting_point
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.accounting_point
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.controllable_unit
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.controllable_unit_history
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.controllable_unit
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.controllable_unit_history
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.controllable_unit_service_provider
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.controllable_unit_service_provider_history
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.controllable_unit_service_provider
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.controllable_unit_service_provider_history
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.controllable_unit_service_provider
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.controllable_unit_service_provider_history
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.controllable_unit_suspension
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.controllable_unit_suspension_history
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.controllable_unit_suspension
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.controllable_unit_suspension_history
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.controllable_unit_suspension
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.controllable_unit_suspension_history
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.controllable_unit_suspension
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.controllable_unit_suspension_history
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.entity_client
FROM flex_balance_responsible_party;

REVOKE ALL ON TABLE
flex.entity_client
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.entity_client
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.entity_client
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.entity_client
FROM flex_system_operator;

REVOKE ALL ON TABLE
flex.entity_client
FROM flex_service_provider;

REVOKE ALL ON TABLE
flex.entity_client
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.service_provider_product_application
FROM flex_balance_responsible_party;

REVOKE ALL ON TABLE
flex.service_provider_product_application_history
FROM flex_balance_responsible_party;

REVOKE ALL ON TABLE
flex.service_provider_product_application
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.service_provider_product_application_history
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.service_provider_product_application
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.service_provider_product_application_history
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.service_provider_product_application
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.service_provider_product_application_history
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.service_provider_product_application
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.service_provider_product_application_history
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.service_provider_product_suspension
FROM flex_balance_responsible_party;

REVOKE ALL ON TABLE
flex.service_provider_product_suspension_history
FROM flex_balance_responsible_party;

REVOKE ALL ON TABLE
flex.service_provider_product_suspension
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.service_provider_product_suspension_history
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.service_provider_product_suspension
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.service_provider_product_suspension_history
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.service_provider_product_suspension
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.service_provider_product_suspension_history
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.service_provider_product_suspension
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.service_provider_product_suspension_history
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.service_providing_group
FROM flex_balance_responsible_party;

REVOKE ALL ON TABLE
flex.service_providing_group_history
FROM flex_balance_responsible_party;

REVOKE ALL ON TABLE
flex.service_providing_group
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.service_providing_group_history
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.service_providing_group
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.service_providing_group_history
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.service_providing_group
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.service_providing_group_history
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.service_providing_group
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.service_providing_group_history
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_prequalification
FROM flex_balance_responsible_party;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_prequalification_history
FROM flex_balance_responsible_party;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_prequalification
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_prequalification_history
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_prequalification
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_prequalification_history
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_prequalification
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_prequalification_history
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_prequalification
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_prequalification_history
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_suspension
FROM flex_balance_responsible_party;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_suspension_history
FROM flex_balance_responsible_party;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_suspension
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_suspension_history
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_suspension
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_suspension_history
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_suspension
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_suspension_history
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_suspension
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.service_providing_group_grid_suspension_history
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.service_providing_group_membership
FROM flex_balance_responsible_party;

REVOKE ALL ON TABLE
flex.service_providing_group_membership_history
FROM flex_balance_responsible_party;

REVOKE ALL ON TABLE
flex.service_providing_group_membership
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.service_providing_group_membership_history
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.service_providing_group_membership
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.service_providing_group_membership_history
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.service_providing_group_membership
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.service_providing_group_membership_history
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.service_providing_group_membership
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.service_providing_group_membership_history
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.service_providing_group_product_application
FROM flex_balance_responsible_party;

REVOKE ALL ON TABLE
flex.service_providing_group_product_application_history
FROM flex_balance_responsible_party;

REVOKE ALL ON TABLE
flex.service_providing_group_product_application
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.service_providing_group_product_application_history
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.service_providing_group_product_application
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.service_providing_group_product_application_history
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.service_providing_group_product_application
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.service_providing_group_product_application_history
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.service_providing_group_product_application
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.service_providing_group_product_application_history
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.service_providing_group_product_suspension
FROM flex_balance_responsible_party;

REVOKE ALL ON TABLE
flex.service_providing_group_product_suspension_history
FROM flex_balance_responsible_party;

REVOKE ALL ON TABLE
flex.service_providing_group_product_suspension
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.service_providing_group_product_suspension_history
FROM flex_energy_supplier;

REVOKE ALL ON TABLE
flex.service_providing_group_product_suspension
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.service_providing_group_product_suspension_history
FROM flex_end_user;

REVOKE ALL ON TABLE
flex.service_providing_group_product_suspension
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.service_providing_group_product_suspension_history
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.service_providing_group_product_suspension
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.service_providing_group_product_suspension_history
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.technical_resource
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.technical_resource_history
FROM flex_market_operator;

REVOKE ALL ON TABLE
flex.technical_resource
FROM flex_third_party;

REVOKE ALL ON TABLE
flex.technical_resource_history
FROM flex_third_party;
