-- AUTO-GENERATED FILE (just permissions-to-db)

SET search_path TO flex, public;

GRANT SELECT ON TABLE flex.entity
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.entity
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.entity
TO flex_end_user;

GRANT SELECT ON TABLE flex.entity
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.entity
TO flex_market_operator;

GRANT SELECT ON TABLE flex.entity
TO flex_system_operator;

GRANT SELECT ON TABLE flex.entity
TO flex_service_provider;

GRANT SELECT ON TABLE flex.entity
TO flex_third_party;

GRANT SELECT ON TABLE flex.entity
TO flex_entity;

GRANT SELECT ON TABLE flex.entity_client
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.entity_client
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.entity_client
TO flex_end_user;

GRANT SELECT ON TABLE flex.entity_client
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.entity_client
TO flex_market_operator;

GRANT SELECT ON TABLE flex.entity_client
TO flex_system_operator;

GRANT SELECT ON TABLE flex.entity_client
TO flex_service_provider;

GRANT SELECT ON TABLE flex.entity_client
TO flex_third_party;

GRANT INSERT ON TABLE flex.entity_client
TO flex_entity;

GRANT SELECT ON TABLE flex.entity_client
TO flex_entity;

GRANT UPDATE ON TABLE flex.entity_client
TO flex_entity;

GRANT DELETE ON TABLE flex.entity_client
TO flex_entity;

GRANT SELECT ON TABLE flex.party
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.party
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.party
TO flex_end_user;

GRANT INSERT ON TABLE flex.party
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.party
TO flex_flexibility_information_system_operator;

GRANT UPDATE ON TABLE flex.party
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.party
TO flex_market_operator;

GRANT SELECT ON TABLE flex.party
TO flex_system_operator;

GRANT SELECT ON TABLE flex.party
TO flex_service_provider;

GRANT SELECT ON TABLE flex.party
TO flex_third_party;

GRANT SELECT ON TABLE flex.party
TO flex_entity;

GRANT SELECT ON TABLE flex.party
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.party_history
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.party_history
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.party_history
TO flex_end_user;

GRANT SELECT ON TABLE flex.party_history
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.party_history
TO flex_market_operator;

GRANT SELECT ON TABLE flex.party_history
TO flex_system_operator;

GRANT SELECT ON TABLE flex.party_history
TO flex_service_provider;

GRANT SELECT ON TABLE flex.party_history
TO flex_third_party;

GRANT SELECT ON TABLE flex.party_history
TO flex_entity;

GRANT SELECT ON TABLE flex.party_history
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.identity
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.identity
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.identity
TO flex_end_user;

GRANT SELECT ON TABLE flex.identity
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.identity
TO flex_market_operator;

GRANT SELECT ON TABLE flex.identity
TO flex_system_operator;

GRANT SELECT ON TABLE flex.identity
TO flex_service_provider;

GRANT SELECT ON TABLE flex.identity
TO flex_third_party;

GRANT SELECT ON TABLE flex.identity
TO flex_entity;

GRANT SELECT ON TABLE flex.party_membership
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.party_membership
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.party_membership
TO flex_end_user;

GRANT INSERT ON TABLE flex.party_membership
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.party_membership
TO flex_flexibility_information_system_operator;

GRANT DELETE ON TABLE flex.party_membership
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.party_membership
TO flex_market_operator;

GRANT SELECT ON TABLE flex.party_membership
TO flex_system_operator;

GRANT SELECT ON TABLE flex.party_membership
TO flex_service_provider;

GRANT SELECT ON TABLE flex.party_membership
TO flex_third_party;

GRANT SELECT ON TABLE flex.party_membership
TO flex_entity;

GRANT SELECT ON TABLE flex.party_membership_history
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.party_membership_history
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.party_membership_history
TO flex_end_user;

GRANT SELECT ON TABLE flex.party_membership_history
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.party_membership_history
TO flex_market_operator;

GRANT SELECT ON TABLE flex.party_membership_history
TO flex_system_operator;

GRANT SELECT ON TABLE flex.party_membership_history
TO flex_service_provider;

GRANT SELECT ON TABLE flex.party_membership_history
TO flex_third_party;

GRANT SELECT ON TABLE flex.party_membership_history
TO flex_entity;

GRANT SELECT ON TABLE flex.controllable_unit
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.controllable_unit
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.controllable_unit
TO flex_end_user;

GRANT INSERT ON TABLE flex.controllable_unit
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.controllable_unit
TO flex_flexibility_information_system_operator;

GRANT UPDATE ON TABLE flex.controllable_unit
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.controllable_unit
TO flex_market_operator;

