import {
  IconClockCircle,
  IconQualitiesCircle,
  IconWarningTriangle,
} from "@elhub/ds-icons";
import { Alert, Loader } from "../../components/ui";
import {
  useDashboardApplications,
} from "../hooks/useDashboardApplications";
import { useServiceProvidingGroups } from "../hooks/useServiceProvidingGroups";
import { useControllableUnits } from "../hooks/useControllableUnits";
import { StatCard } from "../shared/StatCard";
import { useNotices } from "../hooks/useNotices";
import { useGetIdentity } from "ra-core";

export const SpStatCards = () => {
  const applicationsQuery = useDashboardApplications();
  const spgQuery = useServiceProvidingGroups();
  const cuQuery = useControllableUnits();
  const noticeQuery = useNotices();
  const { data: identity } = useGetIdentity()

  const noticeQueryParams = identity ? new URLSearchParams({
    filter: JSON.stringify({ party_id: identity?.partyID }),
  }) : undefined

  const isLoading =
    applicationsQuery.isLoading ||
    spgQuery.isLoading ||
    cuQuery.isLoading ||
    noticeQuery.isLoading;
  const error =
    applicationsQuery.error ||
    spgQuery.error ||
    cuQuery.error ||
    noticeQuery.error;

  if (isLoading) return <Loader size="small" />;
  if (error) return <Alert variant="error">Failed to load stats.</Alert>;



  const sppaCount = applicationsQuery.sppaCount;
  const spgpaCount = applicationsQuery.spgpaCount;
  const sppgpCount = applicationsQuery.gridPrequalificationsCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <StatCard
        label="Controllable Units"
        value={cuQuery.data?.count ?? 0}
        icon={
          <IconQualitiesCircle
            size="medium"
            className="text-semantic-text-success"
          />
        }
        borderClass="border-l-semantic-border-success"
        iconBgClass="bg-semantic-background-success"
        actionLabel="Create new"
        actionTo="/controllable_unit/create"
      />
      <StatCard
        label="Service Providing Groups"
        value={spgQuery.data?.count ?? 0}
        icon={
          <IconQualitiesCircle
            size="medium"
            className="text-semantic-text-success"
          />
        }
        borderClass="border-l-semantic-border-success"
        iconBgClass="bg-semantic-background-success"
        actionLabel="Create new"
        actionTo="/service_providing_group/create"
      />
      <StatCard
        label="Notices"
        value={noticeQuery.data?.count ?? 0}
        icon={
          <IconWarningTriangle
            size="medium"
            className="text-semantic-text-error"
          />
        }
        borderClass="border-l-semantic-border-error"
        iconBgClass="bg-semantic-background-error"
        actionLabel="View"
        actionTo={`/notice?${noticeQueryParams?.toString() || ""}`}
      />
      <StatCard
        label="SP Product Applications"
        value={sppaCount}
        icon={
          <IconClockCircle
            size="medium"
            className="text-semantic-text-information"
          />
        }
        borderClass="border-l-semantic-border-information"
        iconBgClass="bg-semantic-background-information"
        actionLabel="Create new"
        actionTo="/service_provider_product_application/create"
      />
      <StatCard
        label="SPG Product Applications"
        value={spgpaCount}
        icon={
          <IconClockCircle
            size="medium"
            className="text-semantic-text-information"
          />
        }
        borderClass="border-l-semantic-border-information"
        iconBgClass="bg-semantic-background-information"
        actionLabel="Create new"
        actionTo="/service_providing_group_product_application/create"
      />
      <StatCard
        label="Grid Prequalifications"
        value={sppgpCount}
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
