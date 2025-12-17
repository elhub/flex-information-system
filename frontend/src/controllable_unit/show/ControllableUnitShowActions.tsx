import { Button, EditButton, TopToolbar, usePermissions } from "react-admin";
import { Link as RouterLink } from "react-router-dom";
import WarningIcon from "@mui/icons-material/Warning";
import AddIcon from "@mui/icons-material/Add";
import { ResourceHistoryButton } from "../../components/history";
import { EventButton } from "../../event/EventButton";
import { ControllableUnitServiceProviderLocationState } from "../service_provider/ControllableUnitServiceProviderInput";
import { ControllableUnitSuspensionLocationState } from "../suspension/ControllableUnitSuspensionInput";
import { Permissions } from "../../auth/permissions";

const CreateCUSPButton = ({
  controllableUnitId,
}: {
  controllableUnitId: string | undefined;
}) => {
  const locationState: ControllableUnitServiceProviderLocationState = {
    cusp: { controllable_unit_id: Number(controllableUnitId) },
    cuIDAsNumber: true,
  };
  return (
    <Button
      component={RouterLink}
      to={`/controllable_unit/${controllableUnitId}/service_provider/create`}
      state={locationState}
      startIcon={<AddIcon />}
      label="Create new contract"
    />
  );
};

const CreateSuspensionButton = ({
  controllableUnitId,
}: {
  controllableUnitId: string | undefined;
}) => {
  const locationState: ControllableUnitSuspensionLocationState = {
    cus: { controllable_unit_id: Number(controllableUnitId) },
  };

  return (
    <Button
      component={RouterLink}
      to={`/controllable_unit/${controllableUnitId}/suspension/create`}
      state={locationState}
      startIcon={<WarningIcon />}
      label="Create new suspension"
    />
  );
};

export const ControllableUnitShowActions = ({
  controllableUnitId,
  isHistory,
}: {
  controllableUnitId: string | undefined;
  isHistory: boolean;
}) => {
  const { permissions } = usePermissions<Permissions>();

  const canCreateCUSP = permissions?.allow(
    "controllable_unit_service_provider",
    "create",
  );
  const canCreateSuspension = permissions?.allow(
    "controllable_unit_suspension",
    "create",
  );
  const canEdit = permissions?.allow("controllable_unit", "update");

  return (
    <TopToolbar>
      {canCreateSuspension && (
        <CreateSuspensionButton controllableUnitId={controllableUnitId} />
      )}
      {canCreateCUSP && (
        <CreateCUSPButton controllableUnitId={controllableUnitId} />
      )}
      {canEdit && <EditButton />}
      <ResourceHistoryButton id={controllableUnitId} />
      {(!isHistory && <EventButton recordId={controllableUnitId} />) || null}
    </TopToolbar>
  );
};
