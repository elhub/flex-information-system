import { Tabs } from "../../components/ui";
import { AccountingPointGridLocation } from "../../generated-client";
import { AccountingPointGridLocationPanel } from "../grid_location/AccountingPointGridLocationPanel";

type Props = {
  apId: number;
  gridLocation: AccountingPointGridLocation | undefined;
  userCanViewGridLocation: boolean;
  userCanEditGridLocation: boolean;
};

export const AccountingPointShowTabs = ({
  apId,
  gridLocation,
  userCanViewGridLocation,
  userCanEditGridLocation,
}: Props) => (
  <Tabs defaultValue="grid_location" className="relative top-[-24px]">
    <Tabs.List>
      {userCanViewGridLocation && (
        <Tabs.Tab label="Grid Location" value="grid_location" />
      )}
    </Tabs.List>
    {userCanViewGridLocation && (
      <Tabs.Panel value="grid_location">
        <AccountingPointGridLocationPanel
          apId={apId}
          gridLocation={gridLocation}
          userCanEdit={userCanEditGridLocation}
        />
      </Tabs.Panel>
    )}
  </Tabs>
);
