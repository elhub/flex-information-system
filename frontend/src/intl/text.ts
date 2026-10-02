export type TextKey =
  | "simple_table.no_results"
  | "delete"
  | "delete_confirm"
  | "dashboard.application"
  | "dashboard.sp_product_application"
  | "dashboard.spg_product_application"
  | "dashboard.spg_grid_prequalification"
  | "dashboard.recorded_at"
  | "dashboard.created_at"
  | "dashboard.no_active_applications"
  | "entity_role"
  | "edit"
  | "print"
  | "service_providing_group"
  | "service_providing_group_product_application"
  | "service_provider_product_application"
  | "service_provider"
  | "system_operator"
  | "sppa_overview.see_service_provider"
  | "sppa_overview.see_system_operator"
  | "resource_show_layout.actions_group_label"
  | "resource_show_layout.navigate_group_label"
  | "resource_show_layout.more_button"
  | "resource_show_layout.more_actions_aria_label"
  | "events"
  | "print"
  | "tab.summary"
  | "spg_info_tab.name"
  | "spg_info_tab.see_group"
  | "spg_info_tab.see_so"
  | "spg_info_tab.procuring_system_operator"
  | "spg_info_tab.impacted_system_operator"
  | "tab.controllable_units"
  | "tab.technical_resources"
  | "tab.product_applications"
  | "tab.grid_prequalifications"
  | "tab.power_per_substation"
  | "tab.changes"
  | "tab.service_providing_groups"
  | "tab.accounting_point"
  | "tab.balance_responsible_party"
  | "tab.history"
  | "tab.spg_info"
  | "tab.overview"
  | "tab.grid_location"
  | "tab.comments"
  | "tab.attachments"
  | "cu_spg_show_history"
  | "table.header.history_id"
  | "cu_spg_id"
  | "cu_spg_empty"
  | "technical_resources_show_location"
  | "technical_resources_show_label"
  | "table.header.aggregated_flexible_power"
  | "table.header.aggregated_rated_power"
  | "table.header.minimum_rated_power"
  | "table.header.maximum_rated_power"
  | "table.header.grid_prequalification"
  | "table.header.product_application"
  | "table.header.valid_from"
  | "table.header.valid_to"
  | "table.header.substation"
  | "table.header.business_id"
  | "table.header.controllable_units"
  | "table.cell.unassigned"
  | "form_toolbar.save"
  | "form_toolbar.cancel"
  | "form_toolbar.confirm"
  | "controllable_unit"
  | "cu_show_view_accounting_point"
  | "cu_show_view_system_operator"
  | "controllable_unit.is_small.true"
  | "controllable_unit.is_small.true.label"
  | "controllable_unit.is_small.false"
  | "controllable_unit.is_small.false.label"
  | "cu_show_no_service_provider"
  | "cu_show_no_balance_responsible_party"
  | "cu_flexible_power_exceeds_rated_power_heading"
  | "cu_flexible_power_exceeds_rated_power_body"
  | "cu_show_suspended_heading"
  | "cu_show_suspended_body"
  | "cu_show_add_technical_resources_heading"
  | "cu_show_add_technical_resources_body"
  | "cu_show_not_active_heading"
  | "cu_show_not_active_body"
  | "spgpa_show_requested_alert_body"
  | "power_ratio_tooltip"
  | "lookup.input.accounting_point"
  | "lookup.input.controllable_unit"
  | "lookup.input.end_user"
  | "spg_grid_prequalification_header"
  | "spg_product_application_header"
  | "spg_grid_prequalification_empty"
  | "spgpq_conditionally_approve_button"
  | "spgpq_conditionally_approve_title"
  | "spgpq_conditionally_approve_description"
  | "spgpq_conditionally_approve_placeholder"
  | "spg_product_application_empty"
  | "spg_activate_group_notice"
  | "spg_activate_group_title"
  | "spg_activate_group_ensure"
  | "spg_activate_group_ensure_pt1"
  | "spg_activate_group_ensure_pt2"
  | "spgpa_ramping_details"
  | "spgpa_ramping_deviations"
  | "spgpa_ramping_rate"
  | "spgpa_add_attachment"
  | "spgpa_spg_override_description"
  | "spgpa_show_default_title"
  | "spga_additional_information_description"
  | "spga_save_confirmation_text"
  | "spgpa_draft_status_label"
  | "spgpa_draft_status_tooltip"
  | "spgpa_delete_draft"
  | "spgpa_draft_autosaved"
  | "spgpa_hide_prequalified"
  | "spgpa_summary_heading"
  | "spgpa_summary_approved_flexible_power"
  | "spgpa_summary_flexible_power_needing_approval"
  | "spg_manage_members_heading"
  | "spg_manage_members_heading_no_name"
  | "spg_manage_members_body"
  | "spg_show_table_search_label"
  | "spg_show_table_search_clear"
  | "spg_show_table_search_placeholder"
  | "spg_changes_period_heading"
  | "spg_changes_period_hint"
  | "spg_changes_from_label"
  | "spg_changes_to_label"
  | "spg_changes_since_label"
  | "spg_changes_custom_milestone"
  | "spg_changes_milestone_now"
  | "spg_changes_column_id"
  | "spg_changes_column_name"
  | "spg_changes_column_map"
  | "spg_changes_column_first_change"
  | "spg_changes_column_last_change"
  | "spg_changes_column_status"
  | "spg_changes_empty"
  | "spg_changes_error"
  | "spg_changes_status_added"
  | "spg_changes_status_removed"
  | "spg_changes_status_changed"
  | "spg_changes_status_unchanged"
  | "spg_changes_summary_power_diff"
  | "spg_changes_comparison_scope"
  | "spg_changes_log_changed_by_label"
  | "spg_changes_log_property_category"
  | "spg_changes_log_property_previous_label"
  | "spg_changes_log_property_new_label"
  | "spg_changes_log_membershipAdded_category"
  | "spg_changes_log_membershipRemoved_category"
  | "spg_changes_log_membershipAdded_previous_label"
  | "spg_changes_log_membershipAdded_new_label"
  | "spg_changes_log_membershipRemoved_previous_label"
  | "spg_changes_log_membershipRemoved_new_label"
  | "spg_changes_log_membershipValidity_category"
  | "spg_changes_log_membershipValidity_previous_label"
  | "spg_changes_log_membershipValidity_new_label"
  | "spg_manage_members_search_label"
  | "spg_manage_members_search_clear"
  | "spg_manage_members_search_placeholder"
  | "spg_manage_members_empty"
  | "spg_manage_members_open_in_new_tab"
  | "spg_manage_members_show_selected_only"
  | "spg_manage_members_selected_singular"
  | "spg_manage_members_selected_plural"
  | "spg_manage_members_total_flexible_power"
  | "spg_manage_members_clear_selection"
  | "spg_manage_members_review"
  | "spg_manage_members_submit_next"
  | "spg_manage_members_submit_done"
  | "spg_manage_members_review_modal_title"
  | "spg_manage_members_review_modal_description"
  | "spg_manage_members_review_modal_no_changes"
  | "spg_manage_members_review_modal_adding_singular"
  | "spg_manage_members_review_modal_adding_plural"
  | "spg_manage_members_review_modal_removing_singular"
  | "spg_manage_members_review_modal_removing_plural"
  | "spg_manage_members_review_modal_close"
  | "spg_manage_members_cu_ineligible_flexible_power"
  | "spg_manage_members_cu_ineligible_status"
  | "spg_manage_members_column_record_time"
  | "spg_manage_members_column_record_time_tooltip"
  | "spg_create_additional_information_override_description"
  | "spg_create_additional_information_placeholder"
  | "user_dropdown_logout"
  | "user_dropdown_user_guide"
  | "user_dropdown_create_user_guide"
  | "user_dropdown_my_party"
  | "user_dropdown_assume_another_party"
  | "user_dropdown_assume_party"
  | "user_dropdown_my_entity"
  | "user_dropdown_user"
  | "user_dropdown_organisation_administrator"
  | "header_nav_dashboard"
  | "header_nav_controllable_units"
  | "header_nav_service_providing_groups"
  | "header_nav_grid_prequalification"
  | "header_nav_applications"
  | "header_nav_service_provider_product_applications"
  | "header_nav_service_providing_group_product_applications"
  | "header_nav_other"
  | "header_nav_system_operator_product_listing"
  | "header_nav_entities"
  | "header_nav_parties"
  | "header_nav_events"
  | "header_nav_notifications"
  | "header_nav_notices"
  | "header_nav_need_help"
  | "header_nav_user_guide"
  | "header_nav_create_user_guide"
  | "header_nav_assume_party"
  | "comment.visibility.same_party.description"
  | "comment.visibility.any_involved_party.description"
  | "notice_missing_grid_location_button"
  | "notice_insufficient_grid_location_source_button"
  | "notice_bidding_zone_mismatch_button"
  | "notice_spg_membership_button"
  | "accounting_point_show.header"
  | "accounting_point_location_map.popup.business_id"
  | "accounting_point_location_map.popup.kind"
  | "accounting_point_location_map.popup.status"
  | "accounting_point_location_map.popup.voltage"
  | "accounting_point_location_map.popup.selected_as_grid_location"
  | "accounting_point_location_map.popup.select"
  | "accounting_point_location_map.no_location_set"
  | "accounting_point_grid_location_panel.heading"
  | "accounting_point_grid_location_panel.status.missing"
  | "accounting_point_grid_location_panel.status.confirmed"
  | "accounting_point_grid_location_panel.status.guessed"
  | "accounting_point_grid_location_panel.button.edit_details"
  | "accounting_point_grid_location_panel.button.validate_grid_location"
  | "accounting_point_grid_location_panel.button.add_grid_location"
  | "accounting_point_grid_location_panel.empty.no_grid_location_set"
  | "ap_show_overview.grid_location.heading"
  | "ap_show_overview.grid_location.description"
  | "ap_show_overview.grid_location.guessed_help_before"
  | "ap_show_overview.grid_location.guessed_help_after"
  | "ap_show_overview.grid_location.with_selection"
  | "ap_show_overview.grid_location.without_selection"
  | "ap_show_overview.grid_location.current_status"
  | "ap_show_overview.grid_location.open_location_tab"
  | "ap_show_overview.grid_location.no_location_access"
  | "ap_show_overview.cu_summary.heading"
  | "ap_show_overview.cu_summary.description"
  | "ap_show_overview.cu_summary.total_flexible_power"
  | "ap_show_overview.cu_summary.total_rated_power"
  | "ap_show_overview.common.not_available"
  | "ap_controllable_units_table.empty"
  | "substation_reference_input.search_for_substation"
  | "resource_show_layout.more_actions"
  | "resource_show_layout.navigate_to";

