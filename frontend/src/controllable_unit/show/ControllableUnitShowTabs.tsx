import { Tabs } from "../../components/ui";
import { TechnicalResourceList } from "../technical_resource/TechnicalResourceList";
import { RecordContextProvider } from "ra-core";
import { useTabSearchParam } from "../../hooks/useTabSearchParam";

type Props = {
  cuId: number;
};

export const ControllableUnitShowTabs = ({ cuId }: Props) => {
  const [tab, setTab] = useTabSearchParam("technical_resources");
  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
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
};
