export type TextKey =
  | "entity_role"
  | "spg_grid_prequalification_header"
  | "spg_product_application_header";

export const text: Record<string, Record<TextKey, string>> = {
  en: {
    entity_role: "Entity",
    spg_grid_prequalification_header: "Grid prequalification",
    spg_product_application_header: "Product application",
  },
  nb: {
    entity_role: "Entitet",
    spg_grid_prequalification_header: "Nettprekvalifisering",
    spg_product_application_header: "Produktsøknad",
  },
  nn: {
    entity_role: "Entitet",
    spg_grid_prequalification_header: "Nettprekvalifisering",
    spg_product_application_header: "Produktsøknad",
  },
};
