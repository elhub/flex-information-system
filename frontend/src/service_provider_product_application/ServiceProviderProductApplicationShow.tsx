import { useParams } from "react-router-dom";
import { Loader, Badge } from "../components/ui";
import { ShowPageLayout } from "../components/ShowPageLayout";
import { usePermissions } from "ra-core";
import { Permissions } from "../auth/permissions";
import { SppaShowSummary } from "./show/SppaShowSummary";
import { SppaShowTabs } from "./show/SppaShowTabs";
import { SppaActionBar } from "./show/SppaActionBar";
import { useSppaRecord } from "./show/useSppaShowViewModel";
import { useTranslateEnum } from "../intl/intl";
import { sppaStatusVariantMap } from "./show/sppaStatus";

export const ServiceProviderProductApplicationShow = () => {
  const sppaId = Number(useParams<{ id: string }>().id);
  const { permissions } = usePermissions<Permissions>();
  const translateEnum = useTranslateEnum();

  const { data: sppa, isPending, error } = useSppaRecord(sppaId);

  const canUpdateStatus = !!permissions?.allow(
    "service_provider_product_application.status",
    "update",
  );

  if (isPending) return <Loader />;
  if (error) throw error;
  if (!sppa) return null;

  const { status, icon } = sppaStatusVariantMap[sppa.status];

  return (
    <ShowPageLayout
      backTo={{ pathname: "/service_provider_product_application", label: "Applications" }}
      title={`Product Application #${sppa.id}`}
      badge={
        <Badge size="small" status={status} variant="block" icon={icon}>
          {translateEnum(
            `service_provider_product_application.status.${sppa.status}`,
          )}
        </Badge>
      }
      actionBar={canUpdateStatus ? <SppaActionBar sppa={sppa} /> : undefined}
    >
      <SppaShowSummary sppa={sppa} />
      <SppaShowTabs sppaId={sppa.id} />
    </ShowPageLayout>
  );
};
