export type TextKey =
  | "entity_role"
  | "controllable_unit.is_small.true"
  | "controllable_unit.is_small.true.label"
  | "controllable_unit.is_small.false"
  | "controllable_unit.is_small.false.label"
  | "lookup.input.accounting_point"
  | "lookup.input.controllable_unit"
  | "lookup.input.end_user"
  | "spg_grid_prequalification_header"
  | "spg_product_application_header"
  | "spg_grid_prequalification_empty"
  | "spg_product_application_empty"
  | "spg_activate_group_notice"
  | "spg_activate_group_title"
  | "spg_activate_group_ensure"
  | "spg_activate_group_ensure_pt1"
  | "spg_activate_group_ensure_pt2"
  | "spgpa_ramping_details"
  | "spgpa_ramping_deviations"
  | "spgpa_ramping_rate"
  | "spg_activate_group_ensure_pt2"
  | "spg_manage_members_heading"
  | "spg_manage_members_heading_no_name"
  | "spg_manage_members_body"
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
  | "comment.visibility.same_party.description"
  | "comment.visibility.any_involved_party.description";

export const text: Record<string, Record<TextKey, string>> = {
  en: {
    entity_role: "Entity",
    "controllable_unit.is_small.true": "Yes (Small, ≤ 50 kW of flexible power)",
    "controllable_unit.is_small.true.label": "Yes",
    "controllable_unit.is_small.false":
      "No (Not small, > 50 kW of flexible power)",
    "controllable_unit.is_small.false.label": "No",
    "lookup.input.accounting_point": "Accounting point",
    "lookup.input.controllable_unit": "Controllable unit",
    "lookup.input.end_user": "End user",
    spg_grid_prequalification_header: "Grid prequalifications",
    spg_product_application_header: "Product applications",
    spg_grid_prequalification_empty: "No grid prequalifications",
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
    "comment.visibility.same_party.description":
      "Only visible to your current party",
    "comment.visibility.any_involved_party.description":
      "Visible to all parties involved in this resource",
  },
  nb: {
    entity_role: "Entitet",
    "controllable_unit.is_small.true": "Ja (Liten, ≤ 50 kW fleksibel effekt)",
    "controllable_unit.is_small.true.label": "Ja",
    "controllable_unit.is_small.false":
      "Nei (Ikke liten, > 50 kW fleksibel effekt)",
    "controllable_unit.is_small.false.label": "Nei",
    "lookup.input.accounting_point": "Avregningspunkt",
    "lookup.input.controllable_unit": "Kontrollerbar enhet",
    "lookup.input.end_user": "Sluttbruker",
    spg_grid_prequalification_header: "Nettprekvalifiseringer",
    spg_product_application_header: "Produktprekvalifiseringer",
    spg_grid_prequalification_empty: "Ingen nettprekvalifiseringer",
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
    "comment.visibility.same_party.description":
      "Kun synlig for din nåværende aktør",
    "comment.visibility.any_involved_party.description":
      "Synlig for alle parter involvert i denne ressursen",
  },
};
