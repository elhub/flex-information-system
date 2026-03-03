import { Tabs } from "../../components/ui";
import { ExistingControllableUnitsTable } from "./ExistingControllableUnitsTable";
import { FindControllableUnits } from "./FindControllableUnits";

type Props = {
  spgId: number;
  biddingZone?: string;
};

export const ServiceProvidingGroupMembershipTable = ({ spgId }: Props) => (
  <Tabs defaultValue="existing">
    <Tabs.List>
      <Tabs.Tab label="Members" value="existing" />
      <Tabs.Tab label="Find controllable units" value="find" />
    </Tabs.List>
    <Tabs.Panel value="existing">
      <ExistingControllableUnitsTable spgId={spgId} />
    </Tabs.Panel>
    <Tabs.Panel value="find">
      <FindControllableUnits spgId={spgId} />
    </Tabs.Panel>
  </Tabs>
);
