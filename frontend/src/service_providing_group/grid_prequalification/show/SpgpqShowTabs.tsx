import { Tabs } from "../../../components/ui";
import { SpgpqCommentFeed } from "./SpgpqCommentFeed";

type Props = {
  spgpqId: number;
};

export const SpgpqShowTabs = ({ spgpqId }: Props) => (
  <Tabs defaultValue="comments" className="relative top-[-24px]">
    <Tabs.List>
      <Tabs.Tab label="Comments" value="comments" />
    </Tabs.List>
    <Tabs.Panel value="comments">
      <SpgpqCommentFeed spgpqId={spgpqId} />
    </Tabs.Panel>
  </Tabs>
);
