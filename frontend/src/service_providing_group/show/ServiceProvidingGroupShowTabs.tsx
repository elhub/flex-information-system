import { Tabs } from "../../components/ui";
import { ServiceProvidingGroupShowTable } from "./ServiceProvidingGroupShowTable";
import { ServiceProvidingGroupShowProductApplicationsTable } from "./ServiceProvidingGroupShowProductApplicationsTable";
import { ServiceProvidingGroupShowGridPrequalificationsTable } from "./ServiceProvidingGroupShowGridPrequalificationsTable";
import { ServiceProvidingGroupShowPowerPerSubstationTable } from "./ServiceProvidingGroupShowPowerPerSubstationTable";
import { ServiceProvidingGroupShowSPGSummarySection } from "./ServiceProvidingGroupShowSPGSummarySection";
import {
  ServiceProvidingGroupStatus,
  ServiceProvidingGroupSummary,
} from "../../generated-client";
import { useTabSearchParam } from "../../hooks/useTabSearchParam";
import { SpgTechnicalResourceList } from "./SpgTechnicalResourceList";
import { usePermissions, useTranslate } from "ra-core";
import { Scale } from "../../utils/scales";
import { ServiceProvidingGroupHistoryList } from "./ServiceProvidingGroupHistory";
import { Permissions } from "../../auth/permissions";

type Props = {
  spgId: number;
  spgStatus: ServiceProvidingGroupStatus;
  summary: ServiceProvidingGroupSummary | undefined;
  showPowerPerSubstation?: boolean;
  powerScale: Scale;
};

export const ServiceProvidingGroupShowTabs = ({
  spgId,
  spgStatus,
  summary,
  showPowerPerSubstation,
  powerScale,
}: Props) => {
  const [tab, setTab] = useTabSearchParam("overview");
  const translate = useTranslate();
  const { permissions } = usePermissions<Permissions>();
  const canViewHistory = !!permissions?.allow(
    "service_providing_group_history",
    "read",
  );
  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label={translate("text.tab.overview")} value="overview" />
        <Tabs.Tab
          label={translate("text.tab.controllable_units")}
          value="controllable_units"
        />
        <Tabs.Tab
          label={translate("text.tab.technical_resources")}
          value="technical_resources"
        />
        <Tabs.Tab
          label={translate("text.tab.product_applications")}
          value="product_applications"
        />
        <Tabs.Tab
          label={translate("text.tab.grid_prequalifications")}
          value="grid_prequalifications"
        />
        {showPowerPerSubstation && (
          <Tabs.Tab
            label={translate("text.tab.power_per_substation")}
            value="power_per_substation"
          />
        )}
        <Tabs.Tab label={translate("text.tab.history")} value="history" />
      </Tabs.List>
      <Tabs.Panel value="overview">
        {summary ? (
          <ServiceProvidingGroupShowSPGSummarySection
            summary={summary}
            powerScale={powerScale}
          />
        ) : (
          "No overview available"
        )}
      </Tabs.Panel>
      <Tabs.Panel value="controllable_units">
        <ServiceProvidingGroupShowTable spgId={spgId} powerScale={powerScale} />
      </Tabs.Panel>
      <Tabs.Panel value="technical_resources">
        <SpgTechnicalResourceList spgId={spgId} powerScale={powerScale} />
      </Tabs.Panel>
      <Tabs.Panel value="product_applications">
        <ServiceProvidingGroupShowProductApplicationsTable
          spgId={spgId}
          spgStatus={spgStatus}
          powerScale={powerScale}
        />
      </Tabs.Panel>
      <Tabs.Panel value="grid_prequalifications">
        <ServiceProvidingGroupShowGridPrequalificationsTable spgId={spgId} />
      </Tabs.Panel>
      {showPowerPerSubstation && (
        <Tabs.Panel value="power_per_substation">
          <ServiceProvidingGroupShowPowerPerSubstationTable
            spgId={spgId}
            powerScale={powerScale}
          />
        </Tabs.Panel>
      )}
      {canViewHistory && (
        <Tabs.Panel value="history">
          <ServiceProvidingGroupHistoryList spgId={spgId} />
        </Tabs.Panel>
      )}
    </Tabs>
  );
};
