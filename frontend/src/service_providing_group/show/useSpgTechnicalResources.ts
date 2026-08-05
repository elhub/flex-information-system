import { useQuery } from "@tanstack/react-query";
import {
  listControllableUnit,
  listServiceProvidingGroupMembership,
  listTechnicalResource,
  TechnicalResource,
} from "../../generated-client";
import { throwOnError } from "../../util";

export type SpgTechnicalResource = TechnicalResource & {
  controllable_unit_name: string;
};

const fetchSpgTechnicalResources = async (
  spgId: number,
): Promise<SpgTechnicalResource[]> => {
  const memberships = await listServiceProvidingGroupMembership({
    query: {
      service_providing_group_id: `eq.${spgId}`,
    },
  }).then(throwOnError);

  if (memberships.length === 0) return [];

  const controllableUnitIds = Array.from(
    new Set(memberships.map((m) => m.controllable_unit_id)),
  );

  const [controllableUnits, technicalResources] = await Promise.all([
    listControllableUnit({
      query: {
        id: `in.(${controllableUnitIds.join(",")})`,
      },
    }).then(throwOnError),
    listTechnicalResource({
      query: {
        controllable_unit_id: `in.(${controllableUnitIds.join(",")})`,
        order: "controllable_unit_id.asc,id.asc",
      },
    }).then(throwOnError),
  ]);

  const cuNameMap = Object.fromEntries(
    controllableUnits.map((cu) => [cu.id, cu.name]),
  );

  return technicalResources.map((tr) => ({
    ...tr,
    controllable_unit_name: cuNameMap[tr.controllable_unit_id] ?? "-",
  }));
};

export const useSpgTechnicalResources = (spgId: number) =>
  useQuery({
    queryKey: ["spg_technical_resources", spgId],
    queryFn: () => fetchSpgTechnicalResources(spgId),
    enabled: !!spgId,
  });
