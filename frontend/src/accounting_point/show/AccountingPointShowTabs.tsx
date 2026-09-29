import { useGetIdentity, usePermissions, UserIdentity } from "ra-core";
import { Tabs } from "../../components/ui";
import {
  AccountingPoint,
  AccountingPointGridLocation,
} from "../../generated-client";
import {
  AccountingPointLocationMap,
  Substation,
} from "./AccountingPointLocationMap";
import { AccountingPointGridLocationPanel } from "../grid_location/AccountingPointGridLocationPanel";
import { Permissions } from "../../auth/permissions";
import { useTabSearchParam } from "../../hooks/useTabSearchParam";

const userCanViewGrid = (identity: UserIdentity | undefined) =>
  identity?.role === "flex_flexibility_information_system_operator" ||
  identity?.role === "flex_system_operator";

type Props = {
  ap: AccountingPoint;
  gridLocation: AccountingPointGridLocation | undefined;
  selectedSubstation: Substation | null;
  onSelectSubstation: (substation: Substation | null) => void;
  onClearSelection: () => void;
  onCancelSelection: () => void;
  popupSubstation: Substation | null;
  onClosePopup: () => void;
};

export const AccountingPointShowTabs = ({
  ap,
  gridLocation,
  selectedSubstation,
  onSelectSubstation,
  onClearSelection,
  onCancelSelection,
  popupSubstation,
  onClosePopup,
}: Props) => {
  const { permissions } = usePermissions<Permissions>();
  const { data: identity } = useGetIdentity();
  const location = ap.location;
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

  const highlightedBusinessId =
    selectedSubstation?.business_id ?? gridLocation?.business_id ?? null;

  const handleSubstationClick = canEditGridLocation
    ? (substation: Substation) => {
        onSelectSubstation(substation);
      }
    : undefined;

  return (
    <Tabs
      value={tab}
      onChange={setTab}
      className="relative top-[-24px] h-full flex flex-col"
    >
      <Tabs.List>
        <Tabs.Tab label="Location" value="location" />
      </Tabs.List>
      <Tabs.Panel value="location" className="flex-1 min-h-0">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          {canViewGridLocation && (
            <div className="w-full lg:w-[380px] shrink-0 flex">
              <AccountingPointGridLocationPanel
                apId={ap.id}
                gridLocation={gridLocation}
                userCanEdit={canEditGridLocation}
                isConnectingSystemOperator={
                  identity?.partyID !== undefined &&
                  identity.partyID === ap.system_operator_id
                }
                selectedSubstation={selectedSubstation}
                onSelectSubstation={onSelectSubstation}
                onClearSelection={onClearSelection}
                onCancelSelection={onCancelSelection}
              />
            </div>
          )}
          {canViewLocation && (
            <div className="flex-1 min-w-0 w-full">
              <AccountingPointLocationMap
                location={location}
                canViewGrid={userCanViewGrid(identity)}
                onSubstationClick={handleSubstationClick}
                highlightedSubstationBusinessId={highlightedBusinessId}
                selectedSubstation={selectedSubstation}
                popupSubstation={popupSubstation}
                onClosePopup={onClosePopup}
              />
            </div>
          )}
        </div>
      </Tabs.Panel>
    </Tabs>
  );
};
