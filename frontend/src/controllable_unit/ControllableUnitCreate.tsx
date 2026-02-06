import { Create, useNavigate, useNotify } from "react-admin";
import {
  ControllableUnitInput,
  ControllableUnitInputLocationState,
} from "./ControllableUnitInput";
import { ControllableUnitServiceProviderLocationState } from "./service_provider/ControllableUnitServiceProviderInput";
import { zControllableUnit } from "../generated-client/zod.gen";
import useLocationState from "../hooks/useLocationState";

const ControllableUnitCreate = () => {
  const locationState = useLocationState<ControllableUnitInputLocationState>();
  const navigate = useNavigate();
  const notify = useNotify();

  const onSuccess = (data: unknown) => {
    const controllableUnit = zControllableUnit.partial().parse(data ?? {});
    const cuspState: ControllableUnitServiceProviderLocationState = {
      cusp: {
        controllable_unit_id: controllableUnit.id,
        end_user_id: locationState?.endUserId,
        valid_from: controllableUnit.start_date,
      },
    };

    notify("Controllable Unit created successfully", { type: "success" });

    navigate(
      `/controllable_unit/${controllableUnit.id}/service_provider/create`,
      { state: cuspState, replace: true },
    );
  };

  return (
    <Create mutationOptions={{ onSuccess }}>
      <ControllableUnitInput />
    </Create>
  );
};

export default ControllableUnitCreate;
