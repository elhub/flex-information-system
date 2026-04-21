import { Tabs } from "../../components/ui";
import { CommentList } from "../../components/comments";
import {
  EventButton,
  NestedResourceHistoryButton,
  ResourceHistoryButton,
} from "../../components/EDS-ra/buttons";

type Props = {
  sppaId: number;
};

export const SppaShowTabs = ({ sppaId }: Props) => (
  <>
    <Tabs defaultValue="comments" className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label="Comments" value="comments" />
      </Tabs.List>
      <Tabs.Panel value="comments">
        <CommentList
          parentPath={[
            { resource: "service_provider_product_application", id: sppaId },
          ]}
        />
      </Tabs.Panel>
    </Tabs>
    <div className="flex gap-4 mt-2">
      <ResourceHistoryButton />
      <NestedResourceHistoryButton child="comment" />
      <EventButton filterOnSubject recordId={String(sppaId)} />
    </div>
  </>
);
