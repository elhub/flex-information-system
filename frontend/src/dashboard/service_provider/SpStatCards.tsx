import {
  IconClockCircle,
  IconQualitiesCircle,
  IconWarningTriangle,
} from "@elhub/ds-icons";
import { Alert, Loader } from "../../components/ui";
import { useDashboardApplications } from "../hooks/useDashboardApplications";
import { useNotices } from "../hooks/useNotices";
import { useServiceProvidingGroups } from "../hooks/useServiceProvidingGroups";
import { StatCard } from "../shared/StatCard";

export const SpStatCards = () => {
  const applicationsQuery = useDashboardApplications();
  const spgQuery = useServiceProvidingGroups();
  const noticeQuery = useNotices();

  const isLoading =
    applicationsQuery.isLoading || spgQuery.isLoading || noticeQuery.isLoading;
  const error =
    applicationsQuery.error || spgQuery.error || noticeQuery.error;

  if (isLoading) return <Loader size="small" />;
  if (error) return <Alert variant="error">Failed to load stats.</Alert>;

  const pendingCount = applicationsQuery.activeItems.length;
  const activeSpgCount = (spgQuery.data ?? []).filter(
    (s) => s.status === "active",
  ).length;
  const inconsistencyCount = (noticeQuery.data ?? []).length;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <StatCard
        label="Pending Applications"
        value={pendingCount}
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
        label="Active SPGs"
        value={activeSpgCount}
        icon={
          <IconQualitiesCircle
            size="medium"
            className="text-semantic-text-success"
          />
        }
        borderClass="border-l-semantic-border-success"
        iconBgClass="bg-semantic-background-success"
      />
      <StatCard
        label="Inconsistencies"
        value={inconsistencyCount}
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
