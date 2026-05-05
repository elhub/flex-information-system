import { useGetIdentity } from "ra-core";
import { Alert, Loader } from "../../components/ui";
import { SpApplicationsTable } from "./SpApplicationsTable";
import { useDashboardApplications } from "../hooks/useDashboardApplications";
import { SpMarketsCard } from "./SpMarketsCard";
import { SpStatCards } from "./SpStatCards";

export const SpDashboard = () => {
  const { data: identity } = useGetIdentity();
  const partyID = identity?.partyID as number | undefined;

  const { activeItems, resolvedItems, isLoading, error } =
    useDashboardApplications();

  return (
    <>
      {isLoading && <Loader size="medium" />}
      {error && <Alert variant="error">Failed to load applications.</Alert>}

      {!isLoading && !error && (
        <>
          <SpStatCards />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-semantic-text-subtle mb-3">
              Active Applications
            </p>
            <SpApplicationsTable
              items={activeItems}
              empty="No active applications."
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-semantic-text-subtle mb-3">
              Recently Resolved
            </p>
            <SpApplicationsTable
              items={resolvedItems}
              empty="No resolved applications."
            />
          </div>

          <SpMarketsCard spId={partyID} />
        </>
      )}
    </>
  );
};
