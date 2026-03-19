import { useQuery } from "@tanstack/react-query";
import {
  listServiceProvidingGroupProductApplication,
  readParty,
  ServiceProvidingGroupProductApplicationStatus,
} from "../../generated-client";
import { throwOnError } from "../../util";

export type SpgProductApplicationRow = {
  id: number;
  procuringSystemOperatorName: string;
  productTypeIds: number[];
  status: ServiceProvidingGroupProductApplicationStatus;
};

const fetchSpgProductApplications = async (
  spgId: number,
): Promise<SpgProductApplicationRow[]> => {
  const applications = await listServiceProvidingGroupProductApplication({
    query: {
      service_providing_group_id: `eq.${spgId}`,
      order: "id.desc",
    },
  }).then(throwOnError);

  if (applications.length === 0) return [];

  const uniquePartyIds = [
    ...new Set(applications.map((a) => a.procuring_system_operator_id)),
  ];

  const parties = await Promise.all(
    uniquePartyIds.map((id) => readParty({ path: { id } }).then(throwOnError)),
  );

  const partyMap = Object.fromEntries(parties.map((p) => [p.id, p.name]));

  return applications.map((a) => ({
    id: a.id,
    procuringSystemOperatorName:
      partyMap[a.procuring_system_operator_id] ??
      String(a.procuring_system_operator_id),
    productTypeIds: a.product_type_ids,
    status: a.status,
  }));
};

export const useSpgProductApplications = (spgId: number | undefined) =>
  useQuery({
    queryKey: ["spg_product_applications", spgId],
    queryFn: () => fetchSpgProductApplications(spgId ?? 0),
    enabled: !!spgId,
  });
