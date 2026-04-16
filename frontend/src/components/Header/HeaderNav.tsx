import { useMemo } from "react";
import { usePermissions, useTranslate } from "ra-core";
import { Link as NavLink } from "react-router-dom";
import { IconChevronDown } from "@elhub/ds-icons";

import type {
  Permissions,
  PermissionTarget,
  PermissionOperation,
} from "../../auth/permissions";
import { BodyText, Button, Dropdown, Link, Nav } from "../ui";
import { menuConfig, routeDefs } from "../../routes";
import type { RouteName } from "../../routes";

export const HeaderNav = () => {
  const { permissions, isLoading } = usePermissions<Permissions>();
  const translate = useTranslate();

  const canShow = useMemo(
    () => (route: RouteName) => {
      const def = routeDefs[route];
      const access = "access" in def ? def.access : undefined;
      if (!access) return true;
      const dotIndex = access.indexOf(".");
      const target = access.slice(0, dotIndex) as PermissionTarget;
      const operation = access.slice(dotIndex + 1) as PermissionOperation;
      return typeof permissions?.allow === "function"
        ? permissions.allow(target, operation)
        : true;
    },
    [permissions],
  );

  const visibleGroups = useMemo(() => {
    if (!permissions) return [];

    return menuConfig
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => canShow(item.route)),
      }))
      .filter((group) => group.items.length > 0);
  }, [permissions, canShow]);

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
                <BodyText weight="bold">{translate(group.label)}</BodyText>
              </Button>
              <Dropdown.Menu placement="bottom-start" arrow>
                <Dropdown.Menu.GroupedList>
                  {group.items.map((item) => (
                    <Dropdown.Menu.GroupedList.Item key={item.route}>
                      <Link
                        as={NavLink}
                        to={routeDefs[item.route].path}
                        className="w-full no-underline"
                      >
                        <BodyText>{translate(item.label)}</BodyText>
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
