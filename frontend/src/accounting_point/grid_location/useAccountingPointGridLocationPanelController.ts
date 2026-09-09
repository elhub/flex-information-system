import { useState } from "react";
import { useTranslate } from "ra-core";
import { AccountingPointGridLocation } from "../../generated-client";
import { Substation } from "../show/AccountingPointLocationMap";

// Controller/logic layer: owns RA (useTranslate) and edit-toggle state.
// Returns plain data/booleans/strings/functions only.
export const useAccountingPointGridLocationPanelController = ({
  gridLocation,
  userCanEdit,
  isConnectingSystemOperator,
  selectedSubstation,
  onClearSelection,
  onCancelSelection,
}: {
  gridLocation: AccountingPointGridLocation | undefined;
  userCanEdit: boolean;
  isConnectingSystemOperator?: boolean;
  selectedSubstation?: Substation | null;
  onClearSelection?: () => void;
  onCancelSelection?: () => void;
}) => {
  const translate = useTranslate();
  const [isEditing, setIsEditing] = useState(false);

  // when a substation is clicked on the map, open the edit form
  if (!!selectedSubstation && userCanEdit && !isEditing) {
    setIsEditing(true);
  }

  const handleDone = () => {
    setIsEditing(false);
    onClearSelection?.();
  };

  const handleCancel = () => {
    setIsEditing(false);
    onCancelSelection?.();
  };

  const isConfirmed = gridLocation?.quality.toLowerCase() === "confirmed";

  const heading = !gridLocation
    ? translate("text.accounting_point_grid_location_panel.heading.missing")
    : isConfirmed
      ? translate("text.accounting_point_grid_location_panel.heading.confirmed")
      : translate(
          "text.accounting_point_grid_location_panel.heading.suggested",
        );

  const editButtonLabel = isConfirmed
    ? translate("text.accounting_point_grid_location_panel.button.edit_details")
    : translate(
        "text.accounting_point_grid_location_panel.button.validate_grid_location",
      );

  const showMissingVoltageWarning =
    gridLocation?.nominal_voltage === 0 && !!isConnectingSystemOperator;

  return {
    isEditing,
    setIsEditing,
    handleDone,
    handleCancel,
    isConfirmed,
    heading,
    editButtonLabel,
    showMissingVoltageWarning,
    emptyStateText: translate(
      "text.accounting_point_grid_location_panel.empty.no_grid_location_set",
    ),
    addButtonLabel: translate(
      "text.accounting_point_grid_location_panel.button.add_grid_location",
    ),
    objectTypeLabel: gridLocation
      ? translate(
          `enum.accounting_point_grid_location.object_type.${gridLocation.object_type}`,
        )
      : undefined,
    sourceLabel: gridLocation
      ? translate(
          `enum.accounting_point_grid_location.source.${gridLocation.source}`,
        )
      : undefined,
    qualityLabel: gridLocation
      ? translate(
          `enum.accounting_point_grid_location.quality.${gridLocation.quality}`,
        )
      : undefined,
  };
};
