import { useTranslate } from "ra-core";
import { useParty } from "../../hooks/party";
import { ResourceCard } from "../../components/ResourceCard";

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
      <ResourceCard
        title={translate("text.service_provider")}
        content={[
          {
            label: translate("text.resource_card.resource_name"),
            value: serviceProvider.data?.name,
          },
        ]}
        to={`/party/${serviceProviderId}/show`}
        linkText={translate("text.sppa_overview.see_service_provider")}
      />
      <ResourceCard
        title={translate("text.system_operator")}
        content={[
          {
            label: translate("text.resource_card.resource_name"),
            value: systemOperator.data?.name,
          },
        ]}
        to={`/party/${systemOperatorId}/show`}
        linkText={translate("text.sppa_overview.see_system_operator")}
      />
    </div>
  );
};
