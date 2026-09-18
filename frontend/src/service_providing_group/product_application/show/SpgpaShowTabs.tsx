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
import { ServiceProvidingGroupProductApplicationHistoryList } from "../ServiceProvidingGroupProductApplicationHistoryList";
import { SpgpaOverview } from "./SpgpaOverview";
import { SpgpaControllableUnitsTable } from "./SpgpaControllableUnitsTable";
import { useTranslate } from "ra-core";

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
  const [tab, setTab] = useTabSearchParam("overview");
  const translate = useTranslate();
  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label="Overview" value="overview" />
        <Tabs.Tab label={translate("text.tab.spg_info")} value="spg_info" />
        <Tabs.Tab
          label={translate("text.tab.controllable_units")}
          value="controllable_units"
        />
        <Tabs.Tab label={translate("text.tab.comments")} value="comments" />
        {attachmentsEnabled && (
          <Tabs.Tab
            label={translate("text.tab.attachments")}
            value="attachments"
          />
        )}
        <Tabs.Tab label="History" value="history" />
      </Tabs.List>
      <Tabs.Panel value="overview">
        <SpgpaOverview spgpa={spgpa} spg={spg} />
      </Tabs.Panel>
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
      <Tabs.Panel value="history">
        <ServiceProvidingGroupProductApplicationHistoryList
          applicationId={spgpaId}
        />
      </Tabs.Panel>
    </Tabs>
  );
};
