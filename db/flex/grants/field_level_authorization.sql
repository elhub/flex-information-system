-- liquibase formatted sql
-- AUTO-GENERATED FILE (just permissions-to-db)


-- changeset flex:flex-grant-entity-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-entity-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity
TO flex_energy_supplier;

-- changeset flex:flex-grant-entity-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity
TO flex_end_user;

-- changeset flex:flex-grant-entity-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.entity
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-entity-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-entity-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.entity
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-entity-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity
TO flex_market_operator;

-- changeset flex:flex-grant-entity-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity
TO flex_system_operator;

-- changeset flex:flex-grant-entity-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity
TO flex_service_provider;

-- changeset flex:flex-grant-entity-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity
TO flex_third_party;

-- changeset flex:flex-grant-entity-org-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity
TO flex_organisation;

-- changeset flex:flex-grant-entity-ent-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity
TO flex_entity;

-- changeset flex:flex-grant-entity-client-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity_client
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-entity-client-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity_client
TO flex_energy_supplier;

-- changeset flex:flex-grant-entity-client-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity_client
TO flex_end_user;

-- changeset flex:flex-grant-entity-client-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity_client
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-entity-client-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity_client
TO flex_market_operator;

-- changeset flex:flex-grant-entity-client-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity_client
TO flex_system_operator;

-- changeset flex:flex-grant-entity-client-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity_client
TO flex_service_provider;

-- changeset flex:flex-grant-entity-client-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity_client
TO flex_third_party;

-- changeset flex:flex-grant-entity-client-org-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity_client
TO flex_organisation;

-- changeset flex:flex-grant-entity-client-ent-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.entity_client
TO flex_entity;

-- changeset flex:flex-grant-entity-client-ent-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.entity_client
TO flex_entity;

-- changeset flex:flex-grant-entity-client-ent-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.entity_client
TO flex_entity;

-- changeset flex:flex-grant-entity-client-ent-delete endDelimiter:-- runAlways:true
GRANT DELETE ON TABLE flex.entity_client
TO flex_entity;

-- changeset flex:flex-grant-party-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-party-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party
TO flex_energy_supplier;

-- changeset flex:flex-grant-party-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party
TO flex_end_user;

-- changeset flex:flex-grant-party-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.party
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-party-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-party-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.party
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-party-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party
TO flex_market_operator;

-- changeset flex:flex-grant-party-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party
TO flex_system_operator;

-- changeset flex:flex-grant-party-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party
TO flex_service_provider;

-- changeset flex:flex-grant-party-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party
TO flex_third_party;

-- changeset flex:flex-grant-party-org-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party
TO flex_organisation;

-- changeset flex:flex-grant-party-ent-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party
TO flex_entity;

-- changeset flex:flex-grant-party-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party
TO flex_internal_event_notification;

-- changeset flex:flex-grant-party-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_history
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-party-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_history
TO flex_energy_supplier;

-- changeset flex:flex-grant-party-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_history
TO flex_end_user;

-- changeset flex:flex-grant-party-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_history
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-party-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_history
TO flex_market_operator;

-- changeset flex:flex-grant-party-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_history
TO flex_system_operator;

-- changeset flex:flex-grant-party-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_history
TO flex_service_provider;

-- changeset flex:flex-grant-party-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_history
TO flex_third_party;

-- changeset flex:flex-grant-party-history-org-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_history
TO flex_organisation;

-- changeset flex:flex-grant-party-history-ent-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_history
TO flex_entity;

-- changeset flex:flex-grant-party-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_history
TO flex_internal_event_notification;

-- changeset flex:flex-grant-identity-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.identity
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-identity-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.identity
TO flex_energy_supplier;

-- changeset flex:flex-grant-identity-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.identity
TO flex_end_user;

-- changeset flex:flex-grant-identity-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.identity
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-identity-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.identity
TO flex_market_operator;

-- changeset flex:flex-grant-identity-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.identity
TO flex_system_operator;

-- changeset flex:flex-grant-identity-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.identity
TO flex_service_provider;