export const text: Record<string, Record<TextKey, string>> = {
  en: {
    "simple_table.no_results": "No results",
    "dashboard.application": "Application",
    "dashboard.sp_product_application": "SP Product Application",
    "dashboard.spg_product_application": "SPG Product Application",
    "dashboard.spg_grid_prequalification": "SPG Grid Prequalification",
    "dashboard.recorded_at": "Recorded at",
    "dashboard.created_at": "Created at",
    "dashboard.no_active_applications": "No active applications.",
    entity_role: "Entity",
    edit: "Edit",
    print: "Print",
    events: "Events",
    service_provider_product_application:
      "Service provider product application",
    service_provider: "Service provider",
    system_operator: "System operator",
    "sppa_overview.see_service_provider": "See service provider",
    "sppa_overview.see_system_operator": "See system operator",
    delete: "Delete",
    delete_confirm:
      "Are you sure you want to delete this item? This action cannot be undone.",
    service_providing_group: "Service providing group",
    service_providing_group_product_application:
      "Service providing group product application",
    "resource_show_layout.actions_group_label": "Actions",
    "resource_show_layout.navigate_group_label": "Navigate to",
    "resource_show_layout.more_button": "More",
    "resource_show_layout.more_actions_aria_label": "More actions",
    "tab.summary": "Summary",
    "spg_info_tab.name": "Name",
    "spg_info_tab.see_group": "See group",
    "spg_info_tab.see_so": "See SO",
    "spg_info_tab.procuring_system_operator": "Procuring system operator",
    "spg_info_tab.impacted_system_operator": "Impacted system operator",
    "tab.controllable_units": "Controllable units",
    "tab.technical_resources": "Technical resources",
    "tab.product_applications": "Product applications",
    "tab.grid_prequalifications": "Grid prequalifications",
    "tab.power_per_substation": "Power per substation",
    "tab.changes": "Changes",
    "tab.service_providing_groups": "Service providing groups",
    "tab.accounting_point": "Accounting point",
    "tab.balance_responsible_party": "Balance responsible parties",
    "tab.history": "History",
    "tab.spg_info": "SPG info",
    "tab.overview": "Overview",
    "tab.grid_location": "Grid location",
    "tab.comments": "Comments",
    "tab.attachments": "Attachments",
    cu_spg_show_history: "Show history",
    "table.header.history_id": "History ID",
    cu_spg_id: "SPG ID",
    cu_spg_empty: "No service providing groups for this controllable unit.",
    "table.header.aggregated_flexible_power": "Aggregated flexible power",
    "table.header.aggregated_rated_power": "Aggregated rated power",
    "table.header.minimum_rated_power": "Minimum rated power",
    "table.header.maximum_rated_power": "Maximum rated power",
    "table.header.grid_prequalification": "Grid prequalification",
    "table.header.product_application": "Product application",
    "table.header.valid_from": "Valid from",
    "table.header.valid_to": "Valid to",
    "table.header.substation": "Substation",
    "table.header.business_id": "Business ID",
    "table.header.controllable_units": "Controllable units",
    "table.cell.unassigned": "(unassigned)",
    "form_toolbar.save": "Save",
    "form_toolbar.cancel": "Cancel",
    "form_toolbar.confirm": "Confirm",
    controllable_unit: "Controllable unit",
    cu_show_view_accounting_point: "View accounting point",
    cu_show_view_system_operator: "View system operator",
    "controllable_unit.is_small.true": "Yes (Small, ≤ 50 kW of flexible power)",
    "controllable_unit.is_small.true.label": "Yes",
    "controllable_unit.is_small.false":
      "No (Not small, > 50 kW of flexible power)",
    "controllable_unit.is_small.false.label": "No",
    cu_show_no_service_provider: "No service provider",
    cu_show_no_balance_responsible_party: "No balance responsible party",
    cu_flexible_power_exceeds_rated_power_heading:
      "Flexible power exceeds rated power",
    cu_flexible_power_exceeds_rated_power_body:
      "The flexible power of this controllable unit exceeds the combined maximum active power of all its technical resources. Update the flexible power or add technical resources.",
    cu_show_suspended_heading: "Controllable unit is suspended",
    cu_show_suspended_body: "Reason: %{reason}",
    cu_show_add_technical_resources_heading: "Add technical resources",
    cu_show_add_technical_resources_body:
      "To set the controllable unit as active, at least one technical resource is required.",
    cu_show_not_active_heading: "Controllable unit is not active",
    cu_show_not_active_body:
      "Controllable unit must be active to be added to a service providing group. Add all technical resources and ensure that data is correct before activating.",
    spgpa_show_requested_alert_body:
      "The procuring system operator must now shortly start prequalification or verification on this application.",
    power_ratio_tooltip:
      "The flexible power represents %{percentage}% of the rated power",
    "lookup.input.accounting_point": "Accounting point",
    "lookup.input.controllable_unit": "Controllable unit",
    "lookup.input.end_user": "End user",
    technical_resources_show_location: "Show",
    technical_resources_show_label: "Location",
    spg_grid_prequalification_header: "Grid prequalifications",
    spg_product_application_header: "Product applications",
    spg_grid_prequalification_empty: "No grid prequalifications",
    spgpq_conditionally_approve_button: "Conditionally approve",
    spgpq_conditionally_approve_title:
      "Conditionally approve grid prequalification",
    spgpq_conditionally_approve_description:
      "This will mark the grid prequalification as conditionally approved. Describe the conditions below. They will be added as a comment visible to all involved parties.",
    spgpq_conditionally_approve_placeholder:
      "Describe the conditions for approval",
    spg_product_application_empty: "No product applications",
    spg_activate_group_notice:
      "Activating the service providing group will allow it to be used in a product application",
    spg_activate_group_title: "Activate service providing group",
    spg_activate_group_ensure: "Ensure the following before activating",
    spg_activate_group_ensure_pt1: "all controllable units have been added",
    spg_activate_group_ensure_pt2: "data is correct",
    spgpa_ramping_details:
      "Describe how the units in the service providing group are regulated to deliver this response. E.g. units are switched off one by one to achieve a stepwise profile, or each unit gradually adjusts production/consumption simultaneously.",
    spgpa_ramping_deviations: "Describe when and how the profile will deviate.",
    spgpa_ramping_rate: "State the ramp rate (MW/s)",
    spgpa_add_attachment:
      "If possible, please attach a ramping profile illustrating the deviation. Files can be attached after the application has been saved.",
    spgpa_spg_override_description:
      "Reference to the service providing group. The list ONLY show active service providing groups.",
    spgpa_show_default_title: "Product application",
    spga_additional_information_description:
      "Are there any accounting points within the service providing group that have flexible connection agreements, such as UKT/TPV or other bilateral agreements with the grid owner?\n\nIf yes, attach documentation demonstrating dialogue with the grid owner about possible participation in the market.\n\nAlso attach any agreements covering notification procedures in the event of market activation. Files can be attached after the application has been saved.",
    spga_save_confirmation_text:
      "Saving the application will submit it to the procuring system operator. Before saving, ensure that the application is complete and accurate. If required, remember to attach supporting documents after the application has been saved.",
    spgpa_draft_status_label: "Local draft",
    spgpa_draft_status_tooltip:
      "Saved only in this browser. This draft is private and is not visible to others.",
    spgpa_delete_draft: "Delete draft",
    spgpa_draft_autosaved: "Draft autosaved",
    spg_manage_members_heading: "Manage members of %{name}",
    spg_manage_members_heading_no_name: "Manage members",
    spg_manage_members_body:
      "Select the controllable units to include in the service providing group.",
    spg_manage_members_search_label: "Search",
    spg_manage_members_search_clear: "Clear",
    spg_manage_members_search_placeholder:
      "Filter by name, id or accounting point id",
    spg_manage_members_empty: "No controllable units found.",
    spg_manage_members_open_in_new_tab: "Open in new tab",
    spg_manage_members_show_selected_only: "Show selected only",
    spg_manage_members_selected_singular: "1 member selected",
    spg_manage_members_selected_plural: "%{count} members selected",
    spg_manage_members_total_flexible_power:
      "Total Flexible Power: %{power} kW",
    spg_manage_members_clear_selection: "Clear selection",
    spg_manage_members_review: "Review selected",
    spg_manage_members_submit_next: "Next",
    spg_manage_members_submit_done: "Done",
    spg_manage_members_review_modal_title: "Review selection",
    spg_manage_members_review_modal_description:
      "Summary of changes to group membership.",
    spg_manage_members_review_modal_no_changes:
      "No changes from the current membership.",
    spg_manage_members_review_modal_adding_singular:
      "Adding 1 controllable unit",
    spg_manage_members_review_modal_adding_plural:
      "Adding %{count} controllable units",
    spg_manage_members_review_modal_removing_singular:
      "Removing 1 controllable unit",
    spg_manage_members_review_modal_removing_plural:
      "Removing %{count} controllable units",
    spg_manage_members_review_modal_close: "Close",
    spg_manage_members_cu_ineligible_flexible_power:
      "Cannot add: flexible power (%{flexible_power} kW) exceeds 100% of rated power (%{rated_power} kW).",
    spg_manage_members_cu_ineligible_status:
      "Cannot add: controllable unit is not active.",
    spg_manage_members_column_record_time: "Recorded at",
    spg_manage_members_column_record_time_tooltip:
      "When CU was added to the group",
    spg_create_additional_information_override_description:
      "This field is meant to capture any additional information about the service providing group that might be relevant.",
    spg_create_additional_information_placeholder:
      "This field is optional and can be left empty.",
    spg_show_table_search_label: "Search",
    spg_show_table_search_clear: "Clear",
    spg_show_table_search_placeholder:
      "Filter by name, id, accounting point id or system operator",
    spgpa_hide_prequalified: "Hide prequalified",
    spgpa_summary_heading: "Flexible power overview",
    spgpa_summary_approved_flexible_power:
      "Flexible power with approved status",
    spgpa_summary_flexible_power_needing_approval:
      "Flexible power pending approval",
    spg_changes_since_label: "Compare changes since",
    spg_changes_period_heading: "Select comparison period",
    spg_changes_period_hint: "Drag the handlers or edit the dates",
    spg_changes_from_label: "From",
    spg_changes_to_label: "To",
    spg_changes_custom_milestone: "Custom",
    spg_changes_milestone_now: "Current (Now)",
    spg_changes_column_id: "ID",
    spg_changes_column_name: "Name",
    spg_changes_column_map: "Flexible power",
    spg_changes_column_first_change: "First change",
    spg_changes_column_last_change: "Last change",
    spg_changes_column_status: "Change",
    spg_changes_empty: "No changes found for the selected time range.",
    spg_changes_error: "Failed to load changes.",
    spg_changes_status_added: "Added",
    spg_changes_status_removed: "Removed",
    spg_changes_status_changed: "Changed",
    spg_changes_status_unchanged: "Unchanged",
    spg_changes_summary_power_diff: "Flexible power diff",
    spg_changes_comparison_scope: "Comparison scope",
    spg_changes_log_changed_by_label: "Changed by",
    spg_changes_log_property_category: "Property: %{property}",
    spg_changes_log_property_previous_label: "Previous value",
    spg_changes_log_property_new_label: "New value",
    spg_changes_log_membershipAdded_category: "Added to group",
    spg_changes_log_membershipRemoved_category: "Removed from group",
    spg_changes_log_membershipAdded_previous_label: "Old validity",
    spg_changes_log_membershipAdded_new_label: "New validity",
    spg_changes_log_membershipRemoved_previous_label: "Old validity",
    spg_changes_log_membershipRemoved_new_label: "New validity",
    spg_changes_log_membershipValidity_category: "Membership validity window",
    spg_changes_log_membershipValidity_previous_label: "Previous validity",
    spg_changes_log_membershipValidity_new_label: "New validity",
    user_dropdown_logout: "Logout",
    user_dropdown_user_guide: "User guide",
    user_dropdown_create_user_guide: "Create user guide",
    user_dropdown_my_party: "My party",
    user_dropdown_assume_another_party: "Assume another party",
    user_dropdown_assume_party: "Assume party",
    user_dropdown_my_entity: "My entity",
    user_dropdown_user: "User",
    user_dropdown_organisation_administrator: "Organisation administrator",
    header_nav_dashboard: "Dashboard",
    header_nav_controllable_units: "Controllable units",
    header_nav_service_providing_groups: "Service providing groups",
    header_nav_grid_prequalification: "Grid prequalifications",
    header_nav_applications: "Applications",
    header_nav_service_provider_product_applications:
      "Service provider product applications",
    header_nav_service_providing_group_product_applications:
      "Service providing group product applications",
    header_nav_other: "Other",
    header_nav_system_operator_product_listing:
      "System operator product listing",
    header_nav_entities: "Entities",
    header_nav_parties: "Parties",
    header_nav_events: "Events",
    header_nav_notifications: "Notifications",
    header_nav_notices: "Notices",
    header_nav_need_help: "Need help?",
    header_nav_user_guide: "User guide",
    header_nav_create_user_guide: "User guide for creating users",
    header_nav_assume_party: "Assume party",
    "comment.visibility.same_party.description":
      "Only visible to your current party",
    "comment.visibility.any_involved_party.description":
      "Visible to all parties involved in this resource",
    notice_spg_membership_button: "Go to SPG membership",
    notice_missing_grid_location_button:
      "Check the grid location information here",
    notice_insufficient_grid_location_source_button: "Go to accounting point",
    notice_bidding_zone_mismatch_button:
      "Go to Service providing group membership",
    "accounting_point_location_map.popup.business_id": "Business ID",
    "accounting_point_location_map.popup.kind": "Kind",
    "accounting_point_location_map.popup.status": "Status",
    "accounting_point_location_map.popup.voltage": "Voltage",
    "accounting_point_location_map.popup.selected_as_grid_location":
      "Selected as grid location",
    "accounting_point_location_map.popup.select": "Select",
    "accounting_point_location_map.no_location_set":
      "No location set for this accounting point.",
    "accounting_point_show.header": "Accounting Point",
    "accounting_point_grid_location_panel.heading": "Grid location",
    "accounting_point_grid_location_panel.status.missing": "Missing",
    "accounting_point_grid_location_panel.status.confirmed": "Confirmed",
    "accounting_point_grid_location_panel.status.guessed": "Guessed",
    "accounting_point_grid_location_panel.button.edit_details": "Edit details",
    "accounting_point_grid_location_panel.button.validate_grid_location":
      "Validate grid location",
    "accounting_point_grid_location_panel.button.add_grid_location":
      "Add grid location",
    "accounting_point_grid_location_panel.empty.no_grid_location_set":
      "No grid location set for this accounting point yet",
    "ap_show_overview.grid_location.heading": "Grid location",
    "ap_show_overview.grid_location.description":
      "This tells you which substation this accounting point belongs to.",
    "ap_show_overview.grid_location.guessed_help_before": "If status is",
    "ap_show_overview.grid_location.guessed_help_after":
      ", the system made a best guess. Open the Location tab and check that the selected substation is correct.",
    "ap_show_overview.grid_location.with_selection":
      "A substation is selected. Confirm it if correct, or choose a different one.",
    "ap_show_overview.grid_location.without_selection":
      "No substation is selected yet. Choose and save the correct one.",
    "ap_show_overview.grid_location.current_status": "Current status",
    "ap_show_overview.grid_location.open_location_tab": "Open Location tab",
    "ap_show_overview.grid_location.no_location_access":
      "You do not currently have access to the Location tab.",
    "ap_show_overview.cu_summary.heading": "Controllable units summary",
    "ap_show_overview.cu_summary.description":
      "This accounting point contains %{count} controllable units. Here are key aggregates across those units:",
    "ap_show_overview.cu_summary.total_flexible_power": "Total flexible power",
    "ap_show_overview.cu_summary.total_rated_power": "Total rated power",
    "ap_show_overview.common.not_available": "Not available",
    "ap_controllable_units_table.empty":
      "No controllable units tied to this accounting point.",
    "substation_reference_input.search_for_substation": "Search for substation",
    "resource_show_layout.more_actions": "Actions",
    "resource_show_layout.navigate_to": "Navigate to",
  },
  nb: {
    "simple_table.no_results": "Ingen resultater",
    "dashboard.application": "Søknad",
    "dashboard.sp_product_application": "SP-produktsøknad",
    "dashboard.spg_product_application": "SPG-produktsøknad",
    "dashboard.spg_grid_prequalification": "SPG-nettprekvalifisering",
    "dashboard.recorded_at": "Registrert",
    "dashboard.created_at": "Opprettet",
    "dashboard.no_active_applications": "Ingen aktive søknader.",
    entity_role: "Entitet",
    edit: "Endre",
    print: "Skriv ut",
    events: "Hendelser",
    service_provider_product_application:
      "Produktprekvalifisering for tjenesteleverandør",
    service_provider: "Tjenesteleverandør",
    system_operator: "Systemoperatør",
    "sppa_overview.see_service_provider": "Se tjenesteleverandør",
    "sppa_overview.see_system_operator": "Se systemoperatør",
    delete: "Slett",
    delete_confirm:
      "Er du sikker på at du vil slette dette elementet? Denne handlingen kan ikke angres.",
    service_providing_group: "Fleksibilitetsgruppe",
    service_providing_group_product_application:
      "Fleksibilitetsgruppens produktsøknad",
    "resource_show_layout.actions_group_label": "Handlinger",
    "resource_show_layout.navigate_group_label": "Naviger til",
    "resource_show_layout.more_button": "Mer",
    "resource_show_layout.more_actions_aria_label": "Flere handlinger",
    "tab.summary": "Sammendrag",
    "spg_info_tab.name": "Navn",
    "spg_info_tab.see_group": "Se gruppe",
    "spg_info_tab.see_so": "Se SO",
    "spg_info_tab.procuring_system_operator": "Anskaffende systemoperatør",
    "spg_info_tab.impacted_system_operator": "Berørt systemoperatør",
    "tab.controllable_units": "Kontrollerbare enheter",
    "tab.technical_resources": "Tekniske ressurser",
    "tab.product_applications": "Produktprekvalifiseringer",
    "tab.grid_prequalifications": "Nettprekvalifiseringer",
    "tab.power_per_substation": "Kapasitet per substasjon",
    "tab.changes": "Endringer",
    "tab.service_providing_groups": "Fleksibilitetsgrupper",
    "tab.accounting_point": "Avregningspunkt",
    "tab.balance_responsible_party": "Balanseansvarlige",
    "tab.history": "Historikk",
    "tab.spg_info": "SPG-info",
    "tab.overview": "Oversikt",
    "tab.grid_location": "Nettlokasjon",
    "tab.comments": "Kommentarer",
    "tab.attachments": "Vedlegg",
    cu_spg_show_history: "Vis historikk",
    "table.header.history_id": "Historikk-ID",
    cu_spg_id: "SPG-ID",
    cu_spg_empty:
      "Ingen fleksibilitetsgrupper for denne kontrollerbare enheten.",
    technical_resources_show_location: "Vis",
    technical_resources_show_label: "Lokasjon",
    "table.header.aggregated_flexible_power": "Aggregert fleksibel effekt",
    "table.header.aggregated_rated_power": "Aggregert merkeeffekt",
    "table.header.minimum_rated_power": "Minimum merkeeffekt",
    "table.header.maximum_rated_power": "Maksimum merkeeffekt",
    "table.header.grid_prequalification": "Nettprekvalifisering",
    "table.header.product_application": "Produktprekvalifisering",
    "table.header.valid_from": "Gyldig fra",
    "table.header.valid_to": "Gyldig til",
    "table.header.substation": "Substasjon",
    "table.header.business_id": "Forretnings-ID",
    "table.header.controllable_units": "Kontrollerbare enheter",
    "table.cell.unassigned": "(ikke tildelt)",
    "form_toolbar.save": "Lagre",
    "form_toolbar.cancel": "Avbryt",
    "form_toolbar.confirm": "Bekreft",
    controllable_unit: "Kontrollerbar enhet",
    cu_show_view_accounting_point: "Vis avregningspunkt",
    cu_show_view_system_operator: "Vis systemoperatør",
    "controllable_unit.is_small.true": "Ja (Liten, ≤ 50 kW fleksibel effekt)",
    "controllable_unit.is_small.true.label": "Ja",
    "controllable_unit.is_small.false":
      "Nei (Ikke liten, > 50 kW fleksibel effekt)",
    "controllable_unit.is_small.false.label": "Nei",
    cu_show_no_service_provider: "Ingen tjenesteleverandør",
    cu_show_no_balance_responsible_party: "Ingen balanseansvarlig",
    cu_flexible_power_exceeds_rated_power_heading:
      "Fleksibel effekt overstiger installert effekt",
    cu_flexible_power_exceeds_rated_power_body:
      "Den fleksible effekten til denne kontrollerbare enheten overstiger merkeeffekten. Oppdater fleksibel effekt eller legg til tekniske ressurser.",
    cu_show_suspended_heading: "Kontrollerbar enhet er suspendert",
    cu_show_suspended_body: "Årsak: %{reason}",
    cu_show_add_technical_resources_heading: "Legg til tekniske ressurser",
    cu_show_add_technical_resources_body:
      "For å sette den kontrollerbare enheten som aktiv kreves minst én teknisk ressurs.",
    cu_show_not_active_heading: "Kontrollerbar enhet er ikke aktiv",
    cu_show_not_active_body:
      "Kontrollerbar enhet må være aktiv for å bli lagt til en fleksibilitetsgruppe. Legg til alle tekniske ressurser og sørg for at dataene er korrekte før aktivering.",
    spgpa_show_requested_alert_body:
      "Den innkjøpende systemoperatøren må nå snart starte prekvalifisering eller verifisering av denne søknaden.",
    power_ratio_tooltip:
      "Den fleksible effekten utgjør %{percentage}% av merkeeffekten",
    "lookup.input.accounting_point": "Avregningspunkt",
    "lookup.input.controllable_unit": "Kontrollerbar enhet",
    "lookup.input.end_user": "Sluttbruker",
    spg_grid_prequalification_header: "Nettprekvalifiseringer",
    spg_product_application_header: "Produktprekvalifiseringer",
    spg_grid_prequalification_empty: "Ingen nettprekvalifiseringer",
    spgpq_conditionally_approve_button: "Godkjenn med vilkår",
    spgpq_conditionally_approve_title:
      "Godkjenn nettprekvalifisering med vilkår",
    spgpq_conditionally_approve_description:
      "Dette godkjenner nettprekvalifiseringen med vilkår. Beskriv vilkårene nedenfor. De legges til som en kommentar som er synlig for alle involverte parter.",
    spgpq_conditionally_approve_placeholder:
      "Beskriv vilkårene for godkjenning",
    spg_product_application_empty: "Ingen produktprekvalifiseringer",
    spg_activate_group_notice:
      "Ved å aktivere gruppen vil den være mulig å bruke i en produktprekvalifisering",
    spg_activate_group_title: "Aktiver fleksibilitetsgruppe",
    spg_activate_group_ensure: "Sjekk følgende før du aktiverer",
    spg_activate_group_ensure_pt1: "alle enheter har blitt lagt til",
    spg_activate_group_ensure_pt2: "data er korrekt",
    spgpa_ramping_details:
      "Beskriv hvordan enhetene som inngår i fleksibilitetsgruppen reguleres for å gi denne responsen. F.eks. enhetene kobles ut én og én for å oppnå en trinnvis profil, eller hver enhet regulerer produksjon/forbruk gradvis samtidig.",
    spgpa_ramping_deviations: "Beskriv når og hvordan profil vil avvike.",
    spgpa_ramping_rate: "Oppgi raskeste endring av aktiv effekt (MW/s).",
    spgpa_add_attachment:
      "Legg om mulig ved en ramping-profil som illustrerer avviket. Filer kan legges ved etter at søknaden er lagret.",
    spgpa_spg_override_description:
      "Referanse til fleksibilitetsgruppen. Listen viser KUN aktive fleksibilitetsgrupper.",
    spgpa_show_default_title: "Produktprekvalifisering",
    spga_additional_information_description:
      "Er det noen målepunkter i fleksibilitetsgruppen som har fleksible tilknytningsavtaler, som UKT/TPV eller andre bilaterale avtaler med netteier?\n\nHvis ja, legg ved dokumentasjon som viser dialog med netteier om mulig deltakelse i markedet.\n\nLegg også ved eventuelle avtaler som dekker varslingsprosedyrer ved markedsaktivering. Filer kan legges ved etter at søknaden er lagret.",
    spga_save_confirmation_text:
      "Lagring av søknaden sender den til PSO. Kontroller at søknaden er fullstendig og korrekt før du lagrer. Husk om nødvendig å legge ved støttedokumenter etter at søknaden er lagret.",
    spgpa_draft_status_label: "Lokalt utkast",
    spgpa_draft_status_tooltip:
      "Lagret kun i denne nettleseren. Dette utkastet er privat og ikke synlig for andre.",
    spgpa_delete_draft: "Slett utkast",
    spgpa_draft_autosaved: "Utkast lagret automatisk",
    spg_manage_members_heading: "Administrer medlemmer for %{name}",
    spg_manage_members_heading_no_name: "Administrer medlemmer",
    spg_manage_members_body:
      "Velg kontrollerbare enheter som skal inngå i fleksibilitetsgruppen.",
    spg_manage_members_search_label: "Søk",
    spg_manage_members_search_clear: "Fjern",
    spg_manage_members_search_placeholder:
      "Filtrer på navn, id eller avregningspunkt",
    spg_manage_members_empty: "Fant ingen kontrollerbare enheter.",
    spg_manage_members_open_in_new_tab: "Åpne i ny fane",
    spg_manage_members_show_selected_only: "Vis kun valgte",
    spg_manage_members_selected_singular: "1 medlem valgt",
    spg_manage_members_selected_plural: "%{count} medlemmer valgt",
    spg_manage_members_total_flexible_power:
      "Total fleksibel kapasitet: %{power} kW",
    spg_manage_members_clear_selection: "Fjern valgte",
    spg_manage_members_review: "Se over endringer",
    spg_manage_members_submit_next: "Gå videre",
    spg_manage_members_submit_done: "Ferdig",
    spg_manage_members_review_modal_title: "Se over endringene",
    spg_manage_members_review_modal_description:
      "Oppsummering av endringer i gruppens medlemmer.",
    spg_manage_members_review_modal_no_changes: "Ingen endringer av medlemmer.",
    spg_manage_members_review_modal_adding_singular:
      "Legger til 1 kontrollerbar enhet",
    spg_manage_members_review_modal_adding_plural:
      "Legger til %{count} kontrollerbare enheter",
    spg_manage_members_review_modal_removing_singular:
      "Fjerner 1 kontrollerbar enhet",
    spg_manage_members_review_modal_removing_plural:
      "Fjerner %{count} kontrollerbare enheter",
    spg_manage_members_review_modal_close: "Lukk",
    spg_manage_members_cu_ineligible_flexible_power:
      "Kan ikke legge til: fleksibel effekt (%{flexible_power} kW) overstiger 100 % av merkeeffekt (%{rated_power} kW).",
    spg_manage_members_cu_ineligible_status:
      "Kan ikke legge til: kontrollerbar enhet er ikke aktiv.",
    spg_manage_members_column_record_time: "Registreringstidspunkt",
    spg_manage_members_column_record_time_tooltip:
      "Tidspunktet den kontrollerbare enheten ble lagt til i gruppen",
    spg_create_additional_information_override_description:
      "Dette feltet er ment å fange opp eventuell tilleggsinformasjon om fleksibilitetsgruppen som kan være relevant.",
    spg_create_additional_information_placeholder:
      "Dette feltet er valgfritt og kan stå tomt.",
    spg_show_table_search_label: "S\u00f8k",
    spg_show_table_search_clear: "Fjern",
    spg_show_table_search_placeholder:
      "Filtrer p\u00e5 navn, id, avregningspunkt eller systemoperat\u00f8r",
    spgpa_hide_prequalified: "Skjul prekvalifiserte",
    spgpa_summary_heading: "Oversikt over fleksibel kapasitet",
    spgpa_summary_approved_flexible_power:
      "Fleksibel kapasitet som har status godkjent",
    spgpa_summary_flexible_power_needing_approval:
      "Fleksibel kapasitet som avventer status",
    spg_changes_since_label: "Sammenlign endringer siden",
    spg_changes_period_heading: "Velg sammenligningsperiode",
    spg_changes_period_hint: "Dra glidebryterne eller endre datoene",
    spg_changes_from_label: "Fra",
    spg_changes_to_label: "Til",
    spg_changes_custom_milestone: "Egendefinert",
    spg_changes_milestone_now: "Nå",
    spg_changes_column_id: "ID",
    spg_changes_column_name: "Navn",
    spg_changes_column_map: "Fleksibel effekt",
    spg_changes_column_first_change: "Første endring",
    spg_changes_column_last_change: "Siste endring",
    spg_changes_column_status: "Endring",
    spg_changes_empty: "Ingen endringer funnet for det valgte tidsrommet.",
    spg_changes_error: "Kunne ikke laste endringer.",
    spg_changes_status_added: "Lagt til",
    spg_changes_status_removed: "Fjernet",
    spg_changes_status_changed: "Endret",
    spg_changes_status_unchanged: "Uendret",
    spg_changes_summary_power_diff: "Fleksibel effekt diff",
    spg_changes_comparison_scope: "Sammenligningsomfang",
    spg_changes_log_changed_by_label: "Endret av",
    spg_changes_log_property_category: "Egenskap: %{property}",
    spg_changes_log_property_previous_label: "Forrige verdi",
    spg_changes_log_property_new_label: "Ny verdi",
    spg_changes_log_membershipAdded_category: "Lagt til i gruppe",
    spg_changes_log_membershipRemoved_category: "Fjernet fra gruppe",
    spg_changes_log_membershipAdded_previous_label: "Gammelt gyldighetsvindu",
    spg_changes_log_membershipAdded_new_label: "Nytt gyldighetsvindu",
    spg_changes_log_membershipRemoved_previous_label: "Gammelt gyldighetsvindu",
    spg_changes_log_membershipRemoved_new_label: "Nytt gyldighetsvindu",
    spg_changes_log_membershipValidity_category:
      "Gyldighetsvindu for medlemskap",
    spg_changes_log_membershipValidity_previous_label: "Forrige utløp",
    spg_changes_log_membershipValidity_new_label: "Forlenget utløp",
    user_dropdown_logout: "Logg ut",
    user_dropdown_user_guide: "Brukerveiledning",
    user_dropdown_create_user_guide: "Opprett Ny bruker veiledning",
    user_dropdown_my_party: "Min part",
    user_dropdown_assume_another_party: "Bytt part",
    user_dropdown_assume_party: "Velg part",
    user_dropdown_my_entity: "Min entitet",
    user_dropdown_user: "Bruker",
    user_dropdown_organisation_administrator: "Organisasjonsadministrator",
    header_nav_dashboard: "Oversikt",
    header_nav_controllable_units: "Kontrollerbare enheter",
    header_nav_service_providing_groups: "Fleksibilitetsgrupper",
    header_nav_grid_prequalification: "Nettprekvalifiseringer",
    header_nav_applications: "Søknader",
    header_nav_service_provider_product_applications:
      "Tjenesteleverandørens produktsøknader",
    header_nav_service_providing_group_product_applications:
      "Fleksibilitetsgruppens produktsøknader",
    header_nav_other: "Annet",
    header_nav_system_operator_product_listing:
      "Systemoperatørens produktliste",
    header_nav_entities: "Entiteter",
    header_nav_parties: "Parter",
    header_nav_events: "Hendelser",
    header_nav_notifications: "Varsler",
    header_nav_notices: "Merknader",
    header_nav_need_help: "Trenger du hjelp?",
    header_nav_user_guide: "Brukerveiledning",
    header_nav_create_user_guide: "Nybrukerveiledning",
    header_nav_assume_party: "Bytt part",
    "comment.visibility.same_party.description":
      "Kun synlig for din nåværende aktør",
    "comment.visibility.any_involved_party.description":
      "Synlig for alle parter involvert i denne ressursen",
    notice_spg_membership_button: "Gå til medlemskap for fleksibilitetsgruppe",
    notice_missing_grid_location_button:
      "Sjekk informasjon om nettlokasjon her",
    notice_insufficient_grid_location_source_button: "Gå til målepunktet",
    notice_bidding_zone_mismatch_button: "Gå til gruppen",
    "accounting_point_location_map.popup.business_id": "Forretnings-ID",
    "accounting_point_location_map.popup.kind": "Type",
    "accounting_point_location_map.popup.status": "Status",
    "accounting_point_location_map.popup.voltage": "Spenning",
    "accounting_point_location_map.popup.selected_as_grid_location":
      "Valgt som nettlokasjon",
    "accounting_point_location_map.popup.select": "Velg",
    "accounting_point_location_map.no_location_set":
      "Ingen lokasjon er satt for dette avregningspunktet.",
    "accounting_point_show.header": "Avregningspunkt",
    "accounting_point_grid_location_panel.heading": "Nettlokasjon",
    "accounting_point_grid_location_panel.status.missing": "Mangler",
    "accounting_point_grid_location_panel.status.confirmed": "Bekreftet",
    "accounting_point_grid_location_panel.status.guessed": "Gjettet",
    "accounting_point_grid_location_panel.button.edit_details":
      "Rediger detaljer",
    "accounting_point_grid_location_panel.button.validate_grid_location":
      "Valider nettlokasjon",
    "accounting_point_grid_location_panel.button.add_grid_location":
      "Legg til nettlokasjon",
    "accounting_point_grid_location_panel.empty.no_grid_location_set":
      "Ingen nettlokasjon er satt for dette avregningspunktet ennå",
    "ap_show_overview.grid_location.heading": "Nettlokasjon",
    "ap_show_overview.grid_location.description":
      "Dette viser hvilken stasjon dette avregningspunktet tilhører.",
    "ap_show_overview.grid_location.guessed_help_before": "Hvis status er",
    "ap_show_overview.grid_location.guessed_help_after":
      ", har systemet gjort en best mulig gjetning. Åpne fanen Lokasjon og sjekk at valgt stasjon er riktig.",
    "ap_show_overview.grid_location.with_selection":
      "En stasjon er valgt. Bekreft den hvis den er riktig, eller velg en annen.",
    "ap_show_overview.grid_location.without_selection":
      "Ingen stasjon er valgt ennå. Velg og lagre riktig stasjon.",
    "ap_show_overview.grid_location.current_status": "Nåværende status",
    "ap_show_overview.grid_location.open_location_tab": "Åpne Lokasjon-fanen",
    "ap_show_overview.grid_location.no_location_access":
      "Du har ikke tilgang til Lokasjon-fanen.",
    "ap_show_overview.cu_summary.heading":
      "Oppsummering av kontrollerbare enheter",
    "ap_show_overview.cu_summary.description":
      "Dette avregningspunktet inneholder %{count} kontrollerbare enheter. Her er nøkkelaggregater på tvers av disse enhetene:",
    "ap_show_overview.cu_summary.total_flexible_power":
      "Total fleksibel effekt",
    "ap_show_overview.cu_summary.total_rated_power": "Total merkeeffekt",
    "ap_show_overview.common.not_available": "Ikke tilgjengelig",
    "ap_controllable_units_table.empty":
      "Ingen kontrollerbare enheter er knyttet til dette avregningspunktet.",
    "substation_reference_input.search_for_substation": "Søk etter stasjon",
    "resource_show_layout.more_actions": "Handlinger",
    "resource_show_layout.navigate_to": "Naviger til",
  },
};
