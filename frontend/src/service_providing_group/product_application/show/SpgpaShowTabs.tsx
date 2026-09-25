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
import { SpgpaControllableUnitsTable } from "./SpgpaControllableUnitsTable";
import { ServiceProvidingGroupShowChangesTab } from "./ServiceProvidingGroupShowChangesTab";
import { usePermissions, useTranslate } from "ra-core";
import { Permissions } from "../../../auth/permissions";

type Props = {
  spgId: number;
  spgpaId: number;
  spgpa: ServiceProvidingGroupProductApplication;
  spg: ServiceProvidingGroup | undefined;
  showChanges?: boolean;
  powerScale: Scale;
};

export const SpgpaShowTabs = ({
  spgId,
  spgpaId,
  spgpa,
  spg,
  showChanges,
  powerScale,
}: Props) => {
  const { permissions } = usePermissions<Permissions>();
  const canViewHistory = !!permissions?.allow(
    "service_providing_group_product_application_history",
    "read",
  );
  const [tab, setTab] = useTabSearchParam("overview");
  const translate = useTranslate();
  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label={translate("text.tab.overview")} value="overview" />
        <Tabs.Tab
          label={translate("text.tab.controllable_units")}
          value="controllable_units"
        />
        {showChanges && (
          <Tabs.Tab label={translate("text.tab.changes")} value="changes" />
        )}
        <Tabs.Tab label={translate("text.tab.comments")} value="comments" />
        {attachmentsEnabled && (
          <Tabs.Tab
            label={translate("text.tab.attachments")}
            value="attachments"
          />
        )}
        {canViewHistory && (
          <Tabs.Tab label={translate("text.tab.history")} value="history" />
        )}
      </Tabs.List>
      <Tabs.Panel value="overview">
        <SpgInfoTab
          spgId={spgId}
          spgProcuringSystemOperatorId={spgpa.procuring_system_operator_id}
          spg={spg}
          powerScale={powerScale}
        />
      </Tabs.Panel>
      <Tabs.Panel value="controllable_units">
        <SpgpaControllableUnitsTable
          spgId={spgId}
          spgpa={spgpa}
          powerScale={powerScale}
        />
      </Tabs.Panel>

      {showChanges && (
        <Tabs.Panel value="changes">
          <ServiceProvidingGroupShowChangesTab
            key={`${spgId}-${spgpa.id}-${spgpa.created_at}`}
            spgId={spgId}
            spgpa={spgpa}
            powerScale={powerScale}
          />
        </Tabs.Panel>
      )}

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
      {canViewHistory && (
        <Tabs.Panel value="history">
          <ServiceProvidingGroupProductApplicationHistoryList
            applicationId={spgpaId}
          />
        </Tabs.Panel>
      )}
    </Tabs>
  );
};
