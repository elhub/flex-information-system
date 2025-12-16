// AUTO-GENERATED FILE (scripts/resources_to_intl.py)

export type FieldLabel =
  | "accounting_point.business_id"
  | "accounting_point.id"
  | "accounting_point.recorded_at"
  | "accounting_point.recorded_by"
  | "accounting_point.system_operator_id"
  | "accounting_point_balance_responsible_party.accounting_point_id"
  | "accounting_point_balance_responsible_party.balance_responsible_party_id"
  | "accounting_point_balance_responsible_party.energy_direction"
  | "accounting_point_balance_responsible_party.valid_from"
  | "accounting_point_balance_responsible_party.valid_to"
  | "accounting_point_energy_supplier.accounting_point_id"
  | "accounting_point_energy_supplier.energy_supplier_id"
  | "accounting_point_energy_supplier.valid_from"
  | "accounting_point_energy_supplier.valid_to"
  | "controllable_unit.accounting_point_id"
  | "controllable_unit.business_id"
  | "controllable_unit.grid_node_id"
  | "controllable_unit.grid_validation_notes"
  | "controllable_unit.grid_validation_status"
  | "controllable_unit.id"
  | "controllable_unit.is_small"
  | "controllable_unit.maximum_available_capacity"
  | "controllable_unit.maximum_duration"
  | "controllable_unit.minimum_duration"
  | "controllable_unit.name"
  | "controllable_unit.ramp_rate"
  | "controllable_unit.recorded_at"
  | "controllable_unit.recorded_by"
  | "controllable_unit.recovery_duration"
  | "controllable_unit.regulation_direction"
  | "controllable_unit.start_date"
  | "controllable_unit.status"
  | "controllable_unit.validated_at"
  | "controllable_unit_service_provider.contract_reference"
  | "controllable_unit_service_provider.controllable_unit_id"
  | "controllable_unit_service_provider.end_user_id"
  | "controllable_unit_service_provider.id"
  | "controllable_unit_service_provider.recorded_at"
  | "controllable_unit_service_provider.recorded_by"
  | "controllable_unit_service_provider.service_provider_id"
  | "controllable_unit_service_provider.valid_from"
  | "controllable_unit_service_provider.valid_to"
  | "controllable_unit_suspension.controllable_unit_id"
  | "controllable_unit_suspension.id"
  | "controllable_unit_suspension.impacted_system_operator_id"
  | "controllable_unit_suspension.reason"
  | "controllable_unit_suspension.recorded_at"
  | "controllable_unit_suspension.recorded_by"
  | "entity.business_id"
  | "entity.business_id_type"
  | "entity.id"
  | "entity.name"
  | "entity.recorded_at"
  | "entity.recorded_by"
  | "entity.type"
  | "entity_client.client_id"
  | "entity_client.client_secret"
  | "entity_client.entity_id"
  | "entity_client.id"
  | "entity_client.name"
  | "entity_client.party_id"
  | "entity_client.public_key"
  | "entity_client.recorded_at"
  | "entity_client.recorded_by"
  | "entity_client.scopes"
  | "event.data"
  | "event.id"
  | "event.source"
  | "event.specversion"
  | "event.subject"
  | "event.time"
  | "event.type"
  | "identity.entity_id"
  | "identity.entity_name"
  | "identity.id"
  | "identity.party_id"
  | "identity.party_name"
  | "notice.data"
  | "notice.party_id"
  | "notice.source"
  | "notice.type"
  | "notification.acknowledged"
  | "notification.event_id"
  | "notification.id"
  | "notification.party_id"
  | "notification.recorded_at"
  | "notification.recorded_by"
  | "party.business_id"
  | "party.business_id_type"
  | "party.entity_id"
  | "party.id"
  | "party.name"
  | "party.recorded_at"
  | "party.recorded_by"
  | "party.role"
  | "party.status"
  | "party.type"
  | "party_membership.entity_id"
  | "party_membership.id"
  | "party_membership.party_id"
  | "party_membership.recorded_at"
  | "party_membership.recorded_by"
  | "party_membership.scopes"
  | "product_type.business_id"
  | "product_type.id"
  | "product_type.name"
  | "product_type.products"
  | "product_type.service"
  | "service_provider_product_application.id"
  | "service_provider_product_application.product_type_ids"
  | "service_provider_product_application.qualified_at"
  | "service_provider_product_application.recorded_at"
  | "service_provider_product_application.recorded_by"
  | "service_provider_product_application.service_provider_id"
  | "service_provider_product_application.status"
  | "service_provider_product_application.system_operator_id"
  | "service_provider_product_suspension.id"
  | "service_provider_product_suspension.procuring_system_operator_id"
  | "service_provider_product_suspension.product_type_ids"
  | "service_provider_product_suspension.reason"
  | "service_provider_product_suspension.recorded_at"
  | "service_provider_product_suspension.recorded_by"
  | "service_provider_product_suspension.service_provider_id"
  | "service_providing_group.bidding_zone"
  | "service_providing_group.id"
  | "service_providing_group.name"
  | "service_providing_group.recorded_at"
  | "service_providing_group.recorded_by"
  | "service_providing_group.service_provider_id"
  | "service_providing_group.status"
  | "service_providing_group_grid_prequalification.id"
  | "service_providing_group_grid_prequalification.impacted_system_operator_id"
  | "service_providing_group_grid_prequalification.prequalified_at"
  | "service_providing_group_grid_prequalification.recorded_at"
  | "service_providing_group_grid_prequalification.recorded_by"
  | "service_providing_group_grid_prequalification.service_providing_group_id"
  | "service_providing_group_grid_prequalification.status"
  | "service_providing_group_grid_suspension.id"
  | "service_providing_group_grid_suspension.impacted_system_operator_id"
  | "service_providing_group_grid_suspension.reason"
  | "service_providing_group_grid_suspension.recorded_at"
  | "service_providing_group_grid_suspension.recorded_by"
  | "service_providing_group_grid_suspension.service_providing_group_id"
  | "service_providing_group_membership.controllable_unit_id"
  | "service_providing_group_membership.id"
  | "service_providing_group_membership.recorded_at"
  | "service_providing_group_membership.recorded_by"
  | "service_providing_group_membership.service_providing_group_id"
  | "service_providing_group_membership.valid_from"
  | "service_providing_group_membership.valid_to"
  | "service_providing_group_product_application.id"
  | "service_providing_group_product_application.notes"
  | "service_providing_group_product_application.prequalified_at"
  | "service_providing_group_product_application.procuring_system_operator_id"
  | "service_providing_group_product_application.product_type_ids"
  | "service_providing_group_product_application.recorded_at"
  | "service_providing_group_product_application.recorded_by"
  | "service_providing_group_product_application.service_providing_group_id"
  | "service_providing_group_product_application.status"
  | "service_providing_group_product_application.verified_at"
  | "service_providing_group_product_suspension.id"
  | "service_providing_group_product_suspension.procuring_system_operator_id"
  | "service_providing_group_product_suspension.product_type_ids"
  | "service_providing_group_product_suspension.reason"
  | "service_providing_group_product_suspension.recorded_at"
  | "service_providing_group_product_suspension.recorded_by"
  | "service_providing_group_product_suspension.service_providing_group_id"
  | "system_operator_product_type.id"
  | "system_operator_product_type.product_type_id"
  | "system_operator_product_type.recorded_at"
  | "system_operator_product_type.recorded_by"
  | "system_operator_product_type.status"
  | "system_operator_product_type.system_operator_id"
  | "technical_resource.controllable_unit_id"
  | "technical_resource.details"
  | "technical_resource.id"
  | "technical_resource.name"
  | "technical_resource.recorded_at"
  | "technical_resource.recorded_by"
