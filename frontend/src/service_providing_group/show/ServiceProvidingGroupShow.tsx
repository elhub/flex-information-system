import { useState } from "react";
import { Loader } from "../../components/ui";
import { useParams } from "react-router-dom";
import { ServiceProvidingGroupShowTabs } from "./ServiceProvidingGroupShowTabs";
import { readServiceProvidingGroup } from "../../generated-client";
import { throwOnError } from "../../util";
import { useQuery } from "@tanstack/react-query";
import { useTranslateEnum } from "../../intl/intl";
import { useGetIdentity, usePermissions, useTranslate } from "ra-core";
import { Permissions } from "../../auth/permissions";
import { ActivateServiceProvidingGroupButton } from "../ActivateServiceProvidingGroupButton";
import { spgStatusVariantMap } from "../serviceProvidingGroupStatus";
import { useServiceProvidingGroupAlerts } from "./useServiceProvidingGroupAlert";
import { useServiceProvidingGroupShowSummary } from "./useServiceProvidingGroupShowSummary";
import { ScaleToggle } from "../../components/ScaleToggle";
import { KILO, MEGA, Scale } from "../../utils/scales";
import { ResourceShowLayout } from "../../components/ResourceShowLayout";
import { IconPencil } from "@elhub/ds-icons";

const POWER_SCALE_OPTIONS: Scale[] = [KILO, MEGA];

export const ServiceProvidingGroupShow = () => {
  const spgId = Number(useParams<{ id: string }>().id);
  const { permissions } = usePermissions<Permissions>();
  const translateEnum = useTranslateEnum();
  const translate = useTranslate();
  const { data: identity } = useGetIdentity();
  const isFISOOrSO =
    identity?.role === "flex_flexibility_information_system_operator" ||
    identity?.role === "flex_system_operator";

  const [powerScale, setPowerScale] = useState<Scale>(KILO);

  const {
    data: spg,
    isPending: isSPGPending,
    error: errorSPG,
  } = useQuery({
    queryKey: ["service_providing_group", spgId, "summary"],
    queryFn: () =>
      readServiceProvidingGroup({
        path: { id: spgId },
        query: { embed: "summary" },
      }).then(throwOnError),
    enabled: !!spgId,
  });

  const alert = useServiceProvidingGroupAlerts(spg);
  const summary = useServiceProvidingGroupShowSummary({ spg });

  if (isSPGPending) {
    return <Loader />;
  }

  if (errorSPG) {
    throw errorSPG;
  }

  if (!spg) {
    return null;
  }

  const canUpdateSpg = !!permissions?.allow(
    "service_providing_group",
    "update",
  );

  return (
    <ResourceShowLayout
      secondaryHeaderText={`Service Providing Group #${spg.id}`}
      mainHeaderText={spg.name}
      alert={alert}
      status={{
        label: translateEnum(`service_providing_group.status.${spg.status}`),
        status: spgStatusVariantMap[spg.status].status,
        icon: spgStatusVariantMap[spg.status].icon,
      }}
      displayControls={
        <ScaleToggle
          unit="W"
          options={POWER_SCALE_OPTIONS}
          value={powerScale}
          onChange={setPowerScale}
        />
      }
      workflowActions={
        spg.status === "new" ? (
          <ActivateServiceProvidingGroupButton
            spgId={spg.id}
            disabled={!canUpdateSpg}
          />
        ) : undefined
      }
      moreActions={[
        {
          to: `/service_providing_group/${spg.id}/edit`,
          title: translate("text.edit"),
          icon: <IconPencil />,
          shouldShow: canUpdateSpg,
        },
      ]}
      summary={summary}
      content={
        <ServiceProvidingGroupShowTabs
          spgId={spg.id}
          spgStatus={spg.status}
          summary={spg.summary ?? undefined}
          showPowerPerSubstation={isFISOOrSO}
          powerScale={powerScale}
        />
      }
    />
  );
};
