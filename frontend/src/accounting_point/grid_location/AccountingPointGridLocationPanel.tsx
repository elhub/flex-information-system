import { useState } from "react";
import { AccountingPointGridLocation } from "../../generated-client";
import { LabelValue } from "../../components/LabelValue";
import { Button, Panel } from "../../components/ui";
import { useTranslate } from "ra-core";
import { IconPencil } from "@elhub/ds-icons";
import { AccountingPointGridLocationInput } from "./AccountingPointGridLocationInput";
import { Substation } from "../show/AccountingPointLocationMap";

export const AccountingPointGridLocationPanel = ({
  apId,
  gridLocation,
  userCanEdit,
  selectedSubstation,
  onClearSelection,
}: {
  apId: number;
  gridLocation: AccountingPointGridLocation | undefined;
  userCanEdit: boolean;
  selectedSubstation?: Substation | null;
  onClearSelection?: () => void;
}) => {
  const translate = useTranslate();
  const [isEditingManual, setIsEditingManual] = useState(false);

  // when a substation is clicked on the map, open the edit form
  const isEditing = isEditingManual || (!!selectedSubstation && userCanEdit);
  const setIsEditing = (value: boolean) => setIsEditingManual(value);

  const handleDone = () => {
    setIsEditing(false);
    onClearSelection?.();
  };

  return (
    <Panel border className="bg-white h-fit p-4">
      <div className="flex items-center justify-between mb-4">
        {!isEditing && (
          <h3 className="text-base font-semibold">{gridLocation?.name}</h3>
        )}
        {userCanEdit && !isEditing && gridLocation != null && (
          <Button
            variant="invisible"
            icon={IconPencil}
            onClick={() => setIsEditing(true)}
          >
            Edit Details
          </Button>
        )}
      </div>

      {isEditing ? (
        <AccountingPointGridLocationInput
          apId={apId}
          gridLocation={gridLocation}
          onDone={handleDone}
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
              variant="secondary"
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
            size="small"
            labelKey="accounting_point_grid_location.object_type"
            value={translate(
              `enum.accounting_point_grid_location.object_type.${gridLocation.object_type}`,
            )}
          />
          <LabelValue
            size="small"
            labelKey="accounting_point_grid_location.business_id"
            value={gridLocation.business_id}
          />
          <LabelValue
            size="small"
            labelKey="accounting_point_grid_location.nominal_voltage"
            value={gridLocation.nominal_voltage}
            unit="kV"
          />
          <LabelValue
            size="small"
            labelKey="accounting_point_grid_location.source"
            value={translate(
              `enum.accounting_point_grid_location.source.${gridLocation.source}`,
            )}
          />
          <LabelValue
            size="small"
            labelKey="accounting_point_grid_location.quality"
            value={translate(
              `enum.accounting_point_grid_location.quality.${gridLocation.quality}`,
            )}
          />
          <LabelValue
            size="small"
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
