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
        label: "resources.controllable_unit.name",
        route: "controllable_unit_list",
      },
      // Remaining items added as routes are migrated
    ],
  },
];
