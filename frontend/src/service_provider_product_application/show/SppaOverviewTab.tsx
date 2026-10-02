import { Link as RouterLink } from "react-router-dom";
import { useTranslate } from "ra-core";
import {
  BodyText,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardHeaderContent,
  CardTitle,
} from "../../components/ui";
import { useParty } from "../../hooks/party";

type PartyCardProps = {
  title: string;
  name: string | undefined;
  to: string;
  linkText: string;
};

const PartyCard = ({ title, name, to, linkText }: PartyCardProps) => {
  const translate = useTranslate();
  return (
    <Card>
      <CardHeader>
        <CardHeaderContent>
          <CardTitle>{title}</CardTitle>
        </CardHeaderContent>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <BodyText weight="bold" size="small">
            {translate("text.spg_info_tab.name")}
          </BodyText>
          <BodyText size="small">{name}</BodyText>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="tertiary" size="medium" as={RouterLink} to={to}>
          {linkText}
        </Button>
      </CardFooter>
    </Card>
  );
};

type Props = {
  serviceProviderId: number;
  systemOperatorId: number;
};

export const SppaOverviewTab = ({
  serviceProviderId,
  systemOperatorId,
}: Props) => {
  const translate = useTranslate();
  const serviceProvider = useParty(serviceProviderId);
  const systemOperator = useParty(systemOperatorId);

  if (serviceProvider.error) throw serviceProvider.error;
  if (systemOperator.error) throw systemOperator.error;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <PartyCard
        title={translate("text.service_provider")}
        name={serviceProvider.data?.name}
        to={`/party/${serviceProviderId}/show`}
        linkText={translate("text.sppa_overview.see_service_provider")}
      />
      <PartyCard
        title={translate("text.system_operator")}
        name={systemOperator.data?.name}
        to={`/party/${systemOperatorId}/show`}
        linkText={translate("text.sppa_overview.see_system_operator")}
      />
    </div>
  );
};
