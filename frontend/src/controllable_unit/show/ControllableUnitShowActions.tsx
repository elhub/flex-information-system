import { Button, EditButton, TopToolbar } from "react-admin";
import { Link as RouterLink } from "react-router-dom";
import WarningIcon from "@mui/icons-material/Warning";
import AddIcon from "@mui/icons-material/Add";
import { ResourceHistoryButton } from "../../components/history";
import { EventButton } from "../../event/EventButton";
import { ControllableUnitServiceProviderLocationState } from "../service_provider/ControllableUnitServiceProviderInput";
import { ControllableUnitSuspensionLocationState } from "../suspension/ControllableUnitSuspensionInput";

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
}) => (
  <TopToolbar>
    <CreateSuspensionButton controllableUnitId={controllableUnitId} />
    <CreateCUSPButton controllableUnitId={controllableUnitId} />
    <EditButton />
    <ResourceHistoryButton id={controllableUnitId} />
    {(!isHistory && <EventButton recordId={controllableUnitId} />) || null}
  </TopToolbar>
);
