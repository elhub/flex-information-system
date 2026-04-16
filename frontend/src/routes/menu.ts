import type { RouteName } from "./routeDefs";

export type MenuItem = {
  label: string;
  route: RouteName;
};

export type MenuGroup = {
  label: string;
  items: MenuItem[];
};

export const menuConfig: MenuGroup[] = [
  {
    label: "menu.basic_resources",
    items: [
      {
        label: "resources.accounting_point.name",
        route: "accounting_point_list",
      },
      {
        label: "resources.controllable_unit.name",
        route: "controllable_unit_list",
      },
      {
        label: "resources.service_providing_group.name",
        route: "spg_list",
      },
      {
        label: "resources.service_providing_group_membership.name",
        route: "spg_membership_standalone_list",
      },
      {
        label: "resources.service_providing_group_grid_prequalification.name",
        route: "spg_gp_standalone_list",
      },
      {
        label: "resources.system_operator_product_type.name",
        route: "sopt_list",
      },
    ],
  },
  {
    label: "menu.product_application",
    items: [
      {
        label: "resources.service_provider_product_application.name",
        route: "sp_pa_list",
      },
      {
        label: "resources.service_providing_group_product_application.name",
        route: "spg_pa_standalone_list",
      },
    ],
  },
  {
    label: "menu.suspension",
    items: [
      {
        label: "resources.controllable_unit_suspension.name",
        route: "cu_suspension_standalone_list",
      },
      {
        label: "resources.service_provider_product_suspension.name",
        route: "sp_ps_list",
      },
      {
        label: "resources.service_providing_group_grid_suspension.name",
        route: "spg_gs_standalone_list",
      },
      {
        label: "resources.service_providing_group_product_suspension.name",
        route: "spg_ps_standalone_list",
      },
    ],
  },
  {
    label: "menu.identity",
    items: [
      {
        label: "resources.entity.name",
        route: "entity_list",
      },
      {
        label: "resources.party.name",
        route: "party_list",
      },
    ],
  },
  {
    label: "menu.system",
    items: [
      {
        label: "resources.event.name",
        route: "event_list",
      },
      {
        label: "resources.notification.name",
        route: "notification_list",
      },
      {
        label: "resources.notice.name",
        route: "notice_list",
      },
    ],
  },
];
