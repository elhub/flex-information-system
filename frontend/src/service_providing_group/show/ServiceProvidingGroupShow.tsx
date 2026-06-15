import { Badge, Loader } from "../../components/ui";
import { useParams } from "react-router-dom";
import { ServiceProvidingGroupShowSummary } from "./ServiceProvidingGroupShowSummary";
import { ServiceProvidingGroupShowTabs } from "./ServiceProvidingGroupShowTabs";
import { readServiceProvidingGroup } from "../../generated-client";
import { throwOnError } from "../../util";
import { useQuery } from "@tanstack/react-query";
import { ShowPageLayout } from "../../components/ShowPageLayout";
import { useTranslateEnum } from "../../intl/intl";
import { usePermissions } from "ra-core";
import { Permissions } from "../../auth/permissions";
import { ActivateServiceProvidingGroupButton } from "../ActivateServiceProvidingGroupButton";
import { spgStatusVariantMap } from "../serviceProvidingGroupStatus";
import { useSpgShowViewModel } from "./useSpgShowViewModel";
import { ServiceProvidingGroupAlerts } from "./ServiceProvidingGroupAlerts";

export const ServiceProvidingGroupShow = () => {
  const spgId = Number(useParams<{ id: string }>().id);
  const { permissions } = usePermissions<Permissions>();
  const translateEnum = useTranslateEnum();

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

  const {
    data: spgViewModel,
    isPending: isSPGViewModelPending,
    error: errorSPGViewModel,
  } = useSpgShowViewModel(spgId);

  if (isSPGPending || isSPGViewModelPending) {
    return <Loader />;
  }

  if (errorSPG) {
    throw errorSPG;
  }

  if (errorSPGViewModel) {
    throw errorSPGViewModel;
  }

  if (!spg || !spgViewModel) {
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
        spgViewModel={spgViewModel}
        summary={spg.summary ?? undefined}
      />
    </ShowPageLayout>
  );
};
