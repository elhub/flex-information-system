import { Link, useLocation } from "react-router-dom";
import { ControllableUnitLookup } from "../../generated-client";
import { zControllableUnitLookup } from "../../generated-client/zod.gen";
import {
  Heading,
  BodyText,
  Button,
  Alert,
  Card,
  CardContent,
} from "../../components/ui";
import { ExistingControllableUnitsTable } from "./ExistingControllableUnitsTable";

export const ControllableUnitLookupResult = () => {
  const { state }: { state: { result?: ControllableUnitLookup } | null } =
    useLocation();

  const lookupData = zControllableUnitLookup.safeParse(state?.result);

  if (!lookupData.success) {
    return (
      <div className="flex flex-col gap-5 max-w-4xl mt-4">
        <Alert variant="error">
          Missing lookup result. Please start from the lookup page.
        </Alert>
      </div>
    );
  }

  const { controllable_units, accounting_point, end_user } = lookupData.data;
  const cuCount = controllable_units.length;
  const hasCUs = cuCount > 0;

  return (
    <div className="flex flex-col gap-5 max-w-4xl mt-4">
      <Heading level={2} size="large">
        Controllable unit lookup
      </Heading>

      <Alert variant="info">
        Accounting point {accounting_point.business_id} already has {cuCount}{" "}
        controllable {cuCount === 1 ? "unit" : "units"}. You can manage an
        existing unit or create a new one.
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
              <Button
                as={Link}
                to={`/controllable_unit/create?accounting_point_id=${accounting_point.id}&end_user_id=${end_user.id}`}
                variant="primary"
              >
                Create new unit
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {hasCUs && (
        <ExistingControllableUnitsTable
          controllableUnits={controllable_units}
          endUserId={end_user.id}
        />
      )}
    </div>
  );
};
