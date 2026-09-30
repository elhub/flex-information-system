import { Link as RouterLink } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardHeaderContent,
  CardTitle,
  CardContent,
  CardFooter,
  Loader,
  Button,
  BodyText,
} from "../../../components/ui";
import { ServiceProvidingGroup } from "../../../generated-client";
import { ServiceProvidingGroupControllableUnitSummary } from "../../summary/ServiceProvidingGroupControllableUnitSummary";
import { ServiceProvidingGroupTechnicalResourceSummary } from "../../summary/ServiceProvidingGroupTechnicalResourceSummary";
import { KILO, Scale } from "../../../utils/scales";
import { useParty } from "../../../hooks/party";

type Props = {
  spgId: number;
  spgProcuringSystemOperatorId?: number;
  impactedSystemOperatorId?: number;
  spg: ServiceProvidingGroup | undefined;
  powerScale?: Scale;
};

export const SpgInfoTab = ({
  spgId,
  spgProcuringSystemOperatorId,
  impactedSystemOperatorId,
  spg,
  powerScale = KILO,
}: Props) => {
  const procuringSystemOperator = useParty(spgProcuringSystemOperatorId);
  const impactedSystemOperator = useParty(impactedSystemOperatorId);

  if (procuringSystemOperator.error) throw procuringSystemOperator.error;
  if (impactedSystemOperator.error) throw impactedSystemOperator.error;

  if (!spg) {
    return <Loader size="small" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-5 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardHeaderContent>
              <CardTitle>Service providing group</CardTitle>
            </CardHeaderContent>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 16 }}>
            <div>
              <BodyText weight="bold" size="small">
                Name
              </BodyText>
              <BodyText size="small">{spg.name}</BodyText>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="tertiary"
              size="medium"
              as={RouterLink}
              to={`/service_providing_group/${spgId}/show`}
            >
              See group
            </Button>
          </CardFooter>
        </Card>
        {spgProcuringSystemOperatorId && (
          <Card>
            <CardHeader>
              <CardHeaderContent>
                <CardTitle>Procuring system operator</CardTitle>
              </CardHeaderContent>
            </CardHeader>
            <CardContent style={{ display: "grid", gap: 16 }}>
              <div>
                <BodyText weight="bold" size="small">
                  Name
                </BodyText>
                <BodyText size="small">
                  {procuringSystemOperator.data?.name}
                </BodyText>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="tertiary"
                size="medium"
                as={RouterLink}
                to={`/party/${spgProcuringSystemOperatorId}/show`}
              >
                See SO
              </Button>
            </CardFooter>
          </Card>
        )}
        {impactedSystemOperatorId && (
          <Card>
            <CardHeader>
              <CardHeaderContent>
                <CardTitle>Impacted system operator</CardTitle>
              </CardHeaderContent>
            </CardHeader>
            <CardContent style={{ display: "grid", gap: 16 }}>
              <div>
                <BodyText weight="bold" size="small">
                  Name
                </BodyText>
                <BodyText size="small">
                  {impactedSystemOperator.data?.name}
                </BodyText>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="tertiary"
                size="medium"
                as={RouterLink}
                to={`/party/${impactedSystemOperatorId}/show`}
              >
                See SO
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
      {spg.summary && (
        <>
          <ServiceProvidingGroupControllableUnitSummary
            summary={spg.summary}
            displayScale={powerScale}
          />
          <ServiceProvidingGroupTechnicalResourceSummary
            summary={spg.summary}
            displayScale={powerScale}
          />
        </>
      )}
    </div>
  );
};