-- changeset flex:flex-grant-identity-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.identity
TO flex_third_party;

-- changeset flex:flex-grant-identity-org-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.identity
TO flex_organisation;

-- changeset flex:flex-grant-identity-ent-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.identity
TO flex_entity;

-- changeset flex:flex-grant-party-membership-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-party-membership-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership
TO flex_energy_supplier;

-- changeset flex:flex-grant-party-membership-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership
TO flex_end_user;

-- changeset flex:flex-grant-party-membership-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.party_membership
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-party-membership-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-party-membership-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.party_membership
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-party-membership-fiso-delete endDelimiter:-- runAlways:true
GRANT DELETE ON TABLE flex.party_membership
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-party-membership-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership
TO flex_market_operator;

-- changeset flex:flex-grant-party-membership-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership
TO flex_system_operator;

-- changeset flex:flex-grant-party-membership-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership
TO flex_service_provider;

-- changeset flex:flex-grant-party-membership-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership
TO flex_third_party;

-- changeset flex:flex-grant-party-membership-org-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.party_membership
TO flex_organisation;

-- changeset flex:flex-grant-party-membership-org-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership
TO flex_organisation;

-- changeset flex:flex-grant-party-membership-org-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.party_membership
TO flex_organisation;

-- changeset flex:flex-grant-party-membership-org-delete endDelimiter:-- runAlways:true
GRANT DELETE ON TABLE flex.party_membership
TO flex_organisation;

-- changeset flex:flex-grant-party-membership-ent-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership
TO flex_entity;

-- changeset flex:flex-grant-party-membership-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership_history
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-party-membership-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership_history
TO flex_energy_supplier;

-- changeset flex:flex-grant-party-membership-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership_history
TO flex_end_user;

-- changeset flex:flex-grant-party-membership-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership_history
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-party-membership-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership_history
TO flex_market_operator;

-- changeset flex:flex-grant-party-membership-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership_history
TO flex_system_operator;

-- changeset flex:flex-grant-party-membership-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership_history
TO flex_service_provider;

-- changeset flex:flex-grant-party-membership-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership_history
TO flex_third_party;

-- changeset flex:flex-grant-party-membership-history-org-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership_history
TO flex_organisation;

-- changeset flex:flex-grant-party-membership-history-ent-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.party_membership_history
TO flex_entity;

-- changeset flex:flex-grant-controllable-unit-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-controllable-unit-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit
TO flex_energy_supplier;

-- changeset flex:flex-grant-controllable-unit-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit
TO flex_end_user;

-- changeset flex:flex-grant-controllable-unit-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.controllable_unit
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-controllable-unit-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-controllable-unit-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.controllable_unit
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-controllable-unit-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit
TO flex_market_operator;

-- changeset flex:flex-grant-controllable-unit-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit
TO flex_system_operator;

-- changeset flex:flex-grant-controllable-unit-so-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.controllable_unit
TO flex_system_operator;

-- changeset flex:flex-grant-controllable-unit-sp-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.controllable_unit
TO flex_service_provider;

-- changeset flex:flex-grant-controllable-unit-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit
TO flex_service_provider;

-- changeset flex:flex-grant-controllable-unit-sp-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.controllable_unit
TO flex_service_provider;

-- changeset flex:flex-grant-controllable-unit-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit
TO flex_third_party;

-- changeset flex:flex-grant-controllable-unit-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit
TO flex_internal_event_notification;

-- changeset flex:flex-grant-controllable-unit-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_history
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-controllable-unit-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_history
TO flex_energy_supplier;

-- changeset flex:flex-grant-controllable-unit-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_history
TO flex_end_user;

-- changeset flex:flex-grant-controllable-unit-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_history
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-controllable-unit-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_history
TO flex_market_operator;

-- changeset flex:flex-grant-controllable-unit-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_history
TO flex_system_operator;

-- changeset flex:flex-grant-controllable-unit-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_history
TO flex_service_provider;

-- changeset flex:flex-grant-controllable-unit-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_history
TO flex_third_party;

