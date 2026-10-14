import { useAccountingPointViewModel } from "./useAccountingPointViewModel";
import { useParams } from "react-router-dom";
import { Loader } from "../../components/ui";
import { useGetIdentity, useTranslate } from "react-admin";
import { AccountingPointShowTabs } from "./AccountingPointShowTabs";
import { useState } from "react";
import { Substation } from "./AccountingPointLocationMap";
import { ResourceShowLayout } from "../../components/ResourceShowLayout";

export const AccountingPointShow = () => {
  const { id } = useParams<{ id: string }>();
  const apId = Number(id);
  const { data: identity } = useGetIdentity();
  const translate = useTranslate();

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
  const summary = [
    {
      labelKey: "accounting_point.system_operator_id" as const,
      value: viewModel.systemOperator?.name,
    },
    {
      labelKey: "accounting_point_end_user.end_user_id" as const,
      value: viewModel.endUser?.name,
      shouldShow:
        identity?.role === "flex_flexibility_information_system_operator",
    },
    {
      labelKey:
        "accounting_point_metering_grid_area.metering_grid_area_id" as const,
      value: viewModel.meteringGridArea?.name,
      shouldShow:
        identity?.role === "flex_flexibility_information_system_operator",
    },
  ];

  return (
    <ResourceShowLayout
      secondaryHeaderText={translate("text.accounting_point_show.header")}
      mainHeaderText={ap.business_id}
      summary={summary}
      content={
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
      }
    />
  );
};
