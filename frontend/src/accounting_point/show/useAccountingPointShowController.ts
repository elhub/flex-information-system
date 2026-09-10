import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetIdentity } from "react-admin";
import { usePermissions } from "ra-core";
import { Permissions } from "../../auth/permissions";
import { useAccountingPointViewModel } from "./useAccountingPointViewModel";
import { Substation } from "./AccountingPointLocationMap";

// Controller/logic layer: owns routing (useParams), RA (useGetIdentity,
// usePermissions), data fetching (useAccountingPointViewModel), and
// map-selection state. Returns plain data/booleans/functions only.
export const useAccountingPointShowController = () => {
  const { id } = useParams<{ id: string }>();
  const apId = Number(id);
  const { data: identity } = useGetIdentity();
  const { permissions } = usePermissions<Permissions>();

  const canViewGridLocation = !!permissions?.allow(
    "accounting_point_grid_location",
    "read",
  );

  const canEditGridLocation = !!permissions?.allow(
    "accounting_point_grid_location",
    "update",
  );

  const canSeeConnections =
    identity?.role === "flex_flexibility_information_system_operator";

  const [selectedSubstation, setSelectedSubstation] =
    useState<Substation | null>(null);
  const [popupSubstation, setPopupSubstation] = useState<Substation | null>(
    null,
  );

  const handleCancelSelection = () => {
    setSelectedSubstation(null);
    setPopupSubstation(null);
  };

  const handleClearSelection = () => {
    setSelectedSubstation(null);
    setPopupSubstation(null);
  };

  const handleSubstationSelect = (substation: Substation | null) => {
    setSelectedSubstation(substation);
    setPopupSubstation(substation);
  };

  const closePopup = () => setPopupSubstation(null);

  const {
    data: viewModel,
    isPending,
    error,
  } = useAccountingPointViewModel(apId);

  const ap = viewModel?.accountingPoint;
  const isConnectingSystemOperator =
    identity?.partyID !== undefined &&
    ap?.system_operator_id !== undefined &&
    identity.partyID === ap.system_operator_id;

  return {
    viewModel,
    isPending,
    error,
    canSeeConnections,
    canViewGridLocation,
    canEditGridLocation,
    isConnectingSystemOperator,
    selectedSubstation,
    popupSubstation,
    handleSubstationSelect,
    handleClearSelection,
    handleCancelSelection,
    closePopup,
  };
};
