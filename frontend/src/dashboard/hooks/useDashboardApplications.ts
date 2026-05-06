// frontend/src/dashboard/useDashboardApplications.ts
import { useGetIdentity } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import {
  listServiceProviderProductApplication,
  listServiceProvidingGroupProductApplication,
  listServiceProvidingGroupGridPrequalification,
} from "../../generated-client";
import { useProductTypes } from "../../product_type/components";
import { throwOnError } from "../../util";

export type DashboardItemKind =
  | "sp_product_application"
  | "spg_product_application"
  | "spg_grid_prequalification";

export const ACTIVE_STATUSES = new Set(["requested", "in_progress"]);

export const RESOLVED_SPPA = new Set([
  "qualified",
  "not_qualified",
  "communication_test",
]);
export const RESOLVED_SPGPA = new Set([
  "prequalified",
  "verified",
  "temporary_qualified",
  "rejected",
  "prequalification_pending",
]);
export const RESOLVED_SPGGP = new Set([
  "approved",
  "conditionally_approved",
  "not_approved",
]);

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
          embed: "service_provider",
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
          embed: "service_providing_group(service_provider)",
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
          embed: "service_providing_group(service_provider)",
        },
      }).then(throwOnError),
  });

  const { data: allProductTypes, isLoading: ptLoading } = useProductTypes();

  const isLoading =
    sppaQuery.isLoading ||
    spgpaQuery.isLoading ||
    spggpQuery.isLoading ||
    ptLoading;

  const error = sppaQuery.error ?? spgpaQuery.error ?? spggpQuery.error;

  const getProductTypeNames = (ids: number[]) =>
    allProductTypes
      ?.filter((pt) => ids.includes(pt.id))
      .map((pt) => pt.name)
      .join(", ");

  const sppa =
    sppaQuery.data?.map((r) => ({
      id: r.id,
      kind: "sp_product_application" as DashboardItemKind,
      typeLabel: "Product Application",
      byline: getProductTypeNames(r.product_type_ids) || "",
      participant: r.service_provider?.name || "",
      status: r.status,
      route: `/service_provider_product_application/${r.id}/show`,
    })) || [];

  const spgpa =
    spgpaQuery.data?.map((r) => ({
      id: r.id,
      kind: "spg_product_application" as DashboardItemKind,
      typeLabel: "SPG Product Application",
      byline: `${r.service_providing_group?.name} (${getProductTypeNames(r.product_type_ids)})`,
      participant: r.procuring_system_operator?.name || "",
      status: r.status,
      route: `/service_providing_group/${r.service_providing_group_id}/product_application/${r.id}/show`,
    })) || [];

  const gridPrequalifications =
    spggpQuery.data?.map((r) => {
      return {
        id: r.id,
        kind: "spg_grid_prequalification" as DashboardItemKind,
        typeLabel: "SPG Grid Prequalification",
        byline: r.service_providing_group?.name || "",
        participant: r.service_providing_group?.name || "",
        status: r.status,
        route: `/service_providing_group/${r.service_providing_group_id}/grid_prequalification/${r.id}/show`,
      };
    }) || [];

  const activeItems: DashboardItem[] = [
    ...gridPrequalifications,
    ...spgpa,
    ...sppa,
  ].filter((item) => ACTIVE_STATUSES.has(item.status));
  const resolvedGridPrequalifications =
    gridPrequalifications?.filter((gp) => RESOLVED_SPGGP.has(gp.status)) || [];
  const resolvedSPPA =
    sppa?.filter((sppa) => RESOLVED_SPPA.has(sppa.status)) || [];
  const resolvedSPGPA =
    spgpa?.filter((spgpa) => RESOLVED_SPPA.has(spgpa.status)) || [];

  const resolvedItems: DashboardItem[] = [
    ...resolvedGridPrequalifications,
    ...resolvedSPPA,
    ...resolvedSPGPA,
  ];

  return {
    activeItems,
    resolvedItems,
    gridPrequalifications,
    spgpa,
    sppa,
    isLoading,
    error,
  };
};
