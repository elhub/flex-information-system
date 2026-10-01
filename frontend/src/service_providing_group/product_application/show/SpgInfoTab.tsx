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
import { useTranslate } from "ra-core";
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
  const translate = useTranslate();
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
              <CardTitle>{translate("text.service_providing_group")}</CardTitle>
            </CardHeaderContent>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <BodyText weight="bold" size="small">
                {translate("text.spg_info_tab.name")}
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
              {translate("text.spg_info_tab.see_group")}
            </Button>
          </CardFooter>
        </Card>
        {spgProcuringSystemOperatorId && (
          <Card>
            <CardHeader>
              <CardHeaderContent>
                <CardTitle>
                  {translate("text.spg_info_tab.procuring_system_operator")}
                </CardTitle>
              </CardHeaderContent>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <BodyText weight="bold" size="small">
                  {translate("text.spg_info_tab.name")}
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
                {translate("text.spg_info_tab.see_so")}
              </Button>
            </CardFooter>
          </Card>
        )}
        {impactedSystemOperatorId && (
          <Card>
            <CardHeader>
              <CardHeaderContent>
                <CardTitle>
                  {translate("text.spg_info_tab.impacted_system_operator")}
                </CardTitle>
              </CardHeaderContent>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <BodyText weight="bold" size="small">
                  {translate("text.spg_info_tab.name")}
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
                {translate("text.spg_info_tab.see_so")}
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
