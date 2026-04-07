import { Loader } from "../../components/ui";
import { useParams } from "react-router-dom";
import { ServiceProvidingGroupShowSummary } from "./ServiceProvidingGroupShowSummary";
import { ServiceProvidingGroupShowTabs } from "./ServiceProvidingGroupShowTabs";
import { readServiceProvidingGroup } from "../../generated-client";
import { throwOnError } from "../../util";
import { useQuery } from "@tanstack/react-query";
import { ShowPageLayout } from "../../components/ShowPageLayout";

export const ServiceProvidingGroupShow = () => {
  const spgId = Number(useParams<{ id: string }>().id);
  const {
    data: spg,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["service_providing_group", spgId],
    queryFn: () =>
      readServiceProvidingGroup({ path: { id: spgId } }).then(throwOnError),
    enabled: !!spgId,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    throw error;
  }

  if (!spg) {
    return null;
  }

  return (
    <ShowPageLayout
      backTo="/service_providing_group"
      title={`Group Details - ${spg.name}`}
    >
      <ServiceProvidingGroupShowSummary spg={spg} />
      <ServiceProvidingGroupShowTabs spgId={spg.id} />
    </ShowPageLayout>
  );
};
