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
  | "spgpa_ramping_deviations";

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
    spg_activate_group_title: "Aktiver tjenesteleverandørgruppe",
    spg_activate_group_ensure: "Sjekk følgende før du aktiverer",
    spg_activate_group_ensure_pt1: "alle enheter har blitt lagt til",
    spg_activate_group_ensure_pt2: "data er korrekt",
    spgpa_ramping_details:
      "Beskriv hvordan enhetene som inngår i fleksibilitetsgruppen reguleres for å gi denne responsen. F.eks. enhetene kobles ut én og én for å oppnå en trinnvis profil, eller hver enhet regulerer produksjon/forbruk gradvis samtidig.",
    spgpa_ramping_deviations: "Beskriv når og hvordan profil vil avvike.",
  },
};
