import { Badge, Loader } from "../../components/ui";
import { useParams } from "react-router-dom";
import { ControllableUnitShowSummary } from "./ControllableUnitShowSummary";
import { ControllableUnitShowTabs } from "./ControllableUnitShowTabs";
import { ControllableUnitAlerts } from "./components/ControllableUnitAlerts";
import { useControllableUnitViewModel } from "./useControllableUnitViewModel";
import { useTranslateEnum } from "../../intl/intl";
import { ActivateControllableUnitButton } from "./components/ActivateControllableUnitButton";
import { Permissions } from "../../auth/permissions";
import { usePermissions } from "ra-core";
import { ShowPageLayout } from "../../components/ShowPageLayout";
import { cuStatusVariantMap } from "../controllableUnitStatus";

export const ControllableUnitShow = () => {
  const { id } = useParams<{ id: string }>();
  const cuId = Number(id);
  const { permissions } = usePermissions<Permissions>();

  const translateEnum = useTranslateEnum();
  const {
    data: viewModel,
    isPending: isViewModelPending,
    error: viewModelError,
  } = useControllableUnitViewModel(cuId);

  const cu = viewModel?.controllableUnit;

  if (viewModelError) {
    throw viewModelError;
  }

  if (isViewModelPending) {
    return <Loader />;
  }

  if (!cu || !viewModel) {
    return null;
  }

  const canActivateControllableUnit =
    !!permissions?.allow("controllable_unit", "update") &&
    (viewModel.technicalResources?.length ?? 0) > 0;

  return (
    <ShowPageLayout
      backTo={{ pathname: "/controllable_unit", label: "Controllable units" }}
      title={`Controllable Unit - ${cu.name}`}
      alerts={<ControllableUnitAlerts controllableUnitViewModel={viewModel} />}
      badge={
        <>
          <Badge
            size="small"
            status={cuStatusVariantMap[cu.status].status}
            variant="block"
            icon={cuStatusVariantMap[cu.status].icon}
          >
            {translateEnum(`controllable_unit.status.${cu.status}`)}
          </Badge>
          {cu.status === "new" && (
            <ActivateControllableUnitButton
              controllableUnitId={cu.id}
              disabled={!canActivateControllableUnit}
            />
          )}
        </>
      }
    >
      <ControllableUnitShowSummary viewModel={viewModel} />
      <ControllableUnitShowTabs cuId={cu.id} />
    </ShowPageLayout>
  );
};
