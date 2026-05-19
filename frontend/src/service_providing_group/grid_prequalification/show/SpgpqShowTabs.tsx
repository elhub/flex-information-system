import { Tabs } from "../../../components/ui";
import { SpgInfoTab } from "../../product_application/show/SpgInfoTab";
import { SpgpqCommentFeed } from "./SpgpqCommentFeed";
import { ServiceProvidingGroup } from "../../../generated-client";
import { useTabSearchParam } from "../../../hooks/useTabSearchParam";

type Props = {
  spgId: number;
  spgpqId: number;
  spg: ServiceProvidingGroup | undefined;
};

export const SpgpqShowTabs = ({ spgId, spgpqId, spg }: Props) => {
  const [tab, setTab] = useTabSearchParam("spg_info");
  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label="SPG info" value="spg_info" />
        <Tabs.Tab label="Comments" value="comments" />
      </Tabs.List>
      <Tabs.Panel value="spg_info">
        <SpgInfoTab spgId={spgId} spg={spg} />
      </Tabs.Panel>
      <Tabs.Panel value="comments">
        <SpgpqCommentFeed spgpqId={spgpqId} />
      </Tabs.Panel>
    </Tabs>
  );
};
