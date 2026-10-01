import { useQuery } from "@tanstack/react-query";
import {
  listServiceProvidingGroupGridPrequalification,
  ServiceProvidingGroupGridPrequalification,
  ServiceProvidingGroupProductApplication,
} from "../../../generated-client";
import { isAtOrBefore, throwOnError } from "../../../util";
import {
  type SpgMemberControllableUnitRow,
  useSpgMemberControllableUnits,
} from "../../shared/useSpgMemberControllableUnits";

export type SpgpaControllableUnitRow = SpgMemberControllableUnitRow & {
  gridPrequalifiedAt: string | undefined;
  productApplicationPrequalifiedAt: string | undefined;
};

const getGridPrequalifiedAt = (
  membershipRecordedAt: string | undefined,
  gridPrequalification: ServiceProvidingGroupGridPrequalification | undefined,
): string | undefined =>
  gridPrequalification &&
  ["approved", "conditionally_approved"].includes(
    gridPrequalification.status,
  ) &&
  isAtOrBefore(membershipRecordedAt, gridPrequalification.prequalified_at)
    ? gridPrequalification.prequalified_at
    : undefined;

const getProductApplicationPrequalifiedAt = (
  membershipRecordedAt: string | undefined,
  productApplication: ServiceProvidingGroupProductApplication | undefined,
): string | undefined =>
  productApplication &&
  ["prequalified", "verified"].includes(productApplication.status) &&
  (isAtOrBefore(membershipRecordedAt, productApplication.verified_at) ||
    isAtOrBefore(membershipRecordedAt, productApplication.prequalified_at))
    ? (productApplication.verified_at ?? productApplication.prequalified_at)
    : undefined;

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

export const useSpgpaControllableUnits = (
  spgId: number | undefined,
  spgpa: ServiceProvidingGroupProductApplication | undefined,
) => {
  const baseQuery = useSpgMemberControllableUnits(spgId);
  const gridPrequalificationsQuery = useGridPrequalifications(spgId);

  const rows: SpgpaControllableUnitRow[] | undefined =
    baseQuery.data && gridPrequalificationsQuery.data
      ? baseQuery.data.rows
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
              ),
              productApplicationPrequalifiedAt:
                getProductApplicationPrequalifiedAt(
                  row.membershipRecordedAt,
                  spgpa,
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
    data: rows ? { rows } : undefined,
    isLoading: baseQuery.isLoading || gridPrequalificationsQuery.isLoading,
    error: baseQuery.error ?? gridPrequalificationsQuery.error,
  };
};
