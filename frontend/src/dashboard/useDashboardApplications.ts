// frontend/src/dashboard/useDashboardApplications.ts
import { useGetIdentity } from "ra-core";
import { useQuery, } from "@tanstack/react-query";
import { useMemo } from "react";
import {
    listServiceProviderProductApplication,
    listServiceProvidingGroupProductApplication,
    listServiceProvidingGroupGridPrequalification,
    listServiceProvidingGroup,
    listParty,
    listProductType,
} from "../generated-client";
import { throwOnError } from "../util";

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
    dueDate: string;
    status: string;
    route: string;
};

const addMonths = (dateStr: string, months: number): string => {
    const d = new Date(dateStr);
    const originalDay = d.getDate();
    const targetMonth = d.getMonth() + months;
    d.setDate(1); // avoid overflow while setting month
    d.setMonth(targetMonth);
    // clamp to last day of target month
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(originalDay, lastDay));
    return d.toISOString().split("T")[0];
};

// Only show applications that are not yet resolved
const ACTIVE_STATUSES = new Set(["requested", "in_progress"]);

export const useDashboardApplications = () => {
    const { data: identity } = useGetIdentity();
    const soId = identity?.id as number | undefined;

    const sppaQuery = useQuery({
        queryKey: ["dashboard-sppa", soId],
        enabled: soId != null,
        queryFn: () =>
            listServiceProviderProductApplication({
                query: {
                    system_operator_id: `eq.${soId}`,
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
                },
            }).then(throwOnError),
    });

    // Collect all SPG IDs needed for name + service_provider_id lookups
    const uniqueSpgIds = useMemo(
        () => [...new Set([
            ...(spgpaQuery.data ?? []).map((r) => r.service_providing_group_id),
            ...(spggpQuery.data ?? []).map((r) => r.service_providing_group_id),
        ])],
        [spgpaQuery.data, spggpQuery.data],
    );

    const spgQuery = useQuery({
        queryKey: ["dashboard-spg", uniqueSpgIds],
        enabled: uniqueSpgIds.length > 0,
        queryFn: () =>
            listServiceProvidingGroup({
                query: { id: `in.(${uniqueSpgIds.join(",")})` },
            }).then(throwOnError),
    });

    // Collect all party IDs needed for participant name resolution
    const allPartyIds = useMemo(
        () => [...new Set([
            ...(sppaQuery.data ?? []).map((r) => r.service_provider_id),
            ...(spgQuery.data ?? []).map((r) => r.service_provider_id),
        ])],
        [sppaQuery.data, spgQuery.data],
    );

    const partyQuery = useQuery({
        queryKey: ["dashboard-parties", allPartyIds],
        enabled: allPartyIds.length > 0,
        queryFn: () =>
            listParty({
                query: { id: `in.(${allPartyIds.join(",")})` },
            }).then(throwOnError),
    });

    // Collect all product type IDs
    const uniquePtIds = useMemo(
        () => [...new Set([
            ...(sppaQuery.data ?? []).flatMap((r) => r.product_type_ids),
            ...(spgpaQuery.data ?? []).flatMap((r) => r.product_type_ids),
        ])],
        [sppaQuery.data, spgpaQuery.data],
    );

    const ptQuery = useQuery({
        queryKey: ["dashboard-product-types", uniquePtIds],
        enabled: uniquePtIds.length > 0,
        queryFn: () =>
            listProductType({
                query: { id: `in.(${uniquePtIds.join(",")})` },
            }).then(throwOnError),
    });

    const isLoading =
        sppaQuery.isLoading ||
        spgpaQuery.isLoading ||
        spggpQuery.isLoading ||
        spgQuery.isLoading ||
        partyQuery.isLoading ||
        ptQuery.isLoading;

    const error =
        sppaQuery.error ??
        spgpaQuery.error ??
        spggpQuery.error ??
        spgQuery.error ??
        partyQuery.error ??
        ptQuery.error;

    // Build lookup maps
    const spgMap = new Map(
        (spgQuery.data ?? []).map((s) => [s.id, s]),
    );
    const partyMap = new Map(
        (partyQuery.data ?? []).map((p) => [p.id, p.name ?? String(p.id)]),
    );
    const ptMap = new Map(
        (ptQuery.data ?? []).map((pt) => [pt.id, pt.name ?? String(pt.id)]),
    );

    const ptNames = (ids: number[]) =>
        ids.map((id) => ptMap.get(id) ?? String(id)).join(", ");

    const items: DashboardItem[] = [
        ...(sppaQuery.data ?? []).filter((r) => ACTIVE_STATUSES.has(r.status)).map((r) => ({
            id: r.id,
            kind: "sp_product_application" as DashboardItemKind,
            typeLabel: "Product Application",
            byline: ptNames(r.product_type_ids),
            participant: partyMap.get(r.service_provider_id) ?? String(r.service_provider_id),
            dueDate: addMonths(r.recorded_at, 3),
            status: r.status,
            route: `/service_provider_product_application/${r.id}/show`,
        })),
        ...(spgpaQuery.data ?? []).filter((r) => ACTIVE_STATUSES.has(r.status)).map((r) => {
            const spg = spgMap.get(r.service_providing_group_id);
            const spgName = spg?.name ?? String(r.service_providing_group_id);
            const spId = spg?.service_provider_id;
            return {
                id: r.id,
                kind: "spg_product_application" as DashboardItemKind,
                typeLabel: "SPG Product Application",
                byline: [spgName, ptNames(r.product_type_ids)].filter(Boolean).join(" · "),
                participant: spId ? (partyMap.get(spId) ?? String(spId)) : "",
                dueDate: addMonths(r.recorded_at, 3),
                status: r.status,
                route: `/service_providing_group/${r.service_providing_group_id}/product_application/${r.id}/show`,
            };
        }),
        ...(spggpQuery.data ?? []).filter((r) => ACTIVE_STATUSES.has(r.status)).map((r) => {
            const spg = spgMap.get(r.service_providing_group_id);
            const spgName = spg?.name ?? String(r.service_providing_group_id);
            const spId = spg?.service_provider_id;
            return {
                id: r.id,
                kind: "spg_grid_prequalification" as DashboardItemKind,
                typeLabel: "SPG Grid Prequalification",
                byline: spgName,
                participant: spId ? (partyMap.get(spId) ?? String(spId)) : "",
                dueDate: addMonths(r.recorded_at, 3),
                status: r.status,
                route: `/service_providing_group/${r.service_providing_group_id}/grid_prequalification/${r.id}/show`,
            };
        }),
    ];

    return { items, isLoading, error };
};