-- changeset flex:flex-grant-controllable-unit-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_history
TO flex_internal_event_notification;

-- changeset flex:flex-grant-controllable-unit-service-provider-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_service_provider
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-controllable-unit-service-provider-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_service_provider
TO flex_energy_supplier;

-- changeset flex:flex-grant-controllable-unit-service-provider-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_service_provider
TO flex_end_user;

-- changeset flex:flex-grant-controllable-unit-service-provider-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.controllable_unit_service_provider
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-controllable-unit-service-provider-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_service_provider
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-controllable-unit-service-provider-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.controllable_unit_service_provider
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-controllable-unit-service-provider-fiso-delete endDelimiter:-- runAlways:true
GRANT DELETE ON TABLE flex.controllable_unit_service_provider
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-controllable-unit-service-provider-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_service_provider
TO flex_market_operator;

-- changeset flex:flex-grant-controllable-unit-service-provider-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_service_provider
TO flex_system_operator;

-- changeset flex:flex-grant-controllable-unit-service-provider-sp-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.controllable_unit_service_provider
TO flex_service_provider;

-- changeset flex:flex-grant-controllable-unit-service-provider-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_service_provider
TO flex_service_provider;

-- changeset flex:flex-grant-controllable-unit-service-provider-sp-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.controllable_unit_service_provider
TO flex_service_provider;

-- changeset flex:flex-grant-controllable-unit-service-provider-sp-delete endDelimiter:-- runAlways:true
GRANT DELETE ON TABLE flex.controllable_unit_service_provider
TO flex_service_provider;

-- changeset flex:flex-grant-controllable-unit-service-provider-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_service_provider
TO flex_third_party;

-- changeset flex:flex-grant-controllable-unit-service-provider-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_service_provider
TO flex_internal_event_notification;

-- changeset flex:flex-grant-controllable-unit-service-provider-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_service_provider_history
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-controllable-unit-service-provider-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_service_provider_history
TO flex_energy_supplier;

-- changeset flex:flex-grant-controllable-unit-service-provider-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_service_provider_history
TO flex_end_user;

-- changeset flex:flex-grant-controllable-unit-service-provider-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_service_provider_history
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-controllable-unit-service-provider-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_service_provider_history
TO flex_market_operator;

-- changeset flex:flex-grant-controllable-unit-service-provider-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_service_provider_history
TO flex_system_operator;

-- changeset flex:flex-grant-controllable-unit-service-provider-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_service_provider_history
TO flex_service_provider;

-- changeset flex:flex-grant-controllable-unit-service-provider-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_service_provider_history
TO flex_third_party;

-- changeset flex:flex-grant-controllable-unit-service-provider-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.controllable_unit_service_provider_history
TO flex_internal_event_notification;

-- changeset flex:flex-grant-service-providing-group-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-service-providing-group-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group
TO flex_energy_supplier;

-- changeset flex:flex-grant-service-providing-group-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group
TO flex_end_user;

-- changeset flex:flex-grant-service-providing-group-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.service_providing_group
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-providing-group-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-providing-group-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.service_providing_group
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-providing-group-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group
TO flex_market_operator;

-- changeset flex:flex-grant-service-providing-group-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group
TO flex_system_operator;

-- changeset flex:flex-grant-service-providing-group-sp-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.service_providing_group
TO flex_service_provider;

-- changeset flex:flex-grant-service-providing-group-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group
TO flex_service_provider;

-- changeset flex:flex-grant-service-providing-group-sp-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.service_providing_group
TO flex_service_provider;

-- changeset flex:flex-grant-service-providing-group-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group
TO flex_third_party;

-- changeset flex:flex-grant-service-providing-group-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group
TO flex_internal_event_notification;

-- changeset flex:flex-grant-service-providing-group-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_history
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-service-providing-group-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_history
TO flex_energy_supplier;

-- changeset flex:flex-grant-service-providing-group-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_history
TO flex_end_user;

-- changeset flex:flex-grant-service-providing-group-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_history
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-providing-group-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_history
TO flex_market_operator;

