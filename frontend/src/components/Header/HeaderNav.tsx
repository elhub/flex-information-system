import { useMemo } from "react";
import { useCreatePath, usePermissions } from "ra-core";
import { Link as NavLink } from "react-router-dom";
import { IconChevronDown } from "@elhub/ds-icons";

import type { Permissions, PermissionTarget } from "../../auth/permissions";
import { BodyText, Button, Dropdown, Link, Nav } from "../ui";

type MenuEntry = {
  resource: PermissionTarget;
  label: string;
};

type MenuGroup = {
  label: string;
  items: MenuEntry[];
};

const menuGroups: MenuGroup[] = [
  {
    label: "Basic resources",
    items: [
      { resource: "accounting_point", label: "Accounting point data" },
      { resource: "controllable_unit", label: "CU registrations" },
      { resource: "service_providing_group", label: "SPG registrations" },
      {
        resource: "service_providing_group_membership",
        label: "SPG memberships",
      },
      {
        resource: "service_providing_group_grid_prequalification",
        label: "SPG grid prequalifications",
      },
      {
        resource: "system_operator_product_type",
        label: "System operator product listings",
      },
    ],
  },
  {
    label: "Product application",
    items: [
      {
        resource: "service_provider_product_application",
        label: "SP product applications",
      },
      {
        resource: "service_providing_group_product_application",
        label: "SPG product applications",
      },
    ],
  },
  {
    label: "Suspension",
    items: [
      { resource: "controllable_unit_suspension", label: "CU suspensions" },
      {
        resource: "service_provider_product_suspension",
        label: "SP product suspensions",
      },
      {
        resource: "service_providing_group_grid_suspension",
        label: "SPG grid suspensions",
      },
      {
        resource: "service_providing_group_product_suspension",
        label: "SPG product suspensions",
      },
    ],
  },
  {
    label: "Identity",
    items: [
      { resource: "entity", label: "Entities" },
      { resource: "party", label: "Parties" },
    ],
  },
  {
    label: "System",
    items: [
      { resource: "event", label: "Events" },
      { resource: "notification", label: "Notifications" },
      { resource: "notice", label: "Notices" },
    ],
  },
];

export const HeaderNav = () => {
  const createPath = useCreatePath();
  const { permissions, isLoading } = usePermissions<Permissions>();

  const visibleGroups = useMemo(() => {
    if (!permissions) return [];

    return menuGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          permissions?.allow(item.resource, "read"),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [permissions]);

  return (
    <Nav className="flex h-full items-center">
      <div className="flex h-full items-center gap-6">
        {!isLoading &&
          visibleGroups.map((group) => (
            <Dropdown key={group.label}>
              <Button
                as={Dropdown.Toggle}
                variant="invisible"
                icon={IconChevronDown}
                iconPosition="right"
                className="p-0 text-semantic-text-default"
                size="small"
              >
                <BodyText weight="bold">{group.label}</BodyText>
              </Button>
              <Dropdown.Menu placement="bottom-start" arrow>
                <Dropdown.Menu.GroupedList>
                  {group.items.map((item) => (
                    <Dropdown.Menu.GroupedList.Item key={item.resource}>
                      <Link
                        as={NavLink}
                        to={createPath({
                          resource: item.resource,
                          type: "list",
                        })}
                        className="w-full no-underline"
                      >
                        <BodyText>{item.label}</BodyText>
                      </Link>
                    </Dropdown.Menu.GroupedList.Item>
                  ))}
                </Dropdown.Menu.GroupedList>
              </Dropdown.Menu>
            </Dropdown>
          ))}
      </div>
    </Nav>
  );
};
