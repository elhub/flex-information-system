import { useAccountingPointViewModel } from "./useAccountingPointViewModel";
import { useParams } from "react-router-dom";
import { Heading, Loader, Panel } from "../../components/ui";
import { ShowPageLayout } from "../../components/ShowPageLayout";
import { useGetIdentity } from "react-admin";
import { AccountingPointConnections } from "./AccountingPointConnections";
import { AccountingPointShowTabs } from "./AccountingPointShowTabs";
import { LabelValue } from "../../components/LabelValue";
import { AccountingPointGridLocationPanel } from "../grid_location/AccountingPointGridLocationPanel";
import { usePermissions } from "ra-core";
import { Permissions } from "../../auth/permissions";
import { useState } from "react";
import { Substation } from "./AccountingPointLocationMap";

export const AccountingPointShow = () => {
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

  const handleCancelSelection = () => {
    setSelectedSubstation(null);
  };

  const handleClearSelection = () => {
    setSelectedSubstation(null);
  };

  const handleFormSubstationSelect = (substation: Substation | null) => {
    setSelectedSubstation(substation);
    if (substation) {
      setFormSelectionTick((current) => current + 1);
    }
  };

  const [selectedSubstation, setSelectedSubstation] =
    useState<Substation | null>(null);
  const [formSelectionTick, setFormSelectionTick] = useState(0);

  const {
    data: viewModel,
    isPending,
    error,
  } = useAccountingPointViewModel(apId);

  if (error) {
    throw error;
  }

  if (isPending) {
    return <Loader />;
  }

  if (!viewModel?.accountingPoint) {
    return null;
  }

  const ap = viewModel.accountingPoint;

  return (
    <ShowPageLayout title="Accounting Point">
      <div>
        <Panel
          border
          className="bg-semantic-background-alternative h-fit p-4 sm:p-5"
        >
          <Heading level={3} size="medium" className="mb-4">
            General Information
          </Heading>
          <div className="flex flex-col gap-4">
            <LabelValue
              size="large"
              labelKey="accounting_point.business_id"
              value={ap.business_id}
            />

            {identity?.role ===
              "flex_flexibility_information_system_operator" && (
              <AccountingPointConnections
                endUser={viewModel.endUser}
                meteringGridArea={viewModel.meteringGridArea}
              />
            )}
          </div>
        </Panel>
        {canViewGridLocation && (
          <AccountingPointGridLocationPanel
            apId={ap.id}
            gridLocation={viewModel.gridLocation}
            userCanEdit={canEditGridLocation}
            selectedSubstation={selectedSubstation}
            onSelectSubstation={handleFormSubstationSelect}
            onClearSelection={handleClearSelection}
            onCancelSelection={handleCancelSelection}
          />
        )}
      </div>

      <AccountingPointShowTabs
        gridLocation={viewModel.gridLocation}
        location={ap.location}
        selectedSubstation={selectedSubstation}
        onSelectSubstation={setSelectedSubstation}
        formSelectionTick={formSelectionTick}
      />
    </ShowPageLayout>
  );
};
