import { Heading, Loader, Panel } from "../../components/ui";
import { ShowPageLayout } from "../../components/ShowPageLayout";
import { AccountingPointConnections } from "./AccountingPointConnections";
import { AccountingPointShowTabs } from "./AccountingPointShowTabs";
import { LabelValue } from "../../components/LabelValue";
import { AccountingPointGridLocationPanel } from "../grid_location/AccountingPointGridLocationPanel";
import { useAccountingPointShowController } from "./useAccountingPointShowController";

// Presentational: routing, RA (identity/permissions), data fetching, and
// selection state all live in useAccountingPointShowController. This
// component only handles layout.
export const AccountingPointShow = () => {
  const {
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
  } = useAccountingPointShowController();

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

            {canSeeConnections && (
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
            isConnectingSystemOperator={isConnectingSystemOperator}
            selectedSubstation={selectedSubstation}
            onSelectSubstation={handleSubstationSelect}
            onClearSelection={handleClearSelection}
            onCancelSelection={handleCancelSelection}
          />
        )}
      </div>

      <AccountingPointShowTabs
        gridLocation={viewModel.gridLocation}
        location={ap.location}
        selectedSubstation={selectedSubstation}
        onSelectSubstation={handleSubstationSelect}
        popupSubstation={popupSubstation}
        onClosePopup={closePopup}
      />
    </ShowPageLayout>
  );
};
