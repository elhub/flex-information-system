import { useAccountingPointViewModel } from "./useAccountingPointViewModel";
import { useParams } from "react-router-dom";
import { Heading, Loader, Panel } from "../../components/ui";
import { ShowPageLayout } from "../../components/ShowPageLayout";
import { useGetIdentity } from "react-admin";
import { AccountingPointConnections } from "./AccountingPointConnections";
import { AccountingPointShowTabs } from "./AccountingPointShowTabs";
import { LabelValue } from "../../components/LabelValue";
import { useState } from "react";
import { Substation } from "./AccountingPointLocationMap";

export const AccountingPointShow = () => {
  const { id } = useParams<{ id: string }>();
  const apId = Number(id);
  const { data: identity } = useGetIdentity();

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

  const [selectedSubstation, setSelectedSubstation] =
    useState<Substation | null>(null);
  const [popupSubstation, setPopupSubstation] = useState<Substation | null>(
    null,
  );

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

      <AccountingPointShowTabs
        ap={ap}
        gridLocation={viewModel.gridLocation}
        selectedSubstation={selectedSubstation}
        onSelectSubstation={handleSubstationSelect}
        onClearSelection={handleClearSelection}
        onCancelSelection={handleCancelSelection}
        popupSubstation={popupSubstation}
        onClosePopup={() => setPopupSubstation(null)}
      />
    </ShowPageLayout>
  );
};