-- changeset flex:flex-grant-service-providing-group-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_history
TO flex_system_operator;

-- changeset flex:flex-grant-service-providing-group-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_history
TO flex_service_provider;

-- changeset flex:flex-grant-service-providing-group-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_history
TO flex_third_party;

-- changeset flex:flex-grant-service-providing-group-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_history
TO flex_internal_event_notification;

-- changeset flex:flex-grant-service-providing-group-membership-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_membership
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-service-providing-group-membership-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_membership
TO flex_energy_supplier;

-- changeset flex:flex-grant-service-providing-group-membership-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_membership
TO flex_end_user;

-- changeset flex:flex-grant-service-providing-group-membership-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.service_providing_group_membership
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-providing-group-membership-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_membership
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-providing-group-membership-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.service_providing_group_membership
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-providing-group-membership-fiso-delete endDelimiter:-- runAlways:true
GRANT DELETE ON TABLE flex.service_providing_group_membership
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-providing-group-membership-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_membership
TO flex_market_operator;

-- changeset flex:flex-grant-service-providing-group-membership-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_membership
TO flex_system_operator;

-- changeset flex:flex-grant-service-providing-group-membership-sp-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.service_providing_group_membership
TO flex_service_provider;

-- changeset flex:flex-grant-service-providing-group-membership-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_membership
TO flex_service_provider;

-- changeset flex:flex-grant-service-providing-group-membership-sp-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.service_providing_group_membership
TO flex_service_provider;

-- changeset flex:flex-grant-service-providing-group-membership-sp-delete endDelimiter:-- runAlways:true
GRANT DELETE ON TABLE flex.service_providing_group_membership
TO flex_service_provider;

-- changeset flex:flex-grant-service-providing-group-membership-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_membership
TO flex_third_party;

-- changeset flex:flex-grant-service-providing-group-membership-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_membership
TO flex_internal_event_notification;

-- changeset flex:flex-grant-service-providing-group-membership-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_membership_history
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-service-providing-group-membership-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_membership_history
TO flex_energy_supplier;

-- changeset flex:flex-grant-service-providing-group-membership-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_membership_history
TO flex_end_user;

-- changeset flex:flex-grant-service-providing-group-membership-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_membership_history
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-providing-group-membership-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_membership_history
TO flex_market_operator;

-- changeset flex:flex-grant-service-providing-group-membership-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_membership_history
TO flex_system_operator;

-- changeset flex:flex-grant-service-providing-group-membership-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_membership_history
TO flex_service_provider;

-- changeset flex:flex-grant-service-providing-group-membership-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_membership_history
TO flex_third_party;

-- changeset flex:flex-grant-service-providing-group-membership-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_membership_history
TO flex_internal_event_notification;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_energy_supplier;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_end_user;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.service_providing_group_grid_prequalification
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_market_operator;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_system_operator;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-so-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.service_providing_group_grid_prequalification
TO flex_system_operator;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_service_provider;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_third_party;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification
TO flex_internal_event_notification;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification_history
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification_history
TO flex_energy_supplier;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification_history
TO flex_end_user;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification_history
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification_history
TO flex_market_operator;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification_history
TO flex_system_operator;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification_history
TO flex_service_provider;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification_history
TO flex_third_party;

-- changeset flex:flex-grant-service-providing-group-grid-prequalification-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_grid_prequalification_history
TO flex_internal_event_notification;

-- changeset flex:flex-grant-technical-resource-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.technical_resource
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-technical-resource-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.technical_resource
TO flex_energy_supplier;

-- changeset flex:flex-grant-technical-resource-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.technical_resource
TO flex_end_user;

-- changeset flex:flex-grant-technical-resource-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.technical_resource
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-technical-resource-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.technical_resource
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-technical-resource-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.technical_resource
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-technical-resource-fiso-delete endDelimiter:-- runAlways:true
GRANT DELETE ON TABLE flex.technical_resource
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-technical-resource-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.technical_resource
TO flex_market_operator;

-- changeset flex:flex-grant-technical-resource-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.technical_resource
TO flex_system_operator;

