import { useGetIdentity, usePermissions } from "ra-core";
import { Tabs } from "../../components/ui";
import {
  AccountingPoint,
  AccountingPointGridLocation,
} from "../../generated-client";
import { AccountingPointGridLocationPanel } from "../grid_location/AccountingPointGridLocationPanel";
import { Permissions } from "../../auth/permissions";

const userCanEditGridLocation = (
  identity: any,
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
};

export const AccountingPointShowTabs = ({
  accountingPoint,
  gridLocation,
}: Props) => {
  const { permissions } = usePermissions<Permissions>();
  const { data: identity } = useGetIdentity();
  const canViewGridLocation = !!permissions?.allow(
    "accounting_point_grid_location",
    "read",
  );

  return (
    <Tabs defaultValue="grid_location" className="relative top-[-24px]">
      <Tabs.List>
        {canViewGridLocation && (
          <Tabs.Tab label="Grid Location" value="grid_location" />
        )}
      </Tabs.List>
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
