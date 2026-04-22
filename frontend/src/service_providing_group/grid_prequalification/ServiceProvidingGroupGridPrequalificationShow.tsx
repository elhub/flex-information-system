import { useParams } from "react-router-dom";
import { usePermissions, useResourceContext } from "ra-core";
import { Loader, Badge } from "../../components/ui";
import { ShowPageLayout } from "../../components/ShowPageLayout";
import type { Permissions } from "../../auth/permissions";
import { SpgpqShowSummary } from "./show/SpgpqShowSummary";
import { SpgpqShowTabs } from "./show/SpgpqShowTabs";
import { SpgpqActionBar } from "./show/SpgpqActionBar";
import { useSpgpqRecord } from "./show/useSpgpqShowViewModel";
import { useTranslateEnum } from "../../intl/intl";
import { spgpqStatusVariantMap } from "./show/spgpqStatus";
import { useServiceProvidingGroup } from "../show/useSpgShowViewModel";

export const ServiceProvidingGroupGridPrequalificationShow = () => {
  const spgpqId = Number(useParams<{ id: string }>().id);
  const resource = useResourceContext()!;
  const { permissions } = usePermissions<Permissions>();
  const translateEnum = useTranslateEnum();

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

  const { status, icon } = spgpqStatusVariantMap[spgpq.status];

  return (
    <ShowPageLayout
      backTo={{
        pathname: "/service_providing_group_grid_prequalification",
        label: "Grid prequalifications",
      }}
      title={`Grid Prequalification #${spgpq.id}${spg.data ? ` for ${spg.data.name}` : ""}`}
      badge={
        <Badge size="small" status={status} variant="block" icon={icon}>
          {translateEnum(
            `service_providing_group_grid_prequalification.status.${spgpq.status}`,
          )}
        </Badge>
      }
      actionBar={
        !isHistory && canUpdateStatus ? (
          <SpgpqActionBar spgpq={spgpq} />
        ) : undefined
      }
    >
      <SpgpqShowSummary spgpq={spgpq} spg={spg.data} isHistory={isHistory} />
      {!isHistory ? <SpgpqShowTabs spgpqId={spgpq.id} /> : <div />}
    </ShowPageLayout>
  );
};
