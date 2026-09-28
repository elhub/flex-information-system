import { Alert, Loader } from "../../components/ui";
import { useDashboardApplications } from "../hooks/useDashboardApplications";
import { DashboardLayout } from "../DashboardLayout";
import { SoStatCards } from "./SoStatCards";
import { SOApplicationsTable } from "./SoApplicationsTable";

export const SoDashboard = () => {
  const { activeItems, resolvedItems, isLoading, error } =
    useDashboardApplications();

  if (isLoading) return <Loader size="medium" />;
  if (error) return <Alert variant="error">Failed to load dashboard.</Alert>;

  // remove secondary label as we show each application type in its own table

  const sppa = activeItems
    .filter((item) => item.kind === "sp_product_application")
    .map((item) => ({ ...item, secondaryLabel: undefined }));

  const spgpa = activeItems
    .filter((item) => item.kind === "spg_product_application")
    .map((item) => ({ ...item, secondaryLabel: undefined }));

  const spggp = activeItems
    .filter((item) => item.kind === "spg_grid_prequalification")
    .map((item) => ({ ...item, secondaryLabel: undefined }));

  return (
    <DashboardLayout
      statCards={<SoStatCards />}
      activeTable={
        <div className="flex flex-col gap-8">
          <SOApplicationsTable
            label="SP Product Application"
            items={sppa}
            empty="No active SP product applications."
            timestampLabel="Recorded at"
          />
          <SOApplicationsTable
            label="SPG Product Application"
            items={spgpa}
            empty="No active SPG product applications."
            timestampLabel="Created at"
          />
          <SOApplicationsTable
            label="SPG Grid Prequalification"
            items={spggp}
            empty="No active SPG grid prequalifications."
            timestampLabel="Recorded at"
          />
        </div>
      }
      resolvedTable={
        <SOApplicationsTable
          items={resolvedItems}
          empty="No resolved applications."
        />
      }
    />
  );
};
