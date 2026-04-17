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

export const ServiceProvidingGroupShow = () => {
  const spgId = Number(useParams<{ id: string }>().id);
  const { permissions } = usePermissions<Permissions>();
  const translateEnum = useTranslateEnum();

  const {
    data: spg,
    isPending,
    error,
  } = useQuery({
    queryKey: ["service_providing_group", spgId],
    queryFn: () =>
      readServiceProvidingGroup({ path: { id: spgId } }).then(throwOnError),
    enabled: !!spgId,
  });

  if (isPending) {
    return <Loader />;
  }

  if (error) {
    throw error;
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
      backTo="/service_providing_group"
      title={`Group Details - ${spg.name}`}
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
      <ServiceProvidingGroupShowTabs spgId={spg.id} />
    </ShowPageLayout>
  );
};
