import { useState } from "react";
import { useGetIdentity, usePermissions, UserIdentity } from "ra-core";
import { Tabs } from "../../components/ui";
import {
  AccountingPoint,
  AccountingPointGridLocation,
} from "../../generated-client";
import { AccountingPointGridLocationPanel } from "../grid_location/AccountingPointGridLocationPanel";
import {
  AccountingPointLocationMap,
  Substation,
} from "./AccountingPointLocationMap";
import { Permissions } from "../../auth/permissions";
import { useTabSearchParam } from "../../hooks/useTabSearchParam";

const userCanViewGrid = (identity: UserIdentity | undefined) =>
  identity?.role === "flex_flexibility_information_system_operator" ||
  identity?.role === "flex_system_operator";

type Props = {
  accountingPoint: AccountingPoint;
  gridLocation: AccountingPointGridLocation | undefined;
  location: AccountingPoint["location"];
};

export const AccountingPointShowTabs = ({
  accountingPoint,
  gridLocation,
  location,
}: Props) => {
  const { permissions } = usePermissions<Permissions>();
  const { data: identity } = useGetIdentity();
  const canViewLocation = !!permissions?.allow(
    "accounting_point.location",
    "read",
  );
  const canViewGridLocation = !!permissions?.allow(
    "accounting_point_grid_location",
    "read",
  );
  const canEditGridLocation = !!permissions?.allow(
    "accounting_point_grid_location",
    "update",
  );
  const [tab, setTab] = useTabSearchParam("location");
  const [selectedSubstation, setSelectedSubstation] =
    useState<Substation | null>(null);

  const handleSubstationClick = canEditGridLocation
    ? (substation: Substation) => setSelectedSubstation(substation)
    : undefined;

  const handleClearSelection = () => setSelectedSubstation(null);

  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label="Location" value="location" />
      </Tabs.List>
      <Tabs.Panel value="location">
        {canViewLocation && (
          <AccountingPointLocationMap
            accountingPointId={accountingPoint.id}
            location={location}
            canViewGrid={userCanViewGrid(identity)}
            onSubstationClick={handleSubstationClick}
          />
        )}
        {canViewGridLocation && (
          <AccountingPointGridLocationPanel
            apId={accountingPoint.id}
            gridLocation={gridLocation}
            userCanEdit={canEditGridLocation}
            selectedSubstation={selectedSubstation}
            onClearSelection={handleClearSelection}
          />
        )}
      </Tabs.Panel>
    </Tabs>
  );
};
