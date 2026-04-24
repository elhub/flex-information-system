import { Tabs } from "../../../components/ui";
import { SpgInfoTab } from "./SpgInfoTab";
import { SpgpaCommentFeed } from "./SpgpaCommentFeed";
import { ServiceProvidingGroup } from "../../../generated-client";

type Props = {
  spgId: number;
  spgpaId: number;
  spg: ServiceProvidingGroup | undefined;
};

export const SpgpaShowTabs = ({ spgId, spgpaId, spg }: Props) => (
  <>
    <Tabs defaultValue="spg_info" className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label="SPG info" value="spg_info" />
        <Tabs.Tab label="Comments" value="comments" />
      </Tabs.List>
      <Tabs.Panel value="spg_info">
        <SpgInfoTab spgId={spgId} spg={spg} />
      </Tabs.Panel>
      <Tabs.Panel value="comments">
        <SpgpaCommentFeed spgpaId={spgpaId} />
      </Tabs.Panel>
    </Tabs>
  </>
);
