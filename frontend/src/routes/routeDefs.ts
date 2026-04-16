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

  // --- controllable_unit_service_provider (standalone) ---
  cu_sp_standalone_list: {
    path: "/controllable_unit_service_provider",
    access: "controllable_unit_service_provider.read",
    component: lazyNamed(
      () =>
        import("../controllable_unit/service_provider/ControllableUnitServiceProviderList"),
      "ControllableUnitServiceProviderList",
    ),
  },
  cu_sp_standalone_show: {
    path: "/controllable_unit_service_provider/:id/show",
    params: z.object({ id: z.string() }),
    access: "controllable_unit_service_provider.read",
    component: lazyNamed(
      () =>
        import("../controllable_unit/service_provider/ControllableUnitServiceProviderShow"),
      "ControllableUnitServiceProviderShow",
    ),
  },
  cu_sp_standalone_create: {
    path: "/controllable_unit_service_provider/create",
    access: "controllable_unit_service_provider.create",
    component: lazyNamed(
      () =>
        import("../controllable_unit/service_provider/ControllableUnitServiceProviderInput"),
      "ControllableUnitServiceProviderInput",
    ),
  },

  // --- controllable_unit_suspension (standalone) ---
  cu_suspension_standalone_list: {
    path: "/controllable_unit_suspension",
    access: "controllable_unit_suspension.read",
    component: lazyNamed(
      () =>
        import("../controllable_unit/suspension/ControllableUnitSuspensionList"),
      "ControllableUnitSuspensionList",
    ),
  },
  cu_suspension_standalone_show: {
    path: "/controllable_unit_suspension/:id/show",
    params: z.object({ id: z.string() }),
    access: "controllable_unit_suspension.read",
    component: lazyNamed(
      () =>
        import("../controllable_unit/suspension/ControllableUnitSuspensionShow"),
      "ControllableUnitSuspensionShow",
    ),
  },
  cu_suspension_standalone_create: {
    path: "/controllable_unit_suspension/create",
    access: "controllable_unit_suspension.create",
    component: lazyNamed(
      () =>
        import("../controllable_unit/suspension/ControllableUnitSuspensionInput"),
      "ControllableUnitSuspensionInput",
    ),
  },
  cu_suspension_standalone_history: {
    path: "/controllable_unit_suspension/:controllable_unit_suspension_id/history",
    params: z.object({ controllable_unit_suspension_id: z.string() }),
    access: "controllable_unit_suspension.read",
    component: lazyNamed(
      () =>
        import("../controllable_unit/suspension/ControllableUnitSuspensionHistoryList"),
      "ControllableUnitSuspensionHistoryList",
    ),
  },
  cu_suspension_standalone_history_show: {
    path: "/controllable_unit_suspension/:controllable_unit_suspension_id/history/:id/show",
    params: z.object({
      controllable_unit_suspension_id: z.string(),
      id: z.string(),
    }),
    access: "controllable_unit_suspension.read",
    component: lazyNamed(
      () =>
        import("../controllable_unit/suspension/ControllableUnitSuspensionShow"),
      "ControllableUnitSuspensionShow",
    ),
  },

  // === party ===
  party_list: {
    path: "/party",
    access: "party.read",
    component: lazyNamed(() => import("../party/PartyList"), "PartyList"),
  },
  party_show: {
    path: "/party/:id/show",
    params: z.object({ id: z.string() }),
    access: "party.read",
    component: lazyNamed(() => import("../party/PartyShow"), "PartyShow"),
  },
  party_create: {
    path: "/party/create",
    access: "party.create",
    component: lazyNamed(() => import("../party/PartyInput"), "PartyInput"),
  },
  party_edit: {
    path: "/party/:id",
    params: z.object({ id: z.string() }),
    access: "party.update",
    component: lazyNamed(() => import("../party/PartyInput"), "PartyInput"),
  },

  // --- party > history ---
  party_history: {
    path: "/party/:party_id/history",
    params: z.object({ party_id: z.string() }),
    access: "party.read",
    component: lazyNamed(
      () => import("../party/PartyHistoryList"),
      "PartyHistoryList",
    ),
  },
  party_history_show: {
    path: "/party/:party_id/history/:id/show",
    params: z.object({ party_id: z.string(), id: z.string() }),
    access: "party.read",
    component: lazyNamed(() => import("../party/PartyShow"), "PartyShow"),
  },

  // --- party > membership ---
  party_membership_show: {
    path: "/party/:party_id/membership/:id/show",
    params: z.object({ party_id: z.string(), id: z.string() }),
    access: "party.read",
    component: lazyNamed(
      () => import("../party/membership/PartyMembershipShow"),
      "PartyMembershipShow",
    ),
  },
  party_membership_create: {
    path: "/party/:party_id/membership/create",
    params: z.object({ party_id: z.string() }),
    access: "party.read",
    component: lazyNamed(
      () => import("../party/membership/PartyMembershipInput"),
      "PartyMembershipInput",
    ),
  },
  party_membership_edit: {
    path: "/party/:party_id/membership/:id",
    params: z.object({ party_id: z.string(), id: z.string() }),
    access: "party.read",
    component: lazyNamed(
      () => import("../party/membership/PartyMembershipInput"),
      "PartyMembershipInput",
    ),
  },
  party_membership_history: {
    path: "/party/:party_id/membership_history",
    params: z.object({ party_id: z.string() }),
    access: "party.read",
    component: lazyNamed(
      () => import("../party/membership/PartyMembershipHistoryList"),
      "PartyMembershipHistoryList",
    ),
  },
  party_membership_history_show: {
    path: "/party/:party_id/membership_history/:id/show",
    params: z.object({ party_id: z.string(), id: z.string() }),
    access: "party.read",
    component: lazyNamed(
      () => import("../party/membership/PartyMembershipShow"),
      "PartyMembershipShow",
    ),
  },

  // === entity ===
  entity_list: {
    path: "/entity",
    access: "entity.read",
    component: lazyNamed(() => import("../entity/EntityList"), "EntityList"),
  },
  entity_show: {
    path: "/entity/:id/show",
    params: z.object({ id: z.string() }),
    access: "entity.read",
    component: lazyNamed(() => import("../entity/EntityShow"), "EntityShow"),
  },
  entity_create: {
    path: "/entity/create",
    access: "entity.create",
    component: lazyNamed(() => import("../entity/EntityInput"), "EntityInput"),
  },
  entity_edit: {
    path: "/entity/:id",
    params: z.object({ id: z.string() }),
    access: "entity.update",
    component: lazyNamed(() => import("../entity/EntityInput"), "EntityInput"),
  },

  // --- entity > lookup ---
  entity_lookup: {
    path: "/entity/lookup",
    access: "entity.read",
    component: lazyNamed(
      () => import("../entity/lookup/EntityLookupInput"),
      "EntityLookupInput",
    ),
  },

  // --- entity > client ---
  entity_client_show: {
    path: "/entity/:entity_id/client/:id/show",
    params: z.object({ entity_id: z.string(), id: z.string() }),
    access: "entity.read",
    component: lazyNamed(
      () => import("../entity/client/EntityClientShow"),
      "EntityClientShow",
    ),
  },
  entity_client_create: {
    path: "/entity/:entity_id/client/create",
    params: z.object({ entity_id: z.string() }),
    access: "entity.read",
    component: lazyNamed(
      () => import("../entity/client/EntityClientInput"),
      "EntityClientInput",
    ),
  },
  entity_client_edit: {
    path: "/entity/:entity_id/client/:id",
    params: z.object({ entity_id: z.string(), id: z.string() }),
    access: "entity.read",
    component: lazyNamed(
      () => import("../entity/client/EntityClientInput"),
      "EntityClientInput",
    ),
  },

  // === accounting_point ===
  accounting_point_list: {
    path: "/accounting_point",
    access: "accounting_point.read",
    component: lazyNamed(
      () => import("../accounting_point/AccountingPointList"),
      "AccountingPointList",
    ),
  },
  accounting_point_show: {
    path: "/accounting_point/:id/show",
    params: z.object({ id: z.string() }),
    access: "accounting_point.read",
    component: lazyNamed(
      () => import("../accounting_point/show/AccountingPointShow"),
      "AccountingPointShow",
    ),
  },

  // === service_providing_group ===
  spg_list: {
    path: "/service_providing_group",
    access: "service_providing_group.read",
    component: lazyNamed(
      () => import("../service_providing_group/ServiceProvidingGroupList"),
      "ServiceProvidingGroupList",
    ),
  },
  spg_show: {
    path: "/service_providing_group/:id/show",
    params: z.object({ id: z.string() }),
    access: "service_providing_group.read",
    component: lazyNamed(
      () => import("../service_providing_group/show/ServiceProvidingGroupShow"),
      "ServiceProvidingGroupShow",
    ),
  },
  spg_create: {
    path: "/service_providing_group/create",
    access: "service_providing_group.create",
    component: lazyNamed(
      () =>
        import("../service_providing_group/input/ServiceProvidingGroupCreate"),
      "ServiceProvidingGroupCreate",
    ),
  },
  spg_edit: {
    path: "/service_providing_group/:id",
    params: z.object({ id: z.string() }),
    access: "service_providing_group.update",
    component: lazyNamed(
      () =>
        import("../service_providing_group/input/ServiceProvidingGroupInput"),
      "ServiceProvidingGroupInput",
    ),
  },
  spg_manage_members: {
    path: "/service_providing_group/:id/manage-members",
    params: z.object({ id: z.string() }),
    access: "service_providing_group.update",
    component: lazyNamed(
      () =>
        import("../service_providing_group/input/ServiceProvidingGroupManageMembers"),
      "ServiceProvidingGroupManageMembers",
    ),
  },
  spg_activate: {
    path: "/service_providing_group/:id/activate",
    params: z.object({ id: z.string() }),
    access: "service_providing_group.update",
    component: lazyNamed(
      () =>
        import("../service_providing_group/input/ServiceProvidingGroupActivate"),
      "ServiceProvidingGroupActivate",
    ),
  },

  // --- spg > history ---
  spg_history: {
    path: "/service_providing_group/:service_providing_group_id/history",
    params: z.object({ service_providing_group_id: z.string() }),
    access: "service_providing_group.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/ServiceProvidingGroupHistoryList"),
      "ServiceProvidingGroupHistoryList",
    ),
  },
  spg_history_show: {
    path: "/service_providing_group/:service_providing_group_id/history/:id/show",
    params: z.object({
      service_providing_group_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group.read",
    component: lazyNamed(
      () => import("../service_providing_group/show/ServiceProvidingGroupShow"),
      "ServiceProvidingGroupShow",
    ),
  },

  // --- spg > membership (nested) ---
  spg_membership_show: {
    path: "/service_providing_group/:service_providing_group_id/membership/:id/show",
    params: z.object({
      service_providing_group_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_membership.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/membership/ServiceProvidingGroupMembershipShow"),
      "ServiceProvidingGroupMembershipShow",
    ),
  },
  spg_membership_create: {
    path: "/service_providing_group/:service_providing_group_id/membership/create",
    params: z.object({ service_providing_group_id: z.string() }),
    access: "service_providing_group_membership.create",
    component: lazyNamed(
      () =>
        import("../service_providing_group/membership/ServiceProvidingGroupMembershipInput"),
      "ServiceProvidingGroupMembershipInput",
    ),
  },
  spg_membership_edit: {
    path: "/service_providing_group/:service_providing_group_id/membership/:id",
    params: z.object({
      service_providing_group_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_membership.update",
    component: lazyNamed(
      () =>
        import("../service_providing_group/membership/ServiceProvidingGroupMembershipInput"),
      "ServiceProvidingGroupMembershipInput",
    ),
  },
  spg_membership_history: {
    path: "/service_providing_group/:service_providing_group_id/membership_history",
    params: z.object({ service_providing_group_id: z.string() }),
    access: "service_providing_group_membership.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/membership/ServiceProvidingGroupMembershipHistoryList"),
      "ServiceProvidingGroupMembershipHistoryList",
    ),
  },
  spg_membership_history_show: {
    path: "/service_providing_group/:service_providing_group_id/membership_history/:id/show",
    params: z.object({
      service_providing_group_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_membership.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/membership/ServiceProvidingGroupMembershipShow"),
      "ServiceProvidingGroupMembershipShow",
    ),
  },

  // --- spg > grid_prequalification (nested) ---
  spg_grid_prequalification_show: {
    path: "/service_providing_group/:service_providing_group_id/grid_prequalification/:id/show",
    params: z.object({
      service_providing_group_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_grid_prequalification.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationShow"),
      "ServiceProvidingGroupGridPrequalificationShow",
    ),
  },
  spg_grid_prequalification_create: {
    path: "/service_providing_group/:service_providing_group_id/grid_prequalification/create",
    params: z.object({ service_providing_group_id: z.string() }),
    access: "service_providing_group_grid_prequalification.create",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationInput"),
      "ServiceProvidingGroupGridPrequalificationInput",
    ),
  },
  spg_grid_prequalification_edit: {
    path: "/service_providing_group/:service_providing_group_id/grid_prequalification/:id",
    params: z.object({
      service_providing_group_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_grid_prequalification.update",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationInput"),
      "ServiceProvidingGroupGridPrequalificationInput",
    ),
  },
  spg_grid_prequalification_history: {
    path: "/service_providing_group/:service_providing_group_id/grid_prequalification_history",
    params: z.object({ service_providing_group_id: z.string() }),
    access: "service_providing_group_grid_prequalification.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationHistoryList"),
      "ServiceProvidingGroupGridPrequalificationHistoryList",
    ),
  },
  spg_grid_prequalification_history_show: {
    path: "/service_providing_group/:service_providing_group_id/grid_prequalification_history/:id/show",
    params: z.object({
      service_providing_group_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_grid_prequalification.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationShow"),
      "ServiceProvidingGroupGridPrequalificationShow",
    ),
  },

  // --- spg > grid_prequalification > comment ---
  spg_grid_prequalification_comment_show: {
    path: "/service_providing_group/:service_providing_group_id/grid_prequalification/:service_providing_group_grid_prequalification_id/comment/:id/show",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_grid_prequalification_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_grid_prequalification_comment.read",
    component: lazyNamed(() => import("../components/comments"), "CommentShow"),
  },
  spg_grid_prequalification_comment_create: {
    path: "/service_providing_group/:service_providing_group_id/grid_prequalification/:service_providing_group_grid_prequalification_id/comment/create",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_grid_prequalification_id: z.string(),
    }),
    access: "service_providing_group_grid_prequalification_comment.create",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentInput",
    ),
  },
  spg_grid_prequalification_comment_edit: {
    path: "/service_providing_group/:service_providing_group_id/grid_prequalification/:service_providing_group_grid_prequalification_id/comment/:id",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_grid_prequalification_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_grid_prequalification_comment.update",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentInput",
    ),
  },
  spg_grid_prequalification_comment_history: {
    path: "/service_providing_group/:service_providing_group_id/grid_prequalification/:service_providing_group_grid_prequalification_id/comment_history",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_grid_prequalification_id: z.string(),
    }),
    access: "service_providing_group_grid_prequalification_comment.read",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentHistoryList",
    ),
  },
  spg_grid_prequalification_comment_history_show: {
    path: "/service_providing_group/:service_providing_group_id/grid_prequalification/:service_providing_group_grid_prequalification_id/comment_history/:id/show",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_grid_prequalification_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_grid_prequalification_comment.read",
    component: lazyNamed(() => import("../components/comments"), "CommentShow"),
  },

  // --- spg > product_application (nested) ---
  spg_product_application_show: {
    path: "/service_providing_group/:service_providing_group_id/product_application/:id/show",
    params: z.object({
      service_providing_group_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_product_application.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_application/ServiceProvidingGroupProductApplicationShow"),
      "ServiceProvidingGroupProductApplicationShow",
    ),
  },
  spg_product_application_create: {
    path: "/service_providing_group/:service_providing_group_id/product_application/create",
    params: z.object({ service_providing_group_id: z.string() }),
    access: "service_providing_group_product_application.create",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_application/ServiceProvidingGroupProductApplicationInput"),
      "ServiceProvidingGroupProductApplicationInput",
    ),
  },
  spg_product_application_edit: {
    path: "/service_providing_group/:service_providing_group_id/product_application/:id",
    params: z.object({
      service_providing_group_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_product_application.update",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_application/ServiceProvidingGroupProductApplicationInput"),
      "ServiceProvidingGroupProductApplicationInput",
    ),
  },
  spg_product_application_history: {
    path: "/service_providing_group/:service_providing_group_id/product_application_history",
    params: z.object({ service_providing_group_id: z.string() }),
    access: "service_providing_group_product_application.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_application/ServiceProvidingGroupProductApplicationHistoryList"),
      "ServiceProvidingGroupProductApplicationHistoryList",
    ),
  },
  spg_product_application_history_show: {
    path: "/service_providing_group/:service_providing_group_id/product_application_history/:id/show",
    params: z.object({
      service_providing_group_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_product_application.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_application/ServiceProvidingGroupProductApplicationShow"),
      "ServiceProvidingGroupProductApplicationShow",
    ),
  },

  // --- spg > product_application > comment ---
  spg_product_application_comment_show: {
    path: "/service_providing_group/:service_providing_group_id/product_application/:service_providing_group_product_application_id/comment/:id/show",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_product_application_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_product_application_comment.read",
    component: lazyNamed(() => import("../components/comments"), "CommentShow"),
  },
  spg_product_application_comment_create: {
    path: "/service_providing_group/:service_providing_group_id/product_application/:service_providing_group_product_application_id/comment/create",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_product_application_id: z.string(),
    }),
    access: "service_providing_group_product_application_comment.create",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentInput",
    ),
  },
  spg_product_application_comment_edit: {
    path: "/service_providing_group/:service_providing_group_id/product_application/:service_providing_group_product_application_id/comment/:id",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_product_application_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_product_application_comment.update",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentInput",
    ),
  },
  spg_product_application_comment_history: {
    path: "/service_providing_group/:service_providing_group_id/product_application/:service_providing_group_product_application_id/comment_history",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_product_application_id: z.string(),
    }),
    access: "service_providing_group_product_application_comment.read",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentHistoryList",
    ),
  },
  spg_product_application_comment_history_show: {
    path: "/service_providing_group/:service_providing_group_id/product_application/:service_providing_group_product_application_id/comment_history/:id/show",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_product_application_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_product_application_comment.read",
    component: lazyNamed(() => import("../components/comments"), "CommentShow"),
  },

  // --- spg > grid_suspension (nested) ---
  spg_grid_suspension_show: {
    path: "/service_providing_group/:service_providing_group_id/grid_suspension/:id/show",
    params: z.object({
      service_providing_group_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_grid_suspension.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_suspension/ServiceProvidingGroupGridSuspensionShow"),
      "ServiceProvidingGroupGridSuspensionShow",
    ),
  },
  spg_grid_suspension_create: {
    path: "/service_providing_group/:service_providing_group_id/grid_suspension/create",
    params: z.object({ service_providing_group_id: z.string() }),
    access: "service_providing_group_grid_suspension.create",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_suspension/ServiceProvidingGroupGridSuspensionInput"),
      "ServiceProvidingGroupGridSuspensionInput",
    ),
  },
  spg_grid_suspension_edit: {
    path: "/service_providing_group/:service_providing_group_id/grid_suspension/:id",
    params: z.object({
      service_providing_group_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_grid_suspension.update",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_suspension/ServiceProvidingGroupGridSuspensionInput"),
      "ServiceProvidingGroupGridSuspensionInput",
    ),
  },
  spg_grid_suspension_history: {
    path: "/service_providing_group/:service_providing_group_id/grid_suspension_history",
    params: z.object({ service_providing_group_id: z.string() }),
    access: "service_providing_group_grid_suspension.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_suspension/ServiceProvidingGroupGridSuspensionHistoryList"),
      "ServiceProvidingGroupGridSuspensionHistoryList",
    ),
  },
  spg_grid_suspension_history_show: {
    path: "/service_providing_group/:service_providing_group_id/grid_suspension_history/:id/show",
    params: z.object({
      service_providing_group_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_grid_suspension.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_suspension/ServiceProvidingGroupGridSuspensionShow"),
      "ServiceProvidingGroupGridSuspensionShow",
    ),
  },

  // --- spg > grid_suspension > comment ---
  spg_grid_suspension_comment_show: {
    path: "/service_providing_group/:service_providing_group_id/grid_suspension/:service_providing_group_grid_suspension_id/comment/:id/show",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_grid_suspension_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_grid_suspension_comment.read",
    component: lazyNamed(() => import("../components/comments"), "CommentShow"),
  },
  spg_grid_suspension_comment_create: {
    path: "/service_providing_group/:service_providing_group_id/grid_suspension/:service_providing_group_grid_suspension_id/comment/create",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_grid_suspension_id: z.string(),
    }),
    access: "service_providing_group_grid_suspension_comment.create",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentInput",
    ),
  },
  spg_grid_suspension_comment_edit: {
    path: "/service_providing_group/:service_providing_group_id/grid_suspension/:service_providing_group_grid_suspension_id/comment/:id",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_grid_suspension_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_grid_suspension_comment.update",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentInput",
    ),
  },
  spg_grid_suspension_comment_history: {
    path: "/service_providing_group/:service_providing_group_id/grid_suspension/:service_providing_group_grid_suspension_id/comment_history",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_grid_suspension_id: z.string(),
    }),
    access: "service_providing_group_grid_suspension_comment.read",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentHistoryList",
    ),
  },
  spg_grid_suspension_comment_history_show: {
    path: "/service_providing_group/:service_providing_group_id/grid_suspension/:service_providing_group_grid_suspension_id/comment_history/:id/show",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_grid_suspension_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_grid_suspension_comment.read",
    component: lazyNamed(() => import("../components/comments"), "CommentShow"),
  },

  // --- spg > product_suspension (nested) ---
  spg_product_suspension_show: {
    path: "/service_providing_group/:service_providing_group_id/product_suspension/:id/show",
    params: z.object({
      service_providing_group_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_product_suspension.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_suspension/ServiceProvidingGroupProductSuspensionShow"),
      "ServiceProvidingGroupProductSuspensionShow",
    ),
  },
  spg_product_suspension_create: {
    path: "/service_providing_group/:service_providing_group_id/product_suspension/create",
    params: z.object({ service_providing_group_id: z.string() }),
    access: "service_providing_group_product_suspension.create",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_suspension/ServiceProvidingGroupProductSuspensionInput"),
      "ServiceProvidingGroupProductSuspensionInput",
    ),
  },
  spg_product_suspension_edit: {
    path: "/service_providing_group/:service_providing_group_id/product_suspension/:id",
    params: z.object({
      service_providing_group_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_product_suspension.update",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_suspension/ServiceProvidingGroupProductSuspensionInput"),
      "ServiceProvidingGroupProductSuspensionInput",
    ),
  },
  spg_product_suspension_history: {
    path: "/service_providing_group/:service_providing_group_id/product_suspension_history",
    params: z.object({ service_providing_group_id: z.string() }),
    access: "service_providing_group_product_suspension.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_suspension/ServiceProvidingGroupProductSuspensionHistoryList"),
      "ServiceProvidingGroupProductSuspensionHistoryList",
    ),
  },
  spg_product_suspension_history_show: {
    path: "/service_providing_group/:service_providing_group_id/product_suspension_history/:id/show",
    params: z.object({
      service_providing_group_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_product_suspension.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_suspension/ServiceProvidingGroupProductSuspensionShow"),
      "ServiceProvidingGroupProductSuspensionShow",
    ),
  },

  // --- spg > product_suspension > comment ---
  spg_product_suspension_comment_show: {
    path: "/service_providing_group/:service_providing_group_id/product_suspension/:service_providing_group_product_suspension_id/comment/:id/show",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_product_suspension_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_product_suspension_comment.read",
    component: lazyNamed(() => import("../components/comments"), "CommentShow"),
  },
  spg_product_suspension_comment_create: {
    path: "/service_providing_group/:service_providing_group_id/product_suspension/:service_providing_group_product_suspension_id/comment/create",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_product_suspension_id: z.string(),
    }),
    access: "service_providing_group_product_suspension_comment.create",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentInput",
    ),
  },
  spg_product_suspension_comment_edit: {
    path: "/service_providing_group/:service_providing_group_id/product_suspension/:service_providing_group_product_suspension_id/comment/:id",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_product_suspension_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_product_suspension_comment.update",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentInput",
    ),
  },
  spg_product_suspension_comment_history: {
    path: "/service_providing_group/:service_providing_group_id/product_suspension/:service_providing_group_product_suspension_id/comment_history",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_product_suspension_id: z.string(),
    }),
    access: "service_providing_group_product_suspension_comment.read",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentHistoryList",
    ),
  },
  spg_product_suspension_comment_history_show: {
    path: "/service_providing_group/:service_providing_group_id/product_suspension/:service_providing_group_product_suspension_id/comment_history/:id/show",
    params: z.object({
      service_providing_group_id: z.string(),
      service_providing_group_product_suspension_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_product_suspension_comment.read",
    component: lazyNamed(() => import("../components/comments"), "CommentShow"),
  },

  // === service_providing_group standalone sub-resources ===

  // --- spg_grid_prequalification (standalone) ---
  spg_gp_standalone_list: {
    path: "/service_providing_group_grid_prequalification",
    access: "service_providing_group_grid_prequalification.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationList"),
      "ServiceProvidingGroupGridPrequalificationList",
    ),
  },
  spg_gp_standalone_show: {
    path: "/service_providing_group_grid_prequalification/:id/show",
    params: z.object({ id: z.string() }),
    access: "service_providing_group_grid_prequalification.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationShow"),
      "ServiceProvidingGroupGridPrequalificationShow",
    ),
  },
  spg_gp_standalone_create: {
    path: "/service_providing_group_grid_prequalification/create",
    access: "service_providing_group_grid_prequalification.create",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationInput"),
      "ServiceProvidingGroupGridPrequalificationInput",
    ),
  },
  spg_gp_standalone_edit: {
    path: "/service_providing_group_grid_prequalification/:id",
    params: z.object({ id: z.string() }),
    access: "service_providing_group_grid_prequalification.update",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationInput"),
      "ServiceProvidingGroupGridPrequalificationInput",
    ),
  },
  spg_gp_standalone_history: {
    path: "/service_providing_group_grid_prequalification/:service_providing_group_grid_prequalification_id/history",
    params: z.object({
      service_providing_group_grid_prequalification_id: z.string(),
    }),
    access: "service_providing_group_grid_prequalification.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationHistoryList"),
      "ServiceProvidingGroupGridPrequalificationHistoryList",
    ),
  },
  spg_gp_standalone_history_show: {
    path: "/service_providing_group_grid_prequalification/:service_providing_group_grid_prequalification_id/history/:id/show",
    params: z.object({
      service_providing_group_grid_prequalification_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_grid_prequalification.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationShow"),
      "ServiceProvidingGroupGridPrequalificationShow",
    ),
  },

  // --- spg_membership (standalone) ---
  spg_membership_standalone_list: {
    path: "/service_providing_group_membership",
    access: "service_providing_group_membership.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/membership/ServiceProvidingGroupMembershipList"),
      "ServiceProvidingGroupMembershipList",
    ),
  },
  spg_membership_standalone_show: {
    path: "/service_providing_group_membership/:id/show",
    params: z.object({ id: z.string() }),
    access: "service_providing_group_membership.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/membership/ServiceProvidingGroupMembershipShow"),
      "ServiceProvidingGroupMembershipShow",
    ),
  },
  spg_membership_standalone_create: {
    path: "/service_providing_group_membership/create",
    access: "service_providing_group_membership.create",
    component: lazyNamed(
      () =>
        import("../service_providing_group/membership/ServiceProvidingGroupMembershipInput"),
      "ServiceProvidingGroupMembershipInput",
    ),
  },
  spg_membership_standalone_edit: {
    path: "/service_providing_group_membership/:id",
    params: z.object({ id: z.string() }),
    access: "service_providing_group_membership.update",
    component: lazyNamed(
      () =>
        import("../service_providing_group/membership/ServiceProvidingGroupMembershipInput"),
      "ServiceProvidingGroupMembershipInput",
    ),
  },
  spg_membership_standalone_history: {
    path: "/service_providing_group_membership/:service_providing_group_membership_id/history",
    params: z.object({ service_providing_group_membership_id: z.string() }),
    access: "service_providing_group_membership.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/membership/ServiceProvidingGroupMembershipHistoryList"),
      "ServiceProvidingGroupMembershipHistoryList",
    ),
  },
  spg_membership_standalone_history_show: {
    path: "/service_providing_group_membership/:service_providing_group_membership_id/history/:id/show",
    params: z.object({
      service_providing_group_membership_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_membership.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/membership/ServiceProvidingGroupMembershipShow"),
      "ServiceProvidingGroupMembershipShow",
    ),
  },

  // --- spg_product_application (standalone) ---
  spg_pa_standalone_list: {
    path: "/service_providing_group_product_application",
    access: "service_providing_group_product_application.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_application/ServiceProvidingGroupProductApplicationList"),
      "ServiceProvidingGroupProductApplicationList",
    ),
  },
  spg_pa_standalone_show: {
    path: "/service_providing_group_product_application/:id/show",
    params: z.object({ id: z.string() }),
    access: "service_providing_group_product_application.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_application/ServiceProvidingGroupProductApplicationShow"),
      "ServiceProvidingGroupProductApplicationShow",
    ),
  },
  spg_pa_standalone_create: {
    path: "/service_providing_group_product_application/create",
    access: "service_providing_group_product_application.create",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_application/ServiceProvidingGroupProductApplicationInput"),
      "ServiceProvidingGroupProductApplicationInput",
    ),
  },
  spg_pa_standalone_edit: {
    path: "/service_providing_group_product_application/:id",
    params: z.object({ id: z.string() }),
    access: "service_providing_group_product_application.update",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_application/ServiceProvidingGroupProductApplicationInput"),
      "ServiceProvidingGroupProductApplicationInput",
    ),
  },
  spg_pa_standalone_history: {
    path: "/service_providing_group_product_application/:service_providing_group_product_application_id/history",
    params: z.object({
      service_providing_group_product_application_id: z.string(),
    }),
    access: "service_providing_group_product_application.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_application/ServiceProvidingGroupProductApplicationHistoryList"),
      "ServiceProvidingGroupProductApplicationHistoryList",
    ),
  },
  spg_pa_standalone_history_show: {
    path: "/service_providing_group_product_application/:service_providing_group_product_application_id/history/:id/show",
    params: z.object({
      service_providing_group_product_application_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_product_application.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_application/ServiceProvidingGroupProductApplicationShow"),
      "ServiceProvidingGroupProductApplicationShow",
    ),
  },

  // --- spg_grid_suspension (standalone) ---
  spg_gs_standalone_list: {
    path: "/service_providing_group_grid_suspension",
    access: "service_providing_group_grid_suspension.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_suspension/ServiceProvidingGroupGridSuspensionList"),
      "ServiceProvidingGroupGridSuspensionList",
    ),
  },
  spg_gs_standalone_show: {
    path: "/service_providing_group_grid_suspension/:id/show",
    params: z.object({ id: z.string() }),
    access: "service_providing_group_grid_suspension.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_suspension/ServiceProvidingGroupGridSuspensionShow"),
      "ServiceProvidingGroupGridSuspensionShow",
    ),
  },
  spg_gs_standalone_create: {
    path: "/service_providing_group_grid_suspension/create",
    access: "service_providing_group_grid_suspension.create",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_suspension/ServiceProvidingGroupGridSuspensionInput"),
      "ServiceProvidingGroupGridSuspensionInput",
    ),
  },
  spg_gs_standalone_history: {
    path: "/service_providing_group_grid_suspension/:service_providing_group_grid_suspension_id/history",
    params: z.object({
      service_providing_group_grid_suspension_id: z.string(),
    }),
    access: "service_providing_group_grid_suspension.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_suspension/ServiceProvidingGroupGridSuspensionHistoryList"),
      "ServiceProvidingGroupGridSuspensionHistoryList",
    ),
  },
  spg_gs_standalone_history_show: {
    path: "/service_providing_group_grid_suspension/:service_providing_group_grid_suspension_id/history/:id/show",
    params: z.object({
      service_providing_group_grid_suspension_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_grid_suspension.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/grid_suspension/ServiceProvidingGroupGridSuspensionShow"),
      "ServiceProvidingGroupGridSuspensionShow",
    ),
  },

  // --- spg_product_suspension (standalone) ---
  spg_ps_standalone_list: {
    path: "/service_providing_group_product_suspension",
    access: "service_providing_group_product_suspension.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_suspension/ServiceProvidingGroupProductSuspensionList"),
      "ServiceProvidingGroupProductSuspensionList",
    ),
  },
  spg_ps_standalone_show: {
    path: "/service_providing_group_product_suspension/:id/show",
    params: z.object({ id: z.string() }),
    access: "service_providing_group_product_suspension.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_suspension/ServiceProvidingGroupProductSuspensionShow"),
      "ServiceProvidingGroupProductSuspensionShow",
    ),
  },
  spg_ps_standalone_create: {
    path: "/service_providing_group_product_suspension/create",
    access: "service_providing_group_product_suspension.create",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_suspension/ServiceProvidingGroupProductSuspensionInput"),
      "ServiceProvidingGroupProductSuspensionInput",
    ),
  },
  spg_ps_standalone_history: {
    path: "/service_providing_group_product_suspension/:service_providing_group_product_suspension_id/history",
    params: z.object({
      service_providing_group_product_suspension_id: z.string(),
    }),
    access: "service_providing_group_product_suspension.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_suspension/ServiceProvidingGroupProductSuspensionHistoryList"),
      "ServiceProvidingGroupProductSuspensionHistoryList",
    ),
  },
  spg_ps_standalone_history_show: {
    path: "/service_providing_group_product_suspension/:service_providing_group_product_suspension_id/history/:id/show",
    params: z.object({
      service_providing_group_product_suspension_id: z.string(),
      id: z.string(),
    }),
    access: "service_providing_group_product_suspension.read",
    component: lazyNamed(
      () =>
        import("../service_providing_group/product_suspension/ServiceProvidingGroupProductSuspensionShow"),
      "ServiceProvidingGroupProductSuspensionShow",
    ),
  },

  // === service_provider_product_application ===
  sp_pa_list: {
    path: "/service_provider_product_application",
    access: "service_provider_product_application.read",
    component: lazyNamed(
      () =>
        import("../service_provider_product_application/ServiceProviderProductApplicationList"),
      "ServiceProviderProductApplicationList",
    ),
  },
  sp_pa_show: {
    path: "/service_provider_product_application/:id/show",
    params: z.object({ id: z.string() }),
    access: "service_provider_product_application.read",
    component: lazyNamed(
      () =>
        import("../service_provider_product_application/ServiceProviderProductApplicationShow"),
      "ServiceProviderProductApplicationShow",
    ),
  },
  sp_pa_create: {
    path: "/service_provider_product_application/create",
    access: "service_provider_product_application.create",
    component: lazyNamed(
      () =>
        import("../service_provider_product_application/ServiceProviderProductApplicationInput"),
      "ServiceProviderProductApplicationInput",
    ),
  },
  sp_pa_edit: {
    path: "/service_provider_product_application/:id",
    params: z.object({ id: z.string() }),
    access: "service_provider_product_application.update",
    component: lazyNamed(
      () =>
        import("../service_provider_product_application/ServiceProviderProductApplicationInput"),
      "ServiceProviderProductApplicationInput",
    ),
  },
  sp_pa_history: {
    path: "/service_provider_product_application/:service_provider_product_application_id/history",
    params: z.object({ service_provider_product_application_id: z.string() }),
    access: "service_provider_product_application.read",
    component: lazyNamed(
      () =>
        import("../service_provider_product_application/ServiceProviderProductApplicationHistoryList"),
      "ServiceProviderProductApplicationHistoryList",
    ),
  },
  sp_pa_history_show: {
    path: "/service_provider_product_application/:service_provider_product_application_id/history/:id/show",
    params: z.object({
      service_provider_product_application_id: z.string(),
      id: z.string(),
    }),
    access: "service_provider_product_application.read",
    component: lazyNamed(
      () =>
        import("../service_provider_product_application/ServiceProviderProductApplicationShow"),
      "ServiceProviderProductApplicationShow",
    ),
  },

  // --- sp_pa > comment ---
  sp_pa_comment_show: {
    path: "/service_provider_product_application/:service_provider_product_application_id/comment/:id/show",
    params: z.object({
      service_provider_product_application_id: z.string(),
      id: z.string(),
    }),
    access: "service_provider_product_application_comment.read",
    component: lazyNamed(() => import("../components/comments"), "CommentShow"),
  },
  sp_pa_comment_create: {
    path: "/service_provider_product_application/:service_provider_product_application_id/comment/create",
    params: z.object({ service_provider_product_application_id: z.string() }),
    access: "service_provider_product_application_comment.create",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentInput",
    ),
  },
  sp_pa_comment_edit: {
    path: "/service_provider_product_application/:service_provider_product_application_id/comment/:id",
    params: z.object({
      service_provider_product_application_id: z.string(),
      id: z.string(),
    }),
    access: "service_provider_product_application_comment.update",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentInput",
    ),
  },
  sp_pa_comment_history: {
    path: "/service_provider_product_application/:service_provider_product_application_id/comment_history",
    params: z.object({ service_provider_product_application_id: z.string() }),
    access: "service_provider_product_application_comment.read",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentHistoryList",
    ),
  },
  sp_pa_comment_history_show: {
    path: "/service_provider_product_application/:service_provider_product_application_id/comment_history/:id/show",
    params: z.object({
      service_provider_product_application_id: z.string(),
      id: z.string(),
    }),
    access: "service_provider_product_application_comment.read",
    component: lazyNamed(() => import("../components/comments"), "CommentShow"),
  },

  // === service_provider_product_suspension ===
  sp_ps_list: {
    path: "/service_provider_product_suspension",
    access: "service_provider_product_suspension.read",
    component: lazyNamed(
      () =>
        import("../service_provider_product_suspension/ServiceProviderProductSuspensionList"),
      "ServiceProviderProductSuspensionList",
    ),
  },
  sp_ps_show: {
    path: "/service_provider_product_suspension/:id/show",
    params: z.object({ id: z.string() }),
    access: "service_provider_product_suspension.read",
    component: lazyNamed(
      () =>
        import("../service_provider_product_suspension/ServiceProviderProductSuspensionShow"),
      "ServiceProviderProductSuspensionShow",
    ),
  },
  sp_ps_create: {
    path: "/service_provider_product_suspension/create",
    access: "service_provider_product_suspension.create",
    component: lazyNamed(
      () =>
        import("../service_provider_product_suspension/ServiceProviderProductSuspensionInput"),
      "ServiceProviderProductSuspensionInput",
    ),
  },
  sp_ps_edit: {
    path: "/service_provider_product_suspension/:id",
    params: z.object({ id: z.string() }),
    access: "service_provider_product_suspension.update",
    component: lazyNamed(
      () =>
        import("../service_provider_product_suspension/ServiceProviderProductSuspensionInput"),
      "ServiceProviderProductSuspensionInput",
    ),
  },
  sp_ps_history: {
    path: "/service_provider_product_suspension/:service_provider_product_suspension_id/history",
    params: z.object({ service_provider_product_suspension_id: z.string() }),
    access: "service_provider_product_suspension.read",
    component: lazyNamed(
      () =>
        import("../service_provider_product_suspension/ServiceProviderProductSuspensionHistoryList"),
      "ServiceProviderProductSuspensionHistoryList",
    ),
  },
  sp_ps_history_show: {
    path: "/service_provider_product_suspension/:service_provider_product_suspension_id/history/:id/show",
    params: z.object({
      service_provider_product_suspension_id: z.string(),
      id: z.string(),
    }),
    access: "service_provider_product_suspension.read",
    component: lazyNamed(
      () =>
        import("../service_provider_product_suspension/ServiceProviderProductSuspensionShow"),
      "ServiceProviderProductSuspensionShow",
    ),
  },

  // --- sp_ps > comment ---
  sp_ps_comment_show: {
    path: "/service_provider_product_suspension/:service_provider_product_suspension_id/comment/:id/show",
    params: z.object({
      service_provider_product_suspension_id: z.string(),
      id: z.string(),
    }),
    access: "service_provider_product_suspension_comment.read",
    component: lazyNamed(() => import("../components/comments"), "CommentShow"),
  },
  sp_ps_comment_create: {
    path: "/service_provider_product_suspension/:service_provider_product_suspension_id/comment/create",
    params: z.object({ service_provider_product_suspension_id: z.string() }),
    access: "service_provider_product_suspension_comment.create",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentInput",
    ),
  },
  sp_ps_comment_edit: {
    path: "/service_provider_product_suspension/:service_provider_product_suspension_id/comment/:id",
    params: z.object({
      service_provider_product_suspension_id: z.string(),
      id: z.string(),
    }),
    access: "service_provider_product_suspension_comment.update",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentInput",
    ),
  },
  sp_ps_comment_history: {
    path: "/service_provider_product_suspension/:service_provider_product_suspension_id/comment_history",
    params: z.object({ service_provider_product_suspension_id: z.string() }),
    access: "service_provider_product_suspension_comment.read",
    component: lazyNamed(
      () => import("../components/comments"),
      "CommentHistoryList",
    ),
  },
  sp_ps_comment_history_show: {
    path: "/service_provider_product_suspension/:service_provider_product_suspension_id/comment_history/:id/show",
    params: z.object({
      service_provider_product_suspension_id: z.string(),
      id: z.string(),
    }),
    access: "service_provider_product_suspension_comment.read",
    component: lazyNamed(() => import("../components/comments"), "CommentShow"),
  },

  // === product_type ===
  product_type_list: {
    path: "/product_type",
    access: "product_type.read",
    component: lazyNamed(
      () => import("../product_type/ProductTypeList"),
      "ProductTypeList",
    ),
  },
  product_type_show: {
    path: "/product_type/:id/show",
    params: z.object({ id: z.string() }),
    access: "product_type.read",
    component: lazyNamed(
      () => import("../product_type/ProductTypeShow"),
      "ProductTypeShow",
    ),
  },

  // === system_operator_product_type ===
  sopt_list: {
    path: "/system_operator_product_type",
    access: "system_operator_product_type.read",
    component: lazyNamed(
      () =>
        import("../system_operator_product_type/SystemOperatorProductTypeList"),
      "SystemOperatorProductTypeList",
    ),
  },
  sopt_show: {
    path: "/system_operator_product_type/:id/show",
    params: z.object({ id: z.string() }),
    access: "system_operator_product_type.read",
    component: lazyNamed(
      () =>
        import("../system_operator_product_type/SystemOperatorProductTypeShow"),
      "SystemOperatorProductTypeShow",
    ),
  },
  sopt_create: {
    path: "/system_operator_product_type/create",
    access: "system_operator_product_type.create",
    component: lazyNamed(
      () =>
        import("../system_operator_product_type/SystemOperatorProductTypeInput"),
      "SystemOperatorProductTypeInput",
    ),
  },
  sopt_edit: {
    path: "/system_operator_product_type/:id",
    params: z.object({ id: z.string() }),
    access: "system_operator_product_type.update",
    component: lazyNamed(
      () =>
        import("../system_operator_product_type/SystemOperatorProductTypeInput"),
      "SystemOperatorProductTypeInput",
    ),
  },
  sopt_history: {
    path: "/system_operator_product_type/:system_operator_product_type_id/history",
    params: z.object({ system_operator_product_type_id: z.string() }),
    access: "system_operator_product_type.read",
    component: lazyNamed(
      () =>
        import("../system_operator_product_type/SystemOperatorProductTypeHistoryList"),
      "SystemOperatorProductTypeHistoryList",
    ),
  },
  sopt_history_show: {
    path: "/system_operator_product_type/:system_operator_product_type_id/history/:id/show",
    params: z.object({
      system_operator_product_type_id: z.string(),
      id: z.string(),
    }),
    access: "system_operator_product_type.read",
    component: lazyNamed(
      () =>
        import("../system_operator_product_type/SystemOperatorProductTypeShow"),
      "SystemOperatorProductTypeShow",
    ),
  },

  // === event ===
  event_list: {
    path: "/event",
    access: "event.read",
    component: lazyNamed(() => import("../event/EventList"), "EventList"),
  },
  event_show: {
    path: "/event/:id/show",
    params: z.object({ id: z.string() }),
    access: "event.read",
    component: lazyNamed(() => import("../event/EventShow"), "EventShow"),
  },

  // === notification ===
  notification_list: {
    path: "/notification",
    access: "notification.read",
    component: lazyNamed(
      () => import("../notification/NotificationList"),
      "NotificationList",
    ),
  },
  notification_show: {
    path: "/notification/:id/show",
    params: z.object({ id: z.string() }),
    access: "notification.read",
    component: lazyNamed(
      () => import("../notification/NotificationShow"),
      "NotificationShow",
    ),
  },

  // === notice ===
  notice_list: {
    path: "/notice",
    access: "notice.read",
    component: lazyNamed(() => import("../notice/NoticeList"), "NoticeList"),
  },
  notice_show: {
    path: "/notice/:id/show",
    params: z.object({ id: z.string() }),
    access: "notice.read",
    component: lazyNamed(() => import("../notice/NoticeShow"), "NoticeShow"),
  },

  // === auth ===
  assume_party: {
    path: "/login/assumeParty",
    component: lazyNamed(() => import("../AssumePartyPage"), "AssumePartyPage"),
  },
} satisfies Record<string, RouteDef>;

export type RouteDefs = typeof routeDefs;
export type RouteName = keyof RouteDefs;

// Convenience types parameterized on the actual defs
export type RouteParams<K extends RouteName> = ExtractParams<RouteDefs[K]>;
export type RouteState<K extends RouteName> = ExtractState<RouteDefs[K]>;
