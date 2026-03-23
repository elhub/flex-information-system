import { useQuery } from "@tanstack/react-query";
import {
  listServiceProvidingGroupGridPrequalification,
  listParty,
  ServiceProvidingGroupGridPrequalificationStatus,
} from "../../generated-client";
import { throwOnError, toDateString } from "../../util";

export type SpgGridPrequalificationRow = {
  id: number;
  impactedSystemOperatorName: string;
  status: ServiceProvidingGroupGridPrequalificationStatus;
  prequalifiedAt: string;
};

const fetchSpgGridPrequalifications = async (
  spgId: number,
): Promise<SpgGridPrequalificationRow[]> => {
  const prequalifications = await listServiceProvidingGroupGridPrequalification(
    {
      query: {
        service_providing_group_id: `eq.${spgId}`,
        order: "id.desc",
      },
    },
  ).then(throwOnError);

  if (prequalifications.length === 0) return [];

  const uniquePartyIds = [
    ...new Set(prequalifications.map((p) => p.impacted_system_operator_id)),
  ];

  const parties = await listParty({
    query: {
      id: `in.(${uniquePartyIds.join(",")})`,
    },
  }).then(throwOnError);

  const partyMap = Object.fromEntries(parties.map((p) => [p.id, p.name]));

  return prequalifications.map((p) => ({
    id: p.id,
    impactedSystemOperatorName:
      partyMap[p.impacted_system_operator_id] ??
      String(p.impacted_system_operator_id),
    status: p.status,
    prequalifiedAt: toDateString(p.prequalified_at),
  }));
};

export const useSpgGridPrequalifications = (spgId: number | undefined) =>
  useQuery({
    queryKey: ["spg_grid_prequalifications", spgId],
    queryFn: () => fetchSpgGridPrequalifications(spgId ?? 0),
    enabled: !!spgId,
  });
