import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  listAccountingPoint,
  listServiceProvidingGroupGridPrequalification,
  ServiceProvidingGroupGridPrequalification,
  ServiceProvidingGroupProductApplication,
} from "../../../generated-client";
import { isAtOrBefore, throwOnError, toDateString } from "../../../util";
import { fetchSnapshot } from "./useSpgChangesViewModel";

// Delay before a newly selected date is sent to the backend, so dragging
// the timeline slider doesn't fire a request for every mark passed.
const ASOF_DEBOUNCE_MS = 300;

export type SpgpaControllableUnitRow = {
  id: number;
  name: string;
  validFrom: string;
  validTo: string;
  maximum_active_power: number;
  regulation_direction: string;
  mpid: string;
  status: string;
  accountingPointId: number;
  accountingPointSystemOperatorId: number | undefined;
  soName: string;
  membershipRecordedAt: string | undefined;
  gridPrequalifiedAt: string | undefined;
  productApplicationPrequalifiedAt: string | undefined;
};

const getGridPrequalifiedAt = (
  membershipRecordedAt: string | undefined,
  gridPrequalification: ServiceProvidingGroupGridPrequalification | undefined,
  asOf: string,
): string | undefined =>
  gridPrequalification &&
  ["approved", "conditionally_approved"].includes(
    gridPrequalification.status,
  ) &&
  isAtOrBefore(membershipRecordedAt, gridPrequalification.prequalified_at) &&
  isAtOrBefore(gridPrequalification.prequalified_at, asOf)
    ? gridPrequalification.prequalified_at
    : undefined;

const getProductApplicationPrequalifiedAt = (
  membershipRecordedAt: string | undefined,
  productApplication: ServiceProvidingGroupProductApplication | undefined,
  asOf: string,
): string | undefined => {
  if (
    !productApplication ||
    !["prequalified", "verified"].includes(productApplication.status)
  ) {
    return undefined;
  }
  // The approval only counts once it had happened at `asOf`, and only if the
  // unit was already a member when it happened.
  const effectiveAt = [
    productApplication.verified_at,
    productApplication.prequalified_at,
  ].find(
    (at) => isAtOrBefore(membershipRecordedAt, at) && isAtOrBefore(at, asOf),
  );
  return effectiveAt;
};

const gridPrequalificationsQueryKey = (spgId: number | undefined) => [
  "spgpa_controllable_units_grid_prequalifications",
  spgId,
];

const useGridPrequalifications = (spgId: number | undefined) =>
  useQuery({
    queryKey: gridPrequalificationsQueryKey(spgId),
    queryFn: () =>
      listServiceProvidingGroupGridPrequalification({
        query: {
          service_providing_group_id: `eq.${spgId}`,
        },
      }).then(throwOnError),
    enabled: !!spgId,
  });

const useDebouncedValue = <T>(value: T, delayMs: number): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
};

// The members of the group, and how each controllable unit looked, at the
// given point in time. Accounting point details (MPID, system operator) are
// not historized in the same way and are always the current values.
const fetchMembersAsOf = async (spgId: number, asOf: string) => {
  const snapshot = await fetchSnapshot(spgId, asOf);
  const memberships = Array.from(snapshot.values());
  if (memberships.length === 0) return { asOf, rows: [] };

  const accountingPointIds = Array.from(
    new Set(
      memberships.flatMap(
        (m) => m.controllable_unit_history?.[0]?.accounting_point_id ?? [],
      ),
    ),
  );
  const accountingPoints = await listAccountingPoint({
    query: {
      id: `in.(${accountingPointIds.join(",")})`,
      embed: "system_operator",
    },
  }).then(throwOnError);

  const rows = memberships.flatMap((membership) => {
    const cu = membership.controllable_unit_history?.[0];
    if (!cu) return [];
    const ap = accountingPoints.find((a) => a.id === cu.accounting_point_id);
    return [
      {
        id: membership.controllable_unit_id,
        name: cu.name,
        validFrom: toDateString(membership.valid_from),
        validTo: toDateString(membership.valid_to),
        maximum_active_power: cu.maximum_active_power,
        regulation_direction: cu.regulation_direction,
        mpid: ap?.business_id ?? "-",
        status: cu.status,
        accountingPointId: cu.accounting_point_id,
        accountingPointSystemOperatorId: ap?.system_operator_id,
        soName: ap?.system_operator?.name ?? "-",
        membershipRecordedAt: membership.recorded_at,
      },
    ];
  });
  return { asOf, rows };
};

const membersAsOfQueryKey = (spgId: number | undefined, asOf: string) => [
  "spgpa_controllable_units_as_of",
  spgId,
  asOf,
];

export const useSpgpaControllableUnits = (
  spgId: number | undefined,
  spgpa: ServiceProvidingGroupProductApplication | undefined,
  asOf: string,
) => {
  const debouncedAsOf = useDebouncedValue(asOf, ASOF_DEBOUNCE_MS);
  const membersQuery = useQuery({
    queryKey: membersAsOfQueryKey(spgId, debouncedAsOf),
    queryFn: () => fetchMembersAsOf(spgId ?? 0, debouncedAsOf),
    enabled: !!spgId,
    placeholderData: keepPreviousData,
  });
  const gridPrequalificationsQuery = useGridPrequalifications(spgId);

  // The date the shown members belong to, so approvals change together with
  // the rows and not ahead of them while a new date is loading.
  const shownAsOf = membersQuery.data?.asOf;

  const rows: SpgpaControllableUnitRow[] | undefined =
    membersQuery.data && shownAsOf && gridPrequalificationsQuery.data
      ? membersQuery.data.rows
          .map((row) => {
            const gridPrequalification = gridPrequalificationsQuery.data.find(
              (gp) =>
                gp.impacted_system_operator_id ===
                row.accountingPointSystemOperatorId,
            );

            return {
              ...row,
              gridPrequalifiedAt: getGridPrequalifiedAt(
                row.membershipRecordedAt,
                gridPrequalification,
                shownAsOf,
              ),
              productApplicationPrequalifiedAt:
                getProductApplicationPrequalifiedAt(
                  row.membershipRecordedAt,
                  spgpa,
                  shownAsOf,
                ),
            };
          })
          .sort(
            (a, b) =>
              new Date(b.membershipRecordedAt ?? 0).getTime() -
              new Date(a.membershipRecordedAt ?? 0).getTime(),
          )
      : undefined;

  return {
    // `asOf` is the date the returned rows belong to, which lags behind the
    // selected date while a new date is loading.
    data: rows ? { rows, asOf: membersQuery.data?.asOf } : undefined,
    // True only until the first data has arrived.
    isInitialLoading:
      membersQuery.isLoading || gridPrequalificationsQuery.isLoading,
    // True whenever the shown data does not (yet) match the selected date.
    isLoading:
      membersQuery.isLoading ||
      membersQuery.isPlaceholderData ||
      debouncedAsOf !== asOf ||
      gridPrequalificationsQuery.isLoading,
    error: membersQuery.error ?? gridPrequalificationsQuery.error,
  };
};
