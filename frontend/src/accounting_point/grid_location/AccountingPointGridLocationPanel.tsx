import { useState } from "react";
import { IconCheckCircle, IconWarningCircle } from "@elhub/ds-icons";
import { AccountingPointGridLocation } from "../../generated-client";
import { LabelValue } from "../../components/LabelValue";
import { KILO } from "../../utils/scales";
import {
  Alert,
  Badge,
  BodyText,
  Button,
  Heading,
  Panel,
  Tooltip,
} from "../../components/ui";
import { useTranslate } from "ra-core";
import { AccountingPointGridLocationInput } from "./AccountingPointGridLocationInput";
import { Substation } from "../show/AccountingPointLocationMap";
import { tooltips } from "../../tooltip/tooltips";

const qualityLabelKey = "accounting_point_grid_location.quality" as const;

export const AccountingPointGridLocationPanel = ({
  apId,
  gridLocation,
  userCanEdit,
  isConnectingSystemOperator,
  isEditing,
  onEditingChange,
  selectedSubstation,
  onSelectSubstation,
  onClearSelection,
  onCancelSelection,
}: {
  apId: number;
  gridLocation: AccountingPointGridLocation | undefined;
  userCanEdit: boolean;
  isConnectingSystemOperator?: boolean;
  isEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  selectedSubstation?: Substation | null;
  onSelectSubstation?: (substation: Substation | null) => void;
  onClearSelection?: () => void;
  onCancelSelection?: () => void;
}) => {
  const translate = useTranslate();
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const editing = isEditing ?? internalIsEditing;

  const setEditing = (nextIsEditing: boolean) => {
    if (onEditingChange) {
      onEditingChange(nextIsEditing);
      return;
    }
    setInternalIsEditing(nextIsEditing);
  };

  // when a substation is clicked on the map, open the edit form
  if (!!selectedSubstation && userCanEdit && !editing) {
    setEditing(true);
  }

  const handleDone = () => {
    setEditing(false);
    onClearSelection?.();
  };

  const isConfirmed = gridLocation?.quality.toLowerCase() === "confirmed";
  const status = !gridLocation
    ? translate("text.accounting_point_grid_location_panel.status.missing")
    : isConfirmed
      ? translate("text.accounting_point_grid_location_panel.status.confirmed")
      : translate("text.accounting_point_grid_location_panel.status.guessed");
  const statusBadge = !gridLocation
    ? { status: "failed" as const, icon: IconWarningCircle }
    : isConfirmed
      ? { status: "approved" as const, icon: IconCheckCircle }
      : { status: "approved-with-warning" as const, icon: IconWarningCircle };
  const qualityTooltip = tooltips[qualityLabelKey];

  return (
    <Panel border className="bg-white p-4 w-full flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heading level={3} size="medium">
            {translate("text.accounting_point_grid_location_panel.heading")}
          </Heading>
          {!editing && (
            <Tooltip content={qualityTooltip}>
              <Badge
                size="small"
                status={statusBadge.status}
                variant="block"
                icon={statusBadge.icon}
                className="whitespace-nowrap"
              >
                {status}
              </Badge>
            </Tooltip>
          )}
        </div>
      </div>

      {gridLocation?.nominal_voltage === 0 && isConnectingSystemOperator && (
        <Alert variant="warning" className="gap-4 mb-4">
          <Heading size="small">Missing nominal voltage</Heading>
          <BodyText>
            As the connecting system operator, you can update the grid location
            to give this information.
          </BodyText>
        </Alert>
      )}

      {editing ? (
        <AccountingPointGridLocationInput
          apId={apId}
          gridLocation={gridLocation}
          onDone={handleDone}
          onCancel={() => {
            setEditing(false);
            onCancelSelection?.();
          }}
          selectedSubstation={selectedSubstation}
          onSelectSubstation={onSelectSubstation}
          onClearMapSelection={onClearSelection}
        />
      ) : gridLocation == null ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            {translate(
              "text.accounting_point_grid_location_panel.empty.no_grid_location_set",
            )}
          </p>
          {userCanEdit && (
            <Button
              variant="primary"
              className="max-w-fit"
              onClick={() => setEditing(true)}
            >
              {translate(
                "text.accounting_point_grid_location_panel.button.add_grid_location",
              )}
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <LabelValue
            size="large"
            tooltip
            labelKey="accounting_point_grid_location.name"
            value={gridLocation?.name}
          />
          <LabelValue
            size="large"
            labelKey="accounting_point_grid_location.object_type"
            value={translate(
              `enum.accounting_point_grid_location.object_type.${gridLocation.object_type}`,
            )}
          />
          <LabelValue
            size="large"
            tooltip
            labelKey="accounting_point_grid_location.business_id"
            value={gridLocation.business_id}
          />
          <LabelValue
            size="large"
            tooltip
            labelKey="accounting_point_grid_location.nominal_voltage"
            value={gridLocation.nominal_voltage}
            unit="V"
            storageScale={KILO}
          />
          <LabelValue
            size="large"
            labelKey="accounting_point_grid_location.source"
            value={translate(
              `enum.accounting_point_grid_location.source.${gridLocation.source}`,
            )}
          />
          <LabelValue
            size="large"
            tooltip
            labelKey={qualityLabelKey}
            value={translate(
              `enum.accounting_point_grid_location.quality.${gridLocation.quality}`,
            )}
          />
          <LabelValue
            size="large"
            labelKey="accounting_point_grid_location.additional_information"
            value={
              gridLocation.additional_information ? (
                <span className="whitespace-pre-wrap">
                  {gridLocation.additional_information}
                </span>
              ) : undefined
            }
          />
        </div>
      )}
    </Panel>
  );
};
