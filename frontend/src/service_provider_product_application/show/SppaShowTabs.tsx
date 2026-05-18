import { Tabs } from "../../components/ui";
import { SppaCommentFeed } from "./SppaCommentFeed";
import { useTabSearchParam } from "../../hooks/useTabSearchParam";

type Props = {
  sppaId: number;
};

export const SppaShowTabs = ({ sppaId }: Props) => {
  const [tab, setTab] = useTabSearchParam("comments");
  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label="Comments" value="comments" />
      </Tabs.List>
      <Tabs.Panel value="comments">
        <SppaCommentFeed sppaId={sppaId} />
      </Tabs.Panel>
    </Tabs>
  );
};