GRANT SELECT ON TABLE flex.controllable_unit
TO flex_system_operator;

GRANT UPDATE ON TABLE flex.controllable_unit
TO flex_system_operator;

GRANT INSERT ON TABLE flex.controllable_unit
TO flex_service_provider;

GRANT SELECT ON TABLE flex.controllable_unit
TO flex_service_provider;

GRANT UPDATE ON TABLE flex.controllable_unit
TO flex_service_provider;

GRANT SELECT ON TABLE flex.controllable_unit
TO flex_third_party;

GRANT SELECT ON TABLE flex.controllable_unit
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.controllable_unit_history
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.controllable_unit_history
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.controllable_unit_history
TO flex_end_user;

GRANT SELECT ON TABLE flex.controllable_unit_history
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.controllable_unit_history
TO flex_market_operator;

GRANT SELECT ON TABLE flex.controllable_unit_history
TO flex_system_operator;

GRANT SELECT ON TABLE flex.controllable_unit_history
TO flex_service_provider;

GRANT SELECT ON TABLE flex.controllable_unit_history
TO flex_third_party;

GRANT SELECT ON TABLE flex.controllable_unit_history
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.controllable_unit_service_provider
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.controllable_unit_service_provider
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.controllable_unit_service_provider
TO flex_end_user;

GRANT INSERT ON TABLE flex.controllable_unit_service_provider
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.controllable_unit_service_provider
TO flex_flexibility_information_system_operator;

GRANT UPDATE ON TABLE flex.controllable_unit_service_provider
TO flex_flexibility_information_system_operator;

GRANT DELETE ON TABLE flex.controllable_unit_service_provider
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.controllable_unit_service_provider
TO flex_market_operator;

GRANT SELECT ON TABLE flex.controllable_unit_service_provider
TO flex_system_operator;

GRANT INSERT ON TABLE flex.controllable_unit_service_provider
TO flex_service_provider;

GRANT SELECT ON TABLE flex.controllable_unit_service_provider
TO flex_service_provider;

GRANT UPDATE ON TABLE flex.controllable_unit_service_provider
TO flex_service_provider;

GRANT DELETE ON TABLE flex.controllable_unit_service_provider
TO flex_service_provider;

GRANT SELECT ON TABLE flex.controllable_unit_service_provider
TO flex_third_party;

GRANT SELECT ON TABLE flex.controllable_unit_service_provider
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.controllable_unit_service_provider_history
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.controllable_unit_service_provider_history
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.controllable_unit_service_provider_history
TO flex_end_user;

GRANT SELECT ON TABLE flex.controllable_unit_service_provider_history
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.controllable_unit_service_provider_history
TO flex_market_operator;

GRANT SELECT ON TABLE flex.controllable_unit_service_provider_history
TO flex_system_operator;

GRANT SELECT ON TABLE flex.controllable_unit_service_provider_history
TO flex_service_provider;

GRANT SELECT ON TABLE flex.controllable_unit_service_provider_history
TO flex_third_party;

GRANT SELECT ON TABLE flex.controllable_unit_service_provider_history
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.service_providing_group
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.service_providing_group
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.service_providing_group
TO flex_end_user;

GRANT INSERT ON TABLE flex.service_providing_group
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.service_providing_group
TO flex_flexibility_information_system_operator;

GRANT UPDATE ON TABLE flex.service_providing_group
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.service_providing_group
TO flex_market_operator;

GRANT SELECT ON TABLE flex.service_providing_group
TO flex_system_operator;

GRANT INSERT ON TABLE flex.service_providing_group
TO flex_service_provider;

GRANT SELECT ON TABLE flex.service_providing_group
TO flex_service_provider;

GRANT UPDATE ON TABLE flex.service_providing_group
TO flex_service_provider;

GRANT SELECT ON TABLE flex.service_providing_group
TO flex_third_party;

GRANT SELECT ON TABLE flex.service_providing_group
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.service_providing_group_history
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.service_providing_group_history
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.service_providing_group_history
TO flex_end_user;

GRANT SELECT ON TABLE flex.service_providing_group_history
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.service_providing_group_history
TO flex_market_operator;

GRANT SELECT ON TABLE flex.service_providing_group_history
TO flex_system_operator;

GRANT SELECT ON TABLE flex.service_providing_group_history
TO flex_service_provider;

GRANT SELECT ON TABLE flex.service_providing_group_history
TO flex_third_party;

GRANT SELECT ON TABLE flex.service_providing_group_history
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.service_providing_group_membership
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.service_providing_group_membership
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.service_providing_group_membership
TO flex_end_user;

