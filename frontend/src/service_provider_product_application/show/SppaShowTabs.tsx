import { usePermissions, useTranslate } from "ra-core";
import { Tabs } from "../../components/ui";
import { Permissions } from "../../auth/permissions";
import { SppaCommentFeed } from "./SppaCommentFeed";
import { SppaOverviewTab } from "./SppaOverviewTab";
import { ServiceProviderProductApplicationHistoryList } from "../ServiceProviderProductApplicationHistoryList";
import { useTabSearchParam } from "../../hooks/useTabSearchParam";
import { ServiceProviderProductApplication } from "../../generated-client";

type Props = {
  sppa: ServiceProviderProductApplication;
};

export const SppaShowTabs = ({ sppa }: Props) => {
  const { permissions } = usePermissions<Permissions>();
  const translate = useTranslate();
  const [tab, setTab] = useTabSearchParam("overview");
  const canViewHistory = !!permissions?.allow(
    "service_provider_product_application_history",
    "read",
  );
  return (
    <Tabs value={tab} onChange={setTab}>
      <Tabs.List>
        <Tabs.Tab label={translate("text.tab.overview")} value="overview" />
        <Tabs.Tab label={translate("text.tab.comments")} value="comments" />
        {canViewHistory && (
          <Tabs.Tab label={translate("text.tab.history")} value="history" />
        )}
      </Tabs.List>
      <Tabs.Panel value="overview">
        <SppaOverviewTab
          serviceProviderId={sppa.service_provider_id}
          systemOperatorId={sppa.system_operator_id}
        />
      </Tabs.Panel>
      <Tabs.Panel value="comments">
        <SppaCommentFeed sppaId={sppa.id} />
      </Tabs.Panel>
      {canViewHistory && (
        <Tabs.Panel value="history">
          <ServiceProviderProductApplicationHistoryList sppaId={sppa.id} />
        </Tabs.Panel>
      )}
    </Tabs>
  );
};