-- changeset flex:flex-grant-technical-resource-sp-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.technical_resource
TO flex_service_provider;

-- changeset flex:flex-grant-technical-resource-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.technical_resource
TO flex_service_provider;

-- changeset flex:flex-grant-technical-resource-sp-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.technical_resource
TO flex_service_provider;

-- changeset flex:flex-grant-technical-resource-sp-delete endDelimiter:-- runAlways:true
GRANT DELETE ON TABLE flex.technical_resource
TO flex_service_provider;

-- changeset flex:flex-grant-technical-resource-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.technical_resource
TO flex_third_party;

-- changeset flex:flex-grant-technical-resource-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.technical_resource
TO flex_internal_event_notification;

-- changeset flex:flex-grant-technical-resource-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.technical_resource_history
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-technical-resource-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.technical_resource_history
TO flex_energy_supplier;

-- changeset flex:flex-grant-technical-resource-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.technical_resource_history
TO flex_end_user;

-- changeset flex:flex-grant-technical-resource-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.technical_resource_history
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-technical-resource-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.technical_resource_history
TO flex_market_operator;

-- changeset flex:flex-grant-technical-resource-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.technical_resource_history
TO flex_system_operator;

-- changeset flex:flex-grant-technical-resource-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.technical_resource_history
TO flex_service_provider;

-- changeset flex:flex-grant-technical-resource-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.technical_resource_history
TO flex_third_party;

-- changeset flex:flex-grant-technical-resource-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.technical_resource_history
TO flex_internal_event_notification;

-- changeset flex:flex-grant-event-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.event
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-event-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.event
TO flex_energy_supplier;

-- changeset flex:flex-grant-event-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.event
TO flex_end_user;

-- changeset flex:flex-grant-event-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.event
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-event-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.event
TO flex_market_operator;

-- changeset flex:flex-grant-event-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.event
TO flex_system_operator;

-- changeset flex:flex-grant-event-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.event
TO flex_service_provider;

-- changeset flex:flex-grant-event-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.event
TO flex_third_party;

-- changeset flex:flex-grant-event-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.event
TO flex_internal_event_notification;

-- changeset flex:flex-grant-notification-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.notification
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-notification-brp-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.notification
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-notification-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.notification
TO flex_energy_supplier;

-- changeset flex:flex-grant-notification-es-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.notification
TO flex_energy_supplier;

-- changeset flex:flex-grant-notification-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.notification
TO flex_end_user;

-- changeset flex:flex-grant-notification-eu-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.notification
TO flex_end_user;

-- changeset flex:flex-grant-notification-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.notification
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-notification-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.notification
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-notification-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.notification
TO flex_market_operator;

-- changeset flex:flex-grant-notification-mo-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.notification
TO flex_market_operator;

-- changeset flex:flex-grant-notification-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.notification
TO flex_system_operator;

-- changeset flex:flex-grant-notification-so-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.notification
TO flex_system_operator;

-- changeset flex:flex-grant-notification-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.notification
TO flex_service_provider;

-- changeset flex:flex-grant-notification-sp-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.notification
TO flex_service_provider;

-- changeset flex:flex-grant-notification-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.notification
TO flex_third_party;

-- changeset flex:flex-grant-notification-tp-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.notification
TO flex_third_party;

-- changeset flex:flex-grant-notification-ien-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.notification
TO flex_internal_event_notification;

-- changeset flex:flex-grant-notification-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.notification
TO flex_internal_event_notification;

-- changeset flex:flex-grant-accounting-point-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-accounting-point-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point
TO flex_energy_supplier;

-- changeset flex:flex-grant-accounting-point-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point
TO flex_end_user;

-- changeset flex:flex-grant-accounting-point-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-accounting-point-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point
TO flex_market_operator;

-- changeset flex:flex-grant-accounting-point-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point
TO flex_system_operator;

-- changeset flex:flex-grant-accounting-point-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point
TO flex_service_provider;

-- changeset flex:flex-grant-accounting-point-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point
TO flex_third_party;

-- changeset flex:flex-grant-accounting-point-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point
TO flex_internal_event_notification;

