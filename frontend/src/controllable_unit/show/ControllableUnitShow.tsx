import {
  IconArrowLeft,
  IconPencil,
  IconClockReset,
  IconAlarmBell,
} from "@elhub/ds-icons";
import { Button, Heading, Loader, Tag } from "../../components/ui";
import { usePermissions } from "ra-core";
import { Permissions } from "../../auth/permissions";
import { Link as RouterLink, useParams } from "react-router-dom";
import { ControllableUnitShowSummary } from "./ControllableUnitShowSummary";
import { ControllableUnitShowTabs } from "./ControllableUnitShowTabs";
import { ControllableUnitShowActions } from "./ControllableUnitShowActions";
import { ControllableUnitAlerts } from "./components/ControllableUnitAlerts";
import { readControllableUnit } from "../../generated-client";
import { throwOnError } from "../../util";
import { useQuery } from "@tanstack/react-query";
import { useControllableUnitViewModel } from "./useControllableUnitViewModel";
import { ControllableUnitStatus } from "../../generated-client";

const statusVariantMap: Record<
  ControllableUnitStatus,
  "info" | "success" | "warning" | "error"
> = {
  new: "info",
  active: "success",
  inactive: "warning",
  terminated: "error",
};

export const ControllableUnitShow = () => {
  const { id } = useParams<{ id: string }>();
  const cuId = Number(id);

  const { permissions } = usePermissions<Permissions>();
  const canEdit = permissions?.allow("controllable_unit", "update");
  const canReadHistory = permissions?.allow(
    "controllable_unit_history",
    "read",
  );
  const canReadEvents = permissions?.allow("event", "read");

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

  const eventFilter =
    "?filter=" +
    encodeURIComponent(`{ "source@like": "/controllable_unit/${cuId}" }`);

  return (
    <div className="flex flex-col gap-4 p-2">
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
          <Tag variant={statusVariantMap[cu.status ?? "active"]}>
            {cu.status}
          </Tag>
        </div>

        <div className="flex items-center gap-2">
          <ControllableUnitShowActions controllableUnitId={id} />
          {canEdit && (
            <Button
              as={RouterLink}
              to={`/controllable_unit/${cuId}/edit`}
              variant="invisible"
              icon={IconPencil}
            >
              Edit
            </Button>
          )}
          {canReadHistory && (
            <Button
              as={RouterLink}
              to={`/controllable_unit/${cuId}/history`}
              variant="invisible"
              icon={IconClockReset}
            >
              View History
            </Button>
          )}
          {canReadEvents && (
            <Button
              as={RouterLink}
              to={`/event${eventFilter}`}
              variant="invisible"
              icon={IconAlarmBell}
            >
              Events
            </Button>
          )}
        </div>
      </div>

      <ControllableUnitAlerts controllableUnitViewModel={viewModel} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[475px_minmax(0,1fr)]">
        <ControllableUnitShowSummary viewModel={viewModel} />
        <ControllableUnitShowTabs cuId={cu.id} />
      </div>
    </div>
  );
};
