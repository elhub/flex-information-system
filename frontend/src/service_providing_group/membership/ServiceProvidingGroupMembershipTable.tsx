import { Tabs } from "../../components/ui";
import { ExistingControllableUnitsTable } from "./ExistingControllableUnitsTable";
import { FindControllableUnits } from "./FindControllableUnits";
import { useControllableUnitsInSpg } from "./useSpgMemberships";

type Props = {
  spgId: number;
};

export const ServiceProvidingGroupMembershipTable = ({ spgId }: Props) => {
  const { data: members, isLoading } = useControllableUnitsInSpg(spgId);
  const count = members?.length;
  const membersLabel = count !== undefined ? `Members (${count})` : "Members";

  return (
    <Tabs defaultValue="find">
      <Tabs.List>
        <Tabs.Tab label="Find controllable units" value="find" />
        <Tabs.Tab label={membersLabel} value="existing" />
      </Tabs.List>
      <Tabs.Panel value="existing">
        <ExistingControllableUnitsTable
          spgId={spgId}
          controllableUnits={members}
          isLoading={isLoading}
        />
      </Tabs.Panel>
      <Tabs.Panel value="find">
        <FindControllableUnits spgId={spgId} />
      </Tabs.Panel>
    </Tabs>
  );
};
