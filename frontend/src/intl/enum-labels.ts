// AUTO-GENERATED FILE (scripts/resources_to_intl.py)

export type EnumLabel =
  | "accounting_point_balance_responsible_party.energy_direction.consumption"
  | "accounting_point_balance_responsible_party.energy_direction.production"
  | "comment.visibility.any_involved_party"
  | "comment.visibility.same_party"
  | "controllable_unit.grid_validation_status.in_progress"
  | "controllable_unit.grid_validation_status.incomplete_information"
  | "controllable_unit.grid_validation_status.pending"
  | "controllable_unit.grid_validation_status.validated"
  | "controllable_unit.grid_validation_status.validation_failed"
  | "controllable_unit.regulation_direction.both"
  | "controllable_unit.regulation_direction.down"
  | "controllable_unit.regulation_direction.up"
  | "controllable_unit.status.active"
  | "controllable_unit.status.inactive"
  | "controllable_unit.status.new"
  | "controllable_unit.status.terminated"
  | "controllable_unit_suspension.reason.compromises_safe_operation"
  | "controllable_unit_suspension.reason.other"
  | "entity.business_id_type.email"
  | "entity.business_id_type.org"
  | "entity.business_id_type.pid"
  | "entity.type.organisation"
  | "entity.type.person"
  | "party.business_id_type.eic_x"
  | "party.business_id_type.gln"
  | "party.business_id_type.org"
  | "party.business_id_type.uuid"
  | "party.role.flex_balance_responsible_party"
  | "party.role.flex_end_user"
  | "party.role.flex_energy_supplier"
  | "party.role.flex_flexibility_information_system_operator"
  | "party.role.flex_market_operator"
  | "party.role.flex_organisation"
  | "party.role.flex_service_provider"
  | "party.role.flex_system_operator"
  | "party.role.flex_third_party"
  | "party.status.active"
  | "party.status.inactive"
  | "party.status.new"
  | "party.status.suspended"
  | "party.status.terminated"
  | "party.type.balance_responsible_party"
  | "party.type.end_user"
  | "party.type.energy_supplier"
  | "party.type.flexibility_information_system_operator"
  | "party.type.market_operator"
  | "party.type.organisation"
  | "party.type.service_provider"
  | "party.type.system_operator"
  | "party.type.third_party"
  | "service_provider_product_application.status.communication_test"
  | "service_provider_product_application.status.in_progress"
  | "service_provider_product_application.status.not_qualified"
  | "service_provider_product_application.status.qualified"
  | "service_provider_product_application.status.requested"
  | "service_provider_product_suspension.reason.breach_of_conditions"
  | "service_provider_product_suspension.reason.clearing_issues"
  | "service_provider_product_suspension.reason.communication_issues"
  | "service_provider_product_suspension.reason.failing_heartbeat"
  | "service_provider_product_suspension.reason.other"
  | "service_provider_product_suspension.reason.system_issues"
  | "service_providing_group.bidding_zone.NO1"
  | "service_providing_group.bidding_zone.NO2"
  | "service_providing_group.bidding_zone.NO3"
  | "service_providing_group.bidding_zone.NO4"
  | "service_providing_group.bidding_zone.NO5"
  | "service_providing_group.status.active"
  | "service_providing_group.status.inactive"
  | "service_providing_group.status.new"
  | "service_providing_group.status.terminated"
  | "service_providing_group_grid_prequalification.status.approved"
  | "service_providing_group_grid_prequalification.status.conditionally_approved"
  | "service_providing_group_grid_prequalification.status.in_progress"
  | "service_providing_group_grid_prequalification.status.not_approved"
  | "service_providing_group_grid_prequalification.status.requested"
  | "service_providing_group_grid_suspension.reason.breach_of_conditions"
  | "service_providing_group_grid_suspension.reason.other"
  | "service_providing_group_grid_suspension.reason.significant_group_change"
  | "service_providing_group_product_application.status.in_progress"
  | "service_providing_group_product_application.status.prequalification_pending"
  | "service_providing_group_product_application.status.prequalified"
  | "service_providing_group_product_application.status.rejected"
  | "service_providing_group_product_application.status.requested"
  | "service_providing_group_product_application.status.temporary_qualified"
  | "service_providing_group_product_application.status.verified"
  | "service_providing_group_product_suspension.reason.failed_verification"
  | "service_providing_group_product_suspension.reason.other"
  | "system_operator_product_type.status.active"
  | "system_operator_product_type.status.inactive"
;

