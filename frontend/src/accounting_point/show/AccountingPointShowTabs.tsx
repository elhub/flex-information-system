import { useGetIdentity, usePermissions, UserIdentity } from "ra-core";
import { Tabs } from "../../components/ui";
import {
  AccountingPoint,
  AccountingPointGridLocation,
} from "../../generated-client";
import { AccountingPointGridLocationPanel } from "../grid_location/AccountingPointGridLocationPanel";
import { AccountingPointLocationMap } from "./AccountingPointLocationMap";
import { Permissions } from "../../auth/permissions";
import { useTabSearchParam } from "../../hooks/useTabSearchParam";

const userCanEditGridLocation = (
  identity: UserIdentity | undefined,
  accountingPoint: AccountingPoint,
  gridLocation: AccountingPointGridLocation | undefined,
) => {
  const isFISO =
    identity?.role === "flex_flexibility_information_system_operator";
  if (isFISO) return true;
  const isCSO = identity?.partyID == accountingPoint.system_operator_id;
  if (gridLocation?.source === "grid_model") return false;
  return !(gridLocation?.source === "cso" && !isCSO);
};

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
  const [tab, setTab] = useTabSearchParam("location");

  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        {canViewLocation && (
          <Tabs.Tab label="Geographic location" value="location" />
        )}
        {canViewGridLocation && (
          <Tabs.Tab label="Grid Location" value="grid_location" />
        )}
      </Tabs.List>
      {canViewLocation && (
        <Tabs.Panel value="location">
          <AccountingPointLocationMap location={location} />
        </Tabs.Panel>
      )}
      {canViewGridLocation && (
        <Tabs.Panel value="grid_location">
          <AccountingPointGridLocationPanel
            apId={accountingPoint.id}
            gridLocation={gridLocation}
            userCanEdit={userCanEditGridLocation(
              identity,
              accountingPoint,
              gridLocation,
            )}
          />
        </Tabs.Panel>
      )}
    </Tabs>
  );
};
