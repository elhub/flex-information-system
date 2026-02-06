import { Link as RouterLink } from "react-router-dom";
import { usePermissions } from "ra-core";
import { ControllableUnitServiceProviderLocationState } from "../service_provider/ControllableUnitServiceProviderInput";
import { ControllableUnitSuspensionLocationState } from "../suspension/ControllableUnitSuspensionInput";
import { Permissions } from "../../auth/permissions";
import { Button } from "../../components/ui";
import { IconPlus, IconWarningTriangle } from "@elhub/ds-icons";

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
      as={RouterLink}
      to={`/controllable_unit/${controllableUnitId}/service_provider/create`}
      state={locationState}
      icon={IconPlus}
      variant="invisible"
    >
      Create new contract
    </Button>
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
      as={RouterLink}
      to={`/controllable_unit/${controllableUnitId}/suspension/create`}
      state={locationState}
      icon={IconWarningTriangle}
      variant="invisible"
    >
      Create new suspension
    </Button>
  );
};

export const ControllableUnitShowActions = ({
  controllableUnitId,
}: {
  controllableUnitId: string | undefined;
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

  return (
    <>
      {canCreateSuspension && (
        <CreateSuspensionButton controllableUnitId={controllableUnitId} />
      )}
      {canCreateCUSP && (
        <CreateCUSPButton controllableUnitId={controllableUnitId} />
      )}
    </>
  );
};
