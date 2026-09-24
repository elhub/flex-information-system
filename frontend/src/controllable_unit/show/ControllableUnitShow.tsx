import { Badge, Dropdown, Loader } from "../../components/ui";
import { Link as RouterLink, useParams } from "react-router-dom";
import { ControllableUnitShowSummary } from "./ControllableUnitShowSummary";
import { ControllableUnitShowTabs } from "./ControllableUnitShowTabs";
import { ControllableUnitAlerts } from "./components/ControllableUnitAlerts";
import { useControllableUnitViewModel } from "./useControllableUnitViewModel";
import { useTranslateEnum } from "../../intl/intl";
import { ActivateControllableUnitButton } from "./components/ActivateControllableUnitButton";
import { Permissions } from "../../auth/permissions";
import { usePermissions } from "ra-core";
import { ShowPageResourceLayout } from "../../components/ShowPageResourceLayout";
import { MoreActionsButton } from "../../components/MoreActionsButton";
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
    <ShowPageResourceLayout
      resourceType={`Controllable unit #${cu.id}`}
      resourceName={cu.name}
      alerts={<ControllableUnitAlerts controllableUnitViewModel={viewModel} />}
      status={
        <Badge
          size="small"
          status={cuStatusVariantMap[cu.status].status}
          variant="block"
          icon={cuStatusVariantMap[cu.status].icon}
        >
          {translateEnum(`controllable_unit.status.${cu.status}`)}
        </Badge>
      }
      utilityActions={
        canEdit || canReadEvents ? (
          <Dropdown>
            <MoreActionsButton />
            <Dropdown.Menu arrow placement="bottom-start">
              {canEdit && (
                <Dropdown.Menu.GroupedList>
                  <Dropdown.Menu.GroupedList.Item
                    as={RouterLink}
                    to={`/controllable_unit/${cu.id}/edit`}
                  >
                    <div className="flex items-center gap-2">
                      <IconPencil />
                      Edit
                    </div>
                  </Dropdown.Menu.GroupedList.Item>
                </Dropdown.Menu.GroupedList>
              )}
              {canReadEvents && (
                <>
                  {canEdit && <Dropdown.Menu.Divider />}
                  <Dropdown.Menu.GroupedList>
                    <Dropdown.Menu.GroupedList.Item
                      as={RouterLink}
                      to={`/event?filter=${eventsFilter}`}
                    >
                      Events
                    </Dropdown.Menu.GroupedList.Item>
                  </Dropdown.Menu.GroupedList>
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        ) : undefined
      }
      workflowActions={
        cu.status === "new" ? (
          <ActivateControllableUnitButton
            controllableUnitId={cu.id}
            disabled={!canActivateControllableUnit}
          />
        ) : undefined
      }
      summary={<ControllableUnitShowSummary viewModel={viewModel} />}
      content={<ControllableUnitShowTabs cuId={cu.id} viewModel={viewModel} />}
    />
  );
};
