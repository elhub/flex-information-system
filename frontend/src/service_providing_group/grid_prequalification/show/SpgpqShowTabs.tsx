import { usePermissions, useTranslate } from "ra-core";
import { Tabs } from "../../../components/ui";
import { SpgInfoTab } from "../../product_application/show/SpgInfoTab";
import { SpgpqCommentFeed } from "./SpgpqCommentFeed";
import {
  ServiceProvidingGroup,
  ServiceProvidingGroupGridPrequalification,
} from "../../../generated-client";
import { useTabSearchParam } from "../../../hooks/useTabSearchParam";
import { ServiceProvidingGroupGridPrequalificationHistoryList } from "../ServiceProvidingGroupGridPrequalificationHistoryList";
import { Permissions } from "../../../auth/permissions";

type Props = {
  spgId: number;
  spgpqId: number;
  spg: ServiceProvidingGroup | undefined;
  spgpq: ServiceProvidingGroupGridPrequalification;
};

export const SpgpqShowTabs = ({ spgId, spgpqId, spg, spgpq }: Props) => {
  const translate = useTranslate();
  const { permissions } = usePermissions<Permissions>();
  const canViewHistory = !!permissions?.allow(
    "service_providing_group_grid_prequalification_history",
    "read",
  );
  const [tab, setTab] = useTabSearchParam("overview");

  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label={translate("text.tab.overview")} value="overview" />
        <Tabs.Tab label={translate("text.tab.comments")} value="comments" />
        {canViewHistory && (
          <Tabs.Tab label={translate("text.tab.history")} value="history" />
        )}
      </Tabs.List>
      <Tabs.Panel value="overview">
        <SpgInfoTab
          spgId={spgId}
          spg={spg}
          impactedSystemOperatorId={spgpq.impacted_system_operator_id}
        />
      </Tabs.Panel>
      <Tabs.Panel value="comments">
        <SpgpqCommentFeed spgpqId={spgpqId} />
      </Tabs.Panel>
      {canViewHistory && (
        <Tabs.Panel value="history">
          <ServiceProvidingGroupGridPrequalificationHistoryList />
        </Tabs.Panel>
      )}
    </Tabs>
  );
};
