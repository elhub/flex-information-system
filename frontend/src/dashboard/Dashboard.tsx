import { useAuthenticated, useGetIdentity } from "ra-core";
import { Alert, Heading, Loader } from "../components/ui";
import { SOApplicationsTable } from "./system_operator/SoApplicationsTable";
import { SpApplicationsTable } from "./service_provider/SpApplicationsTable";
import { SoStatCards } from "./system_operator/SoStatCards";
import { SpStatCards } from "./service_provider/SpStatCards";
import { DashboardLayout } from "./DashboardLayout";
import { useDashboardApplications } from "./hooks/useDashboardApplications";

export const Dashboard = () => {
  useAuthenticated();

  const { data: identity } = useGetIdentity();
  const { activeItems, resolvedItems, isLoading, error } =
    useDashboardApplications();
  const isServiceProvider = identity?.role === "flex_service_provider";

  return (
    <div
      id="flex-dashboard"
      className="flex flex-col gap-8 px-8 py-6 sm:px-4 sm:py-4 max-w-7xl mx-auto w-full"
    >
      <Heading level={2} size="large">
        Dashboard
      </Heading>
      {isLoading && <Loader size="medium" />}
      {error && <Alert variant="error">Failed to load dashboard.</Alert>}

      {!isLoading && !error && (
        <>
          {isServiceProvider && (
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
          )}

          {!isServiceProvider && (
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
          )}
        </>
      )}
    </div>
  );
};
