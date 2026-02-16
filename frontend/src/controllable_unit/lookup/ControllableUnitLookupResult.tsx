import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { callControllableUnitLookup } from "../../generated-client";
import { throwOnError } from "../../util";
import {
  Heading,
  BodyText,
  Button,
  Alert,
  Card,
  CardContent,
  Loader,
} from "../../components/ui";
import { ExistingControllableUnitsTable } from "./ExistingControllableUnitsTable";

export const ControllableUnitLookupResult = () => {
  const [searchParams] = useSearchParams();
  const endUserOrgNo = searchParams.get("end_user");
  const accountingPointGsrn = searchParams.get("accounting_point");

  const {
    data: lookupData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["controllableUnitLookup", accountingPointGsrn, endUserOrgNo],
    queryFn: () =>
      callControllableUnitLookup({
        body: {
          end_user: endUserOrgNo!,
          accounting_point: accountingPointGsrn!,
        },
      }).then(throwOnError),
    enabled: !!accountingPointGsrn && !!endUserOrgNo,
  });

  if (!accountingPointGsrn || !endUserOrgNo) {
    return (
      <div className="flex flex-col gap-5 max-w-4xl mt-4">
        <Alert variant="error">
          Missing accounting_point or end_user in URL
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-5 max-w-4xl mt-4">
        <Alert variant="error">{error.message}</Alert>
      </div>
    );
  }

  if (isLoading || !lookupData) {
    return <Loader size="large" />;
  }

  const cuCount = lookupData.controllable_units.length;
  const hasCUs = cuCount > 0;

  const createSearchParams = new URLSearchParams({
    end_user_id: lookupData.end_user.id.toString(),
    accounting_point_id: lookupData.accounting_point.id.toString(),
  });
  const createUrl = `/controllable_unit/create?${createSearchParams.toString()}`;

  return (
    <div className="flex flex-col gap-5 max-w-4xl mt-4">
      <Heading level={2} size="large">
        Controllable unit lookup
      </Heading>

      <Alert variant="info">
        Accounting point {lookupData.accounting_point.business_id} already has{" "}
        {cuCount} controllable {cuCount === 1 ? "unit" : "units"}. You can
        manage an existing unit or create a new one.
      </Alert>

      <section className="flex flex-col gap-3">
        <Heading level={3} size="medium">
          Create new
        </Heading>
        <Card className="max-w-3xl">
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <BodyText>
                Register a new controllable unit for this accounting point.
              </BodyText>
              <Button as={Link} to={createUrl} variant="primary">
                Create new unit
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {hasCUs && (
        <ExistingControllableUnitsTable
          controllableUnits={lookupData.controllable_units}
          endUserId={lookupData.end_user.id}
        />
      )}
    </div>
  );
};
