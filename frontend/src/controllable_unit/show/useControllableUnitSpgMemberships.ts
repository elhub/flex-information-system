import { useQuery } from "@tanstack/react-query";
import { listServiceProvidingGroupMembership } from "../../generated-client";
import { throwOnError } from "../../util";

const SPG_MEMBERSHIP_EMBED = "service_providing_group";

const fetchSpgMembershipsForControllableUnit = (controllableUnitId: number) =>
  listServiceProvidingGroupMembership({
    query: {
      controllable_unit_id: "eq." + controllableUnitId,
      embed: SPG_MEMBERSHIP_EMBED,
      order: "valid_from.desc",
    },
  }).then(throwOnError);

export const cuSpgMembershipsQueryKey = (controllableUnitId: number) => [
  "controllableUnitSpgMemberships",
  controllableUnitId,
];

export const useControllableUnitSpgMemberships = (controllableUnitId: number) =>
  useQuery({
    queryKey: cuSpgMembershipsQueryKey(controllableUnitId),
    queryFn: () => fetchSpgMembershipsForControllableUnit(controllableUnitId),
    enabled: !!controllableUnitId,
  });
