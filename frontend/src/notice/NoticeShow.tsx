import { formatDate } from "date-fns";
import { Link as RouterLink } from "react-router-dom";
import { ShowBase, useRecordContext } from "ra-core";
import {
  ResourceShowLayout,
  ResourceSummaryField,
} from "../components/ResourceShowLayout";
import { useTabSearchParam } from "../hooks/useTabSearchParam";
import { useParty } from "../hooks/party";
import { useTranslateEnum } from "../intl/intl";
import { BodyText, Link, Loader, Tabs } from "../components/ui";
import { Notice } from "../generated-client";
import { noticeStatusVariantMap } from "./noticeStatus";
import { NoticeShowDetails } from "./NoticeShowDetails";
import noticeTypes from "./noticeTypes";

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

const NoticeShowContent = () => {
  const translateEnum = useTranslateEnum();
  const notice = useRecordContext<Notice>();
  const { data: party } = useParty(notice?.party_id);

  if (!notice) {
    return null;
  }

  const summary: ResourceSummaryField[] = [
    { labelKey: "notice.id", value: notice.id },
    {
      label: "Receiver",
      value: (
        <Link as={RouterLink} to={`/party/${notice.party_id}/show`}>
          {party?.name ?? notice.party?.name ?? `Party ${notice.party_id}`}
        </Link>
      ),
    },
    {
      labelKey: "notice.type",
      value: <span className="break-all">{notice.type}</span>,
      tooltip: true,
    },
    {
      labelKey: "notice.source",
      value: notice.source ? (
        <Link as={RouterLink} to={`${notice.source}/show`}>
          <span className="break-all">{notice.source}</span>
        </Link>
      ) : undefined,
      tooltip: true,
    },
    {
      labelKey: "notice.status",
      value: translateEnum(`notice.status.${notice.status}`),
      tooltip: true,
    },
    {
      labelKey: "notice.recorded_at",
      value: notice.recorded_at
        ? formatDate(notice.recorded_at, "dd.MM.yyyy HH:mm")
        : undefined,
      tooltip: true,
    },
  ];

  return (
    <ResourceShowLayout
      secondaryHeaderText={`Notice #${notice.id}`}
      mainHeaderText={
        noticeTypes.find((nt) => nt.id === notice.type)?.label ?? notice.type
      }
      status={{
        label: translateEnum(`notice.status.${notice.status}`),
        status: noticeStatusVariantMap[notice.status].status,
        icon: noticeStatusVariantMap[notice.status].icon,
      }}
      summary={summary}
      content={<NoticeShowTabs />}
    />
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
