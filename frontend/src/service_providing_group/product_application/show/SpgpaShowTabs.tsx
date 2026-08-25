import { Tabs } from "../../../components/ui";
import { SpgInfoTab } from "./SpgInfoTab";
import { SpgpaCommentFeed } from "./SpgpaCommentFeed";
import { AttachmentList } from "../../../components/attachments/AttachmentList";
import { ServiceProvidingGroup } from "../../../generated-client";
import { useTabSearchParam } from "../../../hooks/useTabSearchParam";
import { attachmentsEnabled } from "../../../httpConfig";
import { Scale } from "../../../utils/scales";

type Props = {
  spgId: number;
  spgpaId: number;
  spg: ServiceProvidingGroup | undefined;
  powerScale: Scale;
};

export const SpgpaShowTabs = ({ spgId, spgpaId, spg, powerScale }: Props) => {
  const [tab, setTab] = useTabSearchParam("spg_info");
  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label="SPG info" value="spg_info" />
        <Tabs.Tab label="Comments" value="comments" />
        {attachmentsEnabled && (
          <Tabs.Tab label="Attachments" value="attachments" />
        )}
      </Tabs.List>
      <Tabs.Panel value="spg_info">
        <SpgInfoTab spgId={spgId} spg={spg} powerScale={powerScale} />
      </Tabs.Panel>
      <Tabs.Panel value="comments">
        <SpgpaCommentFeed spgpaId={spgpaId} />
      </Tabs.Panel>
      {attachmentsEnabled && (
        <Tabs.Panel value="attachments">
          <AttachmentList
            resource="service_providing_group_product_application"
            parentId={spgpaId}
          />
        </Tabs.Panel>
      )}
    </Tabs>
  );
};
