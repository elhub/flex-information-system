import { useQuery } from "@tanstack/react-query";
import {
  listControllableUnit,
  listServiceProvidingGroupMembership,
} from "../../generated-client";
import type { AccountingPointBalanceResponsibleParty } from "../../generated-client";
import {
  findCurrentlyValidRecord,
  throwOnError,
  toDateString,
} from "../../util";

export type SpgMemberControllableUnitRow = {
  id: number;
  membershipId: number | undefined;
  name: string;
  validFrom: string;
  validTo: string;
  maximum_active_power: number;
  rated_power: number | undefined;
  location: string;
  regulation_direction: string;
  mpid: string;
  accountingPointId: number;
  brpName: string;
  status: string;
  // The current system operator of the CU's accounting point
  accountingPointSystemOperatorId: number | undefined;
  soName: string;
  membershipRecordedAt: string | undefined;
};

type SpgMemberControllableUnitsResult = {
  rows: SpgMemberControllableUnitRow[];
};

const fetchSpgMemberControllableUnits = async (
  serviceProvidingGroupId: number,
) => {
  const memberships = await listServiceProvidingGroupMembership({
    query: {
      service_providing_group_id: `eq.${serviceProvidingGroupId}`,
      order: "id.desc",
    },
  }).then(throwOnError);

  if (memberships.length === 0) {
    return {
      rows: [],
    } satisfies SpgMemberControllableUnitsResult;
  }

  const controllableUnitIds = Array.from(
    new Set(memberships.map((membership) => membership.controllable_unit_id)),
  );

  const controllableUnits = await listControllableUnit({
    query: {
      id: `in.(${controllableUnitIds.join(",")})`,
      embed:
        "summary,accounting_point!(system_operator, balance_responsible_party(balance_responsible_party))",
    },
  }).then(throwOnError);

  const rows: SpgMemberControllableUnitRow[] = controllableUnits.map((cu) => {
    const ap = cu.accounting_point;
    const membership = memberships.find(
      (m) => m.controllable_unit_id === cu.id,
    );
    const currentBrp = findCurrentlyValidRecord(
      ap?.balance_responsible_party as
        AccountingPointBalanceResponsibleParty[] | undefined,
    );

    return {
      id: cu.id,
      membershipId: membership?.id,
      name: cu.name,
      validFrom: toDateString(membership?.valid_from),
      validTo: toDateString(membership?.valid_to),
      maximum_active_power: cu.maximum_active_power,
      rated_power: cu.summary?.technical_resource?.maximum_active_power?.sum,
      regulation_direction: cu.regulation_direction,
      location: ap?.business_id ?? "-",
      mpid: ap?.business_id ?? "-",
      accountingPointId: cu.accounting_point_id,
      brpName: currentBrp?.balance_responsible_party?.name ?? "-",
      status: cu.status,
      accountingPointSystemOperatorId: ap?.system_operator_id,
      soName: ap?.system_operator?.name ?? "-",
      membershipRecordedAt: membership?.recorded_at,
    };
  });

  return {
    rows,
  } satisfies SpgMemberControllableUnitsResult;
};

export const spgMemberControllableUnitsQueryKey = (
  spgId: number | undefined,
) => ["spgMemberControllableUnits", spgId];

/**
 * Fetches the controllable units that are members of the given service
 * providing group, joined with their accounting point, balance responsible
 * party, and membership data. Shared across any view needing this base
 * per-CU data.
 */
export const useSpgMemberControllableUnits = (spgId: number | undefined) =>
  useQuery({
    queryKey: spgMemberControllableUnitsQueryKey(spgId),
    queryFn: () => fetchSpgMemberControllableUnits(spgId ?? 0),
    enabled: !!spgId,
  });
