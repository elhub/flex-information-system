import { useState } from "react";
import { AccountingPointGridLocation } from "../../generated-client";
import { LabelValue } from "../../components/LabelValue";
import { KILO } from "../../utils/scales";
import { Alert, BodyText, Button, Heading, Panel } from "../../components/ui";
import { useTranslate } from "ra-core";
import { AccountingPointGridLocationInput } from "./AccountingPointGridLocationInput";
import { Substation } from "../show/AccountingPointLocationMap";

export const AccountingPointGridLocationPanel = ({
  apId,
  gridLocation,
  userCanEdit,
  isConnectingSystemOperator,
  selectedSubstation,
  onSelectSubstation,
  onClearSelection,
  onCancelSelection,
}: {
  apId: number;
  gridLocation: AccountingPointGridLocation | undefined;
  userCanEdit: boolean;
  isConnectingSystemOperator?: boolean;
  selectedSubstation?: Substation | null;
  onSelectSubstation?: (substation: Substation | null) => void;
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

  const isConfirmed = gridLocation?.quality.toLowerCase() === "confirmed";
  const heading = !gridLocation
    ? translate("text.accounting_point_grid_location_panel.heading.missing")
    : isConfirmed
      ? translate("text.accounting_point_grid_location_panel.heading.confirmed")
      : translate(
          "text.accounting_point_grid_location_panel.heading.suggested",
        );

  return (
    <Panel border className="bg-white h-fit p-4 mt-4">
      <div className="flex items-center justify-between">
        <Heading level={3} size="medium" className="mb-4">
          {heading}
        </Heading>
        {userCanEdit && !isEditing && gridLocation != null && (
          <Button
            variant={isConfirmed ? "secondary" : "primary"}
            onClick={() => setIsEditing(true)}
            className="mt-[-16px]"
          >
            {isConfirmed
              ? translate(
                  "text.accounting_point_grid_location_panel.button.edit_details",
                )
              : translate(
                  "text.accounting_point_grid_location_panel.button.validate_grid_location",
                )}
          </Button>
        )}
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

      {isEditing ? (
        <AccountingPointGridLocationInput
          apId={apId}
          gridLocation={gridLocation}
          onDone={handleDone}
          onCancel={() => {
            setIsEditing(false);
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
              onClick={() => setIsEditing(true)}
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
            labelKey="accounting_point_grid_location.quality"
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