GRANT INSERT ON TABLE flex.service_providing_group_membership
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.service_providing_group_membership
TO flex_flexibility_information_system_operator;

GRANT UPDATE ON TABLE flex.service_providing_group_membership
TO flex_flexibility_information_system_operator;

GRANT DELETE ON TABLE flex.service_providing_group_membership
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.service_providing_group_membership
TO flex_market_operator;

GRANT SELECT ON TABLE flex.service_providing_group_membership
TO flex_system_operator;

GRANT INSERT ON TABLE flex.service_providing_group_membership
TO flex_service_provider;

GRANT SELECT ON TABLE flex.service_providing_group_membership
TO flex_service_provider;

GRANT UPDATE ON TABLE flex.service_providing_group_membership
TO flex_service_provider;

GRANT DELETE ON TABLE flex.service_providing_group_membership
TO flex_service_provider;

GRANT SELECT ON TABLE flex.service_providing_group_membership
TO flex_third_party;

GRANT SELECT ON TABLE flex.service_providing_group_membership
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.service_providing_group_membership_history
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.service_providing_group_membership_history
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.service_providing_group_membership_history
TO flex_end_user;

GRANT SELECT ON TABLE flex.service_providing_group_membership_history
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.service_providing_group_membership_history
TO flex_market_operator;

GRANT SELECT ON TABLE flex.service_providing_group_membership_history
TO flex_system_operator;

GRANT SELECT ON TABLE flex.service_providing_group_membership_history
TO flex_service_provider;

GRANT SELECT ON TABLE flex.service_providing_group_membership_history
TO flex_third_party;

GRANT SELECT ON TABLE flex.service_providing_group_membership_history
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_end_user;

GRANT INSERT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_flexibility_information_system_operator;

GRANT UPDATE ON TABLE flex.service_providing_group_grid_prequalification
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_market_operator;

GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_system_operator;

GRANT UPDATE ON TABLE flex.service_providing_group_grid_prequalification
TO flex_system_operator;

GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_service_provider;

GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_third_party;

GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification_history
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification_history
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification_history
TO flex_end_user;

GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification_history
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification_history
TO flex_market_operator;

GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification_history
TO flex_system_operator;

GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification_history
TO flex_service_provider;

GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification_history
TO flex_third_party;

GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification_history
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.technical_resource
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.technical_resource
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.technical_resource
TO flex_end_user;

GRANT INSERT ON TABLE flex.technical_resource
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.technical_resource
TO flex_flexibility_information_system_operator;

GRANT UPDATE ON TABLE flex.technical_resource
TO flex_flexibility_information_system_operator;

GRANT DELETE ON TABLE flex.technical_resource
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.technical_resource
TO flex_market_operator;

GRANT SELECT ON TABLE flex.technical_resource
TO flex_system_operator;

GRANT INSERT ON TABLE flex.technical_resource
TO flex_service_provider;

GRANT SELECT ON TABLE flex.technical_resource
TO flex_service_provider;

GRANT UPDATE ON TABLE flex.technical_resource
TO flex_service_provider;

GRANT DELETE ON TABLE flex.technical_resource
TO flex_service_provider;

GRANT SELECT ON TABLE flex.technical_resource
TO flex_third_party;

GRANT SELECT ON TABLE flex.technical_resource
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.technical_resource_history
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.technical_resource_history
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.technical_resource_history
TO flex_end_user;

GRANT SELECT ON TABLE flex.technical_resource_history
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.technical_resource_history
TO flex_market_operator;

GRANT SELECT ON TABLE flex.technical_resource_history
TO flex_system_operator;

GRANT SELECT ON TABLE flex.technical_resource_history
TO flex_service_provider;

GRANT SELECT ON TABLE flex.technical_resource_history
TO flex_third_party;

GRANT SELECT ON TABLE flex.technical_resource_history
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.event
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.event
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.event
TO flex_end_user;

GRANT SELECT ON TABLE flex.event
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.event
TO flex_market_operator;

GRANT SELECT ON TABLE flex.event
TO flex_system_operator;

GRANT SELECT ON TABLE flex.event
TO flex_service_provider;

GRANT SELECT ON TABLE flex.event
TO flex_third_party;

GRANT SELECT ON TABLE flex.event
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.notification
TO flex_balance_responsible_party;

GRANT UPDATE ON TABLE flex.notification
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.notification
TO flex_energy_supplier;

GRANT UPDATE ON TABLE flex.notification
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.notification
TO flex_end_user;

GRANT UPDATE ON TABLE flex.notification
TO flex_end_user;

