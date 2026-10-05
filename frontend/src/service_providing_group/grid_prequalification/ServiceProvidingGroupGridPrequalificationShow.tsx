import { useParams } from "react-router-dom";
import { useGetIdentity, usePermissions, useTranslate } from "ra-core";
import { Loader } from "../../components/ui";
import type { Permissions } from "../../auth/permissions";
import { useSpgpqShowSummary } from "./show/useSpgpqShowSummary";
import { SpgpqShowTabs } from "./show/SpgpqShowTabs";
import { SpgpqActionBar } from "./show/SpgpqActionBar";
import { useSpgpqRecord } from "./show/useSpgpqShowViewModel";
import { useServiceProvidingGroup } from "../show/useSpgShowViewModel";
import { ResourceShowLayout } from "../../components/ResourceShowLayout";
import { spgpqStatusVariantMap } from "./spgpqStatus";
import { useTranslateEnum } from "../../intl/intl";
import type { EnumLabel } from "../../intl/enum-labels";
import { IconPencil } from "@elhub/ds-icons";

export const ServiceProvidingGroupGridPrequalificationShow = () => {
  const spgpqId = Number(useParams<{ id: string }>().id);
  const { permissions } = usePermissions<Permissions>();
  const translateEnum = useTranslateEnum();
  const translate = useTranslate();
  const { data: identity } = useGetIdentity();

  const { data: spgpq, isPending, error } = useSpgpqRecord(spgpqId);
  const spg = useServiceProvidingGroup(spgpq?.service_providing_group_id);
  const summary = useSpgpqShowSummary({ spgpq, spg: spg.data });

  const isImpactedSystemOperator =
    spgpq?.impacted_system_operator_id === identity?.partyID;
  const isFiso =
    identity?.role === "flex_flexibility_information_system_operator";
  const canUpdateStatus =
    !!permissions?.allow(
      "service_providing_group_grid_prequalification.status",
      "update",
    ) && isImpactedSystemOperator;
  const canEdit =
    permissions?.allow(
      "service_providing_group_grid_prequalification",
      "update",
    ) &&
    (isImpactedSystemOperator || isFiso);
  const canReadEvents = permissions?.allow("event", "read");

  if (isPending) return <Loader />;
  if (error) throw error;
  if (!spgpq) return null;
  if (spg.error) throw spg.error;

  const eventsFilter = encodeURIComponent(
    JSON.stringify({
      "subject@eq": `/service_providing_group_grid_prequalification/${spgpq.id}`,
    }),
  );

  const variant =
    spgpqStatusVariantMap[spgpq.status as keyof typeof spgpqStatusVariantMap];

  const spgpqStatus = {
    label: translateEnum(
      `service_providing_group_grid_prequalification.status.${spgpq.status}` as EnumLabel,
    ),
    status: variant.status,
    icon: variant.icon,
  };

  return (
    <ResourceShowLayout
      secondaryHeaderText={`Grid Prequalification #${spgpq.id}`}
      mainHeaderText={`${spg.data?.name ?? ""}`}
      status={spgpqStatus}
      workflowActions={canUpdateStatus && <SpgpqActionBar spgpq={spgpq} />}
      moreActions={[
        {
          to: `/service_providing_group_grid_prequalification/${spgpq.id}/edit`,
          title: translate("text.edit"),
          icon: <IconPencil />,
          shouldShow: canEdit,
        },
      ]}
      moreNavigationActions={[
        {
          to: `/event?filter=${eventsFilter}`,
          title: translate("text.header_nav_events"),
          shouldShow: canReadEvents ?? false,
        },
      ]}
      summary={summary}
      content={
        <SpgpqShowTabs
          spgId={spgpq.service_providing_group_id}
          spgpqId={spgpq.id}
          spg={spg.data}
          spgpq={spgpq}
        />
      }
    />
  );
};
