import { Alert, Loader } from "../../components/ui";
import {
  isProductApplicationBlocked,
  getProductApplicationBlockDate,
} from "../../productApplicationBlock";
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
    <div className="flex flex-col gap-4">
      {isProductApplicationBlocked() && (
        <Alert variant="info">
          The flexibility register is not open for new product applications
          until {getProductApplicationBlockDate()}.
        </Alert>
      )}
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
    </div>
  );
};
