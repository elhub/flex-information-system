import { useState } from "react";
import {
  useGetIdentity,
  usePermissions,
  UserIdentity,
  useTranslate,
} from "ra-core";
import { Button, Tabs } from "../../components/ui";
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
import { AccountingPointControllableUnitsTable } from "./AccountingPointControllableUnitsTable";
import { AccountingPointShowOverview } from "./AccountingPointShowOverview";

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
  const translate = useTranslate();
  const { permissions } = usePermissions<Permissions>();
  const { data: identity } = useGetIdentity();
  const [isGridLocationEditing, setIsGridLocationEditing] = useState(false);
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
  const canViewControllableUnits = !!permissions?.allow(
    "controllable_unit",
    "read",
  );
  const [tab, setTab] = useTabSearchParam("overview");

  const highlightedBusinessId =
    selectedSubstation?.business_id ?? gridLocation?.business_id ?? null;
  const isConfirmed = gridLocation?.quality?.toLowerCase() === "confirmed";

  const handleSubstationClick = canEditGridLocation
    ? (substation: Substation) => {
        // when a substation is clicked on the map, open the edit form
        setIsGridLocationEditing(true);
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
        <Tabs.Tab label={translate("text.tab.overview")} value="overview" />
        <Tabs.Tab
          label={translate("text.tab.grid_location")}
          value="location"
        />
        {canViewControllableUnits && (
          <Tabs.Tab
            label={translate("text.tab.controllable_units")}
            value="controllable_units"
          />
        )}
      </Tabs.List>
      <Tabs.Panel value="overview" className="flex-1 min-h-0">
        <AccountingPointShowOverview
          accountingPointId={ap.id}
          gridLocation={gridLocation}
          canViewControllableUnits={canViewControllableUnits}
          canViewGridLocation={canViewGridLocation}
        />
      </Tabs.Panel>
      <Tabs.Panel value="location" className="flex-1 min-h-0">
        {canViewGridLocation &&
          canEditGridLocation &&
          !isGridLocationEditing &&
          gridLocation != null && (
            <div className="mb-4 flex justify-end">
              <Button
                variant={isConfirmed ? "secondary" : "primary"}
                onClick={() => setIsGridLocationEditing(true)}
              >
                {isConfirmed
                  ? translate(
                      "text.accounting_point_grid_location_panel.button.edit_details",
                    )
                  : translate(
                      "text.accounting_point_grid_location_panel.button.validate_grid_location",
                    )}
              </Button>
            </div>
          )}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          {canViewGridLocation && (
            <div className="w-full lg:w-[380px] shrink-0 flex">
              <AccountingPointGridLocationPanel
                apId={ap.id}
                gridLocation={gridLocation}
                userCanEdit={canEditGridLocation}
                isEditing={isGridLocationEditing}
                onEditingChange={setIsGridLocationEditing}
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
      {canViewControllableUnits && (
        <Tabs.Panel value="controllable_units" className="flex-1 min-h-0">
          <AccountingPointControllableUnitsTable accountingPointId={ap.id} />
        </Tabs.Panel>
      )}
    </Tabs>
  );
};
