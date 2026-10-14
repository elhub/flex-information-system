import { Tabs } from "../../components/ui";
import { ResourceCard } from "../../components/ResourceCard";
import { TechnicalResourceList } from "../technical_resource/TechnicalResourceList";
import { ControllableUnitHistoryList } from "../ControllableUnitHistoryList";
import { usePermissions, RecordContextProvider, useTranslate } from "ra-core";
import { useTabSearchParam } from "../../hooks/useTabSearchParam";
import { ControllableUnitSpgList } from "./ControllableUnitSpgList";
import type { ControllableUnitShowViewModel } from "./useControllableUnitViewModel";
import { ControllableUnitServiceProviderList } from "../service_provider/ControllableUnitServiceProviderList";
import { ControllableUnitBalanceResponsiblePartyList } from "../balance_responsible_party/ControllableUnitBalanceResponsiblePartyList";
import { Permissions } from "../../auth/permissions";
import { ControllableUnitTechnicalResourceSummary } from "./ControllableUnitTechnicalResourceSummary";

type Props = {
  cuId: number;
  viewModel: ControllableUnitShowViewModel;
};

export const ControllableUnitShowTabs = ({ cuId, viewModel }: Props) => {
  const { permissions } = usePermissions<Permissions>();
  const canViewAccountingPoint = !!permissions?.allow(
    "accounting_point.business_id",
    "read",
  );
  const canViewHistory = !!permissions?.allow(
    "controllable_unit_history",
    "read",
  );
  const [tab, setTab] = useTabSearchParam("overview");
  const translate = useTranslate();
  return (
    <Tabs value={tab} onChange={setTab}>
      <Tabs.List>
        <Tabs.Tab label={translate("text.tab.overview")} value="overview" />
        <Tabs.Tab
          label={translate("text.tab.technical_resources")}
          value="technical_resources"
        />
        <Tabs.Tab
          label={translate("text.tab.service_providing_groups")}
          value="service_providing_groups"
        />
        <Tabs.Tab label="Service provider contracts" value="service_provider" />
        <Tabs.Tab
          label={translate("text.tab.balance_responsible_party")}
          value="balance_responsible_party"
        />
        {canViewHistory && (
          <Tabs.Tab label={translate("text.tab.history")} value="history" />
        )}
      </Tabs.List>
      <Tabs.Panel value="overview">
        <div className="grid gap-5">
          {canViewAccountingPoint && viewModel.accountingPoint && (
            <ResourceCard
              title={translate("text.tab.accounting_point")}
              content={[
                {
                  labelKey: "accounting_point.business_id",
                  value: viewModel.accountingPoint.business_id,
                },
                {
                  labelKey: "accounting_point.system_operator_id",
                  value: viewModel.systemOperator?.name,
                },
              ]}
              to={`/accounting_point/${viewModel.accountingPoint.id}/show`}
              linkText={translate("text.cu_show_view_accounting_point")}
            />
          )}
          <ControllableUnitTechnicalResourceSummary controllableUnitId={cuId} />
        </div>
      </Tabs.Panel>
      <Tabs.Panel value="technical_resources">
        <RecordContextProvider value={{ id: cuId }}>
          <TechnicalResourceList />
        </RecordContextProvider>
      </Tabs.Panel>
      <Tabs.Panel value="service_providing_groups">
        <ControllableUnitSpgList cuId={cuId} />
      </Tabs.Panel>
      <Tabs.Panel value="service_provider">
        <ControllableUnitServiceProviderList controllableUnitId={cuId} />
      </Tabs.Panel>
      <Tabs.Panel value="balance_responsible_party">
        <ControllableUnitBalanceResponsiblePartyList
          controllableUnitId={cuId}
        />
      </Tabs.Panel>
      {canViewHistory && (
        <Tabs.Panel value="history">
          <ControllableUnitHistoryList controllableUnitId={cuId} />
        </Tabs.Panel>
      )}
    </Tabs>
  );
};
