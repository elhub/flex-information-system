import { Alert, Loader } from "../../components/ui";
import { useDashboardApplications } from "../hooks/useDashboardApplications";
import { DashboardLayout } from "../DashboardLayout";
import { SpStatCards } from "./SpStatCards";
import { SpApplicationsTable } from "./SpApplicationsTable";

export const SpDashboard = () => {
  const { activeItems, resolvedItems, isLoading, error } =
    useDashboardApplications();

  if (isLoading) return <Loader size="medium" />;
  if (error) return <Alert variant="error">Failed to load dashboard.</Alert>;

  return (
    <DashboardLayout
      statCards={<SpStatCards />}
      activeTable={
        <SpApplicationsTable
          items={activeItems}
          empty="No active applications."
        />
      }
      resolvedTable={
        <SpApplicationsTable
          items={resolvedItems}
          empty="No resolved applications."
        />
      }
    />
  );
};
