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
import { Permissions } from "../../auth/permissions";
import { useTabSearchParam } from "../../hooks/useTabSearchParam";

const userCanViewGrid = (identity: UserIdentity | undefined) =>
  identity?.role === "flex_flexibility_information_system_operator" ||
  identity?.role === "flex_system_operator";

type Props = {
  gridLocation: AccountingPointGridLocation | undefined;
  location: AccountingPoint["location"];
  selectedSubstation?: Substation | null;
  onSelectSubstation: (substation: Substation) => void;
};

export const AccountingPointShowTabs = ({
  gridLocation,
  location,
  selectedSubstation,
  onSelectSubstation,
}: Props) => {
  const { permissions } = usePermissions<Permissions>();
  const { data: identity } = useGetIdentity();
  const canViewLocation = !!permissions?.allow(
    "accounting_point.location",
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
        {canViewLocation && (
          <div className={""}>
            <AccountingPointLocationMap
              location={location}
              canViewGrid={userCanViewGrid(identity)}
              onSubstationClick={handleSubstationClick}
              highlightedSubstationBusinessId={highlightedBusinessId}
            />
          </div>
        )}
      </Tabs.Panel>
    </Tabs>
  );
};
