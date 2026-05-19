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

  return (
    <DashboardLayout
      statCards={<SoStatCards />}
      activeTable={
        <SOApplicationsTable
          items={activeItems}
          empty="No active applications."
        />
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