-- changeset flex:flex-grant-accounting-point-balance-responsible-party-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point_balance_responsible_party
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-accounting-point-balance-responsible-party-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point_balance_responsible_party
TO flex_energy_supplier;

-- changeset flex:flex-grant-accounting-point-balance-responsible-party-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point_balance_responsible_party
TO flex_end_user;

-- changeset flex:flex-grant-accounting-point-balance-responsible-party-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point_balance_responsible_party
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-accounting-point-balance-responsible-party-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point_balance_responsible_party
TO flex_market_operator;

-- changeset flex:flex-grant-accounting-point-balance-responsible-party-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point_balance_responsible_party
TO flex_system_operator;

-- changeset flex:flex-grant-accounting-point-balance-responsible-party-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point_balance_responsible_party
TO flex_service_provider;

-- changeset flex:flex-grant-accounting-point-balance-responsible-party-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point_balance_responsible_party
TO flex_third_party;

-- changeset flex:flex-grant-accounting-point-energy-supplier-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point_energy_supplier
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-accounting-point-energy-supplier-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point_energy_supplier
TO flex_energy_supplier;

-- changeset flex:flex-grant-accounting-point-energy-supplier-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point_energy_supplier
TO flex_end_user;

-- changeset flex:flex-grant-accounting-point-energy-supplier-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point_energy_supplier
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-accounting-point-energy-supplier-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point_energy_supplier
TO flex_market_operator;

-- changeset flex:flex-grant-accounting-point-energy-supplier-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point_energy_supplier
TO flex_system_operator;

-- changeset flex:flex-grant-accounting-point-energy-supplier-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point_energy_supplier
TO flex_service_provider;

-- changeset flex:flex-grant-accounting-point-energy-supplier-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.accounting_point_energy_supplier
TO flex_third_party;

-- changeset flex:flex-grant-product-type-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.product_type
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-product-type-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.product_type
TO flex_energy_supplier;

-- changeset flex:flex-grant-product-type-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.product_type
TO flex_end_user;

-- changeset flex:flex-grant-product-type-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.product_type
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-product-type-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.product_type
TO flex_market_operator;

-- changeset flex:flex-grant-product-type-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.product_type
TO flex_system_operator;

-- changeset flex:flex-grant-product-type-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.product_type
TO flex_service_provider;

-- changeset flex:flex-grant-product-type-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.product_type
TO flex_third_party;

-- changeset flex:flex-grant-system-operator-product-type-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.system_operator_product_type
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-system-operator-product-type-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.system_operator_product_type
TO flex_energy_supplier;

-- changeset flex:flex-grant-system-operator-product-type-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.system_operator_product_type
TO flex_end_user;

-- changeset flex:flex-grant-system-operator-product-type-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.system_operator_product_type
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-system-operator-product-type-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.system_operator_product_type
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-system-operator-product-type-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.system_operator_product_type
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-system-operator-product-type-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.system_operator_product_type
TO flex_market_operator;

-- changeset flex:flex-grant-system-operator-product-type-so-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.system_operator_product_type
TO flex_system_operator;

-- changeset flex:flex-grant-system-operator-product-type-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.system_operator_product_type
TO flex_system_operator;

-- changeset flex:flex-grant-system-operator-product-type-so-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.system_operator_product_type
TO flex_system_operator;

-- changeset flex:flex-grant-system-operator-product-type-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.system_operator_product_type
TO flex_service_provider;

-- changeset flex:flex-grant-system-operator-product-type-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.system_operator_product_type
TO flex_third_party;

-- changeset flex:flex-grant-system-operator-product-type-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.system_operator_product_type
TO flex_internal_event_notification;

-- changeset flex:flex-grant-system-operator-product-type-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.system_operator_product_type_history
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-system-operator-product-type-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.system_operator_product_type_history
TO flex_energy_supplier;

-- changeset flex:flex-grant-system-operator-product-type-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.system_operator_product_type_history
TO flex_end_user;

