import { Link as RouterLink } from "react-router-dom";
import { Link, Panel, Tabs } from "../../components/ui";
import { LabelValue } from "../../components/LabelValue";
import { TechnicalResourceList } from "../technical_resource/TechnicalResourceList";
import { ControllableUnitHistoryList } from "../ControllableUnitHistoryList";
import { useGetIdentity, usePermissions, RecordContextProvider } from "ra-core";
import { useTabSearchParam } from "../../hooks/useTabSearchParam";
import type { ControllableUnitShowViewModel } from "./useControllableUnitViewModel";
import { ControllableUnitServiceProviderList } from "../service_provider/ControllableUnitServiceProviderList";
import { ControllableUnitBalanceResponsiblePartyList } from "../balance_responsible_party/ControllableUnitBalanceResponsiblePartyList";
import { AccountingPointLocationMap } from "../../accounting_point/show/AccountingPointLocationMap";
import { Permissions } from "../../auth/permissions";
import { IconRight } from "@elhub/ds-icons";

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
  const canViewLocation = !!permissions?.allow(
    "accounting_point.location",
    "read",
  );
  const [tab, setTab] = useTabSearchParam("technical_resources");

  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label="Technical resources" value="technical_resources" />
        {canViewLocation && (
          <Tabs.Tab
            label="Accounting point location"
            value="accounting_point_location"
          />
        )}
        <Tabs.Tab label="Service provider contracts" value="service_provider" />
        <Tabs.Tab
          label="Balance responsible parties"
          value="balance_responsible_party"
        />
        <Tabs.Tab label="History" value="history" />
      </Tabs.List>
      <Tabs.Panel value="technical_resources">
        <RecordContextProvider value={{ id: cuId }}>
          <TechnicalResourceList />
        </RecordContextProvider>
      </Tabs.Panel>
      {canViewLocation && (
        <Tabs.Panel value="accounting_point_location">
          <Panel border className="mb-4 p-4 sm:p-5">
            <LabelValue
              label="Accounting point"
              value={
                viewModel.accountingPoint ? (
                  <Link
                    as={RouterLink}
                    to={`/accounting_point/${viewModel.accountingPoint.id}/show`}
                    className="inline-flex items-center gap-1"
                    title="View accounting point"
                  >
                    {viewModel.accountingPoint.business_id}
                    <IconRight size="small" />
                  </Link>
                ) : undefined
              }
            />
          </Panel>
          <AccountingPointLocationMap
            location={viewModel.accountingPoint?.location}
            canViewGrid={userCanViewGrid(identity?.role)}
            selectedSubstation={null}
            popupSubstation={null}
            onClosePopup={() => undefined}
          />
        </Tabs.Panel>
      )}
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
