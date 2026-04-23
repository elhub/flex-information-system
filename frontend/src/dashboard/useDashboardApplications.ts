// frontend/src/dashboard/useDashboardApplications.ts

export type DashboardItemKind =
    | "sp_product_application"
    | "spg_product_application"
    | "spg_grid_prequalification";

export type DashboardItem = {
    id: number;
    kind: DashboardItemKind;
    /** Human-readable type label shown in the Type column */
    typeLabel: string;
    /** Byline shown under the type label */
    byline: string;
    /** Resolved service provider party name */
    participant: string;
    /** recorded_at + 3 months, formatted as YYYY-MM-DD */
    dueDate: string;
    /** Raw status string from the resource */
    status: string;
    /** Navigation route for row click */
    route: string;
};
