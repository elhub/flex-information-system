import { useParams } from "react-router-dom";
import { usePermissions, useResourceContext } from "ra-core";
import { Loader } from "../../components/ui";
import { ShowPageLayout } from "../../components/ShowPageLayout";
import type { Permissions } from "../../auth/permissions";
import { SpgpqShowSummary } from "./show/SpgpqShowSummary";
import { SpgpqShowTabs } from "./show/SpgpqShowTabs";
import { SpgpqActionBar } from "./show/SpgpqActionBar";
import { useSpgpqRecord } from "./show/useSpgpqShowViewModel";
import { useServiceProvidingGroup } from "../show/useSpgShowViewModel";
import { SpgpqStatusBadge } from "../../components/SpgpqStatusBadge";

export const ServiceProvidingGroupGridPrequalificationShow = () => {
  const spgpqId = Number(useParams<{ id: string }>().id);
  const resource = useResourceContext()!;
  const { permissions } = usePermissions<Permissions>();

  const isHistory = resource.endsWith("_history");

  const { data: spgpq, isPending, error } = useSpgpqRecord(spgpqId);
  const spg = useServiceProvidingGroup(spgpq?.service_providing_group_id);

  const canUpdateStatus = !!permissions?.allow(
    "service_providing_group_grid_prequalification.status",
    "update",
  );

  if (isPending) return <Loader />;
  if (error) throw error;
  if (!spgpq) return null;
  if (spg.error) throw spg.error;

  return (
    <ShowPageLayout
      title={`Grid Prequalification #${spgpq.id}${spg.data ? ` for ${spg.data.name}` : ""}`}
      badge={<SpgpqStatusBadge status={spgpq.status} />}
      actionBar={
        !isHistory && canUpdateStatus ? (
          <SpgpqActionBar spgpq={spgpq} />
        ) : undefined
      }
    >
      <SpgpqShowSummary spgpq={spgpq} spg={spg.data} isHistory={isHistory} />
      {!isHistory ? (
        <SpgpqShowTabs
          spgId={spgpq.service_providing_group_id}
          spgpqId={spgpq.id}
          spg={spg.data}
        />
      ) : (
        <div />
      )}
    </ShowPageLayout>
  );
};
