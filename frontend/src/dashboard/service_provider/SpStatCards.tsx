import {
  IconClockCircle,
  IconQualitiesCircle,
  IconWarningTriangle,
} from "@elhub/ds-icons";
import { Alert, Loader } from "../../components/ui";
import {
  ACTIVE_STATUSES,
  useDashboardApplications,
} from "../hooks/useDashboardApplications";
import { useServiceProvidingGroups } from "../hooks/useServiceProvidingGroups";
import { useControllableUnits } from "../hooks/useControllableUnits";
import { StatCard } from "../shared/StatCard";
import { useInconsistencies } from "../hooks/useInconsistencies";

export const SpStatCards = () => {
  const applicationsQuery = useDashboardApplications();
  const spgQuery = useServiceProvidingGroups();
  const cuQuery = useControllableUnits();
  const inconsistenciesQuery = useInconsistencies();

  const isLoading =
    applicationsQuery.isLoading ||
    spgQuery.isLoading ||
    cuQuery.isLoading ||
    inconsistenciesQuery.isLoading;
  const error =
    applicationsQuery.error ||
    spgQuery.error ||
    cuQuery.error ||
    inconsistenciesQuery.error;

  if (isLoading) return <Loader size="small" />;
  if (error) return <Alert variant="error">Failed to load stats.</Alert>;

  const activeCuCount = (cuQuery.data ?? []).filter(
    (cusp) => cusp.controllable_unit?.status === "active",
  ).length;
  const activeSpgCount = (spgQuery.data ?? []).filter(
    (s) => s.status === "active",
  ).length;
  const noticeCount = (inconsistenciesQuery.data ?? []).length;

  const activeSppaCount = (applicationsQuery.sppa ?? []).filter((i) =>
    ACTIVE_STATUSES.has(i.status),
  ).length;
  const activeSpgpaCount = (applicationsQuery.spgpa ?? []).filter((i) =>
    ACTIVE_STATUSES.has(i.status),
  ).length;
  const activeSpggpCount = (
    applicationsQuery.gridPrequalifications ?? []
  ).filter((i) => ACTIVE_STATUSES.has(i.status)).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        label="Controllable Units"
        value={activeCuCount}
        icon={
          <IconQualitiesCircle
            size="medium"
            className="text-semantic-text-success"
          />
        }
        borderClass="border-l-semantic-border-success"
        iconBgClass="bg-semantic-background-success"
        actionLabel="Create CU"
        actionTo="/controllable_unit/create"
      />
      <StatCard
        label="Service Providing Groups"
        value={activeSpgCount}
        icon={
          <IconQualitiesCircle
            size="medium"
            className="text-semantic-text-success"
          />
        }
        borderClass="border-l-semantic-border-success"
        iconBgClass="bg-semantic-background-success"
        actionLabel="Create SPG"
        actionTo="/service_providing_group/create"
      />
      <StatCard
        label="Notices"
        value={noticeCount}
        icon={
          <IconWarningTriangle
            size="medium"
            className="text-semantic-text-error"
          />
        }
        borderClass="border-l-semantic-border-error"
        iconBgClass="bg-semantic-background-error"
      />
      <StatCard
        label="SP Product Applications"
        value={activeSppaCount}
        icon={
          <IconClockCircle
            size="medium"
            className="text-semantic-text-information"
          />
        }
        borderClass="border-l-semantic-border-information"
        iconBgClass="bg-semantic-background-information"
        actionLabel="View"
        actionTo="/service_provider_product_application"
      />
      <StatCard
        label="SPG Product Applications"
        value={activeSpgpaCount}
        icon={
          <IconClockCircle
            size="medium"
            className="text-semantic-text-information"
          />
        }
        borderClass="border-l-semantic-border-information"
        iconBgClass="bg-semantic-background-information"
        actionLabel="View"
        actionTo="/service_providing_group_product_application"
      />
      <StatCard
        label="Grid Prequalifications"
        value={activeSpggpCount}
        icon={
          <IconClockCircle
            size="medium"
            className="text-semantic-text-information"
          />
        }
        borderClass="border-l-semantic-border-information"
        iconBgClass="bg-semantic-background-information"
        actionLabel="View"
        actionTo="/service_providing_group_grid_prequalification"
      />
    </div>
  );
};
