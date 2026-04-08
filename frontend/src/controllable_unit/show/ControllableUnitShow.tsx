import {
  IconCross,
  IconCrossCircle,
  IconQualitiesCircle,
  IconStopWatch15,
  SvgIconProps,
} from "@elhub/ds-icons";
import { Badge, Loader } from "../../components/ui";
import { useParams } from "react-router-dom";
import { ControllableUnitShowSummary } from "./ControllableUnitShowSummary";
import { ControllableUnitShowTabs } from "./ControllableUnitShowTabs";
import { ControllableUnitAlerts } from "./components/ControllableUnitAlerts";
import { ControllableUnitStatus } from "../../generated-client";
import { useControllableUnitViewModel } from "./useControllableUnitViewModel";
import { useTranslateEnum } from "../../intl/intl";
import { ActivateControllableUnitButton } from "./components/ActivateControllableUnitButton";
import { Permissions } from "../../auth/permissions";
import { usePermissions } from "ra-core";
import { ShowPageLayout } from "../../components/ShowPageLayout";

const statusVariantMap: Record<
  ControllableUnitStatus,
  {
    status:
      | "ongoing"
      | "failed"
      | "approved-with-warning"
      | "approved"
      | "stopped"
      | "temporarily-stopped"
      | "pending"
      | "rejected";
    icon: React.ComponentType<SvgIconProps>;
  }
> = {
  new: { status: "ongoing", icon: IconStopWatch15 },
  active: { status: "approved", icon: IconQualitiesCircle },
  inactive: { status: "stopped", icon: IconCross },
  terminated: { status: "rejected", icon: IconCrossCircle },
};

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

  const canUpdateControllableUnit =
    !!permissions?.allow("controllable_unit", "update") &&
    (viewModel?.technicalResources?.length ?? 0) > 0;

  if (viewModelError) {
    throw viewModelError;
  }

  if (isViewModelPending) {
    return <Loader />;
  }

  if (!cu || !viewModel) {
    return null;
  }

  return (
    <ShowPageLayout
      backTo="/controllable_unit"
      title={`Controllable Unit - ${cu.name}`}
      alerts={<ControllableUnitAlerts controllableUnitViewModel={viewModel} />}
      badge={
        <>
          <Badge
            size="small"
            status={statusVariantMap[cu.status].status}
            variant="block"
            icon={statusVariantMap[cu.status].icon}
          >
            {translateEnum(`controllable_unit.status.${cu.status}`)}
          </Badge>
          {cu.status === "new" && (
            <ActivateControllableUnitButton
              controllableUnitId={cu.id}
              disabled={!canUpdateControllableUnit}
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