GRANT SELECT ON TABLE flex.notification
TO flex_flexibility_information_system_operator;

GRANT UPDATE ON TABLE flex.notification
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.notification
TO flex_market_operator;

GRANT UPDATE ON TABLE flex.notification
TO flex_market_operator;

GRANT SELECT ON TABLE flex.notification
TO flex_system_operator;

GRANT UPDATE ON TABLE flex.notification
TO flex_system_operator;

GRANT SELECT ON TABLE flex.notification
TO flex_service_provider;

GRANT UPDATE ON TABLE flex.notification
TO flex_service_provider;

GRANT SELECT ON TABLE flex.notification
TO flex_third_party;

GRANT UPDATE ON TABLE flex.notification
TO flex_third_party;

GRANT INSERT ON TABLE flex.notification
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.notification
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.accounting_point
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.accounting_point
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.accounting_point
TO flex_end_user;

GRANT SELECT ON TABLE flex.accounting_point
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.accounting_point
TO flex_market_operator;

GRANT SELECT ON TABLE flex.accounting_point
TO flex_system_operator;

GRANT SELECT ON TABLE flex.accounting_point
TO flex_service_provider;

GRANT SELECT ON TABLE flex.accounting_point
TO flex_third_party;

GRANT SELECT ON TABLE flex.accounting_point
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.product_type
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.product_type
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.product_type
TO flex_end_user;

GRANT SELECT ON TABLE flex.product_type
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.product_type
TO flex_market_operator;

GRANT SELECT ON TABLE flex.product_type
TO flex_system_operator;

GRANT SELECT ON TABLE flex.product_type
TO flex_service_provider;

GRANT SELECT ON TABLE flex.product_type
TO flex_third_party;

GRANT SELECT ON TABLE flex.system_operator_product_type
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.system_operator_product_type
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.system_operator_product_type
TO flex_end_user;

GRANT INSERT ON TABLE flex.system_operator_product_type
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.system_operator_product_type
TO flex_flexibility_information_system_operator;

GRANT UPDATE ON TABLE flex.system_operator_product_type
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.system_operator_product_type
TO flex_market_operator;

GRANT INSERT ON TABLE flex.system_operator_product_type
TO flex_system_operator;

GRANT SELECT ON TABLE flex.system_operator_product_type
TO flex_system_operator;

GRANT UPDATE ON TABLE flex.system_operator_product_type
TO flex_system_operator;

GRANT SELECT ON TABLE flex.system_operator_product_type
TO flex_service_provider;

GRANT SELECT ON TABLE flex.system_operator_product_type
TO flex_third_party;

GRANT SELECT ON TABLE flex.system_operator_product_type
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.system_operator_product_type_history
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.system_operator_product_type_history
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.system_operator_product_type_history
TO flex_end_user;

GRANT SELECT ON TABLE flex.system_operator_product_type_history
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.system_operator_product_type_history
TO flex_market_operator;

GRANT SELECT ON TABLE flex.system_operator_product_type_history
TO flex_system_operator;

GRANT SELECT ON TABLE flex.system_operator_product_type_history
TO flex_service_provider;

GRANT SELECT ON TABLE flex.system_operator_product_type_history
TO flex_third_party;

GRANT SELECT ON TABLE flex.system_operator_product_type_history
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.service_provider_product_application
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.service_provider_product_application
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.service_provider_product_application
TO flex_end_user;

GRANT SELECT ON TABLE flex.service_provider_product_application
TO flex_flexibility_information_system_operator;

GRANT UPDATE ON TABLE flex.service_provider_product_application
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.service_provider_product_application
TO flex_market_operator;

GRANT SELECT ON TABLE flex.service_provider_product_application
TO flex_system_operator;

GRANT UPDATE ON TABLE flex.service_provider_product_application
TO flex_system_operator;

GRANT INSERT ON TABLE flex.service_provider_product_application
TO flex_service_provider;

GRANT SELECT ON TABLE flex.service_provider_product_application
TO flex_service_provider;

GRANT UPDATE ON TABLE flex.service_provider_product_application
TO flex_service_provider;

GRANT SELECT ON TABLE flex.service_provider_product_application
TO flex_third_party;

GRANT SELECT ON TABLE flex.service_provider_product_application
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.service_provider_product_application_history
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.service_provider_product_application_history
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.service_provider_product_application_history
TO flex_end_user;

GRANT SELECT ON TABLE flex.service_provider_product_application_history
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.service_provider_product_application_history
TO flex_market_operator;

GRANT SELECT ON TABLE flex.service_provider_product_application_history
TO flex_system_operator;

