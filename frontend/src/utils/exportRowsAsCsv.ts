import { DataProvider, defaultExporter } from "ra-core";

export const exportRowsAsCsv = (
  rows: Record<string, unknown>[],
  newFileName: string,
) => defaultExporter(rows, async () => ({}), {} as DataProvider, newFileName);
