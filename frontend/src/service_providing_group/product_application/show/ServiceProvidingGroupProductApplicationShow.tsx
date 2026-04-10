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

export const ServiceProvidingGroupProductApplicationShow = () => {
  const spgpaId = Number(useParams<{ id: string }>().id);
  const spgId = Number(useParams<{ spg_id: string }>().spg_id);
  const { permissions } = usePermissions<Permissions>();
  const translateEnum = useTranslateEnum();

  const { data: spgpa, isPending, error } = useSpgpaRecord(spgpaId);

  const canUpdate = !!permissions?.allow(
    "service_providing_group_product_application",
    "update",
  );

  if (isPending) return <Loader />;
  if (error) throw error;
  if (!spgpa) return null;

  const { status, icon } = spgpaStatusVariantMap[spgpa.status];

  return (
    <ShowPageLayout
      backTo={`/service_providing_group/${spgId}/show`}
      title={`Product Application #${spgpa.id}`}
      badge={
        <Badge size="small" status={status} variant="block" icon={icon}>
          {translateEnum(
            `service_providing_group_product_application.status.${spgpa.status}`,
          )}
        </Badge>
      }
      actionBar={canUpdate ? <SpgpaActionBar spgpa={spgpa} /> : undefined}
    >
      <SpgpaShowSummary spgpa={spgpa} />
      <SpgpaShowTabs
        spgId={spgpa.service_providing_group_id}
        spgpaId={spgpa.id}
      />
    </ShowPageLayout>
  );
};