GRANT SELECT ON TABLE flex.service_provider_product_application_history
TO flex_service_provider;

GRANT SELECT ON TABLE flex.service_provider_product_application_history
TO flex_third_party;

GRANT SELECT ON TABLE flex.service_provider_product_application_history
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.service_providing_group_product_application
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.service_providing_group_product_application
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.service_providing_group_product_application
TO flex_end_user;

GRANT SELECT ON TABLE flex.service_providing_group_product_application
TO flex_flexibility_information_system_operator;

GRANT UPDATE ON TABLE flex.service_providing_group_product_application
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.service_providing_group_product_application
TO flex_market_operator;

GRANT SELECT ON TABLE flex.service_providing_group_product_application
TO flex_system_operator;

GRANT UPDATE ON TABLE flex.service_providing_group_product_application
TO flex_system_operator;

GRANT INSERT ON TABLE flex.service_providing_group_product_application
TO flex_service_provider;

GRANT SELECT ON TABLE flex.service_providing_group_product_application
TO flex_service_provider;

GRANT UPDATE ON TABLE flex.service_providing_group_product_application
TO flex_service_provider;

GRANT SELECT ON TABLE flex.service_providing_group_product_application
TO flex_third_party;

GRANT SELECT ON TABLE flex.service_providing_group_product_application
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.service_providing_group_product_application_history
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.service_providing_group_product_application_history
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.service_providing_group_product_application_history
TO flex_end_user;

GRANT SELECT ON TABLE flex.service_providing_group_product_application_history
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.service_providing_group_product_application_history
TO flex_market_operator;

GRANT SELECT ON TABLE flex.service_providing_group_product_application_history
TO flex_system_operator;

GRANT SELECT ON TABLE flex.service_providing_group_product_application_history
TO flex_service_provider;

GRANT SELECT ON TABLE flex.service_providing_group_product_application_history
TO flex_third_party;

GRANT SELECT ON TABLE flex.service_providing_group_product_application_history
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.service_provider_product_application_comment
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.service_provider_product_application_comment
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.service_provider_product_application_comment
TO flex_end_user;

GRANT INSERT ON TABLE flex.service_provider_product_application_comment
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.service_provider_product_application_comment
TO flex_flexibility_information_system_operator;

GRANT UPDATE ON TABLE flex.service_provider_product_application_comment
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.service_provider_product_application_comment
TO flex_market_operator;

GRANT INSERT ON TABLE flex.service_provider_product_application_comment
TO flex_system_operator;

GRANT SELECT ON TABLE flex.service_provider_product_application_comment
TO flex_system_operator;

GRANT UPDATE ON TABLE flex.service_provider_product_application_comment
TO flex_system_operator;

GRANT INSERT ON TABLE flex.service_provider_product_application_comment
TO flex_service_provider;

GRANT SELECT ON TABLE flex.service_provider_product_application_comment
TO flex_service_provider;

GRANT UPDATE ON TABLE flex.service_provider_product_application_comment
TO flex_service_provider;

GRANT SELECT ON TABLE flex.service_provider_product_application_comment
TO flex_third_party;

GRANT SELECT ON TABLE flex.service_provider_product_application_comment
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.service_provider_product_application_comment_history
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.service_provider_product_application_comment_history
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.service_provider_product_application_comment_history
TO flex_end_user;

GRANT SELECT ON TABLE flex.service_provider_product_application_comment_history
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.service_provider_product_application_comment_history
TO flex_market_operator;

GRANT SELECT ON TABLE flex.service_provider_product_application_comment_history
TO flex_system_operator;

GRANT SELECT ON TABLE flex.service_provider_product_application_comment_history
TO flex_service_provider;

GRANT SELECT ON TABLE flex.service_provider_product_application_comment_history
TO flex_third_party;

GRANT SELECT ON TABLE flex.service_provider_product_application_comment_history
TO flex_internal_event_notification;

GRANT SELECT ON TABLE flex.notice
TO flex_balance_responsible_party;

GRANT SELECT ON TABLE flex.notice
TO flex_energy_supplier;

GRANT SELECT ON TABLE flex.notice
TO flex_end_user;

GRANT SELECT ON TABLE flex.notice
TO flex_flexibility_information_system_operator;

GRANT SELECT ON TABLE flex.notice
TO flex_market_operator;

GRANT SELECT ON TABLE flex.notice
TO flex_system_operator;

GRANT SELECT ON TABLE flex.notice
TO flex_service_provider;

GRANT SELECT ON TABLE flex.notice
TO flex_third_party;
