import { Tabs } from "../../../components/ui";
import { SpgpaCommentFeed } from "./SpgpaCommentFeed";
import { AttachmentList } from "../../../components/attachments/AttachmentList";
import {
  ServiceProvidingGroup,
  ServiceProvidingGroupProductApplication,
} from "../../../generated-client";
import { useTabSearchParam } from "../../../hooks/useTabSearchParam";
import { attachmentsEnabled } from "../../../httpConfig";
import { Scale } from "../../../utils/scales";
import { SpgInfoTab } from "./SpgInfoTab";
import { SpgpaControllableUnitsTable } from "./SpgpaControllableUnitsTable";

type Props = {
  spgId: number;
  spgpaId: number;
  spgpa: ServiceProvidingGroupProductApplication;
  spg: ServiceProvidingGroup | undefined;
  powerScale: Scale;
};

export const SpgpaShowTabs = ({
  spgId,
  spgpaId,
  spgpa,
  spg,
  powerScale,
}: Props) => {
  const [tab, setTab] = useTabSearchParam("spg_info");
  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label="SPG info" value="spg_info" />
        <Tabs.Tab label="Controllable units" value="controllable_units" />
        <Tabs.Tab label="Comments" value="comments" />
        {attachmentsEnabled && (
          <Tabs.Tab label="Attachments" value="attachments" />
        )}
      </Tabs.List>
      <Tabs.Panel value="spg_info">
        <SpgInfoTab spgId={spgId} spg={spg} powerScale={powerScale} />
      </Tabs.Panel>
      <Tabs.Panel value="controllable_units">
        <SpgpaControllableUnitsTable
          spgId={spgId}
          spgpa={spgpa}
          powerScale={powerScale}
        />
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
