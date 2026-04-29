import { useAccountingPointViewModel } from "./useAccountingPointViewModel";
import { useParams } from "react-router-dom";
import { Loader, Panel } from "../../components/ui";
import { ShowPageLayout } from "../../components/ShowPageLayout";
import { useGetIdentity } from "react-admin";
import { AccountingPointConnections } from "./AccountingPointConnections";
import { AccountingPointShowTabs } from "./AccountingPointShowTabs";
import { LabelValue } from "../../components/LabelValue";
import { formatDate } from "date-fns";
import {
  AccountingPoint,
  AccountingPointGridLocation,
} from "../../generated-client";

const userCanViewGridLocation = (role: string | undefined) =>
  role === "flex_flexibility_information_system_operator" ||
  role === "flex_system_operator";

const userCanEditGridLocation = (
  identity: any,
  accountingPoint: AccountingPoint,
  gridLocation: AccountingPointGridLocation | undefined,
) => {
  const isFISO =
    identity?.role === "flex_flexibility_information_system_operator";
  if (isFISO) return true;
  const isCSO = identity?.partyID == accountingPoint.system_operator_id;
  if (gridLocation?.source === "grid_model") return false;
  return !(gridLocation?.source === "cso" && !isCSO);
};

export const AccountingPointShow = () => {
  const { id } = useParams<{ id: string }>();
  const apId = Number(id);
  const { data: identity } = useGetIdentity();

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
    <ShowPageLayout
      backTo={{ pathname: "/accounting_point", label: "Accounting points" }}
      title="Accounting Point"
    >
      <Panel
        border
        className="bg-semantic-background-alternative h-fit p-4 sm:p-5"
      >
        <h3 className="text-base font-semibold mb-4">General Information</h3>
        <div className="flex flex-col gap-4">
          <LabelValue
            size="small"
            labelKey="accounting_point.id"
            value={ap.id}
          />
          <LabelValue
            size="small"
            labelKey="accounting_point.business_id"
            value={ap.business_id}
          />

          {identity?.role ===
            "flex_flexibility_information_system_operator" && (
            <AccountingPointConnections
              biddingZone={viewModel.biddingZone}
              balanceResponsibleParty={viewModel.balanceResponsibleParty}
              endUser={viewModel.endUser}
              energySupplier={viewModel.energySupplier}
              systemOperator={viewModel.systemOperator}
              meteringGridArea={viewModel.meteringGridArea}
            />
          )}

          <LabelValue
            size="small"
            labelKey="accounting_point.recorded_at"
            value={
              ap.recorded_at
                ? formatDate(ap.recorded_at, "dd.MM.yyyy HH:mm")
                : undefined
            }
          />
        </div>
      </Panel>
      <AccountingPointShowTabs
        apId={apId}
        gridLocation={viewModel.gridLocation}
        userCanViewGridLocation={userCanViewGridLocation(identity?.role)}
        userCanEditGridLocation={userCanEditGridLocation(
          identity!,
          ap,
          viewModel.gridLocation,
        )}
      />
    </ShowPageLayout>
  );
};
