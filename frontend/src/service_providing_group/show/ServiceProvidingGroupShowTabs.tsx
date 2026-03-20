import { Tabs } from "../../components/ui";
import { ServiceProvidingGroupShowTable } from "./ServiceProvidingGroupShowTable";
import { ServiceProvidingGroupShowProductApplicationsTable } from "./ServiceProvidingGroupShowProductApplicationsTable";
import { ServiceProvidingGroupShowGridPrequalificationsTable } from "./ServiceProvidingGroupShowGridPrequalificationsTable";

type Props = {
  spgId: number;
};

export const ServiceProvidingGroupShowTabs = ({ spgId }: Props) => (
  <Tabs defaultValue="controllable_units" className="relative top-[-24px]">
    <Tabs.List>
      <Tabs.Tab label="Controllable units" value="controllable_units" />
      <Tabs.Tab label="Product applications" value="product_applications" />
      <Tabs.Tab label="Grid prequalifications" value="grid_prequalifications" />
    </Tabs.List>
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
