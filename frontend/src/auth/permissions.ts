// AUTO-GENERATED FILE - DO NOT EDIT
// Generated from local/input/permissions.csv by local/scripts/permissions_to_ts.py

export type Role =
  | "flex_anonymous"
  | "flex_balance_responsible_party"
  | "flex_end_user"
  | "flex_energy_supplier"
  | "flex_entity"
  | "flex_flexibility_information_system_operator"
  | "flex_market_operator"
  | "flex_organisation"
  | "flex_service_provider"
  | "flex_system_operator"
  | "flex_third_party";

export type PermissionTarget =
  | "controllable_unit_history.replaced_at"
  | "party_history.role"
  | "entity_client.id"
  | "controllable_unit_suspension_comment.id"
  | "service_providing_group_product_suspension_history"
  | "entity"
  | "service_providing_group_grid_suspension_comment_history.created_by"
  | "service_provider_product_application_comment_history.service_provider_product_application_id"
  | "service_providing_group_grid_prequalification.prequalified_at"
  | "service_providing_group_product_application_history.product_type_ids"
  | "service_provider_product_suspension_history.recorded_by"
  | "service_provider_product_application_comment.recorded_by"
  | "party_history.name"
  | "service_providing_group.recorded_at"
  | "service_providing_group_grid_suspension_comment_history.recorded_at"
  | "party_membership_history.scopes"
  | "controllable_unit.minimum_duration"
  | "service_providing_group_grid_suspension_comment_history.replaced_at"
  | "controllable_unit_history.ramp_rate"
  | "service_providing_group_grid_suspension_history.service_providing_group_grid_suspension_id"
  | "notice"
  | "service_providing_group.recorded_by"
  | "service_provider_product_suspension.procuring_system_operator_id"
  | "service_provider_product_application_comment_history.recorded_at"
  | "service_providing_group_grid_prequalification_history.status"
  | "service_providing_group_membership"
  | "product_type"
  | "controllable_unit_history.grid_node_id"
  | "service_provider_product_application_history.service_provider_id"
  | "service_providing_group_grid_prequalification.recorded_by"
  | "service_providing_group_membership_history.service_providing_group_membership_id"
  | "service_provider_product_suspension_comment_history.recorded_at"
  | "accounting_point_balance_responsible_party.valid_from"
  | "service_provider_product_suspension_comment_history"
  | "event.id"
  | "service_providing_group.service_provider_id"
  | "notification.recorded_by"
  | "service_provider_product_suspension.recorded_by"
  | "service_providing_group_product_suspension_comment.created_at"
  | "system_operator_product_type_history.status"
  | "service_providing_group_membership_history.replaced_by"
  | "service_provider_product_suspension.recorded_at"
  | "controllable_unit_service_provider"
  | "entity_client.recorded_at"
  | "controllable_unit.name"
  | "service_providing_group_grid_suspension_comment.created_at"
  | "service_providing_group_product_application.product_type_ids"
  | "controllable_unit.grid_node_id"
  | "service_providing_group_grid_suspension_history.id"
  | "service_providing_group_product_suspension_history.service_providing_group_product_suspension_id"
  | "system_operator_product_type.recorded_by"
  | "service_provider_product_suspension_history.service_provider_product_suspension_id"
  | "entity.type"
  | "accounting_point_energy_supplier.accounting_point_id"
  | "service_providing_group_history.status"
  | "party_membership_history.party_id"
  | "controllable_unit.maximum_available_capacity"
  | "entity_client.scopes"
  | "technical_resource_history.id"
  | "service_providing_group_grid_suspension.reason"
  | "service_providing_group_product_suspension_history.product_type_ids"
  | "service_provider_product_suspension_comment_history.created_at"
  | "notification.party_id"
  | "controllable_unit_service_provider_history.contract_reference"
  | "service_providing_group_product_application_history.prequalified_at"
  | "service_providing_group_grid_prequalification.recorded_at"
  | "service_providing_group_grid_suspension_comment_history.recorded_by"
  | "service_providing_group_product_suspension_comment.id"
  | "party.role"
  | "system_operator_product_type_history.product_type_id"
  | "service_provider_product_suspension_comment_history.service_provider_product_suspension_comment_id"
  | "notification.event_id"
  | "service_provider_product_suspension_history.reason"
  | "controllable_unit_service_provider_history.replaced_at"
  | "service_provider_product_suspension.product_type_ids"
  | "service_provider_product_suspension_comment.id"
  | "product_type.business_id"
  | "service_provider_product_suspension_comment_history.replaced_at"
  | "technical_resource"
  | "service_providing_group_product_application_history.recorded_at"
  | "entity.recorded_by"
  | "controllable_unit_suspension.recorded_by"
  | "service_providing_group_grid_prequalification_history.recorded_by"
  | "service_provider_product_suspension.reason"
  | "controllable_unit.status"
  | "controllable_unit.recovery_duration"
  | "controllable_unit_suspension_history.impacted_system_operator_id"
  | "entity.recorded_at"
  | "service_providing_group_product_suspension_comment.recorded_at"
  | "party_history.status"
  | "controllable_unit_suspension_comment_history.created_at"
  | "controllable_unit.id"
  | "service_providing_group_product_suspension.recorded_by"
  | "service_providing_group_product_suspension.procuring_system_operator_id"
  | "controllable_unit_suspension_history.id"
  | "service_providing_group_grid_prequalification_comment.content"
  | "service_providing_group_history.recorded_at"
  | "service_provider_product_suspension.id"
  | "event.specversion"
  | "service_providing_group_product_suspension.reason"
  | "service_providing_group_product_application_history.notes"
  | "service_providing_group_product_application.recorded_by"
  | "service_providing_group_grid_suspension_comment_history.service_providing_group_grid_suspension_comment_id"
  | "service_provider_product_application.system_operator_id"
  | "service_provider_product_suspension.service_provider_id"
  | "service_providing_group_product_application_history.service_providing_group_id"
  | "service_provider_product_application_history.replaced_by"
  | "service_providing_group_grid_suspension_history.recorded_at"
  | "system_operator_product_type_history.recorded_by"
  | "technical_resource.name"
  | "service_provider_product_application"
  | "service_providing_group_grid_suspension.recorded_at"
  | "service_provider_product_application_comment.recorded_at"
  | "entity_client.recorded_by"
  | "party.recorded_at"
  | "service_providing_group_grid_suspension_comment.id"
  | "service_providing_group_membership.valid_to"
  | "technical_resource.id"
  | "controllable_unit_service_provider.controllable_unit_id"
  | "service_provider_product_application_history.product_type_ids"
  | "service_providing_group_grid_prequalification.service_providing_group_id"
  | "service_providing_group_product_suspension_comment_history.id"
  | "product_type.name"
  | "service_providing_group_product_suspension_history.replaced_by"
  | "entity_client.client_secret"
  | "service_providing_group_grid_suspension_comment_history.replaced_by"
  | "service_provider_product_suspension_history.id"
  | "service_providing_group_grid_prequalification_comment.visibility"
  | "controllable_unit_suspension_comment.created_at"
  | "entity.business_id"
  | "service_provider_product_application.status"
  | "controllable_unit_history.recorded_by"
  | "technical_resource.recorded_at"
  | "service_providing_group_grid_suspension.id"
  | "controllable_unit_service_provider_history.controllable_unit_id"
  | "controllable_unit_suspension_comment_history.recorded_by"
  | "party_membership.id"
  | "controllable_unit_service_provider_history.id"
  | "controllable_unit.accounting_point_id"
  | "technical_resource_history.technical_resource_id"
  | "system_operator_product_type_history.replaced_at"
  | "service_providing_group_grid_prequalification_comment"
  | "controllable_unit_history.minimum_duration"
  | "service_providing_group_grid_suspension_history.replaced_by"
  | "service_providing_group.status"
  | "service_providing_group_membership.recorded_at"
  | "service_provider_product_suspension_comment_history.visibility"
  | "service_provider_product_application_history.id"
  | "party_history"
  | "controllable_unit_service_provider_history.replaced_by"
  | "service_providing_group_grid_suspension_comment.service_providing_group_grid_suspension_id"
  | "controllable_unit_history.controllable_unit_id"
  | "controllable_unit_suspension_comment_history.visibility"
  | "party.type"
  | "controllable_unit_history.validated_at"
  | "controllable_unit_suspension_history.recorded_by"
  | "party_history.business_id_type"
  | "service_providing_group_membership.recorded_by"
  | "service_providing_group_product_application_history.replaced_at"
  | "technical_resource_history.controllable_unit_id"
  | "controllable_unit_history.id"
  | "service_provider_product_application_comment_history.replaced_by"
  | "service_providing_group_history.name"
  | "service_providing_group_history.replaced_at"
  | "notification.id"
  | "technical_resource_history.replaced_at"
  | "service_providing_group_product_application_history.service_providing_group_product_application_id"
  | "service_providing_group_product_suspension_comment.content"
  | "service_providing_group_grid_prequalification_history.impacted_system_operator_id"
  | "party"
  | "service_providing_group_product_suspension"
  | "entity_client.name"
  | "technical_resource_history"
  | "party.entity_id"
  | "service_providing_group_product_application.verified_at"
  | "controllable_unit.recorded_by"
  | "party_membership_history.entity_id"
  | "party_history.recorded_by"
  | "service_provider_product_suspension_history.replaced_by"
  | "service_provider_product_application_comment_history.created_by"
  | "accounting_point_energy_supplier.valid_from"
  | "controllable_unit_suspension_comment.content"
  | "technical_resource_history.name"
  | "service_providing_group_grid_suspension_comment_history.content"
  | "service_providing_group_product_suspension_history.id"
  | "service_providing_group_product_application.notes"
  | "service_providing_group_membership_history.valid_to"
  | "notification"
  | "service_providing_group_grid_prequalification_history.recorded_at"
  | "controllable_unit_suspension_comment.controllable_unit_suspension_id"
  | "service_provider_product_application_comment_history.created_at"
  | "party_history.type"
  | "controllable_unit_history.name"
  | "service_providing_group_product_suspension.product_type_ids"
  | "controllable_unit_service_provider.end_user_id"
  | "service_providing_group_grid_prequalification_comment.created_at"
  | "service_providing_group_grid_prequalification_history.id"
  | "service_providing_group_grid_suspension.recorded_by"
  | "service_provider_product_suspension_comment_history.service_provider_product_suspension_id"
  | "controllable_unit_history.grid_validation_status"
  | "party.id"
  | "controllable_unit_suspension_history.replaced_at"
  | "controllable_unit_suspension_comment_history.content"
  | "notice.data"
  | "party_membership_history.recorded_at"
  | "controllable_unit_service_provider_history"
  | "service_provider_product_application_history.recorded_at"
  | "service_providing_group_product_suspension_history.recorded_by"
  | "service_providing_group.name"
  | "service_provider_product_suspension_history"
  | "system_operator_product_type_history.recorded_at"
  | "entity.business_id_type"
  | "service_providing_group_product_application"
  | "controllable_unit.validated_at"
  | "service_provider_product_application_comment_history.id"
  | "service_providing_group_grid_prequalification_comment.service_providing_group_grid_prequalification_id"
  | "controllable_unit_history.status"
  | "service_providing_group_product_application.prequalified_at"
  | "identity.entity_id"
  | "controllable_unit.business_id"
  | "service_provider_product_suspension_comment_history.created_by"
  | "service_providing_group_membership_history.recorded_at"
  | "controllable_unit_suspension_history.controllable_unit_suspension_id"
  | "service_providing_group_grid_prequalification_comment.recorded_at"
  | "system_operator_product_type_history.id"
  | "service_providing_group_grid_suspension.impacted_system_operator_id"
  | "controllable_unit_service_provider.service_provider_id"
  | "service_providing_group_grid_suspension.service_providing_group_id"
  | "controllable_unit_service_provider.recorded_by"
  | "party.business_id_type"
  | "service_providing_group_grid_prequalification.impacted_system_operator_id"
  | "service_providing_group_history.recorded_by"
  | "accounting_point.recorded_by"
  | "controllable_unit_service_provider.valid_to"
  | "event.source"
  | "service_providing_group_product_suspension.recorded_at"
  | "system_operator_product_type.status"
  | "service_provider_product_suspension_comment"
  | "controllable_unit_suspension_comment_history.replaced_by"
  | "service_providing_group_grid_suspension_comment"
  | "controllable_unit_history.regulation_direction"
  | "controllable_unit_suspension_history"
  | "service_provider_product_application_comment"
  | "service_providing_group_membership_history.valid_from"
  | "party_history.recorded_at"
  | "system_operator_product_type_history.replaced_by"
  | "controllable_unit_history.recovery_duration"
  | "controllable_unit.is_small"
  | "notification.recorded_at"
  | "service_provider_product_application_comment_history.replaced_at"
  | "service_provider_product_application_history"
  | "service_providing_group_history.service_providing_group_id"
  | "service_providing_group_product_application_history.recorded_by"
  | "service_providing_group_grid_prequalification_comment.created_by"
  | "service_providing_group_product_suspension_comment.visibility"
  | "service_providing_group_history"
  | "service_providing_group_product_suspension_history.procuring_system_operator_id"
  | "service_providing_group_product_suspension_history.recorded_at"
  | "accounting_point.business_id"
  | "controllable_unit_suspension.controllable_unit_id"
  | "product_type.id"
  | "service_providing_group_grid_prequalification_history.replaced_by"
  | "service_providing_group_product_suspension_comment.service_providing_group_product_suspension_id"
  | "controllable_unit_suspension_comment_history.id"
  | "notice.source"
  | "service_providing_group_product_suspension.service_providing_group_id"
  | "service_provider_product_application.recorded_by"
  | "accounting_point_balance_responsible_party.energy_direction"
  | "service_providing_group_product_suspension_comment.created_by"
  | "service_providing_group_product_suspension_comment_history.recorded_by"
  | "controllable_unit_suspension.recorded_at"
  | "service_provider_product_application_comment.content"
  | "technical_resource.recorded_by"
  | "identity.party_id"
  | "service_providing_group_product_suspension_comment.recorded_by"
  | "service_providing_group_grid_suspension_comment.visibility"
  | "event.type"
  | "service_providing_group_product_application_history.status"
  | "technical_resource.controllable_unit_id"
  | "event.data"
  | "service_provider_product_application_history.service_provider_product_application_id"
  | "controllable_unit_suspension_history.replaced_by"
  | "service_provider_product_application_history.notes"
  | "service_providing_group_membership_history"
  | "controllable_unit_suspension_comment.created_by"
  | "system_operator_product_type.product_type_id"
  | "party_membership_history.party_membership_id"
  | "controllable_unit_service_provider.recorded_at"
  | "service_providing_group_membership_history.replaced_at"
  | "technical_resource_history.replaced_by"
  | "controllable_unit_suspension.id"
  | "service_provider_product_suspension_history.replaced_at"
  | "controllable_unit.maximum_duration"
  | "controllable_unit_history.start_date"
  | "entity_client.entity_id"
  | "controllable_unit"
  | "service_providing_group_product_suspension_history.service_providing_group_id"
  | "controllable_unit_service_provider.valid_from"
  | "service_providing_group_grid_prequalification_history.service_providing_group_id"
  | "controllable_unit_suspension_comment_history.controllable_unit_suspension_id"
  | "controllable_unit_history.recorded_at"
  | "party_membership.party_id"
  | "service_providing_group_product_application_history.procuring_system_operator_id"
  | "controllable_unit_service_provider_history.service_provider_id"
  | "controllable_unit_service_provider.contract_reference"
  | "notification.acknowledged"
  | "party_membership"
  | "controllable_unit_suspension_comment_history.recorded_at"
  | "controllable_unit_suspension_history.controllable_unit_id"
  | "service_provider_product_application_comment.created_by"
  | "accounting_point_energy_supplier.energy_supplier_id"
  | "entity_client.public_key"
  | "service_providing_group_history.service_provider_id"
  | "identity"
  | "controllable_unit_history.is_small"
  | "service_provider_product_application_comment.id"
  | "event.time"
  | "party_history.party_id"
  | "service_providing_group_grid_suspension_comment_history"
  | "party.business_id"
  | "accounting_point_balance_responsible_party.accounting_point_id"
  | "service_provider_product_application.service_provider_id"
  | "controllable_unit_service_provider_history.valid_from"
  | "party_history.entity_id"
  | "service_providing_group_product_application.service_providing_group_id"
  | "service_provider_product_application_comment_history"
  | "system_operator_product_type.recorded_at"
  | "controllable_unit_suspension.reason"
  | "service_provider_product_application_history.status"
  | "service_provider_product_suspension_comment.created_by"
  | "accounting_point_energy_supplier"
  | "system_operator_product_type_history.system_operator_product_type_id"
  | "controllable_unit_suspension.impacted_system_operator_id"
  | "service_providing_group_membership_history.id"
  | "service_providing_group_product_application_history.id"
  | "service_providing_group_membership.service_providing_group_id"
  | "identity.entity_name"
  | "service_providing_group.id"
  | "system_operator_product_type_history"
  | "controllable_unit_suspension_history.recorded_at"
  | "service_provider_product_suspension_history.product_type_ids"
  | "service_providing_group_membership.controllable_unit_id"
  | "party_history.replaced_by"
  | "party_membership_history.recorded_by"
  | "service_providing_group_membership.valid_from"
  | "controllable_unit_suspension_comment.recorded_at"
  | "controllable_unit_service_provider_history.controllable_unit_service_provider_id"
  | "system_operator_product_type_history.system_operator_id"
  | "technical_resource_history.details"
  | "party_membership_history.replaced_by"
  | "service_providing_group_membership_history.controllable_unit_id"
  | "service_provider_product_application_comment_history.visibility"
  | "accounting_point.id"
  | "party.name"
  | "controllable_unit_service_provider.id"
  | "service_provider_product_suspension_comment_history.replaced_by"
  | "service_providing_group_product_application.id"
  | "party_history.id"
  | "accounting_point"
  | "service_provider_product_application.id"
  | "controllable_unit.grid_validation_status"
  | "service_providing_group_membership_history.recorded_by"
  | "product_type.products"
  | "service_providing_group_product_suspension_comment_history.visibility"
  | "service_providing_group_grid_suspension_history.service_providing_group_id"
  | "service_provider_product_application_comment.service_provider_product_application_id"
  | "service_providing_group_grid_suspension_comment.recorded_at"
  | "service_providing_group_product_application.procuring_system_operator_id"
  | "service_providing_group_product_application.status"
  | "identity.id"
  | "party_membership_history"
  | "service_provider_product_application_history.replaced_at"
  | "service_provider_product_application_comment_history.recorded_by"
  | "entity_client.party_id"
  | "service_provider_product_suspension_history.recorded_at"
  | "service_providing_group_grid_prequalification_history.service_providing_group_grid_prequalification_id"
  | "service_provider_product_application_history.system_operator_id"
  | "accounting_point.system_operator_id"
  | "service_provider_product_suspension_comment_history.content"
  | "party_membership.recorded_by"
  | "accounting_point_balance_responsible_party.valid_to"
  | "controllable_unit_suspension_comment.visibility"
  | "service_provider_product_application_comment.visibility"
  | "service_providing_group_grid_prequalification"
  | "service_providing_group_membership.id"
  | "service_provider_product_suspension_comment.recorded_by"
  | "controllable_unit.recorded_at"
  | "service_provider_product_application_comment_history.service_provider_product_application_comment_id"
  | "service_providing_group_grid_suspension_comment.content"
  | "service_providing_group_product_suspension_comment_history.service_providing_group_product_suspension_id"
  | "entity_client"
  | "service_provider_product_suspension_comment.recorded_at"
  | "service_providing_group_grid_prequalification.id"
  | "service_provider_product_application_comment_history.content"
  | "controllable_unit_service_provider_history.valid_to"
  | "service_provider_product_application.notes"
  | "service_providing_group_grid_suspension_history.reason"
  | "party_history.replaced_at"
  | "service_providing_group_grid_suspension_history.impacted_system_operator_id"
  | "service_provider_product_application_comment.created_at"
  | "service_providing_group_product_suspension_history.reason"
  | "controllable_unit_history"
  | "party_membership.entity_id"
  | "controllable_unit_suspension_comment_history.replaced_at"
  | "entity_client.client_id"
  | "controllable_unit_service_provider_history.recorded_at"
  | "service_providing_group_grid_suspension_comment_history.id"
  | "service_providing_group_grid_suspension_comment_history.service_providing_group_grid_suspension_id"
  | "controllable_unit_service_provider_history.recorded_by"
  | "service_providing_group_grid_suspension_comment.created_by"
  | "service_providing_group_product_application_history"
  | "controllable_unit_history.replaced_by"
  | "service_provider_product_suspension_comment.service_provider_product_suspension_id"
  | "service_providing_group_grid_prequalification_history.replaced_at"
  | "party_membership_history.id"
  | "system_operator_product_type.id"
  | "accounting_point_energy_supplier.valid_to"
  | "product_type.service"
  | "party_membership.recorded_at"
  | "controllable_unit_suspension_comment_history.created_by"
  | "controllable_unit.regulation_direction"
  | "service_providing_group_grid_suspension_comment_history.created_at"
  | "service_providing_group_product_suspension_comment_history.content"
  | "accounting_point_balance_responsible_party.balance_responsible_party_id"
  | "party_history.business_id"
  | "service_providing_group_product_suspension_comment"
  | "controllable_unit_suspension"
  | "service_providing_group_grid_prequalification.status"
  | "identity.party_name"
  | "party.recorded_by"
  | "service_providing_group_product_application.recorded_at"
  | "controllable_unit_service_provider_history.end_user_id"
  | "service_providing_group_product_suspension_comment_history.service_providing_group_product_suspension_comment_id"
  | "technical_resource.details"
  | "party_membership_history.replaced_at"
  | "service_providing_group_grid_prequalification_history.prequalified_at"
  | "technical_resource_history.recorded_by"
  | "controllable_unit_suspension_comment"
  | "service_providing_group_product_suspension.id"
  | "controllable_unit_suspension_comment_history"
  | "service_providing_group_product_suspension_comment_history"
  | "service_providing_group_product_suspension_comment_history.recorded_at"
  | "system_operator_product_type"
  | "entity.name"
  | "service_providing_group_grid_suspension_history"
  | "controllable_unit_history.business_id"
  | "notice.type"
  | "controllable_unit_suspension_comment.recorded_by"
  | "service_provider_product_application_history.qualified_at"
  | "service_providing_group_membership_history.service_providing_group_id"
  | "controllable_unit_history.grid_validation_notes"
  | "service_providing_group_product_application_history.verified_at"
  | "controllable_unit_history.accounting_point_id"
  | "notice.party_id"
  | "service_providing_group_history.replaced_by"
  | "controllable_unit_history.maximum_available_capacity"
  | "service_providing_group_grid_suspension_comment_history.visibility"
  | "service_provider_product_suspension_comment_history.recorded_by"
  | "service_providing_group_product_suspension_history.replaced_at"
  | "service_providing_group_grid_suspension_comment.recorded_by"
  | "service_provider_product_application.qualified_at"
  | "system_operator_product_type.system_operator_id"
  | "controllable_unit_suspension_comment_history.controllable_unit_suspension_comment_id"
  | "entity.id"
  | "controllable_unit.start_date"
  | "service_providing_group_grid_prequalification_history"
  | "service_providing_group"
  | "controllable_unit.grid_validation_notes"
  | "party.status"
  | "service_provider_product_application.recorded_at"
  | "service_providing_group_grid_prequalification_comment.id"
  | "party_membership.scopes"
  | "technical_resource_history.recorded_at"
  | "controllable_unit_history.maximum_duration"
  | "event"
  | "service_provider_product_suspension_comment.visibility"
  | "service_providing_group_product_suspension_comment_history.replaced_at"
  | "service_providing_group_grid_suspension"
  | "service_providing_group_grid_prequalification_comment.recorded_by"
  | "service_providing_group_product_suspension_comment_history.created_at"
  | "service_provider_product_application_history.recorded_by"
  | "service_provider_product_suspension"
  | "service_providing_group_history.id"
  | "service_provider_product_application.product_type_ids"
  | "service_provider_product_suspension_comment.created_at"
  | "accounting_point.recorded_at"
  | "service_provider_product_suspension_comment_history.id"
  | "service_provider_product_suspension_history.service_provider_id"
  | "service_providing_group_product_suspension_comment_history.replaced_by"
  | "service_providing_group_product_suspension_comment_history.created_by"
  | "service_provider_product_suspension_comment.content"
  | "service_provider_product_suspension_history.procuring_system_operator_id"
  | "controllable_unit_suspension_history.reason"
  | "service_providing_group_grid_suspension_history.replaced_at"
  | "service_providing_group_grid_suspension_history.recorded_by"
  | "accounting_point_balance_responsible_party"
  | "controllable_unit.ramp_rate"
  | "service_providing_group_product_application_history.replaced_by";

