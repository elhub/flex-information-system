import { NavLink, matchPath, useLocation, useMatch } from "react-router-dom";
import { Button, Dropdown, Link, Nav } from "../ui";
import { IconChevronDown } from "@elhub/ds-icons";
import { useGetIdentity } from "ra-core";

type MenuItem = {
  label: string;
  to: string;
} |
{
  label: string;
  items: { label: string, to: string }[];
};

const navLinks: MenuItem[] = [
  { label: "Dashboard", to: "/" },
  { label: "Controllable units", to: "/controllable_unit" },
  { label: "Service providing groups", to: "/service_providing_group" },
  {
    label: "Applications", items: [
      { label: "Service provider product applications", to: "/service_provider_product_application" },
      { label: "Service providing group product applications", to: "/service_providing_group_product_application" },
    ]
  },
  {
    label: "Other",
    items: [
      { label: "Service operator product listing", to: "/system_operator_product_type" },
      { label: "Entities", to: "/entity" },
      { label: "Parties", to: "/party" },
      { label: "Events", to: "/event" },
      { label: "Notifications", to: "/notification" },
      { label: "Notices", to: "/notice" }
    ]
  }
];

const className = ({ isActive }: { isActive: boolean }) =>
  [
    "relative h-full",
    "after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full",
    isActive
      ? "after:bg-[var(--eds-semantic-background-action-primary-active)]"
      : "after:bg-transparent",
  ].join(" ");

const useMenuItems = () => {
  const { data: identity, isSuccess } = useGetIdentity();

  if (!isSuccess) {
    return [];
  }

  if (!identity.partyID) {
    return [
      { label: "Assume party", to: "/login/assumeParty" },
    ]
  }

  return navLinks;
}

export const HeaderNav = () => {

  const menuItems = useMenuItems();

  return (
    <Nav className="flex h-full items-center">
      <div className="flex h-full items-center gap-3">
        {menuItems.map((link) =>
          "items" in link ? (
            <DropdownNav key={link.label} {...link} />
          ) : (
            <RegularLink key={link.to} {...link} />
          )
        )}
      </div>
    </Nav>
  )
};


const DropdownNav = (group: { label: string; items: { label: string; to: string }[] }) => {
  const { pathname } = useLocation();
  const match = group.items.find(({ to }) =>
    matchPath({ path: to, end: false }, pathname)
  );

  return (
    <Dropdown>
      <Button
        as={Dropdown.Toggle}
        iconPosition="right"
        className={className({ isActive: !!match })}
        icon={IconChevronDown}
        variant="invisible"
        size="small"
      >
        {group.label}
      </Button>
      <Dropdown.Menu placement="bottom-start" arrow>
        <Dropdown.Menu.GroupedList>
          {group.items.map((item) => (
            <Dropdown.Menu.GroupedList.Item
              as={NavLink}
              to={item.to}
              className="w-full no-underline"
              key={item.to}
            >
              {item.label}
            </Dropdown.Menu.GroupedList.Item>
          ))}
        </Dropdown.Menu.GroupedList>
      </Dropdown.Menu>
    </Dropdown>
  )
}


const RegularLink = ({ label, to }: { label: string; to: string }) => {
  const match = useMatch({ path: to, end: true });
  return (
    <Button
      as={NavLink}
      variant="invisible"
      key={to}
      to={to}
      end={false}
      className={className({ isActive: !!match })}
      size="small"
    >
      {label}
    </Button>
  )
}
