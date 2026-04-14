import { Tabs } from "../../../components/ui";
import { CommentList } from "../../../components/comments";
import {
  EventButton,
  NestedResourceHistoryButton,
} from "../../../components/EDS-ra/buttons";
import { SpgInfoTab } from "./SpgInfoTab";


type Props = {
  spgId: number;
  spgpaId: number;
};

export const SpgpaShowTabs = ({ spgId, spgpaId }: Props) => (
  <>
    <Tabs defaultValue="spg_info" className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label="SPG info" value="spg_info" />
        <Tabs.Tab label="Comments" value="comments" />
      </Tabs.List>
      <Tabs.Panel value="spg_info">
        <SpgInfoTab spgId={spgId} />
      </Tabs.Panel>
      <Tabs.Panel value="comments">
        <CommentList
          parentPath={[
            { resource: "service_providing_group", id: spgId },
            { resource: "product_application", id: spgpaId },
          ]}
        />
      </Tabs.Panel>
    </Tabs>
    <div className="flex gap-4 mt-2">
      <NestedResourceHistoryButton child="product_application" />
      <EventButton filterOnSubject recordId={String(spgpaId)} />
    </div>
  </>
);
