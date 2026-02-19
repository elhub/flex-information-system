import { Create } from "react-admin";
import { ControllableUnitCreateForm } from "./ControllableUnitCreateForm";
import { useSearchParams } from "react-router-dom";
import { Alert } from "../components/ui";
import z from "zod";

const zControllableUnitCreateParams = z.object({
  accounting_point_id: z.coerce.number(),
  end_user_id: z.coerce.number(),
});

const ControllableUnitCreate = () => {
  const [searchParams] = useSearchParams();
  const accountingPointIdParam = searchParams.get("accounting_point_id");
  const endUserIdParam = searchParams.get("end_user_id");
  const createParams = zControllableUnitCreateParams.safeParse({
    accounting_point_id: accountingPointIdParam,
    end_user_id: endUserIdParam,
  });
  if (!createParams.success) {
    return (
      <Alert variant="error">
        Missing accounting point or end user. Please start from the lookup page.
      </Alert>
    );
  }

  const { accounting_point_id, end_user_id } = createParams.data;

  return (
    <Create>
      <ControllableUnitCreateForm
        accountingPointId={accounting_point_id}
        endUserId={end_user_id}
      />
    </Create>
  );
};

export default ControllableUnitCreate;
