import { Loader } from "../../components/ui";
import { useParams } from "react-router-dom";
import { useControllableUnitShowSummary } from "./ControllableUnitShowSummary";
import { ControllableUnitShowTabs } from "./ControllableUnitShowTabs";
import { useControllableUnitAlerts } from "./components/ControllableUnitAlerts";
import { useControllableUnitViewModel } from "./useControllableUnitViewModel";
import { useTranslateEnum } from "../../intl/intl";
import { ActivateControllableUnitButton } from "./components/ActivateControllableUnitButton";
import { Permissions } from "../../auth/permissions";
import { usePermissions } from "ra-core";
import { ResourceShowLayout } from "../../components/ResourceShowLayout";
import { cuStatusVariantMap } from "../controllableUnitStatus";
import { IconPencil } from "@elhub/ds-icons";

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
  const alert = useControllableUnitAlerts(viewModel);
  const summary = useControllableUnitShowSummary({ viewModel });

  if (viewModelError) {
    throw viewModelError;
  }

  if (isViewModelPending) {
    return <Loader />;
  }

  if (!cu || !viewModel) {
    return null;
  }

  const eventsFilter = encodeURIComponent(
    JSON.stringify({ "source@eq": `/controllable_unit/${cu.id}` }),
  );
  const canActivateControllableUnit =
    !!permissions?.allow("controllable_unit", "update") &&
    (viewModel.technicalResources?.length ?? 0) > 0;
  const canEdit = permissions?.allow("controllable_unit", "update");
  const canReadEvents = permissions?.allow("event", "read");

  return (
    <ResourceShowLayout
      secondaryHeaderText={`Controllable unit #${cu.id}`}
      mainHeaderText={cu.name}
      alerts={alert ?? undefined}
      status={{
        label: translateEnum(`controllable_unit.status.${cu.status}`),
        status: cuStatusVariantMap[cu.status].status,
        icon: cuStatusVariantMap[cu.status].icon,
      }}
      moreActions={[
        {
          to: `/controllable_unit/${cu.id}/edit`,
          title: "Edit",
          icon: <IconPencil />,
          canClick: canEdit ?? true,
        },
      ]}
      moreNavigationActions={[
        {
          to: `/event?filter=${eventsFilter}`,
          title: "Events",
          canClick: canReadEvents ?? true,
        },
      ]}
      workflowActions={
        cu.status === "new" ? (
          <ActivateControllableUnitButton
            controllableUnitId={cu.id}
            disabled={!canActivateControllableUnit}
          />
        ) : undefined
      }
      summary={summary}
      content={<ControllableUnitShowTabs cuId={cu.id} viewModel={viewModel} />}
    />
  );
};
