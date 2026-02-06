import { BodyText, Button, Dropdown, Loader } from "../ui";
import {
  IconBuilding,
  IconChevronDown,
  IconUser,
  IconViewOff,
} from "@elhub/ds-icons";
import { useGetIdentity, useRedirect, useTranslate, getStorage } from "ra-core";
import { authURL } from "../../httpConfig";
import { sessionInfoKey } from "../../auth";
import styles from "./header.module.css";

const UserDropdown = () => {
  const { isLoading, data } = useGetIdentity();
  const redirect = useRedirect();
  const translate = useTranslate();

  if (isLoading) {
    return <Loader size="small" />;
  }

  const roleLabel =
    data?.role === "flex_entity"
      ? translate("text.entity_role")
      : translate(`enum.party.role.${data?.role}`);

  const handleAssumeParty = () => {
    redirect("/login/assumeParty");
  };

  const handleMyEntity = () => {
    redirect(`/entity/${data?.entityID}/show`);
  };

  const handleMyParty = () => {
    redirect(`/party/${data?.partyID}/show`);
  };

  const handleLogout = () => {
    getStorage().removeItem(sessionInfoKey);
    redirect(`${authURL}/logout`);
  };

  const dropDownItems = [
    {
      label: data?.partyID ? "Unassume party" : "Assume party",
      icon: IconBuilding,
      onClick: handleAssumeParty,
    },
    {
      label: "My entity",
      icon: IconUser,
      onClick: handleMyEntity,
    },
    ...(data?.partyID
      ? [
          {
            label: "My party",
            icon: IconBuilding,
            onClick: handleMyParty,
          },
        ]
      : []),
    {
      label: "Logout",
      icon: IconViewOff,
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown>
      <Button
        icon={IconChevronDown}
        iconPosition="right"
        variant="invisible"
        as={Dropdown.Toggle}
        size="medium"
        className="text-white"
        data-testid="header-desktop-menu-toggle"
      >
        <div className="flex flex-row gap-2 items-center">
          <IconUser />
          <BodyText weight="bold">{data?.fullName ?? "User"}</BodyText>
        </div>
      </Button>
      <Dropdown.Menu arrow placement="bottom">
        <Dropdown.Menu.GroupedList.Heading>
          <BodyText weight="bold">{roleLabel}</BodyText>
        </Dropdown.Menu.GroupedList.Heading>
        <Dropdown.Menu.GroupedList>
          {dropDownItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Dropdown.Menu.GroupedList.Item
                key={index}
                className={styles.dropDownItemButton}
                onClick={item.onClick}
              >
                <div className="flex flex-row gap-2 items-center">
                  <Icon />
                  <BodyText>{item.label}</BodyText>
                </div>
              </Dropdown.Menu.GroupedList.Item>
            );
          })}
        </Dropdown.Menu.GroupedList>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserDropdown;
