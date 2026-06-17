import { BodyText, Button, Dropdown, Loader } from "../ui";
import {
  IconBuilding,
  IconChevronDown,
  IconUser,
  IconViewOff,
  IconBean,
} from "@elhub/ds-icons";
import {
  useGetIdentity,
  useDataProvider,
  useRedirect,
  useTranslate,
  getStorage,
} from "ra-core";
import { authURL } from "../../httpConfig";
import { FlexIdentity, sessionInfoKey } from "../../auth";

const UserDropdown = () => {
  const { data: rawIdentity, isLoading } = useGetIdentity();
  const identity = rawIdentity as FlexIdentity | undefined;
  const redirect = useRedirect();
  const translate = useTranslate();
  const dataProvider = useDataProvider();

  if (isLoading) {
    return <Loader size="small" />;
  }

  const roleLabel =
    identity?.role === "flex_entity"
      ? translate("text.entity_role")
      : translate(`enum.party.role.${identity?.role}`);

  const handleAssumeParty = () => {
    redirect("/login/assumeParty");
  };

  const handleMe = () => {
    redirect(`/entity/${identity?.entityID}/show`);
  };

  const handleParty = async () => {
    if (!identity?.partyID) return;
    if (identity.role === "flex_organisation") {
      try {
        const { data: party } = await dataProvider.getOne("party", {
          id: identity.partyID,
        });
        redirect(`/entity/${party.entity_id}/show`);
      } catch {
        redirect(`/party/${identity.partyID}/show`);
      }
      return;
    }
    redirect(`/party/${identity.partyID}/show`);
  };

  const handleLogout = () => {
    getStorage().removeItem(sessionInfoKey);
    redirect(`${authURL}/logout`);
  };

  const dropDownPartyItems = [
    ...(identity?.partyID
      ? [
          {
            label: identity?.partyName ?? "My party",
            icon: IconBuilding,
            onClick: handleParty,
          },
        ]
      : []),
    {
      label: identity?.partyID ? "Assume another party" : "Assume party",
      icon: IconBean,
      onClick: handleAssumeParty,
    },
  ];
  const dropDownEntityItems = [
    {
      label: identity?.entityName ?? "My entity",
      icon: IconUser,
      onClick: handleMe,
    },
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
        className="text-semantic-background"
      >
        <div className="flex flex-row gap-2 items-center">
          <IconUser />
          <BodyText weight="bold">{identity?.fullName ?? "User"}</BodyText>
        </div>
      </Button>
      <Dropdown.Menu arrow placement="bottom">
        <Dropdown.Menu.GroupedList.Heading>
          <BodyText weight="bold">{roleLabel}</BodyText>
        </Dropdown.Menu.GroupedList.Heading>
        <Dropdown.Menu.Divider />
        <Dropdown.Menu.GroupedList>
          {dropDownPartyItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Dropdown.Menu.GroupedList.Item
                key={index}
                className="flex gap-2 center"
                onClick={item.onClick}
              >
                <Icon />
                <BodyText>{item.label}</BodyText>
              </Dropdown.Menu.GroupedList.Item>
            );
          })}
        </Dropdown.Menu.GroupedList>
        <Dropdown.Menu.Divider />
        <Dropdown.Menu.GroupedList>
          {dropDownEntityItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Dropdown.Menu.GroupedList.Item
                key={index}
                className="flex gap-2 center"
                onClick={item.onClick}
              >
                <Icon />
                <BodyText>{item.label}</BodyText>
              </Dropdown.Menu.GroupedList.Item>
            );
          })}
        </Dropdown.Menu.GroupedList>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserDropdown;
