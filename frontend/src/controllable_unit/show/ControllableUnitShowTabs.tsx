import { Tabs } from "../../components/ui";
import { TechnicalResourceList } from "../technical_resource/TechnicalResourceList";
import { ControllableUnitHistoryList } from "../ControllableUnitHistoryList";
import { useGetIdentity, usePermissions, RecordContextProvider } from "ra-core";
import { useTabSearchParam } from "../../hooks/useTabSearchParam";
import { ControllableUnitOverview } from "./ControllableUnitOverview";
import type { ControllableUnitShowViewModel } from "./useControllableUnitViewModel";
import { ControllableUnitServiceProviderList } from "../service_provider/ControllableUnitServiceProviderList";
import { ControllableUnitBalanceResponsiblePartyList } from "../balance_responsible_party/ControllableUnitBalanceResponsiblePartyList";
import { AccountingPointLocationMap } from "../../accounting_point/show/AccountingPointLocationMap";
import { Permissions } from "../../auth/permissions";

const userCanViewGrid = (role: string | undefined) =>
  role === "flex_flexibility_information_system_operator" ||
  role === "flex_system_operator";

type Props = {
  cuId: number;
  viewModel: ControllableUnitShowViewModel;
};

export const ControllableUnitShowTabs = ({ cuId, viewModel }: Props) => {
  const { permissions } = usePermissions<Permissions>();
  const { data: identity } = useGetIdentity();
  const [tab, setTab] = useTabSearchParam("overview");
  const canViewLocation = !!permissions?.allow(
    "accounting_point.location",
    "read",
  );

  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label="Overview" value="overview" />
        {canViewLocation && (
          <Tabs.Tab
            label="Accounting point location"
            value="accounting_point_location"
          />
        )}
        <Tabs.Tab label="Technical resources" value="technical_resources" />
        <Tabs.Tab label="Service provider contracts" value="service_provider" />
        <Tabs.Tab
          label="Balance responsible parties"
          value="balance_responsible_party"
        />
        <Tabs.Tab label="History" value="history" />
      </Tabs.List>
      <Tabs.Panel value="overview">
        <ControllableUnitOverview viewModel={viewModel} />
      </Tabs.Panel>
      {canViewLocation && (
        <Tabs.Panel value="accounting_point_location">
          <AccountingPointLocationMap
            location={viewModel.accountingPoint?.location}
            canViewGrid={userCanViewGrid(identity?.role)}
            selectedSubstation={null}
            popupSubstation={null}
            onClosePopup={() => undefined}
          />
        </Tabs.Panel>
      )}
      <Tabs.Panel value="technical_resources">
        <RecordContextProvider value={{ id: cuId }}>
          <TechnicalResourceList />
        </RecordContextProvider>
      </Tabs.Panel>
      <Tabs.Panel value="service_provider">
        <ControllableUnitServiceProviderList controllableUnitId={cuId} />
      </Tabs.Panel>
      <Tabs.Panel value="balance_responsible_party">
        <ControllableUnitBalanceResponsiblePartyList
          controllableUnitId={cuId}
        />
      </Tabs.Panel>
      <Tabs.Panel value="history">
        <ControllableUnitHistoryList controllableUnitId={cuId} />
      </Tabs.Panel>
    </Tabs>
  );
};