-- changeset flex:flex-grant-system-operator-product-type-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.system_operator_product_type_history
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-system-operator-product-type-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.system_operator_product_type_history
TO flex_market_operator;

-- changeset flex:flex-grant-system-operator-product-type-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.system_operator_product_type_history
TO flex_system_operator;

-- changeset flex:flex-grant-system-operator-product-type-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.system_operator_product_type_history
TO flex_service_provider;

-- changeset flex:flex-grant-system-operator-product-type-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.system_operator_product_type_history
TO flex_third_party;

-- changeset flex:flex-grant-system-operator-product-type-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.system_operator_product_type_history
TO flex_internal_event_notification;

-- changeset flex:flex-grant-service-provider-product-application-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-service-provider-product-application-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application
TO flex_energy_supplier;

-- changeset flex:flex-grant-service-provider-product-application-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application
TO flex_end_user;

-- changeset flex:flex-grant-service-provider-product-application-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-provider-product-application-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.service_provider_product_application
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-provider-product-application-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application
TO flex_market_operator;

-- changeset flex:flex-grant-service-provider-product-application-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application
TO flex_system_operator;

-- changeset flex:flex-grant-service-provider-product-application-so-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.service_provider_product_application
TO flex_system_operator;

-- changeset flex:flex-grant-service-provider-product-application-sp-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.service_provider_product_application
TO flex_service_provider;

-- changeset flex:flex-grant-service-provider-product-application-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application
TO flex_service_provider;

-- changeset flex:flex-grant-service-provider-product-application-sp-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.service_provider_product_application
TO flex_service_provider;

-- changeset flex:flex-grant-service-provider-product-application-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application
TO flex_third_party;

-- changeset flex:flex-grant-service-provider-product-application-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application
TO flex_internal_event_notification;

-- changeset flex:flex-grant-service-provider-product-application-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_history
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-service-provider-product-application-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_history
TO flex_energy_supplier;

-- changeset flex:flex-grant-service-provider-product-application-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_history
TO flex_end_user;

-- changeset flex:flex-grant-service-provider-product-application-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_history
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-provider-product-application-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_history
TO flex_market_operator;

-- changeset flex:flex-grant-service-provider-product-application-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_history
TO flex_system_operator;

-- changeset flex:flex-grant-service-provider-product-application-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_history
TO flex_service_provider;

-- changeset flex:flex-grant-service-provider-product-application-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_history
TO flex_third_party;

-- changeset flex:flex-grant-service-provider-product-application-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_history
TO flex_internal_event_notification;

-- changeset flex:flex-grant-service-providing-group-product-application-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_product_application
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-service-providing-group-product-application-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_product_application
TO flex_energy_supplier;

-- changeset flex:flex-grant-service-providing-group-product-application-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_product_application
TO flex_end_user;

-- changeset flex:flex-grant-service-providing-group-product-application-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_product_application
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-providing-group-product-application-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.service_providing_group_product_application
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-providing-group-product-application-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_product_application
TO flex_market_operator;

-- changeset flex:flex-grant-service-providing-group-product-application-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_product_application
TO flex_system_operator;

-- changeset flex:flex-grant-service-providing-group-product-application-so-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.service_providing_group_product_application
TO flex_system_operator;

-- changeset flex:flex-grant-service-providing-group-product-application-sp-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.service_providing_group_product_application
TO flex_service_provider;

-- changeset flex:flex-grant-service-providing-group-product-application-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_product_application
TO flex_service_provider;

-- changeset flex:flex-grant-service-providing-group-product-application-sp-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.service_providing_group_product_application
TO flex_service_provider;

-- changeset flex:flex-grant-service-providing-group-product-application-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_product_application
TO flex_third_party;

-- changeset flex:flex-grant-service-providing-group-product-application-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_product_application
TO flex_internal_event_notification;

-- changeset flex:flex-grant-service-providing-group-product-application-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_product_application_history
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-service-providing-group-product-application-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_product_application_history
TO flex_energy_supplier;

-- changeset flex:flex-grant-service-providing-group-product-application-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_product_application_history
TO flex_end_user;

