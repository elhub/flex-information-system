import { matchPath, NavLink, useLocation, useMatch } from "react-router-dom";
import { Button, Dropdown, Nav } from "../ui";
import { IconChevronDown } from "@elhub/ds-icons";
import { useGetIdentity, useTranslate } from "ra-core";
import { userGuideCreateUsersURL, userGuideURL } from "../../httpConfig";
import { FlexIdentity } from "../../auth";

type MenuItem =
  | {
      label: string;
      to: string;
    }
  | {
      label: string;
      items: { label: string; to: string }[];
    };

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
  const roleIdentity = identity as FlexIdentity | undefined;

  const translate = useTranslate();
  console.log(roleIdentity);
  const navLinks: MenuItem[] = [
    { label: translate("text.header_nav_dashboard"), to: "/" },
    {
      label: translate("text.header_nav_controllable_units"),
      to: "/controllable_unit",
    },
    {
      label: translate("text.header_nav_service_providing_groups"),
      to: "/service_providing_group",
    },
    {
      label: translate("text.header_nav_applications"),
      items: [
        {
          label: translate(
            "text.header_nav_service_provider_product_applications",
          ),
          to: "/service_provider_product_application",
        },
        {
          label: translate(
            "text.header_nav_service_providing_group_product_applications",
          ),
          to: "/service_providing_group_product_application",
        },
      ],
    },
    {
      label: translate("text.header_nav_other"),
      items: [
        {
          label: translate("text.header_nav_system_operator_product_listing"),
          to: "/system_operator_product_type",
        },
        { label: translate("text.header_nav_entities"), to: "/entity" },
        { label: translate("text.header_nav_parties"), to: "/party" },
        { label: translate("text.header_nav_events"), to: "/event" },
        {
          label: translate("text.header_nav_notifications"),
          to: "/notification",
        },
        { label: translate("text.header_nav_notices"), to: "/notice" },
      ],
    },
    ...(userGuideURL && userGuideCreateUsersURL
      ? [
          {
            label: translate("text.header_nav_need_help"),
            items: [
              {
                label: translate("text.header_nav_user_guide"),
                to: userGuideURL,
              },
              ...(identity?.role == "flex_organisation"
                ? [
                    {
                      label: translate("text.header_nav_create_user_guide"),
                      to: userGuideCreateUsersURL,
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
  ];

  if (!isSuccess) {
    return [];
  }

  if (!identity.partyID) {
    return [
      {
        label: translate("text.header_nav_assume_party"),
        to: "/login/assumeParty",
      },
    ];
  }

  return navLinks;
};

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
          ),
        )}
      </div>
    </Nav>
  );
};

const DropdownNav = (group: {
  label: string;
  items: { label: string; to: string }[];
}) => {
  const { pathname } = useLocation();
  const match = group.items.find(({ to }) =>
    matchPath({ path: to, end: false }, pathname),
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
  );
};

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
  );
};
