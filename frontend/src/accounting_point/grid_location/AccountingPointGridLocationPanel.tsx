import { AccountingPointGridLocation } from "../../generated-client";
import { LabelValue } from "../../components/LabelValue";
import { KILO } from "../../utils/scales";
import { Alert, BodyText, Button, Heading, Panel } from "../../components/ui";
import { AccountingPointGridLocationInput } from "./AccountingPointGridLocationInput";
import { Substation } from "../show/AccountingPointLocationMap";
import { useAccountingPointGridLocationPanelController } from "./useAccountingPointGridLocationPanelController";

// Presentational: RA (useTranslate) and edit-toggle state live in
// useAccountingPointGridLocationPanelController.
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
  const {
    isEditing,
    setIsEditing,
    handleDone,
    handleCancel,
    isConfirmed,
    heading,
    editButtonLabel,
    showMissingVoltageWarning,
    emptyStateText,
    addButtonLabel,
    objectTypeLabel,
    sourceLabel,
    qualityLabel,
  } = useAccountingPointGridLocationPanelController({
    gridLocation,
    userCanEdit,
    isConnectingSystemOperator,
    selectedSubstation,
    onClearSelection,
    onCancelSelection,
  });

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
            {editButtonLabel}
          </Button>
        )}
      </div>

      {showMissingVoltageWarning && (
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
          onCancel={handleCancel}
          selectedSubstation={selectedSubstation}
          onSelectSubstation={onSelectSubstation}
          onClearMapSelection={onClearSelection}
        />
      ) : gridLocation == null ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">{emptyStateText}</p>
          {userCanEdit && (
            <Button
              variant="primary"
              className="max-w-fit"
              onClick={() => setIsEditing(true)}
            >
              {addButtonLabel}
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
            value={objectTypeLabel}
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
            value={sourceLabel}
          />
          <LabelValue
            size="large"
            tooltip
            labelKey="accounting_point_grid_location.quality"
            value={qualityLabel}
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
