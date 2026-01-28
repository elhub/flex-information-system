import { BodyText, Button, Dropdown, FlexDiv, Loader } from "../ui";
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

  return (
    <Dropdown>
      <Button
        icon={IconChevronDown}
        iconPosition="right"
        variant="invisible"
        as={Dropdown.Toggle}
        size="medium"
        className={styles.dropDownToggle}
        data-testid="header-desktop-menu-toggle"
      >
        <FlexDiv gap={0.5}>
          <IconUser />
          <BodyText weight="bold">{data?.fullName ?? "User"}</BodyText>
        </FlexDiv>
      </Button>
      <Dropdown.Menu arrow placement="bottom">
        <Dropdown.Menu.GroupedList.Heading>
          <BodyText weight="bold">{roleLabel}</BodyText>
        </Dropdown.Menu.GroupedList.Heading>
        <Dropdown.Menu.GroupedList>
          <Dropdown.Menu.GroupedList.Item
            className={styles.dropDownItemButton}
            variant="invisible"
            onClick={handleAssumeParty}
          >
            <FlexDiv gap={0.5}>
              <IconBuilding />
              {data?.partyID ? "Unassume party" : "Assume party"}
            </FlexDiv>
          </Dropdown.Menu.GroupedList.Item>

          <Dropdown.Menu.GroupedList.Item
            className={styles.dropDownItemButton}
            onClick={handleMyEntity}
          >
            <FlexDiv gap={0.5}>
              <IconUser />
              <BodyText>My entity</BodyText>
            </FlexDiv>
          </Dropdown.Menu.GroupedList.Item>

          {data?.partyID && (
            <Dropdown.Menu.GroupedList.Item
              className={styles.dropDownItemButton}
              onClick={handleMyParty}
            >
              <FlexDiv gap={0.5}>
                <IconBuilding />
                <BodyText>My party</BodyText>
              </FlexDiv>
            </Dropdown.Menu.GroupedList.Item>
          )}

          <Dropdown.Menu.GroupedList.Item
            className={styles.dropDownItemButton}
            onClick={handleLogout}
          >
            <FlexDiv gap={0.5}>
              <IconViewOff />
              <BodyText>Logout</BodyText>
            </FlexDiv>
          </Dropdown.Menu.GroupedList.Item>
        </Dropdown.Menu.GroupedList>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserDropdown;
