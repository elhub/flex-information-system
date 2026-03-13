import { useQuery } from "@tanstack/react-query";
import {
  listControllableUnit,
  listControllableUnitServiceProvider,
  listServiceProvidingGroupMembership,
  listTechnicalResource,
  readAccountingPoint,
  readParty,
  type ControllableUnit,
  type ControllableUnitServiceProvider,
} from "../generated-client";
import { throwOnError } from "../util";

export type SpgMembershipRow = {
  id: number;
  type: string;
  controllableUnitName: string;
  validFrom: string;
  validTo: string;
  capacityKw: number;
  technicalResourceName: string;
  direction: string;
  mpid: string;
  endUser: string;
  status: string;
  hasWarning: boolean;
};

type SpgContainsRow = {
  type: string;
  count: number;
  capacityKw: number;
};

export type SpgShowViewModel = {
  rows: SpgMembershipRow[];
  totalCapacityKw: number;
  productionCapacityKw: number;
  consumptionCapacityKw: number;
  containsRows: SpgContainsRow[];
};

const toDateString = (value: string | undefined) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
};

const isExpiredDate = (value: string | undefined) => {
  if (!value) {
    return false;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return parsed.getTime() < Date.now();
};

const formatResourceType = (name: string) => {
  if (!name) {
    return "-";
  }

  const normalized = name
    .replace(/[._-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();

  if (!normalized) {
    return "-";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const pickCurrentCusp = (cusps: ControllableUnitServiceProvider[]) => {
  const now = Date.now();

  const current = cusps.find((cusp) => {
    if (!cusp.valid_from) {
      return true;
    }

    const from = new Date(cusp.valid_from).getTime();
    const to = cusp.valid_to ? new Date(cusp.valid_to).getTime() : undefined;

    if (Number.isNaN(from)) {
      return false;
    }

    return (
      from <= now && (to === undefined || (!Number.isNaN(to) && to >= now))
    );
  });

  return current ?? cusps[0];
};

const toRegulationDirection = (
  value: ControllableUnit["regulation_direction"],
) => {
  if (value === "up") {
    return "Up";
  }

  if (value === "down") {
    return "Down";
  }

  if (value === "both") {
    return "Both";
  }

  return "-";
};

const buildContainsRows = (rows: SpgMembershipRow[]): SpgContainsRow[] => {
  const byType = new Map<string, SpgContainsRow>();

  for (const row of rows) {
    const existing = byType.get(row.type);
    if (existing) {
      existing.count += 1;
      existing.capacityKw += row.capacityKw;
      continue;
    }

    byType.set(row.type, {
      type: row.type,
      count: 1,
      capacityKw: row.capacityKw,
    });
  }

  return Array.from(byType.values()).sort(
    (a, b) => b.capacityKw - a.capacityKw,
  );
};

const fetchSpgShowData = async (serviceProvidingGroupId: number) => {
  const memberships = await listServiceProvidingGroupMembership({
    query: {
      service_providing_group_id: `eq.${serviceProvidingGroupId}`,
      order: "id.desc",
      limit: "200",
    },
  }).then(throwOnError);

  if (memberships.length === 0) {
    return {
      rows: [],
      totalCapacityKw: 0,
      productionCapacityKw: 0,
      consumptionCapacityKw: 0,
      containsRows: [],
    } satisfies SpgShowViewModel;
  }

  const controllableUnitIds = Array.from(
    new Set(memberships.map((membership) => membership.controllable_unit_id)),
  );

  const controllableUnits = await listControllableUnit({
    query: {
      id: `in.(${controllableUnitIds.join(",")})`,
      limit: "500",
    },
  }).then(throwOnError);

  const rows = await Promise.all(
    controllableUnits.map(async (controllableUnit) => {
      const [technicalResources, accountingPoint, cusps] = await Promise.all([
        listTechnicalResource({
          query: {
            controllable_unit_id: `eq.${controllableUnit.id}`,
            order: "id.asc",
            limit: "200",
          },
        }).then(throwOnError),
        readAccountingPoint({
          path: { id: controllableUnit.accounting_point_id },
        }).then(throwOnError),
        listControllableUnitServiceProvider({
          query: {
            controllable_unit_id: `eq.${controllableUnit.id}`,
            order: "valid_from.desc",
            limit: "20",
          },
        }).then(throwOnError),
      ]);

      const membership = memberships.find(
        (value) => value.controllable_unit_id === controllableUnit.id,
      );

      const cusp = pickCurrentCusp(cusps);
      const endUser = cusp
        ? await readParty({ path: { id: cusp.end_user_id } })
            .then(throwOnError)
            .then((party) => party.name)
            .catch(() => "-")
        : "-";

      const firstTechnicalResource = technicalResources[0];

      return {
        id: controllableUnit.id,
        type: formatResourceType(firstTechnicalResource?.name ?? ""),
        controllableUnitName: controllableUnit.name,
        validFrom: toDateString(membership?.valid_from),
        validTo: toDateString(membership?.valid_to),
        capacityKw: controllableUnit.maximum_active_power,
        technicalResourceName: firstTechnicalResource?.name ?? "-",
        direction: toRegulationDirection(controllableUnit.regulation_direction),
        mpid: accountingPoint.business_id,
        endUser,
        status: controllableUnit.status,
        hasWarning: isExpiredDate(membership?.valid_to),
      } satisfies SpgMembershipRow;
    }),
  );

  const totalCapacityKw = rows.reduce((sum, row) => sum + row.capacityKw, 0);

  const productionCapacityKw = controllableUnits
    .filter(
      (controllableUnit) =>
        controllableUnit.regulation_direction === "up" ||
        controllableUnit.regulation_direction === "both",
    )
    .reduce(
      (sum, controllableUnit) => sum + controllableUnit.maximum_active_power,
      0,
    );

  const consumptionCapacityKw = controllableUnits
    .filter(
      (controllableUnit) =>
        controllableUnit.regulation_direction === "down" ||
        controllableUnit.regulation_direction === "both",
    )
    .reduce(
      (sum, controllableUnit) => sum + controllableUnit.maximum_active_power,
      0,
    );

  return {
    rows,
    totalCapacityKw,
    productionCapacityKw,
    consumptionCapacityKw,
    containsRows: buildContainsRows(rows),
  } satisfies SpgShowViewModel;
};

type SpgRecord = {
  id: number;
};

export const spgShowViewModelQueryKey = (
  serviceProvidingGroup: SpgRecord | undefined,
) => ["serviceProvidingGroupShowViewModel", serviceProvidingGroup?.id];

export const useSpgShowViewModel = (
  serviceProvidingGroup: SpgRecord | undefined,
) =>
  useQuery({
    queryKey: spgShowViewModelQueryKey(serviceProvidingGroup),
    queryFn: () => fetchSpgShowData(serviceProvidingGroup?.id ?? 0),
    enabled: !!serviceProvidingGroup?.id,
  });
