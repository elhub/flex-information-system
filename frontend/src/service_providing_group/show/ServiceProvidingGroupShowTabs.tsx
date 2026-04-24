import { Tabs } from "../../components/ui";
import { ServiceProvidingGroupShowTable } from "./ServiceProvidingGroupShowTable";
import { ServiceProvidingGroupShowProductApplicationsTable } from "./ServiceProvidingGroupShowProductApplicationsTable";
import { ServiceProvidingGroupShowGridPrequalificationsTable } from "./ServiceProvidingGroupShowGridPrequalificationsTable";
import { SpgSummarySection } from "./SpgSummarySection";
import { ServiceProvidingGroupSummary } from "../../generated-client";

type Props = {
  spgId: number;
  summary: ServiceProvidingGroupSummary | undefined;
};

export const ServiceProvidingGroupShowTabs = ({ spgId, summary }: Props) => (
  <Tabs defaultValue="controllable_units" className="relative top-[-24px]">
    <Tabs.List>
      <Tabs.Tab label="Controllable units" value="controllable_units" />
      <Tabs.Tab
        label="Product prequalifications"
        value="product_applications"
      />
      <Tabs.Tab label="Grid prequalifications" value="grid_prequalifications" />
    </Tabs.List>
    <Tabs.Panel value="controllable_units">
      <ServiceProvidingGroupShowTable spgId={spgId} />
      {summary && <SpgSummarySection summary={summary} />}
    </Tabs.Panel>
    <Tabs.Panel value="product_applications">
      <ServiceProvidingGroupShowProductApplicationsTable spgId={spgId} />
    </Tabs.Panel>
    <Tabs.Panel value="grid_prequalifications">
      <ServiceProvidingGroupShowGridPrequalificationsTable spgId={spgId} />
    </Tabs.Panel>
  </Tabs>
);
