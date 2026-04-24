// frontend/src/dashboard/useSpDashboard.ts
import { useGetIdentity } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  listServiceProviderProductApplication,
  listServiceProvidingGroupProductApplication,
  listServiceProvidingGroupGridPrequalification,
  listServiceProvidingGroup,
  listParty,
  listProductType,
  listNotice,
} from "../generated-client";
import { throwOnError } from "../util";
import {
  addMonths,
  ACTIVE_STATUSES,
  RESOLVED_SPPA,
  RESOLVED_SPGPA,
  RESOLVED_SPGGP,
} from "./dashboardUtils";
import { DashboardItemKind } from "./useDashboardApplications";

export type SpDashboardItem = {
  id: string | number;
  kind: DashboardItemKind;
  typeLabel: string;
  byline: string;
  systemOperator: string;
  dueDate: string;
  status: string;
  route: string;
};

export const useSpDashboard = () => {
  const { data: identity } = useGetIdentity();
  const partyID = identity?.partyID as number | undefined;

  // 1. Fetch SP product applications for this SP
  const sppaQuery = useQuery({
    queryKey: ["sp-dashboard-sppa", partyID],
    enabled: partyID != null,
    queryFn: () =>
      listServiceProviderProductApplication({
        query: { service_provider_id: `eq.${partyID}` },
      }).then(throwOnError),
  });

  // 2. Fetch SPGs for this SP (used for SPG-based apps + active count)
  const spgQuery = useQuery({
    queryKey: ["sp-dashboard-spg", partyID],
    enabled: partyID != null,
    queryFn: () =>
      listServiceProvidingGroup({
        query: { service_provider_id: `eq.${partyID}` },
      }).then(throwOnError),
  });

  const uniqueSpgIds = useMemo(
    () => (spgQuery.data ?? []).map((s) => s.id),
    [spgQuery.data],
  );

  // 3. Fetch SPG product applications
  const spgpaQuery = useQuery({
    queryKey: ["sp-dashboard-spgpa", uniqueSpgIds],
    enabled: uniqueSpgIds.length > 0,
    queryFn: () =>
      listServiceProvidingGroupProductApplication({
        query: { service_providing_group_id: `in.(${uniqueSpgIds.join(",")})` },
      }).then(throwOnError),
  });

  // 4. Fetch SPG grid prequalifications
  const spggpQuery = useQuery({
    queryKey: ["sp-dashboard-spggp", uniqueSpgIds],
    enabled: uniqueSpgIds.length > 0,
    queryFn: () =>
      listServiceProvidingGroupGridPrequalification({
        query: { service_providing_group_id: `in.(${uniqueSpgIds.join(",")})` },
      }).then(throwOnError),
  });

  // 5. Collect all SO party IDs for name resolution
  const allSoIds = useMemo(
    () => [
      ...new Set([
        ...(sppaQuery.data ?? []).map((r) => r.system_operator_id),
        ...(spgpaQuery.data ?? []).map((r) => r.procuring_system_operator_id),
        ...(spggpQuery.data ?? []).map((r) => r.impacted_system_operator_id),
      ]),
    ],
    [sppaQuery.data, spgpaQuery.data, spggpQuery.data],
  );

  const partyQuery = useQuery({
    queryKey: ["sp-dashboard-parties", allSoIds],
    enabled: allSoIds.length > 0,
    queryFn: () =>
      listParty({
        query: { id: `in.(${allSoIds.join(",")})` },
      }).then(throwOnError),
  });

  // 6. Collect product type IDs
  const uniquePtIds = useMemo(
    () => [
      ...new Set([
        ...(sppaQuery.data ?? []).flatMap((r) => r.product_type_ids),
        ...(spgpaQuery.data ?? []).flatMap((r) => r.product_type_ids),
      ]),
    ],
    [sppaQuery.data, spgpaQuery.data],
  );

  const ptQuery = useQuery({
    queryKey: ["sp-dashboard-product-types", uniquePtIds],
    enabled: uniquePtIds.length > 0,
    queryFn: () =>
      listProductType({
        query: { id: `in.(${uniquePtIds.join(",")})` },
      }).then(throwOnError),
  });

  // 7. Fetch notices for inconsistency count
  const noticeQuery = useQuery({
    queryKey: ["sp-dashboard-notices", partyID],
    enabled: partyID != null,
    queryFn: () =>
      listNotice({
        query: { party_id: `eq.${partyID}` },
      }).then(throwOnError),
  });

  const isLoading =
    sppaQuery.isLoading ||
    spgQuery.isLoading ||
    spgpaQuery.isLoading ||
    spggpQuery.isLoading ||
    partyQuery.isLoading ||
    ptQuery.isLoading ||
    noticeQuery.isLoading;

  const error =
    sppaQuery.error ??
    spgQuery.error ??
    spgpaQuery.error ??
    spggpQuery.error ??
    partyQuery.error ??
    ptQuery.error ??
    noticeQuery.error;

  // Build lookup maps
  const spgMap = new Map((spgQuery.data ?? []).map((s) => [s.id, s]));
  const partyMap = new Map(
    (partyQuery.data ?? []).map((p) => [p.id, p.name ?? String(p.id)]),
  );
  const ptMap = new Map(
    (ptQuery.data ?? []).map((pt) => [pt.id, pt.name ?? String(pt.id)]),
  );

  const ptNames = (ids: number[]) =>
    ids.map((id) => ptMap.get(id) ?? String(id)).join(", ");

  // Build all items
  const allItems: SpDashboardItem[] = [
    ...(sppaQuery.data ?? []).map((r) => ({
      id: `sppa-${r.id}`,
      kind: "sp_product_application" as DashboardItemKind,
      typeLabel: "Product Application",
      byline: ptNames(r.product_type_ids),
      systemOperator:
        partyMap.get(r.system_operator_id) ?? String(r.system_operator_id),
      dueDate: addMonths(r.recorded_at, 3),
      status: r.status,
      route: `/service_provider_product_application/${r.id}/show`,
    })),
    ...(spgpaQuery.data ?? []).map((r) => {
      const spg = spgMap.get(r.service_providing_group_id);
      const spgName = spg?.name ?? String(r.service_providing_group_id);
      return {
        id: `spgpa-${r.id}`,
        kind: "spg_product_application" as DashboardItemKind,
        typeLabel: "SPG Product Application",
        byline: [spgName, ptNames(r.product_type_ids)]
          .filter(Boolean)
          .join(" · "),
        systemOperator:
          partyMap.get(r.procuring_system_operator_id) ??
          String(r.procuring_system_operator_id),
        dueDate: addMonths(r.recorded_at, 3),
        status: r.status,
        route: `/service_providing_group/${r.service_providing_group_id}/product_application/${r.id}/show`,
      };
    }),
    ...(spggpQuery.data ?? []).map((r) => {
      const spg = spgMap.get(r.service_providing_group_id);
      const spgName = spg?.name ?? String(r.service_providing_group_id);
      return {
        id: `spggp-${r.id}`,
        kind: "spg_grid_prequalification" as DashboardItemKind,
        typeLabel: "SPG Grid Prequalification",
        byline: spgName,
        systemOperator:
          partyMap.get(r.impacted_system_operator_id) ??
          String(r.impacted_system_operator_id),
        dueDate: addMonths(r.recorded_at, 3),
        status: r.status,
        route: `/service_providing_group/${r.service_providing_group_id}/grid_prequalification/${r.id}/show`,
      };
    }),
  ];

  const activeItems = allItems.filter((item) =>
    ACTIVE_STATUSES.has(item.status),
  );
  const resolvedItems = allItems.filter((item) => {
    if (item.kind === "sp_product_application")
      return RESOLVED_SPPA.has(item.status);
    if (item.kind === "spg_product_application")
      return RESOLVED_SPGPA.has(item.status);
    return RESOLVED_SPGGP.has(item.status);
  });

  const pendingCount = activeItems.length;
  const activeSpgCount = (spgQuery.data ?? []).filter(
    (s) => s.status === "active",
  ).length;
  const inconsistencyCount = (noticeQuery.data ?? []).length;

  return {
    activeItems,
    resolvedItems,
    pendingCount,
    activeSpgCount,
    inconsistencyCount,
    isLoading,
    error,
  };
};
