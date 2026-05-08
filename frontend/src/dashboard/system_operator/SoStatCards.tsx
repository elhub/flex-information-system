import { IconClockCircle, IconWarningTriangle } from "@elhub/ds-icons";
import { useDashboardApplications } from "../hooks/useDashboardApplications";
import { StatCard } from "../shared/StatCard";
import { Alert, Loader } from "../../components/ui";
import { useNotices } from "../hooks/useNotices";

export const SoStatCards = () => {
  const { activeItems, isLoading, error } = useDashboardApplications();
  const noticeQuery = useNotices();

  if (isLoading || noticeQuery.isLoading) return <Loader size="small" />;
  if (error || noticeQuery.error) return <Alert variant="error">Failed to load stats.</Alert>;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <StatCard
        label="Pending Applications"
        value={activeItems.length}
        icon={
          <IconClockCircle
            size="medium"
            className="text-semantic-text-information"
          />
        }
        borderClass="border-l-semantic-border-information"
        iconBgClass="bg-semantic-background-information"
      />
      <StatCard
        label="Resource Inconsistencies"
        value={noticeQuery.data?.count ?? 0}
        icon={
          <IconWarningTriangle
            size="medium"
            className="text-semantic-text-error"
          />
        }
        borderClass="border-l-semantic-border-error"
        iconBgClass="bg-semantic-background-error"
      />
    </div>
  );
};
