import { useParams } from "react-router-dom";
import { Loader, Badge } from "../../../components/ui";
import { ShowPageLayout } from "../../../components/ShowPageLayout";
import { usePermissions } from "ra-core";
import { Permissions } from "../../../auth/permissions";
import { SpgpaShowSummary } from "./SpgpaShowSummary";
import { SpgpaShowTabs } from "./SpgpaShowTabs";
import { SpgpaActionBar } from "./SpgpaActionBar";
import { useSpgpaRecord } from "./useSpgpaShowViewModel";
import { useTranslateEnum } from "../../../intl/intl";
import { spgpaStatusVariantMap } from "./spgpaStatus";
import { useServiceProvidingGroup } from "../../show/useSpgShowViewModel";

export const ServiceProvidingGroupProductApplicationShow = () => {
  const spgpaId = Number(useParams<{ id: string }>().id);
  const { permissions } = usePermissions<Permissions>();
  const translateEnum = useTranslateEnum();

  const { data: spgpa, isPending, error } = useSpgpaRecord(spgpaId);
  const spg = useServiceProvidingGroup(spgpa?.service_providing_group_id);

  const canUpdateStatus = !!permissions?.allow(
    "service_providing_group_product_application.status",
    "update",
  );

  if (isPending) return <Loader />;
  if (error) throw error;
  if (!spgpa) return null;
  if (spg.error) throw spg.error;

  const { status, icon } = spgpaStatusVariantMap[spgpa.status];

  return (
    <ShowPageLayout
      backTo={`/service_providing_group/${spgpa.service_providing_group_id}/show`}
      title={`Product Application #${spgpa.id}${spg.data ? ` for ${spg.data.name}` : ""}`}
      badge={
        <Badge size="small" status={status} variant="block" icon={icon}>
          {translateEnum(
            `service_providing_group_product_application.status.${spgpa.status}`,
          )}
        </Badge>
      }
      actionBar={canUpdateStatus ? <SpgpaActionBar spgpa={spgpa} /> : undefined}
    >
      <SpgpaShowSummary spgpa={spgpa} spg={spg.data} />
      <SpgpaShowTabs
        spgId={spgpa.service_providing_group_id}
        spgpaId={spgpa.id}
        spg={spg.data}
      />
    </ShowPageLayout>
  );
};
