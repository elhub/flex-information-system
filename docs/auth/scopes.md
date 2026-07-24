# Scopes

<!-- GENERATED FILE (just scopes-to-md) — do not edit manually. -->
<!-- markdownlint-disable MD013 -->

This page lists every scope accepted by the Flexibility Information
System. See the [authorisation model](authz-model.md#scopes) for what
scopes are and how they are checked.

## `data`

Resources of the main data API (`/api/`).

- `manage:data`
- `manage:data:accounting_point_grid_location`
- `manage:data:controllable_unit`
- `manage:data:controllable_unit_service_provider`
- `manage:data:controllable_unit_suspension`
- `manage:data:controllable_unit_suspension_comment`
- `manage:data:entity`
- `manage:data:entity_client`
- `manage:data:notification`
- `manage:data:party`
- `manage:data:party_membership`
- `manage:data:service_provider_product_application`
- `manage:data:service_provider_product_application_comment`
- `manage:data:service_provider_product_suspension`
- `manage:data:service_provider_product_suspension_comment`
- `manage:data:service_providing_group`
- `manage:data:service_providing_group_grid_prequalification`
- `manage:data:service_providing_group_grid_prequalification_comment`
- `manage:data:service_providing_group_grid_suspension`
- `manage:data:service_providing_group_grid_suspension_comment`
- `manage:data:service_providing_group_membership`
- `manage:data:service_providing_group_product_application`
- `manage:data:service_providing_group_product_application_comment`
- `manage:data:service_providing_group_product_suspension`
- `manage:data:service_providing_group_product_suspension_comment`
- `manage:data:system_operator_product_type`
- `manage:data:technical_resource`
- `read:data`
- `read:data:accounting_point`
- `read:data:accounting_point_balance_responsible_party`
- `read:data:accounting_point_bidding_zone`
- `read:data:accounting_point_end_user`
- `read:data:accounting_point_energy_supplier`
- `read:data:accounting_point_grid_location`
- `read:data:accounting_point_grid_location_history`
- `read:data:accounting_point_metering_grid_area`
- `read:data:controllable_unit`
- `read:data:controllable_unit_history`
- `read:data:controllable_unit_service_provider`
- `read:data:controllable_unit_service_provider_history`
- `read:data:controllable_unit_summary`
- `read:data:controllable_unit_suspension`
- `read:data:controllable_unit_suspension_comment`
- `read:data:controllable_unit_suspension_comment_history`
- `read:data:controllable_unit_suspension_history`
- `read:data:entity`
- `read:data:entity_client`
- `read:data:event`
- `read:data:identity`
- `read:data:metering_grid_area`
- `read:data:notice`
- `read:data:notification`
- `read:data:party`
- `read:data:party_history`
- `read:data:party_membership`
- `read:data:party_membership_history`
- `read:data:product_type`
- `read:data:service_provider_product_application`
- `read:data:service_provider_product_application_comment`
- `read:data:service_provider_product_application_comment_history`
- `read:data:service_provider_product_application_history`
- `read:data:service_provider_product_suspension`
- `read:data:service_provider_product_suspension_comment`
- `read:data:service_provider_product_suspension_comment_history`
- `read:data:service_provider_product_suspension_history`
- `read:data:service_providing_group`
- `read:data:service_providing_group_grid_prequalification`
- `read:data:service_providing_group_grid_prequalification_comment`
- `read:data:service_providing_group_grid_prequalification_comment_history`
- `read:data:service_providing_group_grid_prequalification_history`
- `read:data:service_providing_group_grid_suspension`
- `read:data:service_providing_group_grid_suspension_comment`
- `read:data:service_providing_group_grid_suspension_comment_history`
- `read:data:service_providing_group_grid_suspension_history`
- `read:data:service_providing_group_history`
- `read:data:service_providing_group_membership`
- `read:data:service_providing_group_membership_history`
- `read:data:service_providing_group_product_application`
- `read:data:service_providing_group_product_application_comment`
- `read:data:service_providing_group_product_application_comment_history`
- `read:data:service_providing_group_product_application_history`
- `read:data:service_providing_group_product_suspension`
- `read:data:service_providing_group_product_suspension_comment`
- `read:data:service_providing_group_product_suspension_comment_history`
- `read:data:service_providing_group_product_suspension_history`
- `read:data:service_providing_group_summary`
- `read:data:system_operator_product_type`
- `read:data:system_operator_product_type_history`
- `read:data:technical_resource`
- `read:data:technical_resource_history`
- `use:data`
- `use:data:controllable_unit`
- `use:data:controllable_unit:lookup`
- `use:data:entity`
- `use:data:entity:lookup`

## `grid`

Read-only grid topology (substations, lines, ...).

- `read:grid`
- `read:grid:line`
- `read:grid:substation`
- `read:grid:substation_cluster`

## `attachment`

File attachments attached to resources.

- `manage:attachment`
- `manage:attachment:service_providing_group_product_application_attachment`
- `read:attachment`
- `read:attachment:service_providing_group_product_application_attachment`
- `read:attachment:service_providing_group_product_application_attachment_history`
- `use:attachment`

## `auth`

Resources of the auth API (`/auth/`).

- `manage:auth`
- `read:auth`
- `use:auth`
