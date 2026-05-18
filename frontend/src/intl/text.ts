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
  | "spg_product_application_header";

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
    spg_grid_prequalification_header: "Grid prequalification",
    spg_product_application_header: "Product application",
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
    spg_grid_prequalification_header: "Nettprekvalifisering",
    spg_product_application_header: "Produktsøknad",
  },
};
