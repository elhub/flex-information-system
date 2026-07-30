import { useParams } from "react-router-dom";
import { Loader } from "../../../components/ui";
import { ShowPageLayout } from "../../../components/ShowPageLayout";
import { usePermissions } from "ra-core";
import { Permissions } from "../../../auth/permissions";
import { SpgpaShowSummary } from "./SpgpaShowSummary";
import { SpgpaShowTabs } from "./SpgpaShowTabs";
import { SpgpaActionBar } from "./SpgpaActionBar";
import { useSpgpaRecord } from "./useSpgpaShowViewModel";
import { useServiceProvidingGroup } from "../../show/useSpgShowViewModel";
import { SpgpaAlerts } from "./SpgpaAlerts";
import { SpgpaStatusBadge } from "../../../components/SpgpaStatusBadge";

export const ServiceProvidingGroupProductApplicationShow = () => {
  const spgpaId = Number(useParams<{ id: string }>().id);
  const { permissions } = usePermissions<Permissions>();

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

  return (
    <ShowPageLayout
      backTo={{
        pathname: "/service_providing_group_product_application",
        label: "Product applications",
      }}
      title={`Product Application #${spgpa.id}${spg.data ? ` for ${spg.data.name}` : ""}`}
      badge={<SpgpaStatusBadge status={spgpa.status} />}
      actionBar={canUpdateStatus ? <SpgpaActionBar spgpa={spgpa} /> : undefined}
      alerts={<SpgpaAlerts spgpa={spgpa} />}
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
