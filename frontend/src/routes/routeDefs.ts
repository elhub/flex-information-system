import { z } from "zod";
import { lazy, type ComponentType } from "react";
import type { RouteDef, ExtractParams, ExtractState } from "./types";

/** Helper to lazy-load a named export as if it were a default export. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyNamed<T extends Record<string, any>>(
  factory: () => Promise<T>,
  name: keyof T,
) {
  return lazy(() =>
    factory().then((m) => ({ default: m[name] as ComponentType })),
  );
}

export const routeDefs = {
  // === controllable_unit ===
  controllable_unit_list: {
    path: "/controllable_unit",
    access: "controllable_unit.read",
    component: lazyNamed(
      () => import("../controllable_unit/ControllableUnitList"),
      "ControllableUnitList",
    ),
  },
  controllable_unit_show: {
    path: "/controllable_unit/:id/show",
    params: z.object({ id: z.string() }),
    access: "controllable_unit.read",
    component: lazyNamed(
      () => import("../controllable_unit/show/ControllableUnitShow"),
      "ControllableUnitShow",
    ),
  },
  controllable_unit_create: {
    path: "/controllable_unit/create",
    locationState: z.object({
      controllableUnit: z.record(z.string(), z.unknown()).optional(),
      endUserId: z.number().optional(),
    }),
    access: "controllable_unit.create",
    component: lazy(
      () => import("../controllable_unit/ControllableUnitCreate"),
    ),
  },
  controllable_unit_edit: {
    path: "/controllable_unit/:id",
    params: z.object({ id: z.string() }),
    locationState: z.object({
      controllableUnit: z.record(z.string(), z.unknown()).optional(),
      endUserId: z.number().optional(),
    }),
    access: "controllable_unit.update",
    component: lazyNamed(
      () => import("../controllable_unit/ControllableUnitInput"),
      "ControllableUnitInput",
    ),
  },

  // --- controllable_unit > lookup ---
  cu_lookup: {
    path: "/controllable_unit/lookup",
    access: "controllable_unit.lookup",
    component: lazyNamed(
      () => import("../controllable_unit/lookup/ControllableUnitLookupInput"),
      "ControllableUnitLookupInput",
    ),
  },
  cu_lookup_result: {
    path: "/controllable_unit/lookup/result",
    access: "controllable_unit.lookup",
    component: lazyNamed(
      () => import("../controllable_unit/lookup/ControllableUnitLookupResult"),
      "ControllableUnitLookupResult",
    ),
  },
  cu_lookup_create: {
    path: "/controllable_unit/lookup/create",
    access: "controllable_unit.create",
    component: lazy(
      () => import("../controllable_unit/ControllableUnitCreate"),
    ),
  },

  // --- controllable_unit > history ---
  cu_history: {
    path: "/controllable_unit/:controllable_unit_id/history",
    params: z.object({ controllable_unit_id: z.string() }),
    access: "controllable_unit.read",
    component: lazyNamed(
      () => import("../controllable_unit/ControllableUnitHistoryList"),
      "ControllableUnitHistoryList",
    ),
  },

  // --- controllable_unit > suspension ---
  cu_suspension_list: {
    path: "/controllable_unit/:controllable_unit_id/suspension",
    params: z.object({ controllable_unit_id: z.string() }),
    access: "controllable_unit_suspension.read",
    component: lazyNamed(
      () =>
        import("../controllable_unit/suspension/ControllableUnitSuspensionList"),
      "ControllableUnitSuspensionList",
    ),
  },
  cu_suspension_create: {
    path: "/controllable_unit/:controllable_unit_id/suspension/create",
    params: z.object({ controllable_unit_id: z.string() }),
    locationState: z.object({
      cus: z.record(z.string(), z.unknown()).optional(),
    }),
    access: "controllable_unit_suspension.create",
    component: lazyNamed(
      () =>
        import("../controllable_unit/suspension/ControllableUnitSuspensionInput"),
      "ControllableUnitSuspensionInput",
    ),
  },
  cu_suspension_show: {
    path: "/controllable_unit/:controllable_unit_id/suspension/:id/show",
    params: z.object({
      controllable_unit_id: z.string(),
      id: z.string(),
    }),
    access: "controllable_unit_suspension.read",
    component: lazyNamed(
      () =>
        import("../controllable_unit/suspension/ControllableUnitSuspensionShow"),
      "ControllableUnitSuspensionShow",
    ),
  },
  cu_suspension_edit: {
    path: "/controllable_unit/:controllable_unit_id/suspension/:id",
    params: z.object({
      controllable_unit_id: z.string(),
      id: z.string(),
    }),
    locationState: z.object({
      cus: z.record(z.string(), z.unknown()).optional(),
    }),
    access: "controllable_unit_suspension.update",
    component: lazyNamed(
      () =>
        import("../controllable_unit/suspension/ControllableUnitSuspensionInput"),
      "ControllableUnitSuspensionInput",
    ),
  },
  cu_suspension_history: {
    path: "/controllable_unit/:controllable_unit_id/suspension_history",
    params: z.object({ controllable_unit_id: z.string() }),
    access: "controllable_unit_suspension.read",
    component: lazyNamed(
      () =>
        import("../controllable_unit/suspension/ControllableUnitSuspensionHistoryList"),
      "ControllableUnitSuspensionHistoryList",
    ),
  },
  cu_suspension_history_show: {
    path: "/controllable_unit/:controllable_unit_id/suspension_history/:id/show",
    params: z.object({
      controllable_unit_id: z.string(),
      id: z.string(),
    }),
    access: "controllable_unit_suspension.read",
    component: lazyNamed(
      () =>
        import("../controllable_unit/suspension/ControllableUnitSuspensionShow"),
      "ControllableUnitSuspensionShow",
    ),
  },

  // --- controllable_unit > suspension > comment ---
  cu_suspension_comment_show: {
    path: "/controllable_unit/:controllable_unit_id/suspension/:controllable_unit_suspension_id/comment/:id/show",
    params: z.object({
      controllable_unit_id: z.string(),
      controllable_unit_suspension_id: z.string(),
      id: z.string(),
    }),
    access: "controllable_unit_suspension_comment.read",
    component: lazyNamed(() => import("../components/comments"), "CommentShow"),
  },
  cu_suspension_comment_create: {
    path: "/controllable_unit/:controllable_unit_id/suspension/:controllable_unit_suspension_id/comment/create",
    params: z.object({
      controllable_unit_id: z.string(),
      controllable_unit_suspension_id: z.string(),
    }),
    access: "controllable_unit_suspension_comment.create",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentInput",
    ),
  },
  cu_suspension_comment_edit: {
    path: "/controllable_unit/:controllable_unit_id/suspension/:controllable_unit_suspension_id/comment/:id",
    params: z.object({
      controllable_unit_id: z.string(),
      controllable_unit_suspension_id: z.string(),
      id: z.string(),
    }),
    access: "controllable_unit_suspension_comment.update",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentInput",
    ),
  },
  cu_suspension_comment_history: {
    path: "/controllable_unit/:controllable_unit_id/suspension/:controllable_unit_suspension_id/comment_history",
    params: z.object({
      controllable_unit_id: z.string(),
      controllable_unit_suspension_id: z.string(),
    }),
    access: "controllable_unit_suspension_comment.read",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentHistoryList",
    ),
  },
  cu_suspension_comment_history_show: {
    path: "/controllable_unit/:controllable_unit_id/suspension/:controllable_unit_suspension_id/comment_history/:id/show",
    params: z.object({
      controllable_unit_id: z.string(),
      controllable_unit_suspension_id: z.string(),
      id: z.string(),
    }),
    access: "controllable_unit_suspension_comment.read",
    component: lazyNamed(() => import("../components/comments"), "CommentShow"),
  },

  // --- controllable_unit > service_provider ---
  cu_service_provider_list: {
    path: "/controllable_unit/:controllable_unit_id/service_provider",
    params: z.object({ controllable_unit_id: z.string() }),
    access: "controllable_unit_service_provider.read",
    component: lazyNamed(
      () =>
        import("../controllable_unit/service_provider/ControllableUnitServiceProviderList"),
      "ControllableUnitServiceProviderList",
    ),
  },
  cu_service_provider_show: {
    path: "/controllable_unit/:controllable_unit_id/service_provider/:id/show",
    params: z.object({
      controllable_unit_id: z.string(),
      id: z.string(),
    }),
    access: "controllable_unit_service_provider.read",
    component: lazyNamed(
      () =>
        import("../controllable_unit/service_provider/ControllableUnitServiceProviderShow"),
      "ControllableUnitServiceProviderShow",
    ),
  },
  cu_service_provider_create: {
    path: "/controllable_unit/:controllable_unit_id/service_provider/create",
    params: z.object({ controllable_unit_id: z.string() }),
    locationState: z.object({
      cusp: z.record(z.string(), z.unknown()).optional(),
      cuIDAsNumber: z.boolean().optional(),
    }),
    access: "controllable_unit_service_provider.create",
    component: lazyNamed(
      () =>
        import("../controllable_unit/service_provider/ControllableUnitServiceProviderInput"),
      "ControllableUnitServiceProviderInput",
    ),
  },
  cu_service_provider_edit: {
    path: "/controllable_unit/:controllable_unit_id/service_provider/:id",
    params: z.object({
      controllable_unit_id: z.string(),
      id: z.string(),
    }),
    locationState: z.object({
      cusp: z.record(z.string(), z.unknown()).optional(),
      cuIDAsNumber: z.boolean().optional(),
    }),
    access: "controllable_unit_service_provider.update",
    component: lazyNamed(
      () =>
        import("../controllable_unit/service_provider/ControllableUnitServiceProviderInput"),
      "ControllableUnitServiceProviderInput",
    ),
  },
  cu_service_provider_history: {
    path: "/controllable_unit/:controllable_unit_id/service_provider_history",
    params: z.object({ controllable_unit_id: z.string() }),
    access: "controllable_unit_service_provider.read",
    component: lazyNamed(
      () =>
        import("../controllable_unit/service_provider/ControllableUnitServiceProviderHistoryList"),
      "ControllableUnitServiceProviderHistoryList",
    ),
  },
  cu_service_provider_history_show: {
    path: "/controllable_unit/:controllable_unit_id/service_provider_history/:id/show",
    params: z.object({
      controllable_unit_id: z.string(),
      id: z.string(),
    }),
    access: "controllable_unit_service_provider.read",
    component: lazyNamed(
      () =>
        import("../controllable_unit/service_provider/ControllableUnitServiceProviderShow"),
      "ControllableUnitServiceProviderShow",
    ),
  },

  // --- controllable_unit > technical_resource ---
  cu_technical_resource_show: {
    path: "/controllable_unit/:controllable_unit_id/technical_resource/:id/show",
    params: z.object({
      controllable_unit_id: z.string(),
      id: z.string(),
    }),
    access: "technical_resource.read",
    component: lazyNamed(
      () =>
        import("../controllable_unit/technical_resource/TechnicalResourceShow"),
      "TechnicalResourceShow",
    ),
  },
  cu_technical_resource_create: {
    path: "/controllable_unit/:controllable_unit_id/technical_resource/create",
    params: z.object({ controllable_unit_id: z.string() }),
    locationState: z.object({
      technicalResource: z.record(z.string(), z.unknown()).optional(),
    }),
    access: "technical_resource.create",
    component: lazyNamed(
      () =>
        import("../controllable_unit/technical_resource/TechnicalResourceInput"),
      "TechnicalResourceInput",
    ),
  },
  cu_technical_resource_edit: {
    path: "/controllable_unit/:controllable_unit_id/technical_resource/:id",
    params: z.object({
      controllable_unit_id: z.string(),
      id: z.string(),
    }),
    locationState: z.object({
      technicalResource: z.record(z.string(), z.unknown()).optional(),
    }),
    access: "technical_resource.update",
    component: lazyNamed(
      () =>
        import("../controllable_unit/technical_resource/TechnicalResourceInput"),
      "TechnicalResourceInput",
    ),
  },
  cu_technical_resource_history: {
    path: "/controllable_unit/:controllable_unit_id/technical_resource_history",
    params: z.object({ controllable_unit_id: z.string() }),
    access: "technical_resource.read",
    component: lazyNamed(
      () =>
        import("../controllable_unit/technical_resource/TechnicalResourceHistoryList"),
      "TechnicalResourceHistoryList",
    ),
  },
  cu_technical_resource_history_show: {
    path: "/controllable_unit/:controllable_unit_id/technical_resource_history/:id/show",
    params: z.object({
      controllable_unit_id: z.string(),
      id: z.string(),
    }),
    access: "technical_resource.read",
    component: lazyNamed(
      () =>
        import("../controllable_unit/technical_resource/TechnicalResourceShow"),
      "TechnicalResourceShow",
    ),
  },

  // --- controllable_unit > balance_responsible_party ---
  cu_balance_responsible_party: {
    path: "/controllable_unit/:controllable_unit_id/balance_responsible_party",
    params: z.object({ controllable_unit_id: z.string() }),
    access: "controllable_unit.read",
    component: lazyNamed(
      () =>
        import("../controllable_unit/balance_responsible_party/ControllableUnitBalanceResponsiblePartyList"),
      "ControllableUnitBalanceResponsiblePartyList",
    ),
  },
} satisfies Record<string, RouteDef>;

export type RouteDefs = typeof routeDefs;
export type RouteName = keyof RouteDefs;

// Convenience types parameterized on the actual defs
export type RouteParams<K extends RouteName> = ExtractParams<RouteDefs[K]>;
export type RouteState<K extends RouteName> = ExtractState<RouteDefs[K]>;
