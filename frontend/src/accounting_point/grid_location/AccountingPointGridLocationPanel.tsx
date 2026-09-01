import { useState } from "react";
import { AccountingPointGridLocation } from "../../generated-client";
import { LabelValue } from "../../components/LabelValue";
import { KILO } from "../../utils/scales";
import { Button, Heading, Panel } from "../../components/ui";
import { useTranslate } from "ra-core";
import { AccountingPointGridLocationInput } from "./AccountingPointGridLocationInput";
import { Substation } from "../show/AccountingPointLocationMap";

export const AccountingPointGridLocationPanel = ({
  apId,
  gridLocation,
  userCanEdit,
  selectedSubstation,
  onClearSelection,
  onCancelSelection,
}: {
  apId: number;
  gridLocation: AccountingPointGridLocation | undefined;
  userCanEdit: boolean;
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

  const isConfirmed = gridLocation?.quality.toLowerCase() === "confirmed";

  return (
    <Panel border className="bg-white h-fit p-4 mt-4">
      <div className="flex items-center justify-between mt-4">
        <Heading level={3} size="medium" className="mb-4">
          {isConfirmed ? "Confirmed Grid location" : "Suggested Grid location"}
        </Heading>
        {userCanEdit && !isEditing && gridLocation != null && (
          <Button
            variant={isConfirmed ? "secondary" : "primary"}
            onClick={() => setIsEditing(true)}
          >
            {isConfirmed ? "Edit details" : "Validate Grid Location"}
          </Button>
        )}
      </div>

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
          onClearMapSelection={onClearSelection}
        />
      ) : gridLocation == null ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            No grid location set for this accounting point yet
          </p>
          {userCanEdit && (
            <Button
              variant="primary"
              className="max-w-fit"
              onClick={() => setIsEditing(true)}
            >
              Add grid location
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
