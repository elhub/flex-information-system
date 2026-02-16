import { Create } from "react-admin";
import { ControllableUnitCreateForm } from "./ControllableUnitCreateForm";
import { useSearchParams } from "react-router-dom";
import { Alert } from "../components/ui";

const ControllableUnitCreate = () => {
  const [searchParams] = useSearchParams();
  const accountingPointIdParam = searchParams.get("accounting_point_id");
  const endUserIdParam = searchParams.get("end_user_id");
  const accountingPointId = accountingPointIdParam
    ? Number(accountingPointIdParam)
    : undefined;
  const endUserId = endUserIdParam ? Number(endUserIdParam) : undefined;

  if (!accountingPointId || !endUserId) {
    return (
      <Alert variant="error">Missing accounting point or end user in URL</Alert>
    );
  }

  return (
    <Create>
      <ControllableUnitCreateForm
        accountingPointId={accountingPointId}
        endUserId={endUserId}
      />
    </Create>
  );
};

export default ControllableUnitCreate;
