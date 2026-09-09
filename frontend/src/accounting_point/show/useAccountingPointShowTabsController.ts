import { useGetIdentity, usePermissions } from "ra-core";
import { Permissions } from "../../auth/permissions";
import { useTabSearchParam } from "../../hooks/useTabSearchParam";
import { AccountingPointGridLocation } from "../../generated-client";
import { Substation } from "./AccountingPointLocationMap";

const userCanViewGrid = (role: string | undefined) =>
  role === "flex_flexibility_information_system_operator" ||
  role === "flex_system_operator";

// Controller/logic layer: owns RA (usePermissions, useGetIdentity) and tab
// state (useTabSearchParam). Returns plain data/booleans/functions only.
export const useAccountingPointShowTabsController = ({
  gridLocation,
  selectedSubstation,
  onSelectSubstation,
}: {
  gridLocation: AccountingPointGridLocation | undefined;
  selectedSubstation: Substation | null;
  onSelectSubstation: (substation: Substation) => void;
}) => {
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

  return {
    tab,
    setTab,
    canViewLocation,
    canViewGrid: userCanViewGrid(identity?.role),
    highlightedBusinessId,
    handleSubstationClick,
  };
};
