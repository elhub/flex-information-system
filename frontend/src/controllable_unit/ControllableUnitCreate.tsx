import { Create } from "react-admin";
import { ControllableUnitCreateForm } from "./ControllableUnitCreateForm";
import { useSearchParams } from "react-router-dom";
import { Alert } from "../components/ui";
import z from "zod";

const zControllableUnitCreateParams = z.object({
  accounting_point_id: z.coerce.number(),
  end_user_id: z.coerce.number(),
  accounting_point_business_id: z.string().optional(),
});

const ControllableUnitCreate = () => {
  const [searchParams] = useSearchParams();
  const accountingPointIdParam = searchParams.get("accounting_point_id");
  const endUserIdParam = searchParams.get("end_user_id");
  const accountingPointBusinessIdParam = searchParams.get(
    "accounting_point_business_id",
  );
  const createParams = zControllableUnitCreateParams.safeParse({
    accounting_point_id: accountingPointIdParam,
    end_user_id: endUserIdParam,
    accounting_point_business_id: accountingPointBusinessIdParam ?? undefined,
  });
  if (!createParams.success) {
    return (
      <Alert variant="error">
        Missing accounting point or end user. Please start from the lookup page.
      </Alert>
    );
  }

  const { accounting_point_id, end_user_id, accounting_point_business_id } =
    createParams.data;

  return (
    <Create>
      <ControllableUnitCreateForm
        accountingPointId={accounting_point_id}
        endUserId={end_user_id}
        accountingPointBusinessId={accounting_point_business_id}
      />
    </Create>
  );
};

export default ControllableUnitCreate;
