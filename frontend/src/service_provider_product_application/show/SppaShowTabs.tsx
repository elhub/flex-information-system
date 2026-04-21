import { Tabs } from "../../components/ui";
import { SppaCommentFeed } from "./SppaCommentFeed";

type Props = {
  sppaId: number;
};

export const SppaShowTabs = ({ sppaId }: Props) => (
  <Tabs defaultValue="comments" className="relative top-[-24px]">
    <Tabs.List>
      <Tabs.Tab label="Comments" value="comments" />
    </Tabs.List>
    <Tabs.Panel value="comments">
      <SppaCommentFeed sppaId={sppaId} />
    </Tabs.Panel>
  </Tabs>
);
