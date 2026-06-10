import { formatDate } from "date-fns";
import { Link as RouterLink } from "react-router-dom";
import { ShowBase, useRecordContext } from "ra-core";
import { LabelValue } from "../components/LabelValue";
import { ShowPageLayout } from "../components/ShowPageLayout";
import { useTabSearchParam } from "../hooks/useTabSearchParam";
import { useParty } from "../hooks/party";
import { useTranslateEnum } from "../intl/intl";
import { Badge, BodyText, Link, Loader, Panel, Tabs } from "../components/ui";
import { Notice } from "../generated-client";
import { noticeStatusVariantMap } from "./noticeStatus";
import { NoticeShowDetails } from "./NoticeShowDetails";

const NoticeShowTabs = () => {
  const [tab, setTab] = useTabSearchParam("details");

  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label="Details" value="details" />
      </Tabs.List>
      <Tabs.Panel value="details">
        <NoticeShowDetails />
      </Tabs.Panel>
    </Tabs>
  );
};

const NoticeShowSummary = () => {
  const notice = useRecordContext<Notice>();
  const translateEnum = useTranslateEnum();
  const { data: party } = useParty(notice?.party_id);

  if (!notice) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel
        border
        className="bg-semantic-background-alternative h-fit p-4 sm:p-5"
      >
        <div className="flex flex-col gap-4">
          <LabelValue size="small" labelKey="notice.id" value={notice.id} />
          <LabelValue
            size="small"
            label="Reciever"
            value={
              <Link as={RouterLink} to={`/party/${notice.party_id}/show`}>
                {party?.name ??
                  notice.party?.name ??
                  `Party ${notice.party_id}`}
              </Link>
            }
          />
          <LabelValue
            size="small"
            labelKey="notice.type"
            value={<span className="break-all">{notice.type}</span>}
            tooltip
          />
          <LabelValue
            size="small"
            labelKey="notice.source"
            value={
              notice.source ? (
                <Link as={RouterLink} to={`${notice.source}/show`}>
                  <span className="break-all">{notice.source}</span>
                </Link>
              ) : undefined
            }
            tooltip
          />
          <LabelValue
            size="small"
            labelKey="notice.status"
            value={translateEnum(`notice.status.${notice.status}`)}
            tooltip
          />
          <LabelValue
            size="small"
            labelKey="notice.recorded_at"
            value={
              notice.recorded_at
                ? formatDate(notice.recorded_at, "dd.MM.yyyy HH:mm")
                : undefined
            }
            tooltip
          />
        </div>
      </Panel>
    </div>
  );
};

const NoticeShowContent = () => {
  const translateEnum = useTranslateEnum();
  const notice = useRecordContext<Notice>();

  return (
    <ShowPageLayout
      backTo={{ pathname: "/notice", label: "Notices" }}
      title={notice?.id ? `Notice - ${notice.id}` : "Notice"}
      badge={
        notice?.status ? (
          <Badge
            size="small"
            status={noticeStatusVariantMap[notice.status].status}
            variant="block"
            icon={noticeStatusVariantMap[notice.status].icon}
          >
            {translateEnum(`notice.status.${notice.status}`)}
          </Badge>
        ) : undefined
      }
    >
      <NoticeShowSummary />
      <NoticeShowTabs />
    </ShowPageLayout>
  );
};

export const NoticeShow = () => {
  return (
    <ShowBase
      loading={<Loader />}
      error={<BodyText>Something went wrong</BodyText>}
    >
      <NoticeShowContent />
    </ShowBase>
  );
};