export type PermissionOperation =
  | "lookup"
  | "read"
  | "delete"
  | "create"
  | "update";

export type Permissions = {
  allow: (target: PermissionTarget, operation: PermissionOperation) => boolean;
};

const rawPermissions: Record<
  Role,
  { target: PermissionTarget; operation: PermissionOperation }[]
> = {
  flex_anonymous: [],
  flex_balance_responsible_party: [
    {
      target: "accounting_point.business_id",
      operation: "read",
    },
    {
      target: "accounting_point.id",
      operation: "read",
    },
    {
      target: "accounting_point",
      operation: "read",
    },
    {
      target: "accounting_point.recorded_at",
      operation: "read",
    },
    {
      target: "accounting_point.recorded_by",
      operation: "read",
    },
    {
      target: "accounting_point.system_operator_id",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.accounting_point_id",
      operation: "read",
    },
    {
      target:
        "accounting_point_balance_responsible_party.balance_responsible_party_id",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.energy_direction",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.valid_from",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.valid_to",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.accounting_point_id",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.energy_supplier_id",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.valid_from",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit.accounting_point_id",
      operation: "read",
    },
    {
      target: "controllable_unit.business_id",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_node_id",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_validation_notes",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_validation_status",
      operation: "read",
    },
    {
      target: "controllable_unit.id",
      operation: "read",
    },
    {
      target: "controllable_unit.is_small",
      operation: "read",
    },
    {
      target: "controllable_unit.maximum_available_capacity",
      operation: "read",
    },
    {
      target: "controllable_unit.maximum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.minimum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.name",
      operation: "read",
    },
    {
      target: "controllable_unit.ramp_rate",
      operation: "read",
    },
    {
      target: "controllable_unit",
      operation: "read",
    },
    {
      target: "controllable_unit.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit.recovery_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.regulation_direction",
      operation: "read",
    },
    {
      target: "controllable_unit.start_date",
      operation: "read",
    },
    {
      target: "controllable_unit.status",
      operation: "read",
    },
    {
      target: "controllable_unit.validated_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.accounting_point_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.business_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_node_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_validation_notes",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_validation_status",
      operation: "read",
    },
    {
      target: "controllable_unit_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.is_small",
      operation: "read",
    },
    {
      target: "controllable_unit_history.maximum_available_capacity",
      operation: "read",
    },
    {
      target: "controllable_unit_history.maximum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.minimum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.name",
      operation: "read",
    },
    {
      target: "controllable_unit_history.ramp_rate",
      operation: "read",
    },
    {
      target: "controllable_unit_history",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recovery_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.regulation_direction",
      operation: "read",
    },
    {
      target: "controllable_unit_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_history.start_date",
      operation: "read",
    },
    {
      target: "controllable_unit_history.status",
      operation: "read",
    },
    {
      target: "controllable_unit_history.validated_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.contract_reference",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.end_user_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.valid_from",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.contract_reference",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.controllable_unit_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_service_provider_history.controllable_unit_service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.end_user_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.valid_from",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.reason",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.content",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment_history.controllable_unit_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment_history.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.controllable_unit_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_history.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.reason",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target: "entity.business_id",
      operation: "read",
    },
    {
      target: "entity.business_id_type",
      operation: "read",
    },
    {
      target: "entity.id",
      operation: "read",
    },
    {
      target: "entity.name",
      operation: "read",
    },
    {
      target: "entity",
      operation: "read",
    },
    {
      target: "entity.recorded_at",
      operation: "read",
    },
    {
      target: "entity.recorded_by",
      operation: "read",
    },
    {
      target: "entity.type",
      operation: "read",
    },
    {
      target: "entity_client.client_id",
      operation: "read",
    },
    {
      target: "entity_client.client_secret",
      operation: "read",
    },
    {
      target: "entity_client.entity_id",
      operation: "read",
    },
    {
      target: "entity_client.id",
      operation: "read",
    },
    {
      target: "entity_client.name",
      operation: "read",
    },
    {
      target: "entity_client.party_id",
      operation: "read",
    },
    {
      target: "entity_client.public_key",
      operation: "read",
    },
    {
      target: "entity_client",
      operation: "read",
    },
    {
      target: "entity_client.recorded_at",
      operation: "read",
    },
    {
      target: "entity_client.recorded_by",
      operation: "read",
    },
    {
      target: "entity_client.scopes",
      operation: "read",
    },
    {
      target: "event.data",
      operation: "read",
    },
    {
      target: "event.id",
      operation: "read",
    },
    {
      target: "event",
      operation: "read",
    },
    {
      target: "event.source",
      operation: "read",
    },
    {
      target: "event.specversion",
      operation: "read",
    },
    {
      target: "event.time",
      operation: "read",
    },
    {
      target: "event.type",
      operation: "read",
    },
    {
      target: "identity.entity_id",
      operation: "read",
    },
    {
      target: "identity.entity_name",
      operation: "read",
    },
    {
      target: "identity.id",
      operation: "read",
    },
    {
      target: "identity.party_id",
      operation: "read",
    },
    {
      target: "identity.party_name",
      operation: "read",
    },
    {
      target: "identity",
      operation: "read",
    },
    {
      target: "notice.data",
      operation: "read",
    },
    {
      target: "notice.party_id",
      operation: "read",
    },
    {
      target: "notice",
      operation: "read",
    },
    {
      target: "notice.source",
      operation: "read",
    },
    {
      target: "notice.type",
      operation: "read",
    },
    {
      target: "notification.acknowledged",
      operation: "read",
    },
    {
      target: "notification.acknowledged",
      operation: "update",
    },
    {
      target: "notification.event_id",
      operation: "read",
    },
    {
      target: "notification.id",
      operation: "read",
    },
    {
      target: "notification.party_id",
      operation: "read",
    },
    {
      target: "notification",
      operation: "read",
    },
    {
      target: "notification.recorded_at",
      operation: "read",
    },
    {
      target: "notification.recorded_by",
      operation: "read",
    },
    {
      target: "notification",
      operation: "update",
    },
    {
      target: "party.business_id",
      operation: "read",
    },
    {
      target: "party.business_id_type",
      operation: "read",
    },
    {
      target: "party.entity_id",
      operation: "read",
    },
    {
      target: "party.id",
      operation: "read",
    },
    {
      target: "party.name",
      operation: "read",
    },
    {
      target: "party",
      operation: "read",
    },
    {
      target: "party.recorded_at",
      operation: "read",
    },
    {
      target: "party.recorded_by",
      operation: "read",
    },
    {
      target: "party.role",
      operation: "read",
    },
    {
      target: "party.status",
      operation: "read",
    },
    {
      target: "party.type",
      operation: "read",
    },
    {
      target: "party_history.business_id",
      operation: "read",
    },
    {
      target: "party_history.business_id_type",
      operation: "read",
    },
    {
      target: "party_history.entity_id",
      operation: "read",
    },
    {
      target: "party_history.id",
      operation: "read",
    },
    {
      target: "party_history.name",
      operation: "read",
    },
    {
      target: "party_history.party_id",
      operation: "read",
    },
    {
      target: "party_history",
      operation: "read",
    },
    {
      target: "party_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_history.role",
      operation: "read",
    },
    {
      target: "party_history.status",
      operation: "read",
    },
    {
      target: "party_history.type",
      operation: "read",
    },
    {
      target: "party_membership.entity_id",
      operation: "read",
    },
    {
      target: "party_membership.id",
      operation: "read",
    },
    {
      target: "party_membership.party_id",
      operation: "read",
    },
    {
      target: "party_membership",
      operation: "read",
    },
    {
      target: "party_membership.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership.scopes",
      operation: "read",
    },
    {
      target: "party_membership_history.entity_id",
      operation: "read",
    },
    {
      target: "party_membership_history.id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_membership_id",
      operation: "read",
    },
    {
      target: "party_membership_history",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_membership_history.scopes",
      operation: "read",
    },
    {
      target: "product_type.business_id",
      operation: "read",
    },
    {
      target: "product_type.id",
      operation: "read",
    },
    {
      target: "product_type.name",
      operation: "read",
    },
    {
      target: "product_type.products",
      operation: "read",
    },
    {
      target: "product_type",
      operation: "read",
    },
    {
      target: "product_type.service",
      operation: "read",
    },
    {
      target: "service_provider_product_application.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application.notes",
      operation: "read",
    },
    {
      target: "service_provider_product_application.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_application.qualified_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application",
      operation: "read",
    },
    {
      target: "service_provider_product_application.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application.service_provider_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application.status",
      operation: "read",
    },
    {
      target: "service_provider_product_application.system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.content",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.content",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.service_provider_product_application_comment_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.notes",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.qualified_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_history.service_provider_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_history.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.status",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.reason",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.service_provider_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.content",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment_history.service_provider_product_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment_history.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.service_provider_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_history.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group.id",
      operation: "read",
    },
    {
      target: "service_providing_group.name",
      operation: "read",
    },
    {
      target: "service_providing_group",
      operation: "read",
    },
    {
      target: "service_providing_group.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group.service_provider_id",
      operation: "read",
    },
    {
      target: "service_providing_group.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.prequalified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.service_providing_group_grid_prequalification_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.prequalified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.service_providing_group_grid_prequalification_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.service_providing_group_grid_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.name",
      operation: "read",
    },
    {
      target: "service_providing_group_history",
      operation: "read",
    },
    {
      target: "service_providing_group_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_history.replaced_by",
      operation: "read",
    },
    {
      target: "service_providing_group_history.service_provider_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.controllable_unit_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.valid_from",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.valid_to",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_membership_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_membership_history.service_providing_group_membership_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.valid_from",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.valid_to",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.notes",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.prequalified_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.status",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.verified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.notes",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.prequalified_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.service_providing_group_product_application_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.verified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.visibility",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.service_providing_group_product_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type.id",
      operation: "read",
    },
    {
      target: "system_operator_product_type.product_type_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type",
      operation: "read",
    },
    {
      target: "system_operator_product_type.recorded_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type.recorded_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type.status",
      operation: "read",
    },
    {
      target: "system_operator_product_type.system_operator_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.product_type_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.recorded_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.recorded_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.replaced_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.replaced_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.status",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.system_operator_id",
      operation: "read",
    },
    {
      target:
        "system_operator_product_type_history.system_operator_product_type_id",
      operation: "read",
    },
    {
      target: "technical_resource.controllable_unit_id",
      operation: "read",
    },
    {
      target: "technical_resource.details",
      operation: "read",
    },
    {
      target: "technical_resource.id",
      operation: "read",
    },
    {
      target: "technical_resource.name",
      operation: "read",
    },
    {
      target: "technical_resource",
      operation: "read",
    },
    {
      target: "technical_resource.recorded_at",
      operation: "read",
    },
    {
      target: "technical_resource.recorded_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "technical_resource_history.details",
      operation: "read",
    },
    {
      target: "technical_resource_history.id",
      operation: "read",
    },
    {
      target: "technical_resource_history.name",
      operation: "read",
    },
    {
      target: "technical_resource_history",
      operation: "read",
    },
    {
      target: "technical_resource_history.recorded_at",
      operation: "read",
    },
    {
      target: "technical_resource_history.recorded_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.replaced_at",
      operation: "read",
    },
    {
      target: "technical_resource_history.replaced_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.technical_resource_id",
      operation: "read",
    },
  ],
  flex_energy_supplier: [
    {
      target: "accounting_point.business_id",
      operation: "read",
    },
    {
      target: "accounting_point.id",
      operation: "read",
    },
    {
      target: "accounting_point",
      operation: "read",
    },
    {
      target: "accounting_point.recorded_at",
      operation: "read",
    },
    {
      target: "accounting_point.recorded_by",
      operation: "read",
    },
    {
      target: "accounting_point.system_operator_id",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.accounting_point_id",
      operation: "read",
    },
    {
      target:
        "accounting_point_balance_responsible_party.balance_responsible_party_id",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.energy_direction",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.valid_from",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.valid_to",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.accounting_point_id",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.energy_supplier_id",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.valid_from",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit.accounting_point_id",
      operation: "read",
    },
    {
      target: "controllable_unit.business_id",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_node_id",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_validation_notes",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_validation_status",
      operation: "read",
    },
    {
      target: "controllable_unit.id",
      operation: "read",
    },
    {
      target: "controllable_unit.is_small",
      operation: "read",
    },
    {
      target: "controllable_unit.maximum_available_capacity",
      operation: "read",
    },
    {
      target: "controllable_unit.maximum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.minimum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.name",
      operation: "read",
    },
    {
      target: "controllable_unit.ramp_rate",
      operation: "read",
    },
    {
      target: "controllable_unit",
      operation: "read",
    },
    {
      target: "controllable_unit.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit.recovery_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.regulation_direction",
      operation: "read",
    },
    {
      target: "controllable_unit.start_date",
      operation: "read",
    },
    {
      target: "controllable_unit.status",
      operation: "read",
    },
    {
      target: "controllable_unit.validated_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.accounting_point_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.business_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_node_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_validation_notes",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_validation_status",
      operation: "read",
    },
    {
      target: "controllable_unit_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.is_small",
      operation: "read",
    },
    {
      target: "controllable_unit_history.maximum_available_capacity",
      operation: "read",
    },
    {
      target: "controllable_unit_history.maximum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.minimum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.name",
      operation: "read",
    },
    {
      target: "controllable_unit_history.ramp_rate",
      operation: "read",
    },
    {
      target: "controllable_unit_history",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recovery_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.regulation_direction",
      operation: "read",
    },
    {
      target: "controllable_unit_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_history.start_date",
      operation: "read",
    },
    {
      target: "controllable_unit_history.status",
      operation: "read",
    },
    {
      target: "controllable_unit_history.validated_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.contract_reference",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.end_user_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.valid_from",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.contract_reference",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.controllable_unit_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_service_provider_history.controllable_unit_service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.end_user_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.valid_from",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.reason",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.content",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment_history.controllable_unit_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment_history.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.controllable_unit_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_history.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.reason",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target: "entity.business_id",
      operation: "read",
    },
    {
      target: "entity.business_id_type",
      operation: "read",
    },
    {
      target: "entity.id",
      operation: "read",
    },
    {
      target: "entity.name",
      operation: "read",
    },
    {
      target: "entity",
      operation: "read",
    },
    {
      target: "entity.recorded_at",
      operation: "read",
    },
    {
      target: "entity.recorded_by",
      operation: "read",
    },
    {
      target: "entity.type",
      operation: "read",
    },
    {
      target: "entity_client.client_id",
      operation: "read",
    },
    {
      target: "entity_client.client_secret",
      operation: "read",
    },
    {
      target: "entity_client.entity_id",
      operation: "read",
    },
    {
      target: "entity_client.id",
      operation: "read",
    },
    {
      target: "entity_client.name",
      operation: "read",
    },
    {
      target: "entity_client.party_id",
      operation: "read",
    },
    {
      target: "entity_client.public_key",
      operation: "read",
    },
    {
      target: "entity_client",
      operation: "read",
    },
    {
      target: "entity_client.recorded_at",
      operation: "read",
    },
    {
      target: "entity_client.recorded_by",
      operation: "read",
    },
    {
      target: "entity_client.scopes",
      operation: "read",
    },
    {
      target: "event.data",
      operation: "read",
    },
    {
      target: "event.id",
      operation: "read",
    },
    {
      target: "event",
      operation: "read",
    },
    {
      target: "event.source",
      operation: "read",
    },
    {
      target: "event.specversion",
      operation: "read",
    },
    {
      target: "event.time",
      operation: "read",
    },
    {
      target: "event.type",
      operation: "read",
    },
    {
      target: "identity.entity_id",
      operation: "read",
    },
    {
      target: "identity.entity_name",
      operation: "read",
    },
    {
      target: "identity.id",
      operation: "read",
    },
    {
      target: "identity.party_id",
      operation: "read",
    },
    {
      target: "identity.party_name",
      operation: "read",
    },
    {
      target: "identity",
      operation: "read",
    },
    {
      target: "notice.data",
      operation: "read",
    },
    {
      target: "notice.party_id",
      operation: "read",
    },
    {
      target: "notice",
      operation: "read",
    },
    {
      target: "notice.source",
      operation: "read",
    },
    {
      target: "notice.type",
      operation: "read",
    },
    {
      target: "notification.acknowledged",
      operation: "read",
    },
    {
      target: "notification.acknowledged",
      operation: "update",
    },
    {
      target: "notification.event_id",
      operation: "read",
    },
    {
      target: "notification.id",
      operation: "read",
    },
    {
      target: "notification.party_id",
      operation: "read",
    },
    {
      target: "notification",
      operation: "read",
    },
    {
      target: "notification.recorded_at",
      operation: "read",
    },
    {
      target: "notification.recorded_by",
      operation: "read",
    },
    {
      target: "notification",
      operation: "update",
    },
    {
      target: "party.business_id",
      operation: "read",
    },
    {
      target: "party.business_id_type",
      operation: "read",
    },
    {
      target: "party.entity_id",
      operation: "read",
    },
    {
      target: "party.id",
      operation: "read",
    },
    {
      target: "party.name",
      operation: "read",
    },
    {
      target: "party",
      operation: "read",
    },
    {
      target: "party.recorded_at",
      operation: "read",
    },
    {
      target: "party.recorded_by",
      operation: "read",
    },
    {
      target: "party.role",
      operation: "read",
    },
    {
      target: "party.status",
      operation: "read",
    },
    {
      target: "party.type",
      operation: "read",
    },
    {
      target: "party_history.business_id",
      operation: "read",
    },
    {
      target: "party_history.business_id_type",
      operation: "read",
    },
    {
      target: "party_history.entity_id",
      operation: "read",
    },
    {
      target: "party_history.id",
      operation: "read",
    },
    {
      target: "party_history.name",
      operation: "read",
    },
    {
      target: "party_history.party_id",
      operation: "read",
    },
    {
      target: "party_history",
      operation: "read",
    },
    {
      target: "party_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_history.role",
      operation: "read",
    },
    {
      target: "party_history.status",
      operation: "read",
    },
    {
      target: "party_history.type",
      operation: "read",
    },
    {
      target: "party_membership.entity_id",
      operation: "read",
    },
    {
      target: "party_membership.id",
      operation: "read",
    },
    {
      target: "party_membership.party_id",
      operation: "read",
    },
    {
      target: "party_membership",
      operation: "read",
    },
    {
      target: "party_membership.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership.scopes",
      operation: "read",
    },
    {
      target: "party_membership_history.entity_id",
      operation: "read",
    },
    {
      target: "party_membership_history.id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_membership_id",
      operation: "read",
    },
    {
      target: "party_membership_history",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_membership_history.scopes",
      operation: "read",
    },
    {
      target: "product_type.business_id",
      operation: "read",
    },
    {
      target: "product_type.id",
      operation: "read",
    },
    {
      target: "product_type.name",
      operation: "read",
    },
    {
      target: "product_type.products",
      operation: "read",
    },
    {
      target: "product_type",
      operation: "read",
    },
    {
      target: "product_type.service",
      operation: "read",
    },
    {
      target: "service_provider_product_application.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application.notes",
      operation: "read",
    },
    {
      target: "service_provider_product_application.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_application.qualified_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application",
      operation: "read",
    },
    {
      target: "service_provider_product_application.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application.service_provider_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application.status",
      operation: "read",
    },
    {
      target: "service_provider_product_application.system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.content",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.content",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.service_provider_product_application_comment_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.notes",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.qualified_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_history.service_provider_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_history.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.status",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.reason",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.service_provider_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.content",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment_history.service_provider_product_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment_history.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.service_provider_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_history.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group.id",
      operation: "read",
    },
    {
      target: "service_providing_group.name",
      operation: "read",
    },
    {
      target: "service_providing_group",
      operation: "read",
    },
    {
      target: "service_providing_group.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group.service_provider_id",
      operation: "read",
    },
    {
      target: "service_providing_group.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.prequalified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.service_providing_group_grid_prequalification_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.prequalified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.service_providing_group_grid_prequalification_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.service_providing_group_grid_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.name",
      operation: "read",
    },
    {
      target: "service_providing_group_history",
      operation: "read",
    },
    {
      target: "service_providing_group_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_history.replaced_by",
      operation: "read",
    },
    {
      target: "service_providing_group_history.service_provider_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.controllable_unit_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.valid_from",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.valid_to",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_membership_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_membership_history.service_providing_group_membership_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.valid_from",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.valid_to",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.notes",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.prequalified_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.status",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.verified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.notes",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.prequalified_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.service_providing_group_product_application_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.verified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.visibility",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.service_providing_group_product_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type.id",
      operation: "read",
    },
    {
      target: "system_operator_product_type.product_type_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type",
      operation: "read",
    },
    {
      target: "system_operator_product_type.recorded_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type.recorded_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type.status",
      operation: "read",
    },
    {
      target: "system_operator_product_type.system_operator_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.product_type_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.recorded_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.recorded_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.replaced_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.replaced_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.status",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.system_operator_id",
      operation: "read",
    },
    {
      target:
        "system_operator_product_type_history.system_operator_product_type_id",
      operation: "read",
    },
    {
      target: "technical_resource.controllable_unit_id",
      operation: "read",
    },
    {
      target: "technical_resource.details",
      operation: "read",
    },
    {
      target: "technical_resource.id",
      operation: "read",
    },
    {
      target: "technical_resource.name",
      operation: "read",
    },
    {
      target: "technical_resource",
      operation: "read",
    },
    {
      target: "technical_resource.recorded_at",
      operation: "read",
    },
    {
      target: "technical_resource.recorded_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "technical_resource_history.details",
      operation: "read",
    },
    {
      target: "technical_resource_history.id",
      operation: "read",
    },
    {
      target: "technical_resource_history.name",
      operation: "read",
    },
    {
      target: "technical_resource_history",
      operation: "read",
    },
    {
      target: "technical_resource_history.recorded_at",
      operation: "read",
    },
    {
      target: "technical_resource_history.recorded_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.replaced_at",
      operation: "read",
    },
    {
      target: "technical_resource_history.replaced_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.technical_resource_id",
      operation: "read",
    },
  ],
  flex_end_user: [
    {
      target: "accounting_point.business_id",
      operation: "read",
    },
    {
      target: "accounting_point.id",
      operation: "read",
    },
    {
      target: "accounting_point",
      operation: "read",
    },
    {
      target: "accounting_point.recorded_at",
      operation: "read",
    },
    {
      target: "accounting_point.recorded_by",
      operation: "read",
    },
    {
      target: "accounting_point.system_operator_id",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.accounting_point_id",
      operation: "read",
    },
    {
      target:
        "accounting_point_balance_responsible_party.balance_responsible_party_id",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.energy_direction",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.valid_from",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.valid_to",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.accounting_point_id",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.energy_supplier_id",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.valid_from",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit.accounting_point_id",
      operation: "read",
    },
    {
      target: "controllable_unit.business_id",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_node_id",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_validation_notes",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_validation_status",
      operation: "read",
    },
    {
      target: "controllable_unit.id",
      operation: "read",
    },
    {
      target: "controllable_unit.is_small",
      operation: "read",
    },
    {
      target: "controllable_unit.maximum_available_capacity",
      operation: "read",
    },
    {
      target: "controllable_unit.maximum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.minimum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.name",
      operation: "read",
    },
    {
      target: "controllable_unit.ramp_rate",
      operation: "read",
    },
    {
      target: "controllable_unit",
      operation: "read",
    },
    {
      target: "controllable_unit.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit.recovery_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.regulation_direction",
      operation: "read",
    },
    {
      target: "controllable_unit.start_date",
      operation: "read",
    },
    {
      target: "controllable_unit.status",
      operation: "read",
    },
    {
      target: "controllable_unit.validated_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.accounting_point_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.business_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_node_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_validation_notes",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_validation_status",
      operation: "read",
    },
    {
      target: "controllable_unit_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.is_small",
      operation: "read",
    },
    {
      target: "controllable_unit_history.maximum_available_capacity",
      operation: "read",
    },
    {
      target: "controllable_unit_history.maximum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.minimum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.name",
      operation: "read",
    },
    {
      target: "controllable_unit_history.ramp_rate",
      operation: "read",
    },
    {
      target: "controllable_unit_history",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recovery_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.regulation_direction",
      operation: "read",
    },
    {
      target: "controllable_unit_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_history.start_date",
      operation: "read",
    },
    {
      target: "controllable_unit_history.status",
      operation: "read",
    },
    {
      target: "controllable_unit_history.validated_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.contract_reference",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.end_user_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.valid_from",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.contract_reference",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.controllable_unit_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_service_provider_history.controllable_unit_service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.end_user_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.valid_from",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.reason",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.content",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment_history.controllable_unit_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment_history.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.controllable_unit_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_history.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.reason",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target: "entity.business_id",
      operation: "read",
    },
    {
      target: "entity.business_id_type",
      operation: "read",
    },
    {
      target: "entity.id",
      operation: "read",
    },
    {
      target: "entity.name",
      operation: "read",
    },
    {
      target: "entity",
      operation: "read",
    },
    {
      target: "entity.recorded_at",
      operation: "read",
    },
    {
      target: "entity.recorded_by",
      operation: "read",
    },
    {
      target: "entity.type",
      operation: "read",
    },
    {
      target: "entity_client.client_id",
      operation: "read",
    },
    {
      target: "entity_client.client_secret",
      operation: "read",
    },
    {
      target: "entity_client.entity_id",
      operation: "read",
    },
    {
      target: "entity_client.id",
      operation: "read",
    },
    {
      target: "entity_client.name",
      operation: "read",
    },
    {
      target: "entity_client.party_id",
      operation: "read",
    },
    {
      target: "entity_client.public_key",
      operation: "read",
    },
    {
      target: "entity_client",
      operation: "read",
    },
    {
      target: "entity_client.recorded_at",
      operation: "read",
    },
    {
      target: "entity_client.recorded_by",
      operation: "read",
    },
    {
      target: "entity_client.scopes",
      operation: "read",
    },
    {
      target: "event.data",
      operation: "read",
    },
    {
      target: "event.id",
      operation: "read",
    },
    {
      target: "event",
      operation: "read",
    },
    {
      target: "event.source",
      operation: "read",
    },
    {
      target: "event.specversion",
      operation: "read",
    },
    {
      target: "event.time",
      operation: "read",
    },
    {
      target: "event.type",
      operation: "read",
    },
    {
      target: "identity.entity_id",
      operation: "read",
    },
    {
      target: "identity.entity_name",
      operation: "read",
    },
    {
      target: "identity.id",
      operation: "read",
    },
    {
      target: "identity.party_id",
      operation: "read",
    },
    {
      target: "identity.party_name",
      operation: "read",
    },
    {
      target: "identity",
      operation: "read",
    },
    {
      target: "notice.data",
      operation: "read",
    },
    {
      target: "notice.party_id",
      operation: "read",
    },
    {
      target: "notice",
      operation: "read",
    },
    {
      target: "notice.source",
      operation: "read",
    },
    {
      target: "notice.type",
      operation: "read",
    },
    {
      target: "notification.acknowledged",
      operation: "read",
    },
    {
      target: "notification.acknowledged",
      operation: "update",
    },
    {
      target: "notification.event_id",
      operation: "read",
    },
    {
      target: "notification.id",
      operation: "read",
    },
    {
      target: "notification.party_id",
      operation: "read",
    },
    {
      target: "notification",
      operation: "read",
    },
    {
      target: "notification.recorded_at",
      operation: "read",
    },
    {
      target: "notification.recorded_by",
      operation: "read",
    },
    {
      target: "notification",
      operation: "update",
    },
    {
      target: "party.business_id",
      operation: "read",
    },
    {
      target: "party.business_id_type",
      operation: "read",
    },
    {
      target: "party.entity_id",
      operation: "read",
    },
    {
      target: "party.id",
      operation: "read",
    },
    {
      target: "party.name",
      operation: "read",
    },
    {
      target: "party",
      operation: "read",
    },
    {
      target: "party.recorded_at",
      operation: "read",
    },
    {
      target: "party.recorded_by",
      operation: "read",
    },
    {
      target: "party.role",
      operation: "read",
    },
    {
      target: "party.status",
      operation: "read",
    },
    {
      target: "party.type",
      operation: "read",
    },
    {
      target: "party_history.business_id",
      operation: "read",
    },
    {
      target: "party_history.business_id_type",
      operation: "read",
    },
    {
      target: "party_history.entity_id",
      operation: "read",
    },
    {
      target: "party_history.id",
      operation: "read",
    },
    {
      target: "party_history.name",
      operation: "read",
    },
    {
      target: "party_history.party_id",
      operation: "read",
    },
    {
      target: "party_history",
      operation: "read",
    },
    {
      target: "party_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_history.role",
      operation: "read",
    },
    {
      target: "party_history.status",
      operation: "read",
    },
    {
      target: "party_history.type",
      operation: "read",
    },
    {
      target: "party_membership.entity_id",
      operation: "read",
    },
    {
      target: "party_membership.id",
      operation: "read",
    },
    {
      target: "party_membership.party_id",
      operation: "read",
    },
    {
      target: "party_membership",
      operation: "read",
    },
    {
      target: "party_membership.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership.scopes",
      operation: "read",
    },
    {
      target: "party_membership_history.entity_id",
      operation: "read",
    },
    {
      target: "party_membership_history.id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_membership_id",
      operation: "read",
    },
    {
      target: "party_membership_history",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_membership_history.scopes",
      operation: "read",
    },
    {
      target: "product_type.business_id",
      operation: "read",
    },
    {
      target: "product_type.id",
      operation: "read",
    },
    {
      target: "product_type.name",
      operation: "read",
    },
    {
      target: "product_type.products",
      operation: "read",
    },
    {
      target: "product_type",
      operation: "read",
    },
    {
      target: "product_type.service",
      operation: "read",
    },
    {
      target: "service_provider_product_application.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application.notes",
      operation: "read",
    },
    {
      target: "service_provider_product_application.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_application.qualified_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application",
      operation: "read",
    },
    {
      target: "service_provider_product_application.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application.service_provider_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application.status",
      operation: "read",
    },
    {
      target: "service_provider_product_application.system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.content",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.content",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.service_provider_product_application_comment_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.notes",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.qualified_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_history.service_provider_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_history.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.status",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.reason",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.service_provider_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.content",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment_history.service_provider_product_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment_history.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.service_provider_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_history.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group.id",
      operation: "read",
    },
    {
      target: "service_providing_group.name",
      operation: "read",
    },
    {
      target: "service_providing_group",
      operation: "read",
    },
    {
      target: "service_providing_group.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group.service_provider_id",
      operation: "read",
    },
    {
      target: "service_providing_group.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.prequalified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.service_providing_group_grid_prequalification_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.prequalified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.service_providing_group_grid_prequalification_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.service_providing_group_grid_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.name",
      operation: "read",
    },
    {
      target: "service_providing_group_history",
      operation: "read",
    },
    {
      target: "service_providing_group_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_history.replaced_by",
      operation: "read",
    },
    {
      target: "service_providing_group_history.service_provider_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.controllable_unit_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.valid_from",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.valid_to",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_membership_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_membership_history.service_providing_group_membership_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.valid_from",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.valid_to",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.notes",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.prequalified_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.status",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.verified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.notes",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.prequalified_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.service_providing_group_product_application_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.verified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.visibility",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.service_providing_group_product_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type.id",
      operation: "read",
    },
    {
      target: "system_operator_product_type.product_type_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type",
      operation: "read",
    },
    {
      target: "system_operator_product_type.recorded_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type.recorded_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type.status",
      operation: "read",
    },
    {
      target: "system_operator_product_type.system_operator_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.product_type_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.recorded_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.recorded_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.replaced_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.replaced_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.status",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.system_operator_id",
      operation: "read",
    },
    {
      target:
        "system_operator_product_type_history.system_operator_product_type_id",
      operation: "read",
    },
    {
      target: "technical_resource.controllable_unit_id",
      operation: "read",
    },
    {
      target: "technical_resource.details",
      operation: "read",
    },
    {
      target: "technical_resource.id",
      operation: "read",
    },
    {
      target: "technical_resource.name",
      operation: "read",
    },
    {
      target: "technical_resource",
      operation: "read",
    },
    {
      target: "technical_resource.recorded_at",
      operation: "read",
    },
    {
      target: "technical_resource.recorded_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "technical_resource_history.details",
      operation: "read",
    },
    {
      target: "technical_resource_history.id",
      operation: "read",
    },
    {
      target: "technical_resource_history.name",
      operation: "read",
    },
    {
      target: "technical_resource_history",
      operation: "read",
    },
    {
      target: "technical_resource_history.recorded_at",
      operation: "read",
    },
    {
      target: "technical_resource_history.recorded_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.replaced_at",
      operation: "read",
    },
    {
      target: "technical_resource_history.replaced_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.technical_resource_id",
      operation: "read",
    },
  ],
  flex_flexibility_information_system_operator: [
    {
      target: "accounting_point.business_id",
      operation: "read",
    },
    {
      target: "accounting_point.id",
      operation: "read",
    },
    {
      target: "accounting_point",
      operation: "read",
    },
    {
      target: "accounting_point.recorded_at",
      operation: "read",
    },
    {
      target: "accounting_point.recorded_by",
      operation: "read",
    },
    {
      target: "accounting_point.system_operator_id",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.accounting_point_id",
      operation: "read",
    },
    {
      target:
        "accounting_point_balance_responsible_party.balance_responsible_party_id",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.energy_direction",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.valid_from",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.valid_to",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.accounting_point_id",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.energy_supplier_id",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.valid_from",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit.accounting_point_id",
      operation: "create",
    },
    {
      target: "controllable_unit.accounting_point_id",
      operation: "read",
    },
    {
      target: "controllable_unit.business_id",
      operation: "read",
    },
    {
      target: "controllable_unit",
      operation: "create",
    },
    {
      target: "controllable_unit.grid_node_id",
      operation: "create",
    },
    {
      target: "controllable_unit.grid_node_id",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_node_id",
      operation: "update",
    },
    {
      target: "controllable_unit.grid_validation_notes",
      operation: "create",
    },
    {
      target: "controllable_unit.grid_validation_notes",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_validation_notes",
      operation: "update",
    },
    {
      target: "controllable_unit.grid_validation_status",
      operation: "create",
    },
    {
      target: "controllable_unit.grid_validation_status",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_validation_status",
      operation: "update",
    },
    {
      target: "controllable_unit.id",
      operation: "read",
    },
    {
      target: "controllable_unit.is_small",
      operation: "read",
    },
    {
      target: "controllable_unit",
      operation: "lookup",
    },
    {
      target: "controllable_unit.maximum_available_capacity",
      operation: "create",
    },
    {
      target: "controllable_unit.maximum_available_capacity",
      operation: "read",
    },
    {
      target: "controllable_unit.maximum_available_capacity",
      operation: "update",
    },
    {
      target: "controllable_unit.maximum_duration",
      operation: "create",
    },
    {
      target: "controllable_unit.maximum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.maximum_duration",
      operation: "update",
    },
    {
      target: "controllable_unit.minimum_duration",
      operation: "create",
    },
    {
      target: "controllable_unit.minimum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.minimum_duration",
      operation: "update",
    },
    {
      target: "controllable_unit.name",
      operation: "create",
    },
    {
      target: "controllable_unit.name",
      operation: "read",
    },
    {
      target: "controllable_unit.name",
      operation: "update",
    },
    {
      target: "controllable_unit.ramp_rate",
      operation: "create",
    },
    {
      target: "controllable_unit.ramp_rate",
      operation: "read",
    },
    {
      target: "controllable_unit.ramp_rate",
      operation: "update",
    },
    {
      target: "controllable_unit",
      operation: "read",
    },
    {
      target: "controllable_unit.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit.recovery_duration",
      operation: "create",
    },
    {
      target: "controllable_unit.recovery_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.recovery_duration",
      operation: "update",
    },
    {
      target: "controllable_unit.regulation_direction",
      operation: "create",
    },
    {
      target: "controllable_unit.regulation_direction",
      operation: "read",
    },
    {
      target: "controllable_unit.regulation_direction",
      operation: "update",
    },
    {
      target: "controllable_unit.start_date",
      operation: "create",
    },
    {
      target: "controllable_unit.start_date",
      operation: "read",
    },
    {
      target: "controllable_unit.start_date",
      operation: "update",
    },
    {
      target: "controllable_unit.status",
      operation: "read",
    },
    {
      target: "controllable_unit.status",
      operation: "update",
    },
    {
      target: "controllable_unit",
      operation: "update",
    },
    {
      target: "controllable_unit.validated_at",
      operation: "create",
    },
    {
      target: "controllable_unit.validated_at",
      operation: "read",
    },
    {
      target: "controllable_unit.validated_at",
      operation: "update",
    },
    {
      target: "controllable_unit_history.accounting_point_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.business_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_node_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_validation_notes",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_validation_status",
      operation: "read",
    },
    {
      target: "controllable_unit_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.is_small",
      operation: "read",
    },
    {
      target: "controllable_unit_history.maximum_available_capacity",
      operation: "read",
    },
    {
      target: "controllable_unit_history.maximum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.minimum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.name",
      operation: "read",
    },
    {
      target: "controllable_unit_history.ramp_rate",
      operation: "read",
    },
    {
      target: "controllable_unit_history",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recovery_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.regulation_direction",
      operation: "read",
    },
    {
      target: "controllable_unit_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_history.start_date",
      operation: "read",
    },
    {
      target: "controllable_unit_history.status",
      operation: "read",
    },
    {
      target: "controllable_unit_history.validated_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.contract_reference",
      operation: "create",
    },
    {
      target: "controllable_unit_service_provider.contract_reference",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.contract_reference",
      operation: "update",
    },
    {
      target: "controllable_unit_service_provider.controllable_unit_id",
      operation: "create",
    },
    {
      target: "controllable_unit_service_provider.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider",
      operation: "create",
    },
    {
      target: "controllable_unit_service_provider",
      operation: "delete",
    },
    {
      target: "controllable_unit_service_provider.end_user_id",
      operation: "create",
    },
    {
      target: "controllable_unit_service_provider.end_user_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.service_provider_id",
      operation: "create",
    },
    {
      target: "controllable_unit_service_provider.service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider",
      operation: "update",
    },
    {
      target: "controllable_unit_service_provider.valid_from",
      operation: "create",
    },
    {
      target: "controllable_unit_service_provider.valid_from",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.valid_from",
      operation: "update",
    },
    {
      target: "controllable_unit_service_provider.valid_to",
      operation: "create",
    },
    {
      target: "controllable_unit_service_provider.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.valid_to",
      operation: "update",
    },
    {
      target: "controllable_unit_service_provider_history.contract_reference",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.controllable_unit_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_service_provider_history.controllable_unit_service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.end_user_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.valid_from",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.controllable_unit_id",
      operation: "create",
    },
    {
      target: "controllable_unit_suspension.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension",
      operation: "create",
    },
    {
      target: "controllable_unit_suspension",
      operation: "delete",
    },
    {
      target: "controllable_unit_suspension.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.impacted_system_operator_id",
      operation: "create",
    },
    {
      target: "controllable_unit_suspension.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.reason",
      operation: "create",
    },
    {
      target: "controllable_unit_suspension.reason",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.reason",
      operation: "update",
    },
    {
      target: "controllable_unit_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension",
      operation: "update",
    },
    {
      target: "controllable_unit_suspension_comment.content",
      operation: "create",
    },
    {
      target: "controllable_unit_suspension_comment.content",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.content",
      operation: "update",
    },
    {
      target:
        "controllable_unit_suspension_comment.controllable_unit_suspension_id",
      operation: "create",
    },
    {
      target:
        "controllable_unit_suspension_comment.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment",
      operation: "create",
    },
    {
      target: "controllable_unit_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment",
      operation: "update",
    },
    {
      target: "controllable_unit_suspension_comment.visibility",
      operation: "create",
    },
    {
      target: "controllable_unit_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.visibility",
      operation: "update",
    },
    {
      target: "controllable_unit_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment_history.controllable_unit_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment_history.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.controllable_unit_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_history.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.reason",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target: "entity.business_id",
      operation: "create",
    },
    {
      target: "entity.business_id",
      operation: "read",
    },
    {
      target: "entity.business_id_type",
      operation: "create",
    },
    {
      target: "entity.business_id_type",
      operation: "read",
    },
    {
      target: "entity",
      operation: "create",
    },
    {
      target: "entity.id",
      operation: "read",
    },
    {
      target: "entity",
      operation: "lookup",
    },
    {
      target: "entity.name",
      operation: "create",
    },
    {
      target: "entity.name",
      operation: "read",
    },
    {
      target: "entity.name",
      operation: "update",
    },
    {
      target: "entity",
      operation: "read",
    },
    {
      target: "entity.recorded_at",
      operation: "read",
    },
    {
      target: "entity.recorded_by",
      operation: "read",
    },
    {
      target: "entity.type",
      operation: "create",
    },
    {
      target: "entity.type",
      operation: "read",
    },
    {
      target: "entity",
      operation: "update",
    },
    {
      target: "entity_client.client_id",
      operation: "read",
    },
    {
      target: "entity_client.client_secret",
      operation: "read",
    },
    {
      target: "entity_client.entity_id",
      operation: "read",
    },
    {
      target: "entity_client.id",
      operation: "read",
    },
    {
      target: "entity_client.name",
      operation: "read",
    },
    {
      target: "entity_client.party_id",
      operation: "read",
    },
    {
      target: "entity_client.public_key",
      operation: "read",
    },
    {
      target: "entity_client",
      operation: "read",
    },
    {
      target: "entity_client.recorded_at",
      operation: "read",
    },
    {
      target: "entity_client.recorded_by",
      operation: "read",
    },
    {
      target: "entity_client.scopes",
      operation: "read",
    },
    {
      target: "event.data",
      operation: "read",
    },
    {
      target: "event.id",
      operation: "read",
    },
    {
      target: "event",
      operation: "read",
    },
    {
      target: "event.source",
      operation: "read",
    },
    {
      target: "event.specversion",
      operation: "read",
    },
    {
      target: "event.time",
      operation: "read",
    },
    {
      target: "event.type",
      operation: "read",
    },
    {
      target: "identity.entity_id",
      operation: "read",
    },
    {
      target: "identity.entity_name",
      operation: "read",
    },
    {
      target: "identity.id",
      operation: "read",
    },
    {
      target: "identity.party_id",
      operation: "read",
    },
    {
      target: "identity.party_name",
      operation: "read",
    },
    {
      target: "identity",
      operation: "read",
    },
    {
      target: "notice.data",
      operation: "read",
    },
    {
      target: "notice.party_id",
      operation: "read",
    },
    {
      target: "notice",
      operation: "read",
    },
    {
      target: "notice.source",
      operation: "read",
    },
    {
      target: "notice.type",
      operation: "read",
    },
    {
      target: "notification.acknowledged",
      operation: "read",
    },
    {
      target: "notification.acknowledged",
      operation: "update",
    },
    {
      target: "notification.event_id",
      operation: "read",
    },
    {
      target: "notification.id",
      operation: "read",
    },
    {
      target: "notification.party_id",
      operation: "read",
    },
    {
      target: "notification",
      operation: "read",
    },
    {
      target: "notification.recorded_at",
      operation: "read",
    },
    {
      target: "notification.recorded_by",
      operation: "read",
    },
    {
      target: "notification",
      operation: "update",
    },
    {
      target: "party.business_id",
      operation: "create",
    },
    {
      target: "party.business_id",
      operation: "read",
    },
    {
      target: "party.business_id_type",
      operation: "create",
    },
    {
      target: "party.business_id_type",
      operation: "read",
    },
    {
      target: "party",
      operation: "create",
    },
    {
      target: "party.entity_id",
      operation: "create",
    },
    {
      target: "party.entity_id",
      operation: "read",
    },
    {
      target: "party.id",
      operation: "read",
    },
    {
      target: "party.name",
      operation: "create",
    },
    {
      target: "party.name",
      operation: "read",
    },
    {
      target: "party.name",
      operation: "update",
    },
    {
      target: "party",
      operation: "read",
    },
    {
      target: "party.recorded_at",
      operation: "read",
    },
    {
      target: "party.recorded_by",
      operation: "read",
    },
    {
      target: "party.role",
      operation: "create",
    },
    {
      target: "party.role",
      operation: "read",
    },
    {
      target: "party.status",
      operation: "read",
    },
    {
      target: "party.status",
      operation: "update",
    },
    {
      target: "party.type",
      operation: "create",
    },
    {
      target: "party.type",
      operation: "read",
    },
    {
      target: "party",
      operation: "update",
    },
    {
      target: "party_history.business_id",
      operation: "read",
    },
    {
      target: "party_history.business_id_type",
      operation: "read",
    },
    {
      target: "party_history.entity_id",
      operation: "read",
    },
    {
      target: "party_history.id",
      operation: "read",
    },
    {
      target: "party_history.name",
      operation: "read",
    },
    {
      target: "party_history.party_id",
      operation: "read",
    },
    {
      target: "party_history",
      operation: "read",
    },
    {
      target: "party_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_history.role",
      operation: "read",
    },
    {
      target: "party_history.status",
      operation: "read",
    },
    {
      target: "party_history.type",
      operation: "read",
    },
    {
      target: "party_membership",
      operation: "create",
    },
    {
      target: "party_membership",
      operation: "delete",
    },
    {
      target: "party_membership.entity_id",
      operation: "create",
    },
    {
      target: "party_membership.entity_id",
      operation: "read",
    },
    {
      target: "party_membership.id",
      operation: "read",
    },
    {
      target: "party_membership.party_id",
      operation: "create",
    },
    {
      target: "party_membership.party_id",
      operation: "read",
    },
    {
      target: "party_membership",
      operation: "read",
    },
    {
      target: "party_membership.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership.scopes",
      operation: "create",
    },
    {
      target: "party_membership.scopes",
      operation: "read",
    },
    {
      target: "party_membership.scopes",
      operation: "update",
    },
    {
      target: "party_membership",
      operation: "update",
    },
    {
      target: "party_membership_history.entity_id",
      operation: "read",
    },
    {
      target: "party_membership_history.id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_membership_id",
      operation: "read",
    },
    {
      target: "party_membership_history",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_membership_history.scopes",
      operation: "read",
    },
    {
      target: "product_type.business_id",
      operation: "read",
    },
    {
      target: "product_type.id",
      operation: "read",
    },
    {
      target: "product_type.name",
      operation: "read",
    },
    {
      target: "product_type.products",
      operation: "read",
    },
    {
      target: "product_type",
      operation: "read",
    },
    {
      target: "product_type.service",
      operation: "read",
    },
    {
      target: "service_provider_product_application.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application.notes",
      operation: "read",
    },
    {
      target: "service_provider_product_application.notes",
      operation: "update",
    },
    {
      target: "service_provider_product_application.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_application.product_type_ids",
      operation: "update",
    },
    {
      target: "service_provider_product_application.qualified_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application.qualified_at",
      operation: "update",
    },
    {
      target: "service_provider_product_application",
      operation: "read",
    },
    {
      target: "service_provider_product_application.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application.service_provider_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application.status",
      operation: "read",
    },
    {
      target: "service_provider_product_application.status",
      operation: "update",
    },
    {
      target: "service_provider_product_application.system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application",
      operation: "update",
    },
    {
      target: "service_provider_product_application_comment.content",
      operation: "create",
    },
    {
      target: "service_provider_product_application_comment.content",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.content",
      operation: "update",
    },
    {
      target: "service_provider_product_application_comment",
      operation: "create",
    },
    {
      target: "service_provider_product_application_comment.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment.service_provider_product_application_id",
      operation: "create",
    },
    {
      target:
        "service_provider_product_application_comment.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment",
      operation: "update",
    },
    {
      target: "service_provider_product_application_comment.visibility",
      operation: "create",
    },
    {
      target: "service_provider_product_application_comment.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.visibility",
      operation: "update",
    },
    {
      target: "service_provider_product_application_comment_history.content",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.service_provider_product_application_comment_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.notes",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.qualified_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_history.service_provider_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_history.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.status",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension",
      operation: "create",
    },
    {
      target: "service_provider_product_suspension",
      operation: "delete",
    },
    {
      target: "service_provider_product_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension.procuring_system_operator_id",
      operation: "create",
    },
    {
      target:
        "service_provider_product_suspension.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.product_type_ids",
      operation: "create",
    },
    {
      target: "service_provider_product_suspension.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.product_type_ids",
      operation: "update",
    },
    {
      target: "service_provider_product_suspension",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.reason",
      operation: "create",
    },
    {
      target: "service_provider_product_suspension.reason",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.reason",
      operation: "update",
    },
    {
      target: "service_provider_product_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.service_provider_id",
      operation: "create",
    },
    {
      target: "service_provider_product_suspension.service_provider_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension",
      operation: "update",
    },
    {
      target: "service_provider_product_suspension_comment.content",
      operation: "create",
    },
    {
      target: "service_provider_product_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.content",
      operation: "update",
    },
    {
      target: "service_provider_product_suspension_comment",
      operation: "create",
    },
    {
      target: "service_provider_product_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment.service_provider_product_suspension_id",
      operation: "create",
    },
    {
      target:
        "service_provider_product_suspension_comment.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment",
      operation: "update",
    },
    {
      target: "service_provider_product_suspension_comment.visibility",
      operation: "create",
    },
    {
      target: "service_provider_product_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.visibility",
      operation: "update",
    },
    {
      target: "service_provider_product_suspension_comment_history.content",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment_history.service_provider_product_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment_history.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.service_provider_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_history.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group",
      operation: "create",
    },
    {
      target: "service_providing_group.id",
      operation: "read",
    },
    {
      target: "service_providing_group.name",
      operation: "create",
    },
    {
      target: "service_providing_group.name",
      operation: "read",
    },
    {
      target: "service_providing_group.name",
      operation: "update",
    },
    {
      target: "service_providing_group",
      operation: "read",
    },
    {
      target: "service_providing_group.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group.service_provider_id",
      operation: "create",
    },
    {
      target: "service_providing_group.service_provider_id",
      operation: "read",
    },
    {
      target: "service_providing_group.status",
      operation: "read",
    },
    {
      target: "service_providing_group.status",
      operation: "update",
    },
    {
      target: "service_providing_group",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_prequalification",
      operation: "create",
    },
    {
      target: "service_providing_group_grid_prequalification.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification.impacted_system_operator_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_grid_prequalification.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.prequalified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.prequalified_at",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_prequalification",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification.service_providing_group_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_grid_prequalification.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.status",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_prequalification",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.content",
      operation: "create",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.content",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.content",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_prequalification_comment",
      operation: "create",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.service_providing_group_grid_prequalification_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.service_providing_group_grid_prequalification_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment",
      operation: "update",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.visibility",
      operation: "create",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.visibility",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.visibility",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_prequalification_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.prequalified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.service_providing_group_grid_prequalification_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension",
      operation: "create",
    },
    {
      target: "service_providing_group_grid_suspension",
      operation: "delete",
    },
    {
      target: "service_providing_group_grid_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension.impacted_system_operator_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_grid_suspension.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.reason",
      operation: "create",
    },
    {
      target: "service_providing_group_grid_suspension.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.reason",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension.service_providing_group_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_grid_suspension.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_suspension_comment.content",
      operation: "create",
    },
    {
      target: "service_providing_group_grid_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.content",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_suspension_comment",
      operation: "create",
    },
    {
      target: "service_providing_group_grid_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment.service_providing_group_grid_suspension_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_suspension_comment.visibility",
      operation: "create",
    },
    {
      target: "service_providing_group_grid_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.visibility",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.service_providing_group_grid_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.name",
      operation: "read",
    },
    {
      target: "service_providing_group_history",
      operation: "read",
    },
    {
      target: "service_providing_group_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_history.replaced_by",
      operation: "read",
    },
    {
      target: "service_providing_group_history.service_provider_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.controllable_unit_id",
      operation: "create",
    },
    {
      target: "service_providing_group_membership.controllable_unit_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership",
      operation: "create",
    },
    {
      target: "service_providing_group_membership",
      operation: "delete",
    },
    {
      target: "service_providing_group_membership.id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.service_providing_group_id",
      operation: "create",
    },
    {
      target: "service_providing_group_membership.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership",
      operation: "update",
    },
    {
      target: "service_providing_group_membership.valid_from",
      operation: "create",
    },
    {
      target: "service_providing_group_membership.valid_from",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.valid_from",
      operation: "update",
    },
    {
      target: "service_providing_group_membership.valid_to",
      operation: "create",
    },
    {
      target: "service_providing_group_membership.valid_to",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.valid_to",
      operation: "update",
    },
    {
      target: "service_providing_group_membership_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_membership_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_membership_history.service_providing_group_membership_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.valid_from",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.valid_to",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.notes",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.notes",
      operation: "update",
    },
    {
      target: "service_providing_group_product_application.prequalified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.prequalified_at",
      operation: "update",
    },
    {
      target:
        "service_providing_group_product_application.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.product_type_ids",
      operation: "update",
    },
    {
      target: "service_providing_group_product_application",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.status",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.status",
      operation: "update",
    },
    {
      target: "service_providing_group_product_application",
      operation: "update",
    },
    {
      target: "service_providing_group_product_application.verified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.verified_at",
      operation: "update",
    },
    {
      target: "service_providing_group_product_application_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.notes",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.prequalified_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.service_providing_group_product_application_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.verified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension",
      operation: "create",
    },
    {
      target: "service_providing_group_product_suspension",
      operation: "delete",
    },
    {
      target: "service_providing_group_product_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension.procuring_system_operator_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_product_suspension.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.product_type_ids",
      operation: "create",
    },
    {
      target: "service_providing_group_product_suspension.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.reason",
      operation: "create",
    },
    {
      target: "service_providing_group_product_suspension.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.reason",
      operation: "update",
    },
    {
      target: "service_providing_group_product_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension.service_providing_group_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_product_suspension.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension",
      operation: "update",
    },
    {
      target: "service_providing_group_product_suspension_comment.content",
      operation: "create",
    },
    {
      target: "service_providing_group_product_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.content",
      operation: "update",
    },
    {
      target: "service_providing_group_product_suspension_comment",
      operation: "create",
    },
    {
      target: "service_providing_group_product_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment.service_providing_group_product_suspension_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_product_suspension_comment.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment",
      operation: "update",
    },
    {
      target: "service_providing_group_product_suspension_comment.visibility",
      operation: "create",
    },
    {
      target: "service_providing_group_product_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.visibility",
      operation: "update",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.service_providing_group_product_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type",
      operation: "create",
    },
    {
      target: "system_operator_product_type.id",
      operation: "read",
    },
    {
      target: "system_operator_product_type.product_type_id",
      operation: "create",
    },
    {
      target: "system_operator_product_type.product_type_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type",
      operation: "read",
    },
    {
      target: "system_operator_product_type.recorded_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type.recorded_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type.status",
      operation: "read",
    },
    {
      target: "system_operator_product_type.status",
      operation: "update",
    },
    {
      target: "system_operator_product_type.system_operator_id",
      operation: "create",
    },
    {
      target: "system_operator_product_type.system_operator_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type",
      operation: "update",
    },
    {
      target: "system_operator_product_type_history.id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.product_type_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.recorded_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.recorded_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.replaced_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.replaced_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.status",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.system_operator_id",
      operation: "read",
    },
    {
      target:
        "system_operator_product_type_history.system_operator_product_type_id",
      operation: "read",
    },
    {
      target: "technical_resource.controllable_unit_id",
      operation: "create",
    },
    {
      target: "technical_resource.controllable_unit_id",
      operation: "read",
    },
    {
      target: "technical_resource",
      operation: "create",
    },
    {
      target: "technical_resource",
      operation: "delete",
    },
    {
      target: "technical_resource.details",
      operation: "create",
    },
    {
      target: "technical_resource.details",
      operation: "read",
    },
    {
      target: "technical_resource.details",
      operation: "update",
    },
    {
      target: "technical_resource.id",
      operation: "read",
    },
    {
      target: "technical_resource.name",
      operation: "create",
    },
    {
      target: "technical_resource.name",
      operation: "read",
    },
    {
      target: "technical_resource.name",
      operation: "update",
    },
    {
      target: "technical_resource",
      operation: "read",
    },
    {
      target: "technical_resource.recorded_at",
      operation: "read",
    },
    {
      target: "technical_resource.recorded_by",
      operation: "read",
    },
    {
      target: "technical_resource",
      operation: "update",
    },
    {
      target: "technical_resource_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "technical_resource_history.details",
      operation: "read",
    },
    {
      target: "technical_resource_history.id",
      operation: "read",
    },
    {
      target: "technical_resource_history.name",
      operation: "read",
    },
    {
      target: "technical_resource_history",
      operation: "read",
    },
    {
      target: "technical_resource_history.recorded_at",
      operation: "read",
    },
    {
      target: "technical_resource_history.recorded_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.replaced_at",
      operation: "read",
    },
    {
      target: "technical_resource_history.replaced_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.technical_resource_id",
      operation: "read",
    },
  ],
  flex_market_operator: [
    {
      target: "accounting_point.business_id",
      operation: "read",
    },
    {
      target: "accounting_point.id",
      operation: "read",
    },
    {
      target: "accounting_point",
      operation: "read",
    },
    {
      target: "accounting_point.recorded_at",
      operation: "read",
    },
    {
      target: "accounting_point.recorded_by",
      operation: "read",
    },
    {
      target: "accounting_point.system_operator_id",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.accounting_point_id",
      operation: "read",
    },
    {
      target:
        "accounting_point_balance_responsible_party.balance_responsible_party_id",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.energy_direction",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.valid_from",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.valid_to",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.accounting_point_id",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.energy_supplier_id",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.valid_from",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit.accounting_point_id",
      operation: "read",
    },
    {
      target: "controllable_unit.business_id",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_node_id",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_validation_notes",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_validation_status",
      operation: "read",
    },
    {
      target: "controllable_unit.id",
      operation: "read",
    },
    {
      target: "controllable_unit.is_small",
      operation: "read",
    },
    {
      target: "controllable_unit.maximum_available_capacity",
      operation: "read",
    },
    {
      target: "controllable_unit.maximum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.minimum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.name",
      operation: "read",
    },
    {
      target: "controllable_unit.ramp_rate",
      operation: "read",
    },
    {
      target: "controllable_unit",
      operation: "read",
    },
    {
      target: "controllable_unit.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit.recovery_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.regulation_direction",
      operation: "read",
    },
    {
      target: "controllable_unit.start_date",
      operation: "read",
    },
    {
      target: "controllable_unit.status",
      operation: "read",
    },
    {
      target: "controllable_unit.validated_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.accounting_point_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.business_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_node_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_validation_notes",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_validation_status",
      operation: "read",
    },
    {
      target: "controllable_unit_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.is_small",
      operation: "read",
    },
    {
      target: "controllable_unit_history.maximum_available_capacity",
      operation: "read",
    },
    {
      target: "controllable_unit_history.maximum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.minimum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.name",
      operation: "read",
    },
    {
      target: "controllable_unit_history.ramp_rate",
      operation: "read",
    },
    {
      target: "controllable_unit_history",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recovery_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.regulation_direction",
      operation: "read",
    },
    {
      target: "controllable_unit_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_history.start_date",
      operation: "read",
    },
    {
      target: "controllable_unit_history.status",
      operation: "read",
    },
    {
      target: "controllable_unit_history.validated_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.contract_reference",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.end_user_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.valid_from",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.contract_reference",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.controllable_unit_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_service_provider_history.controllable_unit_service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.end_user_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.valid_from",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.reason",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.content",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment_history.controllable_unit_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment_history.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.controllable_unit_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_history.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.reason",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target: "entity.business_id",
      operation: "read",
    },
    {
      target: "entity.business_id_type",
      operation: "read",
    },
    {
      target: "entity.id",
      operation: "read",
    },
    {
      target: "entity.name",
      operation: "read",
    },
    {
      target: "entity",
      operation: "read",
    },
    {
      target: "entity.recorded_at",
      operation: "read",
    },
    {
      target: "entity.recorded_by",
      operation: "read",
    },
    {
      target: "entity.type",
      operation: "read",
    },
    {
      target: "entity_client.client_id",
      operation: "read",
    },
    {
      target: "entity_client.client_secret",
      operation: "read",
    },
    {
      target: "entity_client.entity_id",
      operation: "read",
    },
    {
      target: "entity_client.id",
      operation: "read",
    },
    {
      target: "entity_client.name",
      operation: "read",
    },
    {
      target: "entity_client.party_id",
      operation: "read",
    },
    {
      target: "entity_client.public_key",
      operation: "read",
    },
    {
      target: "entity_client",
      operation: "read",
    },
    {
      target: "entity_client.recorded_at",
      operation: "read",
    },
    {
      target: "entity_client.recorded_by",
      operation: "read",
    },
    {
      target: "entity_client.scopes",
      operation: "read",
    },
    {
      target: "event.data",
      operation: "read",
    },
    {
      target: "event.id",
      operation: "read",
    },
    {
      target: "event",
      operation: "read",
    },
    {
      target: "event.source",
      operation: "read",
    },
    {
      target: "event.specversion",
      operation: "read",
    },
    {
      target: "event.time",
      operation: "read",
    },
    {
      target: "event.type",
      operation: "read",
    },
    {
      target: "identity.entity_id",
      operation: "read",
    },
    {
      target: "identity.entity_name",
      operation: "read",
    },
    {
      target: "identity.id",
      operation: "read",
    },
    {
      target: "identity.party_id",
      operation: "read",
    },
    {
      target: "identity.party_name",
      operation: "read",
    },
    {
      target: "identity",
      operation: "read",
    },
    {
      target: "notice.data",
      operation: "read",
    },
    {
      target: "notice.party_id",
      operation: "read",
    },
    {
      target: "notice",
      operation: "read",
    },
    {
      target: "notice.source",
      operation: "read",
    },
    {
      target: "notice.type",
      operation: "read",
    },
    {
      target: "notification.acknowledged",
      operation: "read",
    },
    {
      target: "notification.acknowledged",
      operation: "update",
    },
    {
      target: "notification.event_id",
      operation: "read",
    },
    {
      target: "notification.id",
      operation: "read",
    },
    {
      target: "notification.party_id",
      operation: "read",
    },
    {
      target: "notification",
      operation: "read",
    },
    {
      target: "notification.recorded_at",
      operation: "read",
    },
    {
      target: "notification.recorded_by",
      operation: "read",
    },
    {
      target: "notification",
      operation: "update",
    },
    {
      target: "party.business_id",
      operation: "read",
    },
    {
      target: "party.business_id_type",
      operation: "read",
    },
    {
      target: "party.entity_id",
      operation: "read",
    },
    {
      target: "party.id",
      operation: "read",
    },
    {
      target: "party.name",
      operation: "read",
    },
    {
      target: "party",
      operation: "read",
    },
    {
      target: "party.recorded_at",
      operation: "read",
    },
    {
      target: "party.recorded_by",
      operation: "read",
    },
    {
      target: "party.role",
      operation: "read",
    },
    {
      target: "party.status",
      operation: "read",
    },
    {
      target: "party.type",
      operation: "read",
    },
    {
      target: "party_history.business_id",
      operation: "read",
    },
    {
      target: "party_history.business_id_type",
      operation: "read",
    },
    {
      target: "party_history.entity_id",
      operation: "read",
    },
    {
      target: "party_history.id",
      operation: "read",
    },
    {
      target: "party_history.name",
      operation: "read",
    },
    {
      target: "party_history.party_id",
      operation: "read",
    },
    {
      target: "party_history",
      operation: "read",
    },
    {
      target: "party_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_history.role",
      operation: "read",
    },
    {
      target: "party_history.status",
      operation: "read",
    },
    {
      target: "party_history.type",
      operation: "read",
    },
    {
      target: "party_membership.entity_id",
      operation: "read",
    },
    {
      target: "party_membership.id",
      operation: "read",
    },
    {
      target: "party_membership.party_id",
      operation: "read",
    },
    {
      target: "party_membership",
      operation: "read",
    },
    {
      target: "party_membership.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership.scopes",
      operation: "read",
    },
    {
      target: "party_membership_history.entity_id",
      operation: "read",
    },
    {
      target: "party_membership_history.id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_membership_id",
      operation: "read",
    },
    {
      target: "party_membership_history",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_membership_history.scopes",
      operation: "read",
    },
    {
      target: "product_type.business_id",
      operation: "read",
    },
    {
      target: "product_type.id",
      operation: "read",
    },
    {
      target: "product_type.name",
      operation: "read",
    },
    {
      target: "product_type.products",
      operation: "read",
    },
    {
      target: "product_type",
      operation: "read",
    },
    {
      target: "product_type.service",
      operation: "read",
    },
    {
      target: "service_provider_product_application.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application.notes",
      operation: "read",
    },
    {
      target: "service_provider_product_application.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_application.qualified_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application",
      operation: "read",
    },
    {
      target: "service_provider_product_application.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application.service_provider_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application.status",
      operation: "read",
    },
    {
      target: "service_provider_product_application.system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.content",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.content",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.service_provider_product_application_comment_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.notes",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.qualified_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_history.service_provider_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_history.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.status",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.reason",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.service_provider_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.content",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment_history.service_provider_product_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment_history.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.service_provider_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_history.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group.id",
      operation: "read",
    },
    {
      target: "service_providing_group.name",
      operation: "read",
    },
    {
      target: "service_providing_group",
      operation: "read",
    },
    {
      target: "service_providing_group.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group.service_provider_id",
      operation: "read",
    },
    {
      target: "service_providing_group.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.prequalified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.service_providing_group_grid_prequalification_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.prequalified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.service_providing_group_grid_prequalification_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.service_providing_group_grid_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.name",
      operation: "read",
    },
    {
      target: "service_providing_group_history",
      operation: "read",
    },
    {
      target: "service_providing_group_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_history.replaced_by",
      operation: "read",
    },
    {
      target: "service_providing_group_history.service_provider_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.controllable_unit_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.valid_from",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.valid_to",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_membership_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_membership_history.service_providing_group_membership_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.valid_from",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.valid_to",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.notes",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.prequalified_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.status",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.verified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.notes",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.prequalified_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.service_providing_group_product_application_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.verified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.visibility",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.service_providing_group_product_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type.id",
      operation: "read",
    },
    {
      target: "system_operator_product_type.product_type_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type",
      operation: "read",
    },
    {
      target: "system_operator_product_type.recorded_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type.recorded_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type.status",
      operation: "read",
    },
    {
      target: "system_operator_product_type.system_operator_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.product_type_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.recorded_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.recorded_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.replaced_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.replaced_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.status",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.system_operator_id",
      operation: "read",
    },
    {
      target:
        "system_operator_product_type_history.system_operator_product_type_id",
      operation: "read",
    },
    {
      target: "technical_resource.controllable_unit_id",
      operation: "read",
    },
    {
      target: "technical_resource.details",
      operation: "read",
    },
    {
      target: "technical_resource.id",
      operation: "read",
    },
    {
      target: "technical_resource.name",
      operation: "read",
    },
    {
      target: "technical_resource",
      operation: "read",
    },
    {
      target: "technical_resource.recorded_at",
      operation: "read",
    },
    {
      target: "technical_resource.recorded_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "technical_resource_history.details",
      operation: "read",
    },
    {
      target: "technical_resource_history.id",
      operation: "read",
    },
    {
      target: "technical_resource_history.name",
      operation: "read",
    },
    {
      target: "technical_resource_history",
      operation: "read",
    },
    {
      target: "technical_resource_history.recorded_at",
      operation: "read",
    },
    {
      target: "technical_resource_history.recorded_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.replaced_at",
      operation: "read",
    },
    {
      target: "technical_resource_history.replaced_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.technical_resource_id",
      operation: "read",
    },
  ],
  flex_system_operator: [
    {
      target: "accounting_point.business_id",
      operation: "read",
    },
    {
      target: "accounting_point.id",
      operation: "read",
    },
    {
      target: "accounting_point",
      operation: "read",
    },
    {
      target: "accounting_point.recorded_at",
      operation: "read",
    },
    {
      target: "accounting_point.recorded_by",
      operation: "read",
    },
    {
      target: "accounting_point.system_operator_id",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.accounting_point_id",
      operation: "read",
    },
    {
      target:
        "accounting_point_balance_responsible_party.balance_responsible_party_id",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.energy_direction",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.valid_from",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.valid_to",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.accounting_point_id",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.energy_supplier_id",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.valid_from",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit.accounting_point_id",
      operation: "read",
    },
    {
      target: "controllable_unit.business_id",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_node_id",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_node_id",
      operation: "update",
    },
    {
      target: "controllable_unit.grid_validation_notes",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_validation_notes",
      operation: "update",
    },
    {
      target: "controllable_unit.grid_validation_status",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_validation_status",
      operation: "update",
    },
    {
      target: "controllable_unit.id",
      operation: "read",
    },
    {
      target: "controllable_unit.is_small",
      operation: "read",
    },
    {
      target: "controllable_unit.maximum_available_capacity",
      operation: "read",
    },
    {
      target: "controllable_unit.maximum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.minimum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.name",
      operation: "read",
    },
    {
      target: "controllable_unit.ramp_rate",
      operation: "read",
    },
    {
      target: "controllable_unit",
      operation: "read",
    },
    {
      target: "controllable_unit.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit.recovery_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.regulation_direction",
      operation: "read",
    },
    {
      target: "controllable_unit.start_date",
      operation: "read",
    },
    {
      target: "controllable_unit.status",
      operation: "read",
    },
    {
      target: "controllable_unit",
      operation: "update",
    },
    {
      target: "controllable_unit.validated_at",
      operation: "read",
    },
    {
      target: "controllable_unit.validated_at",
      operation: "update",
    },
    {
      target: "controllable_unit_history.accounting_point_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.business_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_node_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_validation_notes",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_validation_status",
      operation: "read",
    },
    {
      target: "controllable_unit_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.is_small",
      operation: "read",
    },
    {
      target: "controllable_unit_history.maximum_available_capacity",
      operation: "read",
    },
    {
      target: "controllable_unit_history.maximum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.minimum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.name",
      operation: "read",
    },
    {
      target: "controllable_unit_history.ramp_rate",
      operation: "read",
    },
    {
      target: "controllable_unit_history",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recovery_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.regulation_direction",
      operation: "read",
    },
    {
      target: "controllable_unit_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_history.start_date",
      operation: "read",
    },
    {
      target: "controllable_unit_history.status",
      operation: "read",
    },
    {
      target: "controllable_unit_history.validated_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.contract_reference",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.end_user_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.valid_from",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.contract_reference",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.controllable_unit_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_service_provider_history.controllable_unit_service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.end_user_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.valid_from",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.controllable_unit_id",
      operation: "create",
    },
    {
      target: "controllable_unit_suspension.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension",
      operation: "create",
    },
    {
      target: "controllable_unit_suspension",
      operation: "delete",
    },
    {
      target: "controllable_unit_suspension.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.impacted_system_operator_id",
      operation: "create",
    },
    {
      target: "controllable_unit_suspension.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.reason",
      operation: "create",
    },
    {
      target: "controllable_unit_suspension.reason",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.reason",
      operation: "update",
    },
    {
      target: "controllable_unit_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension",
      operation: "update",
    },
    {
      target: "controllable_unit_suspension_comment.content",
      operation: "create",
    },
    {
      target: "controllable_unit_suspension_comment.content",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.content",
      operation: "update",
    },
    {
      target:
        "controllable_unit_suspension_comment.controllable_unit_suspension_id",
      operation: "create",
    },
    {
      target:
        "controllable_unit_suspension_comment.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment",
      operation: "create",
    },
    {
      target: "controllable_unit_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment",
      operation: "update",
    },
    {
      target: "controllable_unit_suspension_comment.visibility",
      operation: "create",
    },
    {
      target: "controllable_unit_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.visibility",
      operation: "update",
    },
    {
      target: "controllable_unit_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment_history.controllable_unit_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment_history.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.controllable_unit_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_history.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.reason",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target: "entity.business_id",
      operation: "read",
    },
    {
      target: "entity.business_id_type",
      operation: "read",
    },
    {
      target: "entity.id",
      operation: "read",
    },
    {
      target: "entity.name",
      operation: "read",
    },
    {
      target: "entity",
      operation: "read",
    },
    {
      target: "entity.recorded_at",
      operation: "read",
    },
    {
      target: "entity.recorded_by",
      operation: "read",
    },
    {
      target: "entity.type",
      operation: "read",
    },
    {
      target: "entity_client.client_id",
      operation: "read",
    },
    {
      target: "entity_client.client_secret",
      operation: "read",
    },
    {
      target: "entity_client.entity_id",
      operation: "read",
    },
    {
      target: "entity_client.id",
      operation: "read",
    },
    {
      target: "entity_client.name",
      operation: "read",
    },
    {
      target: "entity_client.party_id",
      operation: "read",
    },
    {
      target: "entity_client.public_key",
      operation: "read",
    },
    {
      target: "entity_client",
      operation: "read",
    },
    {
      target: "entity_client.recorded_at",
      operation: "read",
    },
    {
      target: "entity_client.recorded_by",
      operation: "read",
    },
    {
      target: "entity_client.scopes",
      operation: "read",
    },
    {
      target: "event.data",
      operation: "read",
    },
    {
      target: "event.id",
      operation: "read",
    },
    {
      target: "event",
      operation: "read",
    },
    {
      target: "event.source",
      operation: "read",
    },
    {
      target: "event.specversion",
      operation: "read",
    },
    {
      target: "event.time",
      operation: "read",
    },
    {
      target: "event.type",
      operation: "read",
    },
    {
      target: "identity.entity_id",
      operation: "read",
    },
    {
      target: "identity.entity_name",
      operation: "read",
    },
    {
      target: "identity.id",
      operation: "read",
    },
    {
      target: "identity.party_id",
      operation: "read",
    },
    {
      target: "identity.party_name",
      operation: "read",
    },
    {
      target: "identity",
      operation: "read",
    },
    {
      target: "notice.data",
      operation: "read",
    },
    {
      target: "notice.party_id",
      operation: "read",
    },
    {
      target: "notice",
      operation: "read",
    },
    {
      target: "notice.source",
      operation: "read",
    },
    {
      target: "notice.type",
      operation: "read",
    },
    {
      target: "notification.acknowledged",
      operation: "read",
    },
    {
      target: "notification.acknowledged",
      operation: "update",
    },
    {
      target: "notification.event_id",
      operation: "read",
    },
    {
      target: "notification.id",
      operation: "read",
    },
    {
      target: "notification.party_id",
      operation: "read",
    },
    {
      target: "notification",
      operation: "read",
    },
    {
      target: "notification.recorded_at",
      operation: "read",
    },
    {
      target: "notification.recorded_by",
      operation: "read",
    },
    {
      target: "notification",
      operation: "update",
    },
    {
      target: "party.business_id",
      operation: "read",
    },
    {
      target: "party.business_id_type",
      operation: "read",
    },
    {
      target: "party.entity_id",
      operation: "read",
    },
    {
      target: "party.id",
      operation: "read",
    },
    {
      target: "party.name",
      operation: "read",
    },
    {
      target: "party",
      operation: "read",
    },
    {
      target: "party.recorded_at",
      operation: "read",
    },
    {
      target: "party.recorded_by",
      operation: "read",
    },
    {
      target: "party.role",
      operation: "read",
    },
    {
      target: "party.status",
      operation: "read",
    },
    {
      target: "party.type",
      operation: "read",
    },
    {
      target: "party_history.business_id",
      operation: "read",
    },
    {
      target: "party_history.business_id_type",
      operation: "read",
    },
    {
      target: "party_history.entity_id",
      operation: "read",
    },
    {
      target: "party_history.id",
      operation: "read",
    },
    {
      target: "party_history.name",
      operation: "read",
    },
    {
      target: "party_history.party_id",
      operation: "read",
    },
    {
      target: "party_history",
      operation: "read",
    },
    {
      target: "party_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_history.role",
      operation: "read",
    },
    {
      target: "party_history.status",
      operation: "read",
    },
    {
      target: "party_history.type",
      operation: "read",
    },
    {
      target: "party_membership.entity_id",
      operation: "read",
    },
    {
      target: "party_membership.id",
      operation: "read",
    },
    {
      target: "party_membership.party_id",
      operation: "read",
    },
    {
      target: "party_membership",
      operation: "read",
    },
    {
      target: "party_membership.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership.scopes",
      operation: "read",
    },
    {
      target: "party_membership_history.entity_id",
      operation: "read",
    },
    {
      target: "party_membership_history.id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_membership_id",
      operation: "read",
    },
    {
      target: "party_membership_history",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_membership_history.scopes",
      operation: "read",
    },
    {
      target: "product_type.business_id",
      operation: "read",
    },
    {
      target: "product_type.id",
      operation: "read",
    },
    {
      target: "product_type.name",
      operation: "read",
    },
    {
      target: "product_type.products",
      operation: "read",
    },
    {
      target: "product_type",
      operation: "read",
    },
    {
      target: "product_type.service",
      operation: "read",
    },
    {
      target: "service_provider_product_application.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application.notes",
      operation: "read",
    },
    {
      target: "service_provider_product_application.notes",
      operation: "update",
    },
    {
      target: "service_provider_product_application.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_application.qualified_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application.qualified_at",
      operation: "update",
    },
    {
      target: "service_provider_product_application",
      operation: "read",
    },
    {
      target: "service_provider_product_application.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application.service_provider_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application.status",
      operation: "read",
    },
    {
      target: "service_provider_product_application.status",
      operation: "update",
    },
    {
      target: "service_provider_product_application.system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application",
      operation: "update",
    },
    {
      target: "service_provider_product_application_comment.content",
      operation: "create",
    },
    {
      target: "service_provider_product_application_comment.content",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.content",
      operation: "update",
    },
    {
      target: "service_provider_product_application_comment",
      operation: "create",
    },
    {
      target: "service_provider_product_application_comment.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment.service_provider_product_application_id",
      operation: "create",
    },
    {
      target:
        "service_provider_product_application_comment.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment",
      operation: "update",
    },
    {
      target: "service_provider_product_application_comment.visibility",
      operation: "create",
    },
    {
      target: "service_provider_product_application_comment.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.visibility",
      operation: "update",
    },
    {
      target: "service_provider_product_application_comment_history.content",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.service_provider_product_application_comment_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.notes",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.qualified_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_history.service_provider_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_history.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.status",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension",
      operation: "create",
    },
    {
      target: "service_provider_product_suspension",
      operation: "delete",
    },
    {
      target: "service_provider_product_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension.procuring_system_operator_id",
      operation: "create",
    },
    {
      target:
        "service_provider_product_suspension.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.product_type_ids",
      operation: "create",
    },
    {
      target: "service_provider_product_suspension.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.product_type_ids",
      operation: "update",
    },
    {
      target: "service_provider_product_suspension",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.reason",
      operation: "create",
    },
    {
      target: "service_provider_product_suspension.reason",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.reason",
      operation: "update",
    },
    {
      target: "service_provider_product_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.service_provider_id",
      operation: "create",
    },
    {
      target: "service_provider_product_suspension.service_provider_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension",
      operation: "update",
    },
    {
      target: "service_provider_product_suspension_comment.content",
      operation: "create",
    },
    {
      target: "service_provider_product_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.content",
      operation: "update",
    },
    {
      target: "service_provider_product_suspension_comment",
      operation: "create",
    },
    {
      target: "service_provider_product_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment.service_provider_product_suspension_id",
      operation: "create",
    },
    {
      target:
        "service_provider_product_suspension_comment.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment",
      operation: "update",
    },
    {
      target: "service_provider_product_suspension_comment.visibility",
      operation: "create",
    },
    {
      target: "service_provider_product_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.visibility",
      operation: "update",
    },
    {
      target: "service_provider_product_suspension_comment_history.content",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment_history.service_provider_product_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment_history.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.service_provider_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_history.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group.id",
      operation: "read",
    },
    {
      target: "service_providing_group.name",
      operation: "read",
    },
    {
      target: "service_providing_group",
      operation: "read",
    },
    {
      target: "service_providing_group.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group.service_provider_id",
      operation: "read",
    },
    {
      target: "service_providing_group.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.prequalified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.prequalified_at",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_prequalification",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.status",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_prequalification",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.content",
      operation: "create",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.content",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.content",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_prequalification_comment",
      operation: "create",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.service_providing_group_grid_prequalification_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.service_providing_group_grid_prequalification_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment",
      operation: "update",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.visibility",
      operation: "create",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.visibility",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.visibility",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_prequalification_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.prequalified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.service_providing_group_grid_prequalification_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension",
      operation: "create",
    },
    {
      target: "service_providing_group_grid_suspension",
      operation: "delete",
    },
    {
      target: "service_providing_group_grid_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension.impacted_system_operator_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_grid_suspension.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.reason",
      operation: "create",
    },
    {
      target: "service_providing_group_grid_suspension.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.reason",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension.service_providing_group_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_grid_suspension.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_suspension_comment.content",
      operation: "create",
    },
    {
      target: "service_providing_group_grid_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.content",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_suspension_comment",
      operation: "create",
    },
    {
      target: "service_providing_group_grid_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment.service_providing_group_grid_suspension_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_suspension_comment.visibility",
      operation: "create",
    },
    {
      target: "service_providing_group_grid_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.visibility",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.service_providing_group_grid_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.name",
      operation: "read",
    },
    {
      target: "service_providing_group_history",
      operation: "read",
    },
    {
      target: "service_providing_group_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_history.replaced_by",
      operation: "read",
    },
    {
      target: "service_providing_group_history.service_provider_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.controllable_unit_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.valid_from",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.valid_to",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_membership_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_membership_history.service_providing_group_membership_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.valid_from",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.valid_to",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.notes",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.notes",
      operation: "update",
    },
    {
      target: "service_providing_group_product_application.prequalified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.prequalified_at",
      operation: "update",
    },
    {
      target:
        "service_providing_group_product_application.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.product_type_ids",
      operation: "update",
    },
    {
      target: "service_providing_group_product_application",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.status",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.status",
      operation: "update",
    },
    {
      target: "service_providing_group_product_application",
      operation: "update",
    },
    {
      target: "service_providing_group_product_application.verified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.verified_at",
      operation: "update",
    },
    {
      target: "service_providing_group_product_application_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.notes",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.prequalified_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.service_providing_group_product_application_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.verified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension",
      operation: "create",
    },
    {
      target: "service_providing_group_product_suspension",
      operation: "delete",
    },
    {
      target: "service_providing_group_product_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension.procuring_system_operator_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_product_suspension.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.product_type_ids",
      operation: "create",
    },
    {
      target: "service_providing_group_product_suspension.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.reason",
      operation: "create",
    },
    {
      target: "service_providing_group_product_suspension.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.reason",
      operation: "update",
    },
    {
      target: "service_providing_group_product_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension.service_providing_group_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_product_suspension.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension",
      operation: "update",
    },
    {
      target: "service_providing_group_product_suspension_comment.content",
      operation: "create",
    },
    {
      target: "service_providing_group_product_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.content",
      operation: "update",
    },
    {
      target: "service_providing_group_product_suspension_comment",
      operation: "create",
    },
    {
      target: "service_providing_group_product_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment.service_providing_group_product_suspension_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_product_suspension_comment.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment",
      operation: "update",
    },
    {
      target: "service_providing_group_product_suspension_comment.visibility",
      operation: "create",
    },
    {
      target: "service_providing_group_product_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.visibility",
      operation: "update",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.service_providing_group_product_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type",
      operation: "create",
    },
    {
      target: "system_operator_product_type.id",
      operation: "read",
    },
    {
      target: "system_operator_product_type.product_type_id",
      operation: "create",
    },
    {
      target: "system_operator_product_type.product_type_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type",
      operation: "read",
    },
    {
      target: "system_operator_product_type.recorded_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type.recorded_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type.status",
      operation: "read",
    },
    {
      target: "system_operator_product_type.status",
      operation: "update",
    },
    {
      target: "system_operator_product_type.system_operator_id",
      operation: "create",
    },
    {
      target: "system_operator_product_type.system_operator_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type",
      operation: "update",
    },
    {
      target: "system_operator_product_type_history.id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.product_type_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.recorded_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.recorded_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.replaced_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.replaced_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.status",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.system_operator_id",
      operation: "read",
    },
    {
      target:
        "system_operator_product_type_history.system_operator_product_type_id",
      operation: "read",
    },
    {
      target: "technical_resource.controllable_unit_id",
      operation: "read",
    },
    {
      target: "technical_resource.details",
      operation: "read",
    },
    {
      target: "technical_resource.id",
      operation: "read",
    },
    {
      target: "technical_resource.name",
      operation: "read",
    },
    {
      target: "technical_resource",
      operation: "read",
    },
    {
      target: "technical_resource.recorded_at",
      operation: "read",
    },
    {
      target: "technical_resource.recorded_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "technical_resource_history.details",
      operation: "read",
    },
    {
      target: "technical_resource_history.id",
      operation: "read",
    },
    {
      target: "technical_resource_history.name",
      operation: "read",
    },
    {
      target: "technical_resource_history",
      operation: "read",
    },
    {
      target: "technical_resource_history.recorded_at",
      operation: "read",
    },
    {
      target: "technical_resource_history.recorded_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.replaced_at",
      operation: "read",
    },
    {
      target: "technical_resource_history.replaced_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.technical_resource_id",
      operation: "read",
    },
  ],
  flex_service_provider: [
    {
      target: "accounting_point.business_id",
      operation: "read",
    },
    {
      target: "accounting_point.id",
      operation: "read",
    },
    {
      target: "accounting_point",
      operation: "read",
    },
    {
      target: "accounting_point.recorded_at",
      operation: "read",
    },
    {
      target: "accounting_point.recorded_by",
      operation: "read",
    },
    {
      target: "accounting_point.system_operator_id",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.accounting_point_id",
      operation: "read",
    },
    {
      target:
        "accounting_point_balance_responsible_party.balance_responsible_party_id",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.energy_direction",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.valid_from",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.valid_to",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.accounting_point_id",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.energy_supplier_id",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.valid_from",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit.accounting_point_id",
      operation: "create",
    },
    {
      target: "controllable_unit.accounting_point_id",
      operation: "read",
    },
    {
      target: "controllable_unit.business_id",
      operation: "read",
    },
    {
      target: "controllable_unit",
      operation: "create",
    },
    {
      target: "controllable_unit.grid_node_id",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_validation_notes",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_validation_status",
      operation: "read",
    },
    {
      target: "controllable_unit.id",
      operation: "read",
    },
    {
      target: "controllable_unit.is_small",
      operation: "read",
    },
    {
      target: "controllable_unit",
      operation: "lookup",
    },
    {
      target: "controllable_unit.maximum_available_capacity",
      operation: "create",
    },
    {
      target: "controllable_unit.maximum_available_capacity",
      operation: "read",
    },
    {
      target: "controllable_unit.maximum_available_capacity",
      operation: "update",
    },
    {
      target: "controllable_unit.maximum_duration",
      operation: "create",
    },
    {
      target: "controllable_unit.maximum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.maximum_duration",
      operation: "update",
    },
    {
      target: "controllable_unit.minimum_duration",
      operation: "create",
    },
    {
      target: "controllable_unit.minimum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.minimum_duration",
      operation: "update",
    },
    {
      target: "controllable_unit.name",
      operation: "create",
    },
    {
      target: "controllable_unit.name",
      operation: "read",
    },
    {
      target: "controllable_unit.name",
      operation: "update",
    },
    {
      target: "controllable_unit.ramp_rate",
      operation: "create",
    },
    {
      target: "controllable_unit.ramp_rate",
      operation: "read",
    },
    {
      target: "controllable_unit.ramp_rate",
      operation: "update",
    },
    {
      target: "controllable_unit",
      operation: "read",
    },
    {
      target: "controllable_unit.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit.recovery_duration",
      operation: "create",
    },
    {
      target: "controllable_unit.recovery_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.recovery_duration",
      operation: "update",
    },
    {
      target: "controllable_unit.regulation_direction",
      operation: "create",
    },
    {
      target: "controllable_unit.regulation_direction",
      operation: "read",
    },
    {
      target: "controllable_unit.regulation_direction",
      operation: "update",
    },
    {
      target: "controllable_unit.start_date",
      operation: "create",
    },
    {
      target: "controllable_unit.start_date",
      operation: "read",
    },
    {
      target: "controllable_unit.start_date",
      operation: "update",
    },
    {
      target: "controllable_unit.status",
      operation: "read",
    },
    {
      target: "controllable_unit.status",
      operation: "update",
    },
    {
      target: "controllable_unit",
      operation: "update",
    },
    {
      target: "controllable_unit.validated_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.accounting_point_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.business_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_node_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_validation_notes",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_validation_status",
      operation: "read",
    },
    {
      target: "controllable_unit_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.is_small",
      operation: "read",
    },
    {
      target: "controllable_unit_history.maximum_available_capacity",
      operation: "read",
    },
    {
      target: "controllable_unit_history.maximum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.minimum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.name",
      operation: "read",
    },
    {
      target: "controllable_unit_history.ramp_rate",
      operation: "read",
    },
    {
      target: "controllable_unit_history",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recovery_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.regulation_direction",
      operation: "read",
    },
    {
      target: "controllable_unit_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_history.start_date",
      operation: "read",
    },
    {
      target: "controllable_unit_history.status",
      operation: "read",
    },
    {
      target: "controllable_unit_history.validated_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.contract_reference",
      operation: "create",
    },
    {
      target: "controllable_unit_service_provider.contract_reference",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.contract_reference",
      operation: "update",
    },
    {
      target: "controllable_unit_service_provider.controllable_unit_id",
      operation: "create",
    },
    {
      target: "controllable_unit_service_provider.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider",
      operation: "create",
    },
    {
      target: "controllable_unit_service_provider",
      operation: "delete",
    },
    {
      target: "controllable_unit_service_provider.end_user_id",
      operation: "create",
    },
    {
      target: "controllable_unit_service_provider.end_user_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.service_provider_id",
      operation: "create",
    },
    {
      target: "controllable_unit_service_provider.service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider",
      operation: "update",
    },
    {
      target: "controllable_unit_service_provider.valid_from",
      operation: "create",
    },
    {
      target: "controllable_unit_service_provider.valid_from",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.valid_from",
      operation: "update",
    },
    {
      target: "controllable_unit_service_provider.valid_to",
      operation: "create",
    },
    {
      target: "controllable_unit_service_provider.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.valid_to",
      operation: "update",
    },
    {
      target: "controllable_unit_service_provider_history.contract_reference",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.controllable_unit_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_service_provider_history.controllable_unit_service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.end_user_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.valid_from",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.reason",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.content",
      operation: "create",
    },
    {
      target: "controllable_unit_suspension_comment.content",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.content",
      operation: "update",
    },
    {
      target:
        "controllable_unit_suspension_comment.controllable_unit_suspension_id",
      operation: "create",
    },
    {
      target:
        "controllable_unit_suspension_comment.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment",
      operation: "create",
    },
    {
      target: "controllable_unit_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment",
      operation: "update",
    },
    {
      target: "controllable_unit_suspension_comment.visibility",
      operation: "create",
    },
    {
      target: "controllable_unit_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.visibility",
      operation: "update",
    },
    {
      target: "controllable_unit_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment_history.controllable_unit_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment_history.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.controllable_unit_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_history.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.reason",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target: "entity.business_id",
      operation: "read",
    },
    {
      target: "entity.business_id_type",
      operation: "read",
    },
    {
      target: "entity.id",
      operation: "read",
    },
    {
      target: "entity.name",
      operation: "read",
    },
    {
      target: "entity",
      operation: "read",
    },
    {
      target: "entity.recorded_at",
      operation: "read",
    },
    {
      target: "entity.recorded_by",
      operation: "read",
    },
    {
      target: "entity.type",
      operation: "read",
    },
    {
      target: "entity_client.client_id",
      operation: "read",
    },
    {
      target: "entity_client.client_secret",
      operation: "read",
    },
    {
      target: "entity_client.entity_id",
      operation: "read",
    },
    {
      target: "entity_client.id",
      operation: "read",
    },
    {
      target: "entity_client.name",
      operation: "read",
    },
    {
      target: "entity_client.party_id",
      operation: "read",
    },
    {
      target: "entity_client.public_key",
      operation: "read",
    },
    {
      target: "entity_client",
      operation: "read",
    },
    {
      target: "entity_client.recorded_at",
      operation: "read",
    },
    {
      target: "entity_client.recorded_by",
      operation: "read",
    },
    {
      target: "entity_client.scopes",
      operation: "read",
    },
    {
      target: "event.data",
      operation: "read",
    },
    {
      target: "event.id",
      operation: "read",
    },
    {
      target: "event",
      operation: "read",
    },
    {
      target: "event.source",
      operation: "read",
    },
    {
      target: "event.specversion",
      operation: "read",
    },
    {
      target: "event.time",
      operation: "read",
    },
    {
      target: "event.type",
      operation: "read",
    },
    {
      target: "identity.entity_id",
      operation: "read",
    },
    {
      target: "identity.entity_name",
      operation: "read",
    },
    {
      target: "identity.id",
      operation: "read",
    },
    {
      target: "identity.party_id",
      operation: "read",
    },
    {
      target: "identity.party_name",
      operation: "read",
    },
    {
      target: "identity",
      operation: "read",
    },
    {
      target: "notice.data",
      operation: "read",
    },
    {
      target: "notice.party_id",
      operation: "read",
    },
    {
      target: "notice",
      operation: "read",
    },
    {
      target: "notice.source",
      operation: "read",
    },
    {
      target: "notice.type",
      operation: "read",
    },
    {
      target: "notification.acknowledged",
      operation: "read",
    },
    {
      target: "notification.acknowledged",
      operation: "update",
    },
    {
      target: "notification.event_id",
      operation: "read",
    },
    {
      target: "notification.id",
      operation: "read",
    },
    {
      target: "notification.party_id",
      operation: "read",
    },
    {
      target: "notification",
      operation: "read",
    },
    {
      target: "notification.recorded_at",
      operation: "read",
    },
    {
      target: "notification.recorded_by",
      operation: "read",
    },
    {
      target: "notification",
      operation: "update",
    },
    {
      target: "party.business_id",
      operation: "read",
    },
    {
      target: "party.business_id_type",
      operation: "read",
    },
    {
      target: "party.entity_id",
      operation: "read",
    },
    {
      target: "party.id",
      operation: "read",
    },
    {
      target: "party.name",
      operation: "read",
    },
    {
      target: "party",
      operation: "read",
    },
    {
      target: "party.recorded_at",
      operation: "read",
    },
    {
      target: "party.recorded_by",
      operation: "read",
    },
    {
      target: "party.role",
      operation: "read",
    },
    {
      target: "party.status",
      operation: "read",
    },
    {
      target: "party.type",
      operation: "read",
    },
    {
      target: "party_history.business_id",
      operation: "read",
    },
    {
      target: "party_history.business_id_type",
      operation: "read",
    },
    {
      target: "party_history.entity_id",
      operation: "read",
    },
    {
      target: "party_history.id",
      operation: "read",
    },
    {
      target: "party_history.name",
      operation: "read",
    },
    {
      target: "party_history.party_id",
      operation: "read",
    },
    {
      target: "party_history",
      operation: "read",
    },
    {
      target: "party_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_history.role",
      operation: "read",
    },
    {
      target: "party_history.status",
      operation: "read",
    },
    {
      target: "party_history.type",
      operation: "read",
    },
    {
      target: "party_membership.entity_id",
      operation: "read",
    },
    {
      target: "party_membership.id",
      operation: "read",
    },
    {
      target: "party_membership.party_id",
      operation: "read",
    },
    {
      target: "party_membership",
      operation: "read",
    },
    {
      target: "party_membership.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership.scopes",
      operation: "read",
    },
    {
      target: "party_membership_history.entity_id",
      operation: "read",
    },
    {
      target: "party_membership_history.id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_membership_id",
      operation: "read",
    },
    {
      target: "party_membership_history",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_membership_history.scopes",
      operation: "read",
    },
    {
      target: "product_type.business_id",
      operation: "read",
    },
    {
      target: "product_type.id",
      operation: "read",
    },
    {
      target: "product_type.name",
      operation: "read",
    },
    {
      target: "product_type.products",
      operation: "read",
    },
    {
      target: "product_type",
      operation: "read",
    },
    {
      target: "product_type.service",
      operation: "read",
    },
    {
      target: "service_provider_product_application",
      operation: "create",
    },
    {
      target: "service_provider_product_application.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application.notes",
      operation: "read",
    },
    {
      target: "service_provider_product_application.product_type_ids",
      operation: "create",
    },
    {
      target: "service_provider_product_application.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_application.product_type_ids",
      operation: "update",
    },
    {
      target: "service_provider_product_application.qualified_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application",
      operation: "read",
    },
    {
      target: "service_provider_product_application.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application.service_provider_id",
      operation: "create",
    },
    {
      target: "service_provider_product_application.service_provider_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application.status",
      operation: "read",
    },
    {
      target: "service_provider_product_application.system_operator_id",
      operation: "create",
    },
    {
      target: "service_provider_product_application.system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application",
      operation: "update",
    },
    {
      target: "service_provider_product_application_comment.content",
      operation: "create",
    },
    {
      target: "service_provider_product_application_comment.content",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.content",
      operation: "update",
    },
    {
      target: "service_provider_product_application_comment",
      operation: "create",
    },
    {
      target: "service_provider_product_application_comment.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment.service_provider_product_application_id",
      operation: "create",
    },
    {
      target:
        "service_provider_product_application_comment.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment",
      operation: "update",
    },
    {
      target: "service_provider_product_application_comment.visibility",
      operation: "create",
    },
    {
      target: "service_provider_product_application_comment.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.visibility",
      operation: "update",
    },
    {
      target: "service_provider_product_application_comment_history.content",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.service_provider_product_application_comment_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.notes",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.qualified_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_history.service_provider_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_history.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.status",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.reason",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.service_provider_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.content",
      operation: "create",
    },
    {
      target: "service_provider_product_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.content",
      operation: "update",
    },
    {
      target: "service_provider_product_suspension_comment",
      operation: "create",
    },
    {
      target: "service_provider_product_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment.service_provider_product_suspension_id",
      operation: "create",
    },
    {
      target:
        "service_provider_product_suspension_comment.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment",
      operation: "update",
    },
    {
      target: "service_provider_product_suspension_comment.visibility",
      operation: "create",
    },
    {
      target: "service_provider_product_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.visibility",
      operation: "update",
    },
    {
      target: "service_provider_product_suspension_comment_history.content",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment_history.service_provider_product_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment_history.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.service_provider_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_history.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group",
      operation: "create",
    },
    {
      target: "service_providing_group.id",
      operation: "read",
    },
    {
      target: "service_providing_group.name",
      operation: "create",
    },
    {
      target: "service_providing_group.name",
      operation: "read",
    },
    {
      target: "service_providing_group.name",
      operation: "update",
    },
    {
      target: "service_providing_group",
      operation: "read",
    },
    {
      target: "service_providing_group.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group.service_provider_id",
      operation: "create",
    },
    {
      target: "service_providing_group.service_provider_id",
      operation: "read",
    },
    {
      target: "service_providing_group.status",
      operation: "read",
    },
    {
      target: "service_providing_group.status",
      operation: "update",
    },
    {
      target: "service_providing_group",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_prequalification.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.prequalified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.content",
      operation: "create",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.content",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.content",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_prequalification_comment",
      operation: "create",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.service_providing_group_grid_prequalification_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.service_providing_group_grid_prequalification_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment",
      operation: "update",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.visibility",
      operation: "create",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.visibility",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.visibility",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_prequalification_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.prequalified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.service_providing_group_grid_prequalification_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.content",
      operation: "create",
    },
    {
      target: "service_providing_group_grid_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.content",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_suspension_comment",
      operation: "create",
    },
    {
      target: "service_providing_group_grid_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment.service_providing_group_grid_suspension_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_suspension_comment.visibility",
      operation: "create",
    },
    {
      target: "service_providing_group_grid_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.visibility",
      operation: "update",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.service_providing_group_grid_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.name",
      operation: "read",
    },
    {
      target: "service_providing_group_history",
      operation: "read",
    },
    {
      target: "service_providing_group_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_history.replaced_by",
      operation: "read",
    },
    {
      target: "service_providing_group_history.service_provider_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.controllable_unit_id",
      operation: "create",
    },
    {
      target: "service_providing_group_membership.controllable_unit_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership",
      operation: "create",
    },
    {
      target: "service_providing_group_membership",
      operation: "delete",
    },
    {
      target: "service_providing_group_membership.id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.service_providing_group_id",
      operation: "create",
    },
    {
      target: "service_providing_group_membership.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership",
      operation: "update",
    },
    {
      target: "service_providing_group_membership.valid_from",
      operation: "create",
    },
    {
      target: "service_providing_group_membership.valid_from",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.valid_from",
      operation: "update",
    },
    {
      target: "service_providing_group_membership.valid_to",
      operation: "create",
    },
    {
      target: "service_providing_group_membership.valid_to",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.valid_to",
      operation: "update",
    },
    {
      target: "service_providing_group_membership_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_membership_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_membership_history.service_providing_group_membership_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.valid_from",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.valid_to",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application",
      operation: "create",
    },
    {
      target: "service_providing_group_product_application.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.notes",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.prequalified_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application.procuring_system_operator_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_product_application.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.product_type_ids",
      operation: "create",
    },
    {
      target: "service_providing_group_product_application.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.product_type_ids",
      operation: "update",
    },
    {
      target: "service_providing_group_product_application",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application.service_providing_group_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_product_application.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.status",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.status",
      operation: "update",
    },
    {
      target: "service_providing_group_product_application",
      operation: "update",
    },
    {
      target: "service_providing_group_product_application.verified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.notes",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.prequalified_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.service_providing_group_product_application_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.verified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.content",
      operation: "create",
    },
    {
      target: "service_providing_group_product_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.content",
      operation: "update",
    },
    {
      target: "service_providing_group_product_suspension_comment",
      operation: "create",
    },
    {
      target: "service_providing_group_product_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment.service_providing_group_product_suspension_id",
      operation: "create",
    },
    {
      target:
        "service_providing_group_product_suspension_comment.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment",
      operation: "update",
    },
    {
      target: "service_providing_group_product_suspension_comment.visibility",
      operation: "create",
    },
    {
      target: "service_providing_group_product_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.visibility",
      operation: "update",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.service_providing_group_product_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type.id",
      operation: "read",
    },
    {
      target: "system_operator_product_type.product_type_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type",
      operation: "read",
    },
    {
      target: "system_operator_product_type.recorded_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type.recorded_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type.status",
      operation: "read",
    },
    {
      target: "system_operator_product_type.system_operator_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.product_type_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.recorded_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.recorded_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.replaced_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.replaced_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.status",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.system_operator_id",
      operation: "read",
    },
    {
      target:
        "system_operator_product_type_history.system_operator_product_type_id",
      operation: "read",
    },
    {
      target: "technical_resource.controllable_unit_id",
      operation: "create",
    },
    {
      target: "technical_resource.controllable_unit_id",
      operation: "read",
    },
    {
      target: "technical_resource",
      operation: "create",
    },
    {
      target: "technical_resource",
      operation: "delete",
    },
    {
      target: "technical_resource.details",
      operation: "create",
    },
    {
      target: "technical_resource.details",
      operation: "read",
    },
    {
      target: "technical_resource.details",
      operation: "update",
    },
    {
      target: "technical_resource.id",
      operation: "read",
    },
    {
      target: "technical_resource.name",
      operation: "create",
    },
    {
      target: "technical_resource.name",
      operation: "read",
    },
    {
      target: "technical_resource.name",
      operation: "update",
    },
    {
      target: "technical_resource",
      operation: "read",
    },
    {
      target: "technical_resource.recorded_at",
      operation: "read",
    },
    {
      target: "technical_resource.recorded_by",
      operation: "read",
    },
    {
      target: "technical_resource",
      operation: "update",
    },
    {
      target: "technical_resource_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "technical_resource_history.details",
      operation: "read",
    },
    {
      target: "technical_resource_history.id",
      operation: "read",
    },
    {
      target: "technical_resource_history.name",
      operation: "read",
    },
    {
      target: "technical_resource_history",
      operation: "read",
    },
    {
      target: "technical_resource_history.recorded_at",
      operation: "read",
    },
    {
      target: "technical_resource_history.recorded_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.replaced_at",
      operation: "read",
    },
    {
      target: "technical_resource_history.replaced_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.technical_resource_id",
      operation: "read",
    },
  ],
  flex_third_party: [
    {
      target: "accounting_point.business_id",
      operation: "read",
    },
    {
      target: "accounting_point.id",
      operation: "read",
    },
    {
      target: "accounting_point",
      operation: "read",
    },
    {
      target: "accounting_point.recorded_at",
      operation: "read",
    },
    {
      target: "accounting_point.recorded_by",
      operation: "read",
    },
    {
      target: "accounting_point.system_operator_id",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.accounting_point_id",
      operation: "read",
    },
    {
      target:
        "accounting_point_balance_responsible_party.balance_responsible_party_id",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.energy_direction",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.valid_from",
      operation: "read",
    },
    {
      target: "accounting_point_balance_responsible_party.valid_to",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.accounting_point_id",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.energy_supplier_id",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.valid_from",
      operation: "read",
    },
    {
      target: "accounting_point_energy_supplier.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit.accounting_point_id",
      operation: "read",
    },
    {
      target: "controllable_unit.business_id",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_node_id",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_validation_notes",
      operation: "read",
    },
    {
      target: "controllable_unit.grid_validation_status",
      operation: "read",
    },
    {
      target: "controllable_unit.id",
      operation: "read",
    },
    {
      target: "controllable_unit.is_small",
      operation: "read",
    },
    {
      target: "controllable_unit.maximum_available_capacity",
      operation: "read",
    },
    {
      target: "controllable_unit.maximum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.minimum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.name",
      operation: "read",
    },
    {
      target: "controllable_unit.ramp_rate",
      operation: "read",
    },
    {
      target: "controllable_unit",
      operation: "read",
    },
    {
      target: "controllable_unit.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit.recovery_duration",
      operation: "read",
    },
    {
      target: "controllable_unit.regulation_direction",
      operation: "read",
    },
    {
      target: "controllable_unit.start_date",
      operation: "read",
    },
    {
      target: "controllable_unit.status",
      operation: "read",
    },
    {
      target: "controllable_unit.validated_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.accounting_point_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.business_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_node_id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_validation_notes",
      operation: "read",
    },
    {
      target: "controllable_unit_history.grid_validation_status",
      operation: "read",
    },
    {
      target: "controllable_unit_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_history.is_small",
      operation: "read",
    },
    {
      target: "controllable_unit_history.maximum_available_capacity",
      operation: "read",
    },
    {
      target: "controllable_unit_history.maximum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.minimum_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.name",
      operation: "read",
    },
    {
      target: "controllable_unit_history.ramp_rate",
      operation: "read",
    },
    {
      target: "controllable_unit_history",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_history.recovery_duration",
      operation: "read",
    },
    {
      target: "controllable_unit_history.regulation_direction",
      operation: "read",
    },
    {
      target: "controllable_unit_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_history.start_date",
      operation: "read",
    },
    {
      target: "controllable_unit_history.status",
      operation: "read",
    },
    {
      target: "controllable_unit_history.validated_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.contract_reference",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.end_user_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.valid_from",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.contract_reference",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.controllable_unit_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_service_provider_history.controllable_unit_service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.end_user_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.service_provider_id",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.valid_from",
      operation: "read",
    },
    {
      target: "controllable_unit_service_provider_history.valid_to",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.controllable_unit_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.reason",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.content",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment_history.controllable_unit_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_comment_history.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.controllable_unit_id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_history.controllable_unit_suspension_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "controllable_unit_suspension_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.reason",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "controllable_unit_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target: "entity.business_id",
      operation: "read",
    },
    {
      target: "entity.business_id_type",
      operation: "read",
    },
    {
      target: "entity.id",
      operation: "read",
    },
    {
      target: "entity.name",
      operation: "read",
    },
    {
      target: "entity",
      operation: "read",
    },
    {
      target: "entity.recorded_at",
      operation: "read",
    },
    {
      target: "entity.recorded_by",
      operation: "read",
    },
    {
      target: "entity.type",
      operation: "read",
    },
    {
      target: "entity_client.client_id",
      operation: "read",
    },
    {
      target: "entity_client.client_secret",
      operation: "read",
    },
    {
      target: "entity_client.entity_id",
      operation: "read",
    },
    {
      target: "entity_client.id",
      operation: "read",
    },
    {
      target: "entity_client.name",
      operation: "read",
    },
    {
      target: "entity_client.party_id",
      operation: "read",
    },
    {
      target: "entity_client.public_key",
      operation: "read",
    },
    {
      target: "entity_client",
      operation: "read",
    },
    {
      target: "entity_client.recorded_at",
      operation: "read",
    },
    {
      target: "entity_client.recorded_by",
      operation: "read",
    },
    {
      target: "entity_client.scopes",
      operation: "read",
    },
    {
      target: "event.data",
      operation: "read",
    },
    {
      target: "event.id",
      operation: "read",
    },
    {
      target: "event",
      operation: "read",
    },
    {
      target: "event.source",
      operation: "read",
    },
    {
      target: "event.specversion",
      operation: "read",
    },
    {
      target: "event.time",
      operation: "read",
    },
    {
      target: "event.type",
      operation: "read",
    },
    {
      target: "identity.entity_id",
      operation: "read",
    },
    {
      target: "identity.entity_name",
      operation: "read",
    },
    {
      target: "identity.id",
      operation: "read",
    },
    {
      target: "identity.party_id",
      operation: "read",
    },
    {
      target: "identity.party_name",
      operation: "read",
    },
    {
      target: "identity",
      operation: "read",
    },
    {
      target: "notice.data",
      operation: "read",
    },
    {
      target: "notice.party_id",
      operation: "read",
    },
    {
      target: "notice",
      operation: "read",
    },
    {
      target: "notice.source",
      operation: "read",
    },
    {
      target: "notice.type",
      operation: "read",
    },
    {
      target: "notification.acknowledged",
      operation: "read",
    },
    {
      target: "notification.acknowledged",
      operation: "update",
    },
    {
      target: "notification.event_id",
      operation: "read",
    },
    {
      target: "notification.id",
      operation: "read",
    },
    {
      target: "notification.party_id",
      operation: "read",
    },
    {
      target: "notification",
      operation: "read",
    },
    {
      target: "notification.recorded_at",
      operation: "read",
    },
    {
      target: "notification.recorded_by",
      operation: "read",
    },
    {
      target: "notification",
      operation: "update",
    },
    {
      target: "party.business_id",
      operation: "read",
    },
    {
      target: "party.business_id_type",
      operation: "read",
    },
    {
      target: "party.entity_id",
      operation: "read",
    },
    {
      target: "party.id",
      operation: "read",
    },
    {
      target: "party.name",
      operation: "read",
    },
    {
      target: "party",
      operation: "read",
    },
    {
      target: "party.recorded_at",
      operation: "read",
    },
    {
      target: "party.recorded_by",
      operation: "read",
    },
    {
      target: "party.role",
      operation: "read",
    },
    {
      target: "party.status",
      operation: "read",
    },
    {
      target: "party.type",
      operation: "read",
    },
    {
      target: "party_history.business_id",
      operation: "read",
    },
    {
      target: "party_history.business_id_type",
      operation: "read",
    },
    {
      target: "party_history.entity_id",
      operation: "read",
    },
    {
      target: "party_history.id",
      operation: "read",
    },
    {
      target: "party_history.name",
      operation: "read",
    },
    {
      target: "party_history.party_id",
      operation: "read",
    },
    {
      target: "party_history",
      operation: "read",
    },
    {
      target: "party_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_history.role",
      operation: "read",
    },
    {
      target: "party_history.status",
      operation: "read",
    },
    {
      target: "party_history.type",
      operation: "read",
    },
    {
      target: "party_membership.entity_id",
      operation: "read",
    },
    {
      target: "party_membership.id",
      operation: "read",
    },
    {
      target: "party_membership.party_id",
      operation: "read",
    },
    {
      target: "party_membership",
      operation: "read",
    },
    {
      target: "party_membership.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership.scopes",
      operation: "read",
    },
    {
      target: "party_membership_history.entity_id",
      operation: "read",
    },
    {
      target: "party_membership_history.id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_membership_id",
      operation: "read",
    },
    {
      target: "party_membership_history",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_membership_history.scopes",
      operation: "read",
    },
    {
      target: "product_type.business_id",
      operation: "read",
    },
    {
      target: "product_type.id",
      operation: "read",
    },
    {
      target: "product_type.name",
      operation: "read",
    },
    {
      target: "product_type.products",
      operation: "read",
    },
    {
      target: "product_type",
      operation: "read",
    },
    {
      target: "product_type.service",
      operation: "read",
    },
    {
      target: "service_provider_product_application.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application.notes",
      operation: "read",
    },
    {
      target: "service_provider_product_application.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_application.qualified_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application",
      operation: "read",
    },
    {
      target: "service_provider_product_application.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application.service_provider_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application.status",
      operation: "read",
    },
    {
      target: "service_provider_product_application.system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.content",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.content",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.service_provider_product_application_comment_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_comment_history.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.notes",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.qualified_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_history.service_provider_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_application_history.service_provider_product_application_id",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.status",
      operation: "read",
    },
    {
      target: "service_provider_product_application_history.system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.reason",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension.service_provider_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.content",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment_history.service_provider_product_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_comment_history.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target: "service_provider_product_suspension_history.service_provider_id",
      operation: "read",
    },
    {
      target:
        "service_provider_product_suspension_history.service_provider_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group.id",
      operation: "read",
    },
    {
      target: "service_providing_group.name",
      operation: "read",
    },
    {
      target: "service_providing_group",
      operation: "read",
    },
    {
      target: "service_providing_group.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group.service_provider_id",
      operation: "read",
    },
    {
      target: "service_providing_group.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.prequalified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_comment",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.service_providing_group_grid_prequalification_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_comment.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.prequalified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.service_providing_group_grid_prequalification_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_prequalification_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_prequalification_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_comment_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.service_providing_group_grid_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.impacted_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_grid_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.service_providing_group_grid_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_grid_suspension_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.name",
      operation: "read",
    },
    {
      target: "service_providing_group_history",
      operation: "read",
    },
    {
      target: "service_providing_group_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_history.replaced_by",
      operation: "read",
    },
    {
      target: "service_providing_group_history.service_provider_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.controllable_unit_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.valid_from",
      operation: "read",
    },
    {
      target: "service_providing_group_membership.valid_to",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_membership_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_membership_history.service_providing_group_membership_id",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.valid_from",
      operation: "read",
    },
    {
      target: "service_providing_group_membership_history.valid_to",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.notes",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.prequalified_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.status",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application.verified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.notes",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.prequalified_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_application_history.service_providing_group_product_application_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.status",
      operation: "read",
    },
    {
      target: "service_providing_group_product_application_history.verified_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension.procuring_system_operator_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension.service_providing_group_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.content",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.created_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment.visibility",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.content",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.created_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.created_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment_history.id",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_comment_history",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.recorded_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.recorded_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.replaced_at",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.service_providing_group_product_suspension_comment_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_comment_history.visibility",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.procuring_system_operator_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.product_type_ids",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.reason",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.recorded_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.recorded_by",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.replaced_at",
      operation: "read",
    },
    {
      target: "service_providing_group_product_suspension_history.replaced_by",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.service_providing_group_id",
      operation: "read",
    },
    {
      target:
        "service_providing_group_product_suspension_history.service_providing_group_product_suspension_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type.id",
      operation: "read",
    },
    {
      target: "system_operator_product_type.product_type_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type",
      operation: "read",
    },
    {
      target: "system_operator_product_type.recorded_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type.recorded_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type.status",
      operation: "read",
    },
    {
      target: "system_operator_product_type.system_operator_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.product_type_id",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.recorded_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.recorded_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.replaced_at",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.replaced_by",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.status",
      operation: "read",
    },
    {
      target: "system_operator_product_type_history.system_operator_id",
      operation: "read",
    },
    {
      target:
        "system_operator_product_type_history.system_operator_product_type_id",
      operation: "read",
    },
    {
      target: "technical_resource.controllable_unit_id",
      operation: "read",
    },
    {
      target: "technical_resource.details",
      operation: "read",
    },
    {
      target: "technical_resource.id",
      operation: "read",
    },
    {
      target: "technical_resource.name",
      operation: "read",
    },
    {
      target: "technical_resource",
      operation: "read",
    },
    {
      target: "technical_resource.recorded_at",
      operation: "read",
    },
    {
      target: "technical_resource.recorded_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.controllable_unit_id",
      operation: "read",
    },
    {
      target: "technical_resource_history.details",
      operation: "read",
    },
    {
      target: "technical_resource_history.id",
      operation: "read",
    },
    {
      target: "technical_resource_history.name",
      operation: "read",
    },
    {
      target: "technical_resource_history",
      operation: "read",
    },
    {
      target: "technical_resource_history.recorded_at",
      operation: "read",
    },
    {
      target: "technical_resource_history.recorded_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.replaced_at",
      operation: "read",
    },
    {
      target: "technical_resource_history.replaced_by",
      operation: "read",
    },
    {
      target: "technical_resource_history.technical_resource_id",
      operation: "read",
    },
  ],
  flex_organisation: [
    {
      target: "entity.business_id",
      operation: "read",
    },
    {
      target: "entity.business_id_type",
      operation: "read",
    },
    {
      target: "entity.id",
      operation: "read",
    },
    {
      target: "entity",
      operation: "lookup",
    },
    {
      target: "entity.name",
      operation: "read",
    },
    {
      target: "entity",
      operation: "read",
    },
    {
      target: "entity.recorded_at",
      operation: "read",
    },
    {
      target: "entity.recorded_by",
      operation: "read",
    },
    {
      target: "entity.type",
      operation: "read",
    },
    {
      target: "entity_client.client_id",
      operation: "read",
    },
    {
      target: "entity_client.client_secret",
      operation: "create",
    },
    {
      target: "entity_client.client_secret",
      operation: "read",
    },
    {
      target: "entity_client.client_secret",
      operation: "update",
    },
    {
      target: "entity_client",
      operation: "create",
    },
    {
      target: "entity_client",
      operation: "delete",
    },
    {
      target: "entity_client.entity_id",
      operation: "create",
    },
    {
      target: "entity_client.entity_id",
      operation: "read",
    },
    {
      target: "entity_client.id",
      operation: "read",
    },
    {
      target: "entity_client.name",
      operation: "create",
    },
    {
      target: "entity_client.name",
      operation: "read",
    },
    {
      target: "entity_client.name",
      operation: "update",
    },
    {
      target: "entity_client.party_id",
      operation: "create",
    },
    {
      target: "entity_client.party_id",
      operation: "read",
    },
    {
      target: "entity_client.party_id",
      operation: "update",
    },
    {
      target: "entity_client.public_key",
      operation: "create",
    },
    {
      target: "entity_client.public_key",
      operation: "read",
    },
    {
      target: "entity_client.public_key",
      operation: "update",
    },
    {
      target: "entity_client",
      operation: "read",
    },
    {
      target: "entity_client.recorded_at",
      operation: "read",
    },
    {
      target: "entity_client.recorded_by",
      operation: "read",
    },
    {
      target: "entity_client.scopes",
      operation: "create",
    },
    {
      target: "entity_client.scopes",
      operation: "read",
    },
    {
      target: "entity_client.scopes",
      operation: "update",
    },
    {
      target: "entity_client",
      operation: "update",
    },
    {
      target: "identity.entity_id",
      operation: "read",
    },
    {
      target: "identity.entity_name",
      operation: "read",
    },
    {
      target: "identity.id",
      operation: "read",
    },
    {
      target: "identity.party_id",
      operation: "read",
    },
    {
      target: "identity.party_name",
      operation: "read",
    },
    {
      target: "identity",
      operation: "read",
    },
    {
      target: "party.business_id",
      operation: "read",
    },
    {
      target: "party.business_id_type",
      operation: "read",
    },
    {
      target: "party.entity_id",
      operation: "read",
    },
    {
      target: "party.id",
      operation: "read",
    },
    {
      target: "party.name",
      operation: "read",
    },
    {
      target: "party",
      operation: "read",
    },
    {
      target: "party.recorded_at",
      operation: "read",
    },
    {
      target: "party.recorded_by",
      operation: "read",
    },
    {
      target: "party.role",
      operation: "read",
    },
    {
      target: "party.status",
      operation: "read",
    },
    {
      target: "party.type",
      operation: "read",
    },
    {
      target: "party_history.business_id",
      operation: "read",
    },
    {
      target: "party_history.business_id_type",
      operation: "read",
    },
    {
      target: "party_history.entity_id",
      operation: "read",
    },
    {
      target: "party_history.id",
      operation: "read",
    },
    {
      target: "party_history.name",
      operation: "read",
    },
    {
      target: "party_history.party_id",
      operation: "read",
    },
    {
      target: "party_history",
      operation: "read",
    },
    {
      target: "party_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_history.role",
      operation: "read",
    },
    {
      target: "party_history.status",
      operation: "read",
    },
    {
      target: "party_history.type",
      operation: "read",
    },
    {
      target: "party_membership",
      operation: "create",
    },
    {
      target: "party_membership",
      operation: "delete",
    },
    {
      target: "party_membership.entity_id",
      operation: "create",
    },
    {
      target: "party_membership.entity_id",
      operation: "read",
    },
    {
      target: "party_membership.id",
      operation: "read",
    },
    {
      target: "party_membership.party_id",
      operation: "create",
    },
    {
      target: "party_membership.party_id",
      operation: "read",
    },
    {
      target: "party_membership",
      operation: "read",
    },
    {
      target: "party_membership.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership.scopes",
      operation: "create",
    },
    {
      target: "party_membership.scopes",
      operation: "read",
    },
    {
      target: "party_membership.scopes",
      operation: "update",
    },
    {
      target: "party_membership",
      operation: "update",
    },
    {
      target: "party_membership_history.entity_id",
      operation: "read",
    },
    {
      target: "party_membership_history.id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_membership_id",
      operation: "read",
    },
    {
      target: "party_membership_history",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_membership_history.scopes",
      operation: "read",
    },
  ],
  flex_entity: [
    {
      target: "entity.business_id",
      operation: "read",
    },
    {
      target: "entity.business_id_type",
      operation: "read",
    },
    {
      target: "entity.id",
      operation: "read",
    },
    {
      target: "entity.name",
      operation: "read",
    },
    {
      target: "entity",
      operation: "read",
    },
    {
      target: "entity.recorded_at",
      operation: "read",
    },
    {
      target: "entity.recorded_by",
      operation: "read",
    },
    {
      target: "entity.type",
      operation: "read",
    },
    {
      target: "entity_client.client_id",
      operation: "read",
    },
    {
      target: "entity_client.client_secret",
      operation: "create",
    },
    {
      target: "entity_client.client_secret",
      operation: "read",
    },
    {
      target: "entity_client.client_secret",
      operation: "update",
    },
    {
      target: "entity_client",
      operation: "create",
    },
    {
      target: "entity_client",
      operation: "delete",
    },
    {
      target: "entity_client.entity_id",
      operation: "create",
    },
    {
      target: "entity_client.entity_id",
      operation: "read",
    },
    {
      target: "entity_client.id",
      operation: "read",
    },
    {
      target: "entity_client.name",
      operation: "create",
    },
    {
      target: "entity_client.name",
      operation: "read",
    },
    {
      target: "entity_client.name",
      operation: "update",
    },
    {
      target: "entity_client.party_id",
      operation: "create",
    },
    {
      target: "entity_client.party_id",
      operation: "read",
    },
    {
      target: "entity_client.party_id",
      operation: "update",
    },
    {
      target: "entity_client.public_key",
      operation: "create",
    },
    {
      target: "entity_client.public_key",
      operation: "read",
    },
    {
      target: "entity_client.public_key",
      operation: "update",
    },
    {
      target: "entity_client",
      operation: "read",
    },
    {
      target: "entity_client.recorded_at",
      operation: "read",
    },
    {
      target: "entity_client.recorded_by",
      operation: "read",
    },
    {
      target: "entity_client.scopes",
      operation: "create",
    },
    {
      target: "entity_client.scopes",
      operation: "read",
    },
    {
      target: "entity_client.scopes",
      operation: "update",
    },
    {
      target: "entity_client",
      operation: "update",
    },
    {
      target: "identity.entity_id",
      operation: "read",
    },
    {
      target: "identity.entity_name",
      operation: "read",
    },
    {
      target: "identity.id",
      operation: "read",
    },
    {
      target: "identity.party_id",
      operation: "read",
    },
    {
      target: "identity.party_name",
      operation: "read",
    },
    {
      target: "identity",
      operation: "read",
    },
    {
      target: "party.business_id",
      operation: "read",
    },
    {
      target: "party.business_id_type",
      operation: "read",
    },
    {
      target: "party.entity_id",
      operation: "read",
    },
    {
      target: "party.id",
      operation: "read",
    },
    {
      target: "party.name",
      operation: "read",
    },
    {
      target: "party",
      operation: "read",
    },
    {
      target: "party.recorded_at",
      operation: "read",
    },
    {
      target: "party.recorded_by",
      operation: "read",
    },
    {
      target: "party.role",
      operation: "read",
    },
    {
      target: "party.status",
      operation: "read",
    },
    {
      target: "party.type",
      operation: "read",
    },
    {
      target: "party_history.business_id",
      operation: "read",
    },
    {
      target: "party_history.business_id_type",
      operation: "read",
    },
    {
      target: "party_history.entity_id",
      operation: "read",
    },
    {
      target: "party_history.id",
      operation: "read",
    },
    {
      target: "party_history.name",
      operation: "read",
    },
    {
      target: "party_history.party_id",
      operation: "read",
    },
    {
      target: "party_history",
      operation: "read",
    },
    {
      target: "party_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_history.role",
      operation: "read",
    },
    {
      target: "party_history.status",
      operation: "read",
    },
    {
      target: "party_history.type",
      operation: "read",
    },
    {
      target: "party_membership.entity_id",
      operation: "read",
    },
    {
      target: "party_membership.id",
      operation: "read",
    },
    {
      target: "party_membership.party_id",
      operation: "read",
    },
    {
      target: "party_membership",
      operation: "read",
    },
    {
      target: "party_membership.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership.scopes",
      operation: "read",
    },
    {
      target: "party_membership_history.entity_id",
      operation: "read",
    },
    {
      target: "party_membership_history.id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_id",
      operation: "read",
    },
    {
      target: "party_membership_history.party_membership_id",
      operation: "read",
    },
    {
      target: "party_membership_history",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_at",
      operation: "read",
    },
    {
      target: "party_membership_history.recorded_by",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_at",
      operation: "read",
    },
    {
      target: "party_membership_history.replaced_by",
      operation: "read",
    },
    {
      target: "party_membership_history.scopes",
      operation: "read",
    },
  ],
};

const permissions = (role: Role): Permissions => {
  const perms = rawPermissions[role];
  return {
    allow: (
      target: PermissionTarget,
      operation: PermissionOperation,
    ): boolean => perms.includes({ target, operation }),
  };
};
export default permissions;
