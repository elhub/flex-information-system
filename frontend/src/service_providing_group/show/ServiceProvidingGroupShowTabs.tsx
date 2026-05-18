import { Tabs } from "../../components/ui";
import { ServiceProvidingGroupShowTable } from "./ServiceProvidingGroupShowTable";
import { ServiceProvidingGroupShowProductApplicationsTable } from "./ServiceProvidingGroupShowProductApplicationsTable";
import { ServiceProvidingGroupShowGridPrequalificationsTable } from "./ServiceProvidingGroupShowGridPrequalificationsTable";
import { ServiceProvidingGroupShowSPGSummarySection } from "./ServiceProvidingGroupShowSPGSummarySection";
import { ServiceProvidingGroupSummary } from "../../generated-client";
import { SpgShowViewModel } from "./useSpgShowViewModel";
import { useTabSearchParam } from "../../hooks/useTabSearchParam";

type Props = {
  spgId: number;
  spgViewModel: SpgShowViewModel;
  summary: ServiceProvidingGroupSummary | undefined;
};

export const ServiceProvidingGroupShowTabs = ({
  spgId,
  spgViewModel,
  summary,
}: Props) => {
  const [tab, setTab] = useTabSearchParam("summary");
  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label="Summary" value="summary" />
        <Tabs.Tab label="Controllable units" value="controllable_units" />
        <Tabs.Tab label="Product applications" value="product_applications" />
        <Tabs.Tab
          label="Grid prequalifications"
          value="grid_prequalifications"
        />
      </Tabs.List>
      <Tabs.Panel value="summary">
        {summary ? (
          <ServiceProvidingGroupShowSPGSummarySection
            spgViewModel={spgViewModel}
            summary={summary}
          />
        ) : (
          "No summary available"
        )}
      </Tabs.Panel>
      <Tabs.Panel value="controllable_units">
        <ServiceProvidingGroupShowTable spgId={spgId} />
      </Tabs.Panel>
      <Tabs.Panel value="product_applications">
        <ServiceProvidingGroupShowProductApplicationsTable spgId={spgId} />
      </Tabs.Panel>
      <Tabs.Panel value="grid_prequalifications">
        <ServiceProvidingGroupShowGridPrequalificationsTable spgId={spgId} />
      </Tabs.Panel>
    </Tabs>
  );
};
