import { useState } from "react";
import { Badge, Loader } from "../../components/ui";
import { useParams } from "react-router-dom";
import { ServiceProvidingGroupShowSummary } from "./ServiceProvidingGroupShowSummary";
import { ServiceProvidingGroupShowTabs } from "./ServiceProvidingGroupShowTabs";
import { readServiceProvidingGroup } from "../../generated-client";
import { throwOnError } from "../../util";
import { useQuery } from "@tanstack/react-query";
import { ShowPageLayout } from "../../components/ShowPageLayout";
import { useTranslateEnum } from "../../intl/intl";
import { useGetIdentity, usePermissions } from "ra-core";
import { Permissions } from "../../auth/permissions";
import { ActivateServiceProvidingGroupButton } from "../ActivateServiceProvidingGroupButton";
import { spgStatusVariantMap } from "../serviceProvidingGroupStatus";
import { ServiceProvidingGroupAlerts } from "./ServiceProvidingGroupAlerts";
import { ScaleToggle } from "../../components/ScaleToggle";
import { KILO, MEGA, Scale } from "../../utils/scales";

const POWER_SCALE_OPTIONS: Scale[] = [KILO, MEGA];

export const ServiceProvidingGroupShow = () => {
  const spgId = Number(useParams<{ id: string }>().id);
  const { permissions } = usePermissions<Permissions>();
  const translateEnum = useTranslateEnum();
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
    <ShowPageLayout
      backTo={{
        pathname: "/service_providing_group",
        label: "Service providing groups",
      }}
      title={`Group Details - ${spg.name}`}
      alerts={<ServiceProvidingGroupAlerts spg={spg} />}
      titleExtra={
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Display unit:</span>
          <ScaleToggle
            unit="W"
            options={POWER_SCALE_OPTIONS}
            value={powerScale}
            onChange={setPowerScale}
          />
        </div>
      }
      badge={
        <>
          <Badge
            size="small"
            status={spgStatusVariantMap[spg.status].status}
            variant="block"
            icon={spgStatusVariantMap[spg.status].icon}
          >
            {translateEnum(`service_providing_group.status.${spg.status}`)}
          </Badge>
          {spg.status === "new" && (
            <ActivateServiceProvidingGroupButton
              spgId={spg.id}
              disabled={!canUpdateSpg}
            />
          )}
        </>
      }
    >
      <ServiceProvidingGroupShowSummary spg={spg} />
      <ServiceProvidingGroupShowTabs
        spgId={spg.id}
        spgStatus={spg.status}
        summary={spg.summary ?? undefined}
        showPowerPerSubstation={isFISOOrSO}
        powerScale={powerScale}
      />
    </ShowPageLayout>
  );
};
