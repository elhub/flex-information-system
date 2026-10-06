import { Loader } from "../../../components/ui";
import { ServiceProvidingGroup } from "../../../generated-client";
import { ServiceProvidingGroupControllableUnitSummary } from "../../summary/ServiceProvidingGroupControllableUnitSummary";
import { ServiceProvidingGroupTechnicalResourceSummary } from "../../summary/ServiceProvidingGroupTechnicalResourceSummary";
import { KILO, Scale } from "../../../utils/scales";
import { useTranslate } from "ra-core";
import { useParty } from "../../../hooks/party";
import { ResourceCard } from "../../../components/ResourceCard";

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
        <ResourceCard
          title={translate("text.service_providing_group")}
          content={[
            {
              label: translate("text.resource_card.resource_name"),
              value: spg.name,
            },
          ]}
          to={`/service_providing_group/${spgId}/show`}
          linkText={translate("text.spg_info_tab.see_group")}
        />
        {spgProcuringSystemOperatorId && (
          <ResourceCard
            title={translate("text.spg_info_tab.procuring_system_operator")}
            content={[
              {
                label: translate("text.resource_card.resource_name"),
                value: procuringSystemOperator.data?.name,
              },
            ]}
            to={`/party/${spgProcuringSystemOperatorId}/show`}
            linkText={translate("text.spg_info_tab.see_so")}
          />
        )}
        {impactedSystemOperatorId && (
          <ResourceCard
            title={translate("text.spg_info_tab.impacted_system_operator")}
            content={[
              {
                label: translate("text.resource_card.resource_name"),
                value: impactedSystemOperator.data?.name,
              },
            ]}
            to={`/party/${impactedSystemOperatorId}/show`}
            linkText={translate("text.spg_info_tab.see_so")}
          />
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
