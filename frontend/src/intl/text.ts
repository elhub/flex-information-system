export type TextKey =
  | "entity_role"
  | "lookup.input.accounting_point"
  | "lookup.input.controllable_unit"
  | "lookup.input.end_user"
  | "spg_grid_prequalification_header"
  | "spg_product_application_header";

export const text: Record<string, Record<TextKey, string>> = {
  en: {
    entity_role: "Entity",
    "lookup.input.accounting_point": "Accounting point",
    "lookup.input.controllable_unit": "Controllable unit",
    "lookup.input.end_user": "End user",
    spg_grid_prequalification_header: "Grid prequalification",
    spg_product_application_header: "Product application",
  },
  nb: {
    entity_role: "Entitet",
    "lookup.input.accounting_point": "Avregningspunkt",
    "lookup.input.controllable_unit": "Kontrollerbar enhet",
    "lookup.input.end_user": "Sluttbruker",
    spg_grid_prequalification_header: "Nettprekvalifisering",
    spg_product_application_header: "Produktsøknad",
  },
  nn: {
    entity_role: "Entitet",
    "lookup.input.accounting_point": "Avrekningspunkt",
    "lookup.input.controllable_unit": "Kontrollerbar eining",
    "lookup.input.end_user": "Sluttbrukar",
    spg_grid_prequalification_header: "Nettprekvalifisering",
    spg_product_application_header: "Produktsøknad",
  },
};