export const enumLabels: Record<string, Record<EnumLabel, string>> = {
  "en": {
    "comment.visibility.same_party": "Same party",
    "comment.visibility.any_involved_party": "Any involved party",
    "controllable_unit.status.new": "New",
    "controllable_unit.status.active": "Active",
    "controllable_unit.status.inactive": "Inactive",
    "controllable_unit.status.terminated": "Terminated",
    "controllable_unit.regulation_direction.up": "Up",
    "controllable_unit.regulation_direction.down": "Down",
    "controllable_unit.regulation_direction.both": "Both",
    "controllable_unit.grid_validation_status.pending": "Pending",
    "controllable_unit.grid_validation_status.in_progress": "In progress",
    "controllable_unit.grid_validation_status.incomplete_information": "Incomplete information",
    "controllable_unit.grid_validation_status.validated": "Validated",
    "controllable_unit.grid_validation_status.validation_failed": "Validation failed",
    "controllable_unit_suspension.reason.compromises_safe_operation": "Compromises safe operation",
    "controllable_unit_suspension.reason.other": "Other",
    "service_providing_group.bidding_zone.NO1": "NO1 (Eastern Norway)",
    "service_providing_group.bidding_zone.NO2": "NO2 (Southern Norway)",
    "service_providing_group.bidding_zone.NO3": "NO3 (Central Norway)",
    "service_providing_group.bidding_zone.NO4": "NO4 (Northern Norway)",
    "service_providing_group.bidding_zone.NO5": "NO5 (Western Norway)",
    "service_providing_group.status.new": "New",
    "service_providing_group.status.active": "Active",
    "service_providing_group.status.inactive": "Inactive",
    "service_providing_group.status.terminated": "Terminated",
    "service_providing_group_grid_prequalification.status.requested": "Requested",
    "service_providing_group_grid_prequalification.status.in_progress": "In progress",
    "service_providing_group_grid_prequalification.status.conditionally_approved": "Conditionally approved",
    "service_providing_group_grid_prequalification.status.approved": "Approved",
    "service_providing_group_grid_prequalification.status.not_approved": "Not approved",
    "service_providing_group_grid_suspension.reason.breach_of_conditions": "Breach of conditions",
    "service_providing_group_grid_suspension.reason.significant_group_change": "Significant group change",
    "service_providing_group_grid_suspension.reason.other": "Other",
    "entity.business_id_type.pid": "Personal ID number",
    "entity.business_id_type.org": "Organisation number",
    "entity.business_id_type.email": "Email",
    "entity.type.person": "Person",
    "entity.type.organisation": "Organisation",
    "party.business_id_type.gln": "GLN (Global Location Number)",
    "party.business_id_type.uuid": "UUID (Universally Unique Identifier)",
    "party.business_id_type.eic_x": "EIC-X (Energy Identification Code - Market parties)",
    "party.business_id_type.org": "Organisation number",
    "party.role.flex_balance_responsible_party": "Balance Responsible Party",
    "party.role.flex_end_user": "End User",
    "party.role.flex_energy_supplier": "Energy Supplier",
    "party.role.flex_flexibility_information_system_operator": "Flexibility Information System Operator",
    "party.role.flex_market_operator": "Market Operator",
    "party.role.flex_organisation": "Organisation",
    "party.role.flex_service_provider": "Service Provider",
    "party.role.flex_system_operator": "System Operator",
    "party.role.flex_third_party": "Third Party",
    "party.type.balance_responsible_party": "Balance Responsible Party",
    "party.type.end_user": "End User",
    "party.type.energy_supplier": "Energy Supplier",
    "party.type.flexibility_information_system_operator": "Flexibility Information System Operator",
    "party.type.market_operator": "Market Operator",
    "party.type.organisation": "Organisation",
    "party.type.service_provider": "Service Provider",
    "party.type.system_operator": "System Operator",
    "party.type.third_party": "Third Party",
    "party.status.new": "New",
    "party.status.active": "Active",
    "party.status.inactive": "Inactive",
    "party.status.suspended": "Suspended",
    "party.status.terminated": "Terminated",
    "accounting_point_balance_responsible_party.energy_direction.consumption": "Consumption",
    "accounting_point_balance_responsible_party.energy_direction.production": "Production",
    "system_operator_product_type.status.active": "Active",
    "system_operator_product_type.status.inactive": "Inactive",
    "service_provider_product_application.status.requested": "Requested",
    "service_provider_product_application.status.in_progress": "In progress",
    "service_provider_product_application.status.communication_test": "Communication test",
    "service_provider_product_application.status.not_qualified": "Not qualified",
    "service_provider_product_application.status.qualified": "Qualified",
    "service_provider_product_suspension.reason.communication_issues": "Communication issues",
    "service_provider_product_suspension.reason.failing_heartbeat": "Failing heartbeat",
    "service_provider_product_suspension.reason.system_issues": "System issues",
    "service_provider_product_suspension.reason.clearing_issues": "Clearing issues",
    "service_provider_product_suspension.reason.breach_of_conditions": "Breach of conditions",
    "service_provider_product_suspension.reason.other": "Other",
    "service_providing_group_product_application.status.requested": "Requested",
    "service_providing_group_product_application.status.prequalification_pending": "Prequalification pending",
    "service_providing_group_product_application.status.in_progress": "In progress",
    "service_providing_group_product_application.status.temporary_qualified": "Temporary qualified",
    "service_providing_group_product_application.status.prequalified": "Prequalified",
    "service_providing_group_product_application.status.verified": "Verified",
    "service_providing_group_product_application.status.rejected": "Rejected",
    "service_providing_group_product_suspension.reason.failed_verification": "Failed verification",
    "service_providing_group_product_suspension.reason.other": "Other"
  },
  "nb": {
    "comment.visibility.same_party": "Samme aktør",
    "comment.visibility.any_involved_party": "Alle involverte aktører",
    "controllable_unit.status.new": "Ny",
    "controllable_unit.status.active": "Aktiv",
    "controllable_unit.status.inactive": "Inaktiv",
    "controllable_unit.status.terminated": "Terminert",
    "controllable_unit.regulation_direction.up": "Opp",
    "controllable_unit.regulation_direction.down": "Ned",
    "controllable_unit.regulation_direction.both": "Begge",
    "controllable_unit.grid_validation_status.pending": "Venter",
    "controllable_unit.grid_validation_status.in_progress": "Under behandling",
    "controllable_unit.grid_validation_status.incomplete_information": "Ufullstendig informasjon",
    "controllable_unit.grid_validation_status.validated": "Validert",
    "controllable_unit.grid_validation_status.validation_failed": "Feilet validering",
    "controllable_unit_suspension.reason.compromises_safe_operation": "Truer sikker drift",
    "controllable_unit_suspension.reason.other": "Annet",
    "service_providing_group.bidding_zone.NO1": "NO1 (Østlandet)",
    "service_providing_group.bidding_zone.NO2": "NO2 (Sørvest-Norge)",
    "service_providing_group.bidding_zone.NO3": "NO3 (Midt-Norge)",
    "service_providing_group.bidding_zone.NO4": "NO4 (Nord-Norge)",
    "service_providing_group.bidding_zone.NO5": "NO5 (Vestlandet)",
    "service_providing_group.status.new": "Ny",
    "service_providing_group.status.active": "Aktiv",
    "service_providing_group.status.inactive": "Inaktiv",
    "service_providing_group.status.terminated": "Terminert",
    "service_providing_group_grid_prequalification.status.requested": "Forespurt",
    "service_providing_group_grid_prequalification.status.in_progress": "Under behandling",
    "service_providing_group_grid_prequalification.status.conditionally_approved": "Betinget godkjent",
    "service_providing_group_grid_prequalification.status.approved": "Godkjent",
    "service_providing_group_grid_prequalification.status.not_approved": "Ikke godkjent",
    "service_providing_group_grid_suspension.reason.breach_of_conditions": "Brudd på vilkår",
    "service_providing_group_grid_suspension.reason.significant_group_change": "Vesentlig endring i gruppen",
    "service_providing_group_grid_suspension.reason.other": "Annet",
    "entity.business_id_type.pid": "Personnummer",
    "entity.business_id_type.org": "Organisasjonsnummer",
    "entity.business_id_type.email": "E-post",
    "entity.type.person": "Person",
    "entity.type.organisation": "Organisasjon",
    "party.business_id_type.gln": "GLN (Global Location Number)",
    "party.business_id_type.uuid": "UUID (Universally Unique Identifier)",
    "party.business_id_type.eic_x": "EIC-X (Energy Identification Code - Markedsaktører)",
    "party.business_id_type.org": "Organisasjonsnummer",
    "party.role.flex_balance_responsible_party": "Balanseansvarlig",
    "party.role.flex_end_user": "Sluttbruker",
    "party.role.flex_energy_supplier": "Kraftleverandør",
    "party.role.flex_flexibility_information_system_operator": "Fleksibilitetsinformasjonssystemoperatør",
    "party.role.flex_market_operator": "Markedsoperatør",
    "party.role.flex_organisation": "Organisasjon",
    "party.role.flex_service_provider": "Tjenesteleverandør",
    "party.role.flex_system_operator": "Systemoperatør",
    "party.role.flex_third_party": "Tredjepart",
    "party.type.balance_responsible_party": "Balanseansvarlig",
    "party.type.end_user": "Sluttbruker",
    "party.type.energy_supplier": "Kraftleverandør",
    "party.type.flexibility_information_system_operator": "Fleksibilitetsinformasjonssystemoperatør",
    "party.type.market_operator": "Markedsoperatør",
    "party.type.organisation": "Organisasjon",
    "party.type.service_provider": "Tjenesteleverandør",
    "party.type.system_operator": "Systemoperatør",
    "party.type.third_party": "Tredjepart",
    "party.status.new": "Ny",
    "party.status.active": "Aktiv",
    "party.status.inactive": "Inaktiv",
    "party.status.suspended": "Suspendert",
    "party.status.terminated": "Terminert",
    "accounting_point_balance_responsible_party.energy_direction.consumption": "Forbruk",
    "accounting_point_balance_responsible_party.energy_direction.production": "Produksjon",
    "system_operator_product_type.status.active": "Aktiv",
    "system_operator_product_type.status.inactive": "Inaktiv",
    "service_provider_product_application.status.requested": "Forespurt",
    "service_provider_product_application.status.in_progress": "Under behandling",
    "service_provider_product_application.status.communication_test": "Kommunikasjonstest",
    "service_provider_product_application.status.not_qualified": "Ikke kvalifisert",
    "service_provider_product_application.status.qualified": "Kvalifisert",
    "service_provider_product_suspension.reason.communication_issues": "Kommunikasjonsproblemer",
    "service_provider_product_suspension.reason.failing_heartbeat": "Feilende hjerteslag",
    "service_provider_product_suspension.reason.system_issues": "Systemproblemer",
    "service_provider_product_suspension.reason.clearing_issues": "Avregningsproblemer",
    "service_provider_product_suspension.reason.breach_of_conditions": "Brudd på vilkår",
    "service_provider_product_suspension.reason.other": "Annet",
    "service_providing_group_product_application.status.requested": "Forespurt",
    "service_providing_group_product_application.status.prequalification_pending": "Prekvalifisering venter",
    "service_providing_group_product_application.status.in_progress": "Under behandling",
    "service_providing_group_product_application.status.temporary_qualified": "Midlertidig kvalifisert",
    "service_providing_group_product_application.status.prequalified": "Prekvalifisert",
    "service_providing_group_product_application.status.verified": "Verifisert",
    "service_providing_group_product_application.status.rejected": "Avvist",
    "service_providing_group_product_suspension.reason.failed_verification": "Feilet verifisering",
    "service_providing_group_product_suspension.reason.other": "Annet"
  },
  "nn": {
    "comment.visibility.same_party": "Same aktør",
    "comment.visibility.any_involved_party": "Alle involverte aktørar",
    "controllable_unit.status.new": "Ny",
    "controllable_unit.status.active": "Aktiv",
    "controllable_unit.status.inactive": "Inaktiv",
    "controllable_unit.status.terminated": "Terminert",
    "controllable_unit.regulation_direction.up": "Opp",
    "controllable_unit.regulation_direction.down": "Ned",
    "controllable_unit.regulation_direction.both": "Begge",
    "controllable_unit.grid_validation_status.pending": "Ventar",
    "controllable_unit.grid_validation_status.in_progress": "Under behandling",
    "controllable_unit.grid_validation_status.incomplete_information": "Ufullstendig informasjon",
    "controllable_unit.grid_validation_status.validated": "Validert",
    "controllable_unit.grid_validation_status.validation_failed": "Feila validering",
    "controllable_unit_suspension.reason.compromises_safe_operation": "Truar sikker drift",
    "controllable_unit_suspension.reason.other": "Anna",
    "service_providing_group.bidding_zone.NO1": "NO1 (Østlandet)",
    "service_providing_group.bidding_zone.NO2": "NO2 (Sørvest-Noreg)",
    "service_providing_group.bidding_zone.NO3": "NO3 (Midt-Noreg)",
    "service_providing_group.bidding_zone.NO4": "NO4 (Nord-Noreg)",
    "service_providing_group.bidding_zone.NO5": "NO5 (Vestlandet)",
    "service_providing_group.status.new": "Ny",
    "service_providing_group.status.active": "Aktiv",
    "service_providing_group.status.inactive": "Inaktiv",
    "service_providing_group.status.terminated": "Terminert",
    "service_providing_group_grid_prequalification.status.requested": "Førespurt",
    "service_providing_group_grid_prequalification.status.in_progress": "Under behandling",
    "service_providing_group_grid_prequalification.status.conditionally_approved": "Betinga godkjent",
    "service_providing_group_grid_prequalification.status.approved": "Godkjent",
    "service_providing_group_grid_prequalification.status.not_approved": "Ikkje godkjent",
    "service_providing_group_grid_suspension.reason.breach_of_conditions": "Brot på vilkår",
    "service_providing_group_grid_suspension.reason.significant_group_change": "Vesentleg endring i gruppa",
    "service_providing_group_grid_suspension.reason.other": "Anna",
    "entity.business_id_type.pid": "Personnummer",
    "entity.business_id_type.org": "Organisasjonsnummer",
    "entity.business_id_type.email": "E-post",
    "entity.type.person": "Person",
    "entity.type.organisation": "Organisasjon",
    "party.business_id_type.gln": "GLN (Global Location Number)",
    "party.business_id_type.uuid": "UUID (Universally Unique Identifier)",
    "party.business_id_type.eic_x": "EIC-X (Energy Identification Code - Marknadsaktørar)",
    "party.business_id_type.org": "Organisasjonsnummer",
    "party.role.flex_balance_responsible_party": "Balanseansvarleg",
    "party.role.flex_end_user": "Sluttbrukar",
    "party.role.flex_energy_supplier": "Kraftleverandør",
    "party.role.flex_flexibility_information_system_operator": "Fleksibilitetsinformasjonssystemoperatør",
    "party.role.flex_market_operator": "Marknadsoperatør",
    "party.role.flex_organisation": "Organisasjon",
    "party.role.flex_service_provider": "Tenesteleverandør",
    "party.role.flex_system_operator": "Systemoperatør",
    "party.role.flex_third_party": "Tredjepart",
    "party.type.balance_responsible_party": "Balanseansvarleg",
    "party.type.end_user": "Sluttbrukar",
    "party.type.energy_supplier": "Kraftleverandør",
    "party.type.flexibility_information_system_operator": "Fleksibilitetsinformasjonssystemoperatør",
    "party.type.market_operator": "Marknadsoperatør",
    "party.type.organisation": "Organisasjon",
    "party.type.service_provider": "Tenesteleverandør",
    "party.type.system_operator": "Systemoperatør",
    "party.type.third_party": "Tredjepart",
    "party.status.new": "Ny",
    "party.status.active": "Aktiv",
    "party.status.inactive": "Inaktiv",
    "party.status.suspended": "Suspendert",
    "party.status.terminated": "Terminert",
    "accounting_point_balance_responsible_party.energy_direction.consumption": "Forbruk",
    "accounting_point_balance_responsible_party.energy_direction.production": "Produksjon",
    "system_operator_product_type.status.active": "Aktiv",
    "system_operator_product_type.status.inactive": "Inaktiv",
    "service_provider_product_application.status.requested": "Førespurt",
    "service_provider_product_application.status.in_progress": "Under behandling",
    "service_provider_product_application.status.communication_test": "Kommunikasjonstest",
    "service_provider_product_application.status.not_qualified": "Ikkje kvalifisert",
    "service_provider_product_application.status.qualified": "Kvalifisert",
    "service_provider_product_suspension.reason.communication_issues": "Kommunikasjonsproblem",
    "service_provider_product_suspension.reason.failing_heartbeat": "Feilande hjarteslag",
    "service_provider_product_suspension.reason.system_issues": "Systemproblem",
    "service_provider_product_suspension.reason.clearing_issues": "Avrekningsproblem",
    "service_provider_product_suspension.reason.breach_of_conditions": "Brot på vilkår",
    "service_provider_product_suspension.reason.other": "Anna",
    "service_providing_group_product_application.status.requested": "Førespurt",
    "service_providing_group_product_application.status.prequalification_pending": "Prekvalifisering ventar",
    "service_providing_group_product_application.status.in_progress": "Under behandling",
    "service_providing_group_product_application.status.temporary_qualified": "Mellombels kvalifisert",
    "service_providing_group_product_application.status.prequalified": "Prekvalifisert",
    "service_providing_group_product_application.status.verified": "Verifisert",
    "service_providing_group_product_application.status.rejected": "Avvist",
    "service_providing_group_product_suspension.reason.failed_verification": "Feila verifisering",
    "service_providing_group_product_suspension.reason.other": "Anna"
  }
};