;

export const fieldLabels: Record<string, Record<FieldLabel, string>> = {
  "en": {
    "controllable_unit.id": "ID",
    "controllable_unit.business_id": "Business ID",
    "controllable_unit.name": "Name",
    "controllable_unit.start_date": "Start date",
    "controllable_unit.status": "Status",
    "controllable_unit.regulation_direction": "Regulation direction",
    "controllable_unit.maximum_available_capacity": "Maximum available capacity",
    "controllable_unit.is_small": "Small",
    "controllable_unit.minimum_duration": "Minimum duration",
    "controllable_unit.maximum_duration": "Maximum duration",
    "controllable_unit.recovery_duration": "Recovery duration",
    "controllable_unit.ramp_rate": "Ramp rate",
    "controllable_unit.accounting_point_id": "Accounting point ID",
    "controllable_unit.grid_node_id": "Grid node ID",
    "controllable_unit.grid_validation_status": "Grid validation status",
    "controllable_unit.grid_validation_notes": "Grid validation notes",
    "controllable_unit.validated_at": "Validated at",
    "controllable_unit.recorded_at": "Recorded at",
    "controllable_unit.recorded_by": "Recorded by",
    "controllable_unit_suspension.id": "ID",
    "controllable_unit_suspension.controllable_unit_id": "Controllable Unit",
    "controllable_unit_suspension.impacted_system_operator_id": "Impacted system operator",
    "controllable_unit_suspension.reason": "Reason",
    "controllable_unit_suspension.recorded_at": "Recorded at",
    "controllable_unit_suspension.recorded_by": "Recorded by",
    "controllable_unit_service_provider.id": "ID",
    "controllable_unit_service_provider.controllable_unit_id": "Controllable unit",
    "controllable_unit_service_provider.service_provider_id": "Service provider",
    "controllable_unit_service_provider.end_user_id": "End user",
    "controllable_unit_service_provider.contract_reference": "Contract reference",
    "controllable_unit_service_provider.valid_from": "Valid from",
    "controllable_unit_service_provider.valid_to": "Valid to",
    "controllable_unit_service_provider.recorded_at": "Recorded at",
    "controllable_unit_service_provider.recorded_by": "Recorded by",
    "service_providing_group.id": "ID",
    "service_providing_group.name": "Name",
    "service_providing_group.service_provider_id": "Service provider",
    "service_providing_group.bidding_zone": "Bidding zone",
    "service_providing_group.status": "Status",
    "service_providing_group.recorded_at": "Recorded at",
    "service_providing_group.recorded_by": "Recorded by",
    "service_providing_group_membership.id": "ID",
    "service_providing_group_membership.controllable_unit_id": "Controllable unit",
    "service_providing_group_membership.service_providing_group_id": "Service providing group",
    "service_providing_group_membership.valid_from": "Valid from",
    "service_providing_group_membership.valid_to": "Valid to",
    "service_providing_group_membership.recorded_at": "Recorded at",
    "service_providing_group_membership.recorded_by": "Recorded by",
    "service_providing_group_grid_prequalification.id": "ID",
    "service_providing_group_grid_prequalification.service_providing_group_id": "Service providing group",
    "service_providing_group_grid_prequalification.impacted_system_operator_id": "Impacted system operator",
    "service_providing_group_grid_prequalification.status": "Status",
    "service_providing_group_grid_prequalification.prequalified_at": "Prequalified at",
    "service_providing_group_grid_prequalification.recorded_at": "Recorded at",
    "service_providing_group_grid_prequalification.recorded_by": "Recorded by",
    "service_providing_group_grid_suspension.id": "ID",
    "service_providing_group_grid_suspension.impacted_system_operator_id": "Impacted system operator",
    "service_providing_group_grid_suspension.service_providing_group_id": "Service providing group",
    "service_providing_group_grid_suspension.reason": "Reason",
    "service_providing_group_grid_suspension.recorded_at": "Recorded at",
    "service_providing_group_grid_suspension.recorded_by": "Recorded by",
    "entity.id": "ID",
    "entity.business_id": "Business ID",
    "entity.business_id_type": "Business ID type",
    "entity.name": "Name",
    "entity.type": "Type",
    "entity.recorded_at": "Recorded at",
    "entity.recorded_by": "Recorded by",
    "entity_client.id": "ID",
    "entity_client.entity_id": "Entity",
    "entity_client.name": "Name",
    "entity_client.client_id": "Client ID",
    "entity_client.party_id": "Party",
    "entity_client.scopes": "Scopes",
    "entity_client.client_secret": "Client secret",
    "entity_client.public_key": "Public key",
    "entity_client.recorded_at": "Recorded at",
    "entity_client.recorded_by": "Recorded by",
    "party.id": "ID",
    "party.business_id": "Business ID",
    "party.business_id_type": "Business ID type",
    "party.entity_id": "Entity",
    "party.name": "Name",
    "party.role": "Role",
    "party.type": "Type",
    "party.status": "Status",
    "party.recorded_at": "Recorded at",
    "party.recorded_by": "Recorded by",
    "party_membership.id": "ID",
    "party_membership.party_id": "Party",
    "party_membership.entity_id": "Entity",
    "party_membership.scopes": "Scopes",
    "party_membership.recorded_at": "Recorded at",
    "party_membership.recorded_by": "Recorded by",
    "identity.id": "ID",
    "identity.entity_id": "Entity",
    "identity.entity_name": "Entity name",
    "identity.party_id": "Party",
    "identity.party_name": "Party name",
    "technical_resource.id": "ID",
    "technical_resource.name": "Name",
    "technical_resource.controllable_unit_id": "Controllable Unit",
    "technical_resource.details": "Details",
    "technical_resource.recorded_at": "Recorded at",
    "technical_resource.recorded_by": "Recorded by",
    "event.id": "ID",
    "event.specversion": "Specification version",
    "event.time": "Time",
    "event.type": "Type",
    "event.source": "Source",
    "event.subject": "Subject",
    "event.data": "Data",
    "notification.id": "ID",
    "notification.acknowledged": "Acknowledged",
    "notification.event_id": "Event ID",
    "notification.party_id": "Party",
    "notification.recorded_at": "Recorded at",
    "notification.recorded_by": "Recorded by",
    "accounting_point.id": "ID",
    "accounting_point.business_id": "Business ID",
    "accounting_point.system_operator_id": "System operator",
    "accounting_point.recorded_at": "Recorded at",
    "accounting_point.recorded_by": "Recorded by",
    "accounting_point_balance_responsible_party.accounting_point_id": "Accounting point",
    "accounting_point_balance_responsible_party.balance_responsible_party_id": "Balance responsible party",
    "accounting_point_balance_responsible_party.energy_direction": "Energy direction",
    "accounting_point_balance_responsible_party.valid_from": "Valid from",
    "accounting_point_balance_responsible_party.valid_to": "Valid to",
    "accounting_point_energy_supplier.accounting_point_id": "Accounting point",
    "accounting_point_energy_supplier.energy_supplier_id": "Energy supplier",
    "accounting_point_energy_supplier.valid_from": "Valid from",
    "accounting_point_energy_supplier.valid_to": "Valid to",
    "product_type.id": "ID",
    "product_type.business_id": "Business ID",
    "product_type.name": "Name",
    "product_type.service": "Service",
    "product_type.products": "Products",
    "system_operator_product_type.id": "ID",
    "system_operator_product_type.system_operator_id": "System operator",
    "system_operator_product_type.product_type_id": "Product type",
    "system_operator_product_type.status": "Status",
    "system_operator_product_type.recorded_at": "Recorded at",
    "system_operator_product_type.recorded_by": "Recorded by",
    "service_provider_product_application.id": "ID",
    "service_provider_product_application.service_provider_id": "Service provider",
    "service_provider_product_application.system_operator_id": "System operator",
    "service_provider_product_application.product_type_ids": "Product types",
    "service_provider_product_application.status": "Status",
    "service_provider_product_application.qualified_at": "Qualified at",
    "service_provider_product_application.recorded_at": "Recorded at",
    "service_provider_product_application.recorded_by": "Recorded by",
    "service_provider_product_suspension.id": "ID",
    "service_provider_product_suspension.procuring_system_operator_id": "Procuring system operator",
    "service_provider_product_suspension.service_provider_id": "Service provider",
    "service_provider_product_suspension.product_type_ids": "Product types",
    "service_provider_product_suspension.reason": "Reason",
    "service_provider_product_suspension.recorded_at": "Recorded at",
    "service_provider_product_suspension.recorded_by": "Recorded by",
    "service_providing_group_product_application.id": "ID",
    "service_providing_group_product_application.service_providing_group_id": "Service providing group",
    "service_providing_group_product_application.procuring_system_operator_id": "Procuring system operator",
    "service_providing_group_product_application.product_type_ids": "Product types",
    "service_providing_group_product_application.status": "Status",
    "service_providing_group_product_application.notes": "Notes",
    "service_providing_group_product_application.prequalified_at": "Prequalified at",
    "service_providing_group_product_application.verified_at": "Verified at",
    "service_providing_group_product_application.recorded_at": "Recorded at",
    "service_providing_group_product_application.recorded_by": "Recorded by",
    "service_providing_group_product_suspension.id": "ID",
    "service_providing_group_product_suspension.procuring_system_operator_id": "Procuring system operator",
    "service_providing_group_product_suspension.service_providing_group_id": "Service providing group",
    "service_providing_group_product_suspension.product_type_ids": "Product typer",
    "service_providing_group_product_suspension.reason": "Reason",
    "service_providing_group_product_suspension.recorded_at": "Recorded at",
    "service_providing_group_product_suspension.recorded_by": "Recorded by",
    "notice.party_id": "Party",
    "notice.type": "Type",
    "notice.source": "Source",
    "notice.data": "Data"
  },
  "nb": {
    "controllable_unit.id": "ID",
    "controllable_unit.business_id": "Forretnings-ID",
    "controllable_unit.name": "Navn",
    "controllable_unit.start_date": "Startdato",
    "controllable_unit.status": "Status",
    "controllable_unit.regulation_direction": "Reguleringsretning",
    "controllable_unit.maximum_available_capacity": "Maksimal tilgjengelig kapasitet",
    "controllable_unit.is_small": "Liten",
    "controllable_unit.minimum_duration": "Minimumsvarighet",
    "controllable_unit.maximum_duration": "Maksimumsvarighet",
    "controllable_unit.recovery_duration": "Gjenopprettingsvarighet",
    "controllable_unit.ramp_rate": "Effektendringshastighet",
    "controllable_unit.accounting_point_id": "Avregningspunkt-ID",
    "controllable_unit.grid_node_id": "Nettnode-ID",
    "controllable_unit.grid_validation_status": "Nettvalideringsstatus",
    "controllable_unit.grid_validation_notes": "Nettvalideringsnotater",
    "controllable_unit.validated_at": "Validert",
    "controllable_unit.recorded_at": "Registrert",
    "controllable_unit.recorded_by": "Registrert av",
    "controllable_unit_suspension.id": "ID",
    "controllable_unit_suspension.controllable_unit_id": "Kontrollerbar enhet",
    "controllable_unit_suspension.impacted_system_operator_id": "Berørt systemoperatør",
    "controllable_unit_suspension.reason": "Årsak",
    "controllable_unit_suspension.recorded_at": "Registrert",
    "controllable_unit_suspension.recorded_by": "Registrert av",
    "controllable_unit_service_provider.id": "ID",
    "controllable_unit_service_provider.controllable_unit_id": "Kontrollerbar enhet",
    "controllable_unit_service_provider.service_provider_id": "Tjenesteleverandør",
    "controllable_unit_service_provider.end_user_id": "Sluttbruker",
    "controllable_unit_service_provider.contract_reference": "Kontraktsreferanse",
    "controllable_unit_service_provider.valid_from": "Gyldig fra",
    "controllable_unit_service_provider.valid_to": "Gyldig til",
    "controllable_unit_service_provider.recorded_at": "Registrert",
    "controllable_unit_service_provider.recorded_by": "Registrert av",
    "service_providing_group.id": "ID",
    "service_providing_group.name": "Navn",
    "service_providing_group.service_provider_id": "Tjenesteleverandør",
    "service_providing_group.bidding_zone": "Budområde",
    "service_providing_group.status": "Status",
    "service_providing_group.recorded_at": "Registrert",
    "service_providing_group.recorded_by": "Registrert av",
    "service_providing_group_membership.id": "ID",
    "service_providing_group_membership.controllable_unit_id": "Kontrollerbar enhet",
    "service_providing_group_membership.service_providing_group_id": "Fleksibilitetsgruppe",
    "service_providing_group_membership.valid_from": "Gyldig fra",
    "service_providing_group_membership.valid_to": "Gyldig til",
    "service_providing_group_membership.recorded_at": "Registrert",
    "service_providing_group_membership.recorded_by": "Registrert av",
    "service_providing_group_grid_prequalification.id": "ID",
    "service_providing_group_grid_prequalification.service_providing_group_id": "Fleksibilitetsgruppe",
    "service_providing_group_grid_prequalification.impacted_system_operator_id": "Berørt systemoperatør",
    "service_providing_group_grid_prequalification.status": "Status",
    "service_providing_group_grid_prequalification.prequalified_at": "Prekvalifisert",
    "service_providing_group_grid_prequalification.recorded_at": "Registrert",
    "service_providing_group_grid_prequalification.recorded_by": "Registrert av",
    "service_providing_group_grid_suspension.id": "ID",
    "service_providing_group_grid_suspension.impacted_system_operator_id": "Berørt systemoperatør",
    "service_providing_group_grid_suspension.service_providing_group_id": "Fleksibilitetsgruppe",
    "service_providing_group_grid_suspension.reason": "Årsak",
    "service_providing_group_grid_suspension.recorded_at": "Registrert",
    "service_providing_group_grid_suspension.recorded_by": "Registrert av",
    "entity.id": "ID",
    "entity.business_id": "Forretnings-ID",
    "entity.business_id_type": "Forretnings-ID-type",
    "entity.name": "Navn",
    "entity.type": "Type",
    "entity.recorded_at": "Registrert",
    "entity.recorded_by": "Registrert av",
    "entity_client.id": "ID",
    "entity_client.entity_id": "Entitet",
    "entity_client.name": "Navn",
    "entity_client.client_id": "Klient-ID",
    "entity_client.party_id": "Aktør",
    "entity_client.scopes": "Scopes",
    "entity_client.client_secret": "Klienthemmelighet",
    "entity_client.public_key": "Offentlig nøkkel",
    "entity_client.recorded_at": "Registrert",
    "entity_client.recorded_by": "Registrert av",
    "party.id": "ID",
    "party.business_id": "Forretnings-ID",
    "party.business_id_type": "Forretnings-ID-type",
    "party.entity_id": "Entitet",
    "party.name": "Navn",
    "party.role": "Rolle",
    "party.type": "Type",
    "party.status": "Status",
    "party.recorded_at": "Registrert",
    "party.recorded_by": "Registrert av",
    "party_membership.id": "ID",
    "party_membership.party_id": "Aktør",
    "party_membership.entity_id": "Entitet",
    "party_membership.scopes": "Scopes",
    "party_membership.recorded_at": "Registrert",
    "party_membership.recorded_by": "Registrert av",
    "identity.id": "ID",
    "identity.entity_id": "Entitet",
    "identity.entity_name": "Entitetsnavn",
    "identity.party_id": "Aktør",
    "identity.party_name": "Aktørnavn",
    "technical_resource.id": "ID",
    "technical_resource.name": "Navn",
    "technical_resource.controllable_unit_id": "Kontrollerbar enhet",
    "technical_resource.details": "Detaljer",
    "technical_resource.recorded_at": "Registrert",
    "technical_resource.recorded_by": "Registrert av",
    "event.id": "ID",
    "event.specversion": "Spesifikasjonsversjon",
    "event.time": "Tidspunkt",
    "event.type": "Type",
    "event.source": "Kilde",
    "event.subject": "Emne",
    "event.data": "Data",
    "notification.id": "ID",
    "notification.acknowledged": "Bekreftet",
    "notification.event_id": "Hendelse-ID",
    "notification.party_id": "Aktør",
    "notification.recorded_at": "Registrert",
    "notification.recorded_by": "Registrert av",
    "accounting_point.id": "ID",
    "accounting_point.business_id": "Forretnings-ID",
    "accounting_point.system_operator_id": "Systemoperatør",
    "accounting_point.recorded_at": "Registrert",
    "accounting_point.recorded_by": "Registrert av",
    "accounting_point_balance_responsible_party.accounting_point_id": "Avregningspunkt",
    "accounting_point_balance_responsible_party.balance_responsible_party_id": "Balanseansvarlig",
    "accounting_point_balance_responsible_party.energy_direction": "Energiretning",
    "accounting_point_balance_responsible_party.valid_from": "Gyldig fra",
    "accounting_point_balance_responsible_party.valid_to": "Gyldig til",
    "accounting_point_energy_supplier.accounting_point_id": "Avregningspunkt",
    "accounting_point_energy_supplier.energy_supplier_id": "Kraftleverandør",
    "accounting_point_energy_supplier.valid_from": "Gyldig fra",
    "accounting_point_energy_supplier.valid_to": "Gyldig til",
    "product_type.id": "ID",
    "product_type.business_id": "Forretnings-ID",
    "product_type.name": "Navn",
    "product_type.service": "Tjeneste",
    "product_type.products": "Produkter",
    "system_operator_product_type.id": "ID",
    "system_operator_product_type.system_operator_id": "Systemoperatør",
    "system_operator_product_type.product_type_id": "Produkttype",
    "system_operator_product_type.status": "Status",
    "system_operator_product_type.recorded_at": "Registrert",
    "system_operator_product_type.recorded_by": "Registrert av",
    "service_provider_product_application.id": "ID",
    "service_provider_product_application.service_provider_id": "Tjenesteleverandør",
    "service_provider_product_application.system_operator_id": "Systemoperatør",
    "service_provider_product_application.product_type_ids": "Produkttyper",
    "service_provider_product_application.status": "Status",
    "service_provider_product_application.qualified_at": "Kvalifisert",
    "service_provider_product_application.recorded_at": "Registrert",
    "service_provider_product_application.recorded_by": "Registrert av",
    "service_provider_product_suspension.id": "ID",
    "service_provider_product_suspension.procuring_system_operator_id": "Kjøpende systemoperatør",
    "service_provider_product_suspension.service_provider_id": "Tjenesteleverandør",
    "service_provider_product_suspension.product_type_ids": "Produkttyper",
    "service_provider_product_suspension.reason": "Årsak",
    "service_provider_product_suspension.recorded_at": "Registrert",
    "service_provider_product_suspension.recorded_by": "Registrert av",
    "service_providing_group_product_application.id": "ID",
    "service_providing_group_product_application.service_providing_group_id": "Fleksibilitetsgruppe",
    "service_providing_group_product_application.procuring_system_operator_id": "Kjøpende systemoperatør",
    "service_providing_group_product_application.product_type_ids": "Produkttyper",
    "service_providing_group_product_application.status": "Status",
    "service_providing_group_product_application.notes": "Notater",
    "service_providing_group_product_application.prequalified_at": "Prekvalifisert",
    "service_providing_group_product_application.verified_at": "Verifisert",
    "service_providing_group_product_application.recorded_at": "Registrert",
    "service_providing_group_product_application.recorded_by": "Registrert av",
    "service_providing_group_product_suspension.id": "ID",
    "service_providing_group_product_suspension.procuring_system_operator_id": "Kjøpende systemoperatør",
    "service_providing_group_product_suspension.service_providing_group_id": "Fleksibilitetsgruppe",
    "service_providing_group_product_suspension.product_type_ids": "Produkttyper",
    "service_providing_group_product_suspension.reason": "Årsak",
    "service_providing_group_product_suspension.recorded_at": "Registrert",
    "service_providing_group_product_suspension.recorded_by": "Registrert av",
    "notice.party_id": "Aktør",
    "notice.type": "Type",
    "notice.source": "Kilde",
    "notice.data": "Data"
  },
  "nn": {
    "controllable_unit.id": "ID",
    "controllable_unit.business_id": "Forretnings-ID",
    "controllable_unit.name": "Namn",
    "controllable_unit.start_date": "Startdato",
    "controllable_unit.status": "Status",
    "controllable_unit.regulation_direction": "Reguleringsretning",
    "controllable_unit.maximum_available_capacity": "Maksimal tilgjengeleg kapasitet",
    "controllable_unit.is_small": "Liten",
    "controllable_unit.minimum_duration": "Minimumsvarigheit",
    "controllable_unit.maximum_duration": "Maksimumsvarigheit",
    "controllable_unit.recovery_duration": "Gjenopprettingsvarigheit",
    "controllable_unit.ramp_rate": "Effektendringshastigheit",
    "controllable_unit.accounting_point_id": "Avregningspunkt-ID",
    "controllable_unit.grid_node_id": "Nettnode-ID",
    "controllable_unit.grid_validation_status": "Nettvalideringsstatus",
    "controllable_unit.grid_validation_notes": "Nettvalideringsnotat",
    "controllable_unit.validated_at": "Validert",
    "controllable_unit.recorded_at": "Registrert",
    "controllable_unit.recorded_by": "Registrert av",
    "controllable_unit_suspension.id": "ID",
    "controllable_unit_suspension.controllable_unit_id": "Kontrollerbar eining",
    "controllable_unit_suspension.impacted_system_operator_id": "Påverka systemoperatør",
    "controllable_unit_suspension.reason": "Årsak",
    "controllable_unit_suspension.recorded_at": "Registrert",
    "controllable_unit_suspension.recorded_by": "Registrert av",
    "controllable_unit_service_provider.id": "ID",
    "controllable_unit_service_provider.controllable_unit_id": "Kontrollerbar eining",
    "controllable_unit_service_provider.service_provider_id": "Tenesteleverandør",
    "controllable_unit_service_provider.end_user_id": "Sluttbrukar",
    "controllable_unit_service_provider.contract_reference": "Kontraktsreferanse",
    "controllable_unit_service_provider.valid_from": "Gyldig frå",
    "controllable_unit_service_provider.valid_to": "Gyldig til",
    "controllable_unit_service_provider.recorded_at": "Registrert",
    "controllable_unit_service_provider.recorded_by": "Registrert av",
    "service_providing_group.id": "ID",
    "service_providing_group.name": "Namn",
    "service_providing_group.service_provider_id": "Tenesteleverandør",
    "service_providing_group.bidding_zone": "Budområde",
    "service_providing_group.status": "Status",
    "service_providing_group.recorded_at": "Registrert",
    "service_providing_group.recorded_by": "Registrert av",
    "service_providing_group_membership.id": "ID",
    "service_providing_group_membership.controllable_unit_id": "Kontrollerbar eining",
    "service_providing_group_membership.service_providing_group_id": "Fleksibilitetsgruppe",
    "service_providing_group_membership.valid_from": "Gyldig frå",
    "service_providing_group_membership.valid_to": "Gyldig til",
    "service_providing_group_membership.recorded_at": "Registrert",
    "service_providing_group_membership.recorded_by": "Registrert av",
    "service_providing_group_grid_prequalification.id": "ID",
    "service_providing_group_grid_prequalification.service_providing_group_id": "Fleksibilitetsgruppe",
    "service_providing_group_grid_prequalification.impacted_system_operator_id": "Påverka systemoperatør",
    "service_providing_group_grid_prequalification.status": "Status",
    "service_providing_group_grid_prequalification.prequalified_at": "Prekvalifisert",
    "service_providing_group_grid_prequalification.recorded_at": "Registrert",
    "service_providing_group_grid_prequalification.recorded_by": "Registrert av",
    "service_providing_group_grid_suspension.id": "ID",
    "service_providing_group_grid_suspension.impacted_system_operator_id": "Påverka systemoperatør",
    "service_providing_group_grid_suspension.service_providing_group_id": "Fleksibilitetsgruppe",
    "service_providing_group_grid_suspension.reason": "Årsak",
    "service_providing_group_grid_suspension.recorded_at": "Registrert",
    "service_providing_group_grid_suspension.recorded_by": "Registrert av",
    "entity.id": "ID",
    "entity.business_id": "Forretnings-ID",
    "entity.business_id_type": "Forretnings-ID-type",
    "entity.name": "Namn",
    "entity.type": "Type",
    "entity.recorded_at": "Registrert",
    "entity.recorded_by": "Registrert av",
    "entity_client.id": "ID",
    "entity_client.entity_id": "Entitet",
    "entity_client.name": "Namn",
    "entity_client.client_id": "Klient-ID",
    "entity_client.party_id": "Aktør",
    "entity_client.scopes": "Scopes",
    "entity_client.client_secret": "Klientløyndom",
    "entity_client.public_key": "Offentleg nøkkel",
    "entity_client.recorded_at": "Registrert",
    "entity_client.recorded_by": "Registrert av",
    "party.id": "ID",
    "party.business_id": "Forretnings-ID",
    "party.business_id_type": "Forretnings-ID-type",
    "party.entity_id": "Entitet",
    "party.name": "Namn",
    "party.role": "Rolle",
    "party.type": "Type",
    "party.status": "Status",
    "party.recorded_at": "Registrert",
    "party.recorded_by": "Registrert av",
    "party_membership.id": "ID",
    "party_membership.party_id": "Aktør",
    "party_membership.entity_id": "Entitet",
    "party_membership.scopes": "Scopes",
    "party_membership.recorded_at": "Registrert",
    "party_membership.recorded_by": "Registrert av",
    "identity.id": "ID",
    "identity.entity_id": "Entitet",
    "identity.entity_name": "Entitetsnamn",
    "identity.party_id": "Aktør",
    "identity.party_name": "Aktørnamn",
    "technical_resource.id": "ID",
    "technical_resource.name": "Namn",
    "technical_resource.controllable_unit_id": "Kontrollerbar eining",
    "technical_resource.details": "Detaljar",
    "technical_resource.recorded_at": "Registrert",
    "technical_resource.recorded_by": "Registrert av",
    "event.id": "ID",
    "event.specversion": "Spesifikasjonsversjon",
    "event.time": "Tidspunkt",
    "event.type": "Type",
    "event.source": "Kjelde",
    "event.subject": "Emne",
    "event.data": "Data",
    "notification.id": "ID",
    "notification.acknowledged": "Bekrefta",
    "notification.event_id": "Hending-ID",
    "notification.party_id": "Aktør",
    "notification.recorded_at": "Registrert",
    "notification.recorded_by": "Registrert av",
    "accounting_point.id": "ID",
    "accounting_point.business_id": "Forretnings-ID",
    "accounting_point.system_operator_id": "Systemoperatør",
    "accounting_point.recorded_at": "Registrert",
    "accounting_point.recorded_by": "Registrert av",
    "accounting_point_balance_responsible_party.accounting_point_id": "Avregningspunkt",
    "accounting_point_balance_responsible_party.balance_responsible_party_id": "Balanseansvarleg",
    "accounting_point_balance_responsible_party.energy_direction": "Energiretning",
    "accounting_point_balance_responsible_party.valid_from": "Gyldig frå",
    "accounting_point_balance_responsible_party.valid_to": "Gyldig til",
    "accounting_point_energy_supplier.accounting_point_id": "Avregningspunkt",
    "accounting_point_energy_supplier.energy_supplier_id": "Kraftleverandør",
    "accounting_point_energy_supplier.valid_from": "Gyldig frå",
    "accounting_point_energy_supplier.valid_to": "Gyldig til",
    "product_type.id": "ID",
    "product_type.business_id": "Forretnings-ID",
    "product_type.name": "Namn",
    "product_type.service": "Teneste",
    "product_type.products": "Produkt",
    "system_operator_product_type.id": "ID",
    "system_operator_product_type.system_operator_id": "Systemoperatør",
    "system_operator_product_type.product_type_id": "Produkttype",
    "system_operator_product_type.status": "Status",
    "system_operator_product_type.recorded_at": "Registrert",
    "system_operator_product_type.recorded_by": "Registrert av",
    "service_provider_product_application.id": "ID",
    "service_provider_product_application.service_provider_id": "Tenesteleverandør",
    "service_provider_product_application.system_operator_id": "Systemoperatør",
    "service_provider_product_application.product_type_ids": "Produkttypar",
    "service_provider_product_application.status": "Status",
    "service_provider_product_application.qualified_at": "Kvalifisert",
    "service_provider_product_application.recorded_at": "Registrert",
    "service_provider_product_application.recorded_by": "Registrert av",
    "service_provider_product_suspension.id": "ID",
    "service_provider_product_suspension.procuring_system_operator_id": "Kjøpande systemoperatør",
    "service_provider_product_suspension.service_provider_id": "Tenesteleverandør",
    "service_provider_product_suspension.product_type_ids": "Produkttypar",
    "service_provider_product_suspension.reason": "Årsak",
    "service_provider_product_suspension.recorded_at": "Registrert",
    "service_provider_product_suspension.recorded_by": "Registrert av",
    "service_providing_group_product_application.id": "ID",
    "service_providing_group_product_application.service_providing_group_id": "Fleksibilitetsgruppe",
    "service_providing_group_product_application.procuring_system_operator_id": "Kjøpande systemoperatør",
    "service_providing_group_product_application.product_type_ids": "Produkttypar",
    "service_providing_group_product_application.status": "Status",
    "service_providing_group_product_application.notes": "Notat",
    "service_providing_group_product_application.prequalified_at": "Prekvalifisert",
    "service_providing_group_product_application.verified_at": "Verifisert",
    "service_providing_group_product_application.recorded_at": "Registrert",
    "service_providing_group_product_application.recorded_by": "Registrert av",
    "service_providing_group_product_suspension.id": "ID",
    "service_providing_group_product_suspension.procuring_system_operator_id": "Kjøpande systemoperatør",
    "service_providing_group_product_suspension.service_providing_group_id": "Fleksibilitetsgruppe",
    "service_providing_group_product_suspension.product_type_ids": "Produkttypar",
    "service_providing_group_product_suspension.reason": "Årsak",
    "service_providing_group_product_suspension.recorded_at": "Registrert",
    "service_providing_group_product_suspension.recorded_by": "Registrert av",
    "notice.party_id": "Aktør",
    "notice.type": "Type",
    "notice.source": "Kjelde",
    "notice.data": "Data"
  }
};