-- changeset flex:flex-grant-service-providing-group-product-application-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_product_application_history
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-providing-group-product-application-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_product_application_history
TO flex_market_operator;

-- changeset flex:flex-grant-service-providing-group-product-application-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_product_application_history
TO flex_system_operator;

-- changeset flex:flex-grant-service-providing-group-product-application-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_product_application_history
TO flex_service_provider;

-- changeset flex:flex-grant-service-providing-group-product-application-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_product_application_history
TO flex_third_party;

-- changeset flex:flex-grant-service-providing-group-product-application-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_providing_group_product_application_history
TO flex_internal_event_notification;

-- changeset flex:flex-grant-service-provider-product-application-comment-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_comment
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-service-provider-product-application-comment-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_comment
TO flex_energy_supplier;

-- changeset flex:flex-grant-service-provider-product-application-comment-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_comment
TO flex_end_user;

-- changeset flex:flex-grant-service-provider-product-application-comment-fiso-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.service_provider_product_application_comment
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-provider-product-application-comment-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_comment
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-provider-product-application-comment-fiso-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.service_provider_product_application_comment
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-provider-product-application-comment-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_comment
TO flex_market_operator;

-- changeset flex:flex-grant-service-provider-product-application-comment-so-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.service_provider_product_application_comment
TO flex_system_operator;

-- changeset flex:flex-grant-service-provider-product-application-comment-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_comment
TO flex_system_operator;

-- changeset flex:flex-grant-service-provider-product-application-comment-so-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.service_provider_product_application_comment
TO flex_system_operator;

-- changeset flex:flex-grant-service-provider-product-application-comment-sp-insert endDelimiter:-- runAlways:true
GRANT INSERT ON TABLE flex.service_provider_product_application_comment
TO flex_service_provider;

-- changeset flex:flex-grant-service-provider-product-application-comment-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_comment
TO flex_service_provider;

-- changeset flex:flex-grant-service-provider-product-application-comment-sp-update endDelimiter:-- runAlways:true
GRANT UPDATE ON TABLE flex.service_provider_product_application_comment
TO flex_service_provider;

-- changeset flex:flex-grant-service-provider-product-application-comment-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_comment
TO flex_third_party;

-- changeset flex:flex-grant-service-provider-product-application-comment-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_comment
TO flex_internal_event_notification;

-- changeset flex:flex-grant-service-provider-product-application-comment-history-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_comment_history
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-service-provider-product-application-comment-history-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_comment_history
TO flex_energy_supplier;

-- changeset flex:flex-grant-service-provider-product-application-comment-history-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_comment_history
TO flex_end_user;

-- changeset flex:flex-grant-service-provider-product-application-comment-history-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_comment_history
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-service-provider-product-application-comment-history-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_comment_history
TO flex_market_operator;

-- changeset flex:flex-grant-service-provider-product-application-comment-history-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_comment_history
TO flex_system_operator;

-- changeset flex:flex-grant-service-provider-product-application-comment-history-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_comment_history
TO flex_service_provider;

-- changeset flex:flex-grant-service-provider-product-application-comment-history-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_comment_history
TO flex_third_party;

-- changeset flex:flex-grant-service-provider-product-application-comment-history-ien-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.service_provider_product_application_comment_history
TO flex_internal_event_notification;

-- changeset flex:flex-grant-notice-brp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.notice
TO flex_balance_responsible_party;

-- changeset flex:flex-grant-notice-es-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.notice
TO flex_energy_supplier;

-- changeset flex:flex-grant-notice-eu-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.notice
TO flex_end_user;

-- changeset flex:flex-grant-notice-fiso-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.notice
TO flex_flexibility_information_system_operator;

-- changeset flex:flex-grant-notice-mo-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.notice
TO flex_market_operator;

-- changeset flex:flex-grant-notice-so-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.notice
TO flex_system_operator;

-- changeset flex:flex-grant-notice-sp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.notice
TO flex_service_provider;

-- changeset flex:flex-grant-notice-tp-select endDelimiter:-- runAlways:true
GRANT SELECT ON TABLE flex.notice
TO flex_third_party;
