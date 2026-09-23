import { Tabs } from "../../components/ui";
import { TechnicalResourceList } from "../technical_resource/TechnicalResourceList";
import { RecordContextProvider, useTranslate } from "ra-core";
import { useTabSearchParam } from "../../hooks/useTabSearchParam";
import { ControllableUnitSpgList } from "./ControllableUnitSpgList";

type Props = {
  cuId: number;
};

export const ControllableUnitShowTabs = ({ cuId }: Props) => {
  const [tab, setTab] = useTabSearchParam("technical_resources");
  const translate = useTranslate();
  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab
          label={translate("text.tab.technical_resources")}
          value="technical_resources"
        />
        <Tabs.Tab
          label={translate("text.tab.service_providing_groups")}
          value="service_providing_groups"
        />
      </Tabs.List>
      <Tabs.Panel value="technical_resources">
        <RecordContextProvider value={{ id: cuId }}>
          <TechnicalResourceList />
        </RecordContextProvider>
      </Tabs.Panel>
      <Tabs.Panel value="service_providing_groups">
        <ControllableUnitSpgList cuId={cuId} />
      </Tabs.Panel>
    </Tabs>
  );
};
