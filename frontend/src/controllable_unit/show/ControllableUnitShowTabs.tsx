import { Tabs } from "../../components/ui";
import { TechnicalResourceList } from "../technical_resource/TechnicalResourceList";
import { RecordContextProvider } from "ra-core";

type Props = {
  cuId: number;
};

export const ControllableUnitShowTabs = ({ cuId }: Props) => (
  <Tabs defaultValue="technical_resources" className="relative top-[-24px]">
    <Tabs.List>
      <Tabs.Tab label="Technical resources" value="technical_resources" />
    </Tabs.List>
    <Tabs.Panel value="technical_resources">
      <RecordContextProvider value={{ id: cuId }}>
        <TechnicalResourceList />
      </RecordContextProvider>
    </Tabs.Panel>
  </Tabs>
);
