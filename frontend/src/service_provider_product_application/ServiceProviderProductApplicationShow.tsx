import { useParams } from "react-router-dom";
import { Loader } from "../components/ui";
import { ResourceShowLayout } from "../components/ResourceShowLayout";
import { usePermissions, useTranslate } from "ra-core";
import { IconPencil } from "@elhub/ds-icons";
import { Permissions } from "../auth/permissions";
import { useSppaShowSummary } from "./show/SppaShowSummary";
import { SppaShowTabs } from "./show/SppaShowTabs";
import { SppaActionBar } from "./show/SppaActionBar";
import { useSppaRecord } from "./show/useSppaShowViewModel";
import { useTranslateEnum } from "../intl/intl";
import { sppaStatusVariantMap } from "./show/sppaStatus";
import { useParty } from "../hooks/party";

export const ServiceProviderProductApplicationShow = () => {
  const sppaId = Number(useParams<{ id: string }>().id);
  const { permissions } = usePermissions<Permissions>();
  const translate = useTranslate();
  const translateEnum = useTranslateEnum();

  const { data: sppa, isPending, error } = useSppaRecord(sppaId);
  const serviceProvider = useParty(sppa?.service_provider_id);
  const systemOperator = useParty(sppa?.system_operator_id);
  const summary = useSppaShowSummary({
    sppa,
    serviceProviderName: serviceProvider.data?.name,
    systemOperatorName: systemOperator.data?.name,
  });

  const canUpdateStatus = !!permissions?.allow(
    "service_provider_product_application.status",
    "update",
  );
  const canEdit = !!permissions?.allow(
    "service_provider_product_application",
    "update",
  );
  const canReadEvents = permissions?.allow("event", "read") ?? false;

  if (isPending) return <Loader />;
  if (error) throw error;
  if (!sppa) return null;
  if (serviceProvider.error) throw serviceProvider.error;
  if (systemOperator.error) throw systemOperator.error;

  const eventsFilter = encodeURIComponent(
    JSON.stringify({
      "source@eq": `/service_provider_product_application/${sppa.id}`,
    }),
  );

  const { status, icon } = sppaStatusVariantMap[sppa.status];

  return (
    <ResourceShowLayout
      secondaryHeaderText={`${translate(
        "text.service_provider_product_application",
      )} #${sppa.id}`}
      mainHeaderText={
        serviceProvider.data?.name ?? translate("text.service_provider")
      }
      status={{
        label: translateEnum(
          `service_provider_product_application.status.${sppa.status}`,
        ),
        status,
        icon,
      }}
      moreActions={[
        {
          to: `/service_provider_product_application/${sppa.id}`,
          title: translate("text.edit"),
          icon: <IconPencil />,
          shouldShow: canEdit,
        },
      ]}
      moreNavigationActions={[
        {
          to: `/event?filter=${eventsFilter}`,
          title: translate("text.header_nav_events"),
          shouldShow: canReadEvents,
        },
      ]}
      workflowActions={
        canUpdateStatus ? <SppaActionBar sppa={sppa} /> : undefined
      }
      summary={summary}
      content={<SppaShowTabs sppa={sppa} />}
    />
  );
};
