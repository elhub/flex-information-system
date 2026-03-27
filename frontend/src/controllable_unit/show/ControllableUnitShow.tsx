import {
  IconArrowLeft,
  IconCross,
  IconCrossCircle,
  IconQualitiesCircle,
  IconStopWatch15,
  SvgIconProps,
} from "@elhub/ds-icons";
import { Badge, Button, Heading, Loader } from "../../components/ui";
import { Link as RouterLink, useParams } from "react-router-dom";
import { ControllableUnitShowSummary } from "./ControllableUnitShowSummary";
import { ControllableUnitShowTabs } from "./ControllableUnitShowTabs";
import { ControllableUnitAlerts } from "./components/ControllableUnitAlerts";
import { readControllableUnit, ControllableUnitStatus } from "../../generated-client";
import { throwOnError } from "../../util";
import { useQuery } from "@tanstack/react-query";
import { useControllableUnitViewModel } from "./useControllableUnitViewModel";
import { useTranslateEnum, useTranslateField } from "../../intl/intl";
import { ActivateControllableUnitButton } from "./components/ActivateControllableUnitButton";
import { Permissions } from "../../auth/permissions";
import { usePermissions } from "react-admin";

const statusVariantMap: Record<
  ControllableUnitStatus,
  {
    status: "ongoing" | "failed" | "approved-with-warning" | "approved" | "stopped" | "temporarily-stopped" | "pending" | "rejected",
    icon: React.ComponentType<SvgIconProps>,
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
    data: cu,
    isLoading: isCuLoading,
    error: cuError,
  } = useQuery({
    queryKey: ["controllable_unit", cuId],
    queryFn: () =>
      readControllableUnit({ path: { id: cuId } }).then(throwOnError),
    enabled: !!cuId,
  });

  const {
    data: viewModel,
    isPending: isViewModelPending,
    error: viewModelError,
  } = useControllableUnitViewModel(cu);

  const canUpdateControllableUnit = permissions?.allow("controllable_unit", "update") && viewModel?.technicalResources?.length;

  if (isCuLoading || isViewModelPending) {
    return <Loader />;
  }

  if (cuError) {
    throw cuError;
  }

  if (viewModelError) {
    throw viewModelError;
  }

  if (!cu || !viewModel) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 p-2">
      <ControllableUnitAlerts controllableUnitViewModel={viewModel} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            as={RouterLink}
            to="/controllable_unit"
            variant="invisible"
            icon={IconArrowLeft}
          />
          <Heading level={2} size="medium">
            Controllable Unit - {cu.name}
          </Heading>
          <div className="flex items-center gap-1" >
            <Badge size="small" status={statusVariantMap[cu.status].status} variant="block" icon={statusVariantMap[cu.status].icon}>
              {translateEnum(`controllable_unit.status.${cu.status}`)}
            </Badge>
            {cu.status === "new" && (
            <ActivateControllableUnitButton
              controllableUnitId={cu.id}
              disabled={!canUpdateControllableUnit}
            />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[475px_minmax(0,1fr)]">
        <ControllableUnitShowSummary viewModel={viewModel} />
        <ControllableUnitShowTabs cuId={cu.id} />
      </div>
    </div>
  );
};
