// frontend/src/dashboard/useDashboardApplications.ts
import { useGetIdentity } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  listServiceProviderProductApplication,
  listServiceProvidingGroupProductApplication,
  listServiceProvidingGroupGridPrequalification,
} from "../generated-client";
import { useProductTypes } from "../product_type/components";
import { throwOnError } from "../util";
import {
  ACTIVE_STATUSES,
  RESOLVED_SPPA,
  RESOLVED_SPGPA,
  RESOLVED_SPGGP,
} from "./dashboardUtils";

export type DashboardItemKind =
  | "sp_product_application"
  | "spg_product_application"
  | "spg_grid_prequalification";

export type DashboardItem = {
  id: number;
  kind: DashboardItemKind;
  typeLabel: string;
  byline: string;
  participant: string;
  status: string;
  route: string;
};

export const useDashboardApplications = () => {
  const { data: identity } = useGetIdentity();
  const soId = identity?.partyID as number | undefined;

  const sppaQuery = useQuery({
    queryKey: ["dashboard-sppa", soId],
    enabled: soId != null,
    queryFn: () =>
      listServiceProviderProductApplication({
        query: {
          system_operator_id: `eq.${soId}`,
          embed: "service_provider,product_type",
        },
      }).then(throwOnError),
  });

  const spgpaQuery = useQuery({
    queryKey: ["dashboard-spgpa", soId],
    enabled: soId != null,
    queryFn: () =>
      listServiceProvidingGroupProductApplication({
        query: {
          procuring_system_operator_id: `eq.${soId}`,
          embed: "service_providing_group,product_type,service_provider",
        },
      }).then(throwOnError),
  });

  const spggpQuery = useQuery({
    queryKey: ["dashboard-spggp", soId],
    enabled: soId != null,
    queryFn: () =>
      listServiceProvidingGroupGridPrequalification({
        query: {
          impacted_system_operator_id: `eq.${soId}`,
          embed: "service_providing_group(service_provider)"
        },
      }).then(throwOnError),
  });

  const { data: allProductTypes, isLoading: ptLoading } = useProductTypes();

  const isLoading =
    sppaQuery.isLoading ||
    spgpaQuery.isLoading ||
    spggpQuery.isLoading ||
    ptLoading;

  const error =
    sppaQuery.error ?? spgpaQuery.error ?? spggpQuery.error;

  const getProductTypeNames = (ids: number[]) =>
    allProductTypes?.filter(pt => ids.includes(pt.id)).map(pt => pt.name).join(", ")

  const sppa = sppaQuery.data?.map((r) => ({
    id: r.id,
    kind: "sp_product_application" as DashboardItemKind,
    typeLabel: "Product Application",
    byline: getProductTypeNames(r.product_type_ids),
    participant: r.service_provider?.name || "",
    status: r.status,
    route: `/service_provider_product_application/${r.id}/show`,
  }));

  const spgpa = spgpaQuery.data?.map((r) => ({
    id: r.id,
    kind: "spg_product_application" as DashboardItemKind,
    typeLabel: "SPG Product Application",
    byline: `${r.service_providing_group?.name} (${getProductTypeNames(r.product_type_ids)})`,
    participant: r.procuring_system_operator?.name || "",
    status: r.status,
    route: `/service_providing_group/${r.service_providing_group_id}/product_application/${r.id}/show`,
  }));

  const gridPrequalifications = spggpQuery.data?.map((r) => {
    return {
      id: r.id,
      kind: "spg_grid_prequalification" as DashboardItemKind,
      typeLabel: "SPG Grid Prequalification",
      byline: r.service_providing_group?.name || "",
      participant: r.service_providing_group?.name || "",
      status: r.status,
      route: `/service_providing_group/${r.service_providing_group_id}/grid_prequalification/${r.id}/show`,
    };
  })

  const items = [...(sppa || []), ...(spgpa || []), ...(gridPrequalifications || [])]

  const activeItems = items.filter((item) => ACTIVE_STATUSES.has(item.status));

  const resolvedItems = items.filter((item) => {
    if (item.kind === "sp_product_application")
      return RESOLVED_SPPA.has(item.status);
    if (item.kind === "spg_product_application")
      return RESOLVED_SPGPA.has(item.status);
    return RESOLVED_SPGGP.has(item.status);
  });

  return { items: activeItems, activeItems, resolvedItems, isLoading, error };
};
