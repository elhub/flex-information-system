import { Create } from "react-admin";
import { ControllableUnitCreateForm } from "./ControllableUnitCreateForm";

const ControllableUnitCreate = () => {
  return (
    <Create>
      <ControllableUnitCreateForm />
    </Create>
  );
};

export default ControllableUnitCreate;
