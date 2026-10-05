import { formatDate } from "date-fns";
import { Link as RouterLink } from "react-router-dom";
import { ShowBase, useRecordContext, useTranslate } from "ra-core";
import {
  ResourceShowLayout,
  ResourceSummaryField,
} from "../components/ResourceShowLayout";
import { useTabSearchParam } from "../hooks/useTabSearchParam";
import { useParty } from "../hooks/party";
import { useTranslateEnum } from "../intl/intl";
import {
  BodyText,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardHeaderContent,
  CardTitle,
  Loader,
  Tabs,
} from "../components/ui";
import { Notice } from "../generated-client";
import { noticeStatusVariantMap } from "./noticeStatus";
import { NoticeShowDetails } from "./NoticeShowDetails";
import noticeTypes from "./noticeTypes";
import { LabelValue } from "../components/LabelValue";

const parsePartyId = (source?: string | null) => {
  const [, resource, id] = source?.split("/") ?? [];
  return resource === "party" && Number.isInteger(Number(id))
    ? Number(id)
    : undefined;
};

const PartyCard = ({
  title,
  partyId,
}: {
  title: string;
  partyId: number | undefined;
}) => {
  const translate = useTranslate();
  const { data: party } = useParty(partyId);

  return (
    <Card>
      <CardHeader>
        <CardHeaderContent>
          <CardTitle>{title}</CardTitle>
        </CardHeaderContent>
      </CardHeader>
      <CardContent className="grid gap-4">
        <LabelValue label="Name" value={party?.name ?? "-"} />
      </CardContent>
      <CardFooter>
        <Button
          variant="tertiary"
          size="medium"
          as={RouterLink}
          to={`/party/${partyId}/show`}
        >
          {translate("notice_see_party_button")}
        </Button>
      </CardFooter>
    </Card>
  );
};

const SourceCard = ({ source }: { source: string }) => {
  const translate = useTranslate();

  return (
    <Card>
      <CardHeader>
        <CardHeaderContent>
          <CardTitle>Source</CardTitle>
        </CardHeaderContent>
      </CardHeader>
      <CardContent className="grid gap-4">
        <LabelValue label="Source" value={source ?? "-"} />
      </CardContent>
      <CardFooter>
        <Button
          variant="tertiary"
          size="medium"
          as={RouterLink}
          to={source + "/show"}
        >
          {translate("notice_see_source_button")}
        </Button>
      </CardFooter>
    </Card>
  );
};

const NoticeLinkedCards = ({ notice }: { notice: Notice }) => {
  const sourcePartyId = parsePartyId(notice.source);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {notice.source &&
        (sourcePartyId ? (
          <PartyCard title="Source" partyId={sourcePartyId} />
        ) : (
          <SourceCard source={notice.source} />
        ))}
      <PartyCard title="Receiver" partyId={notice.party_id} />
    </div>
  );
};

const NoticeShowTabs = ({ notice }: { notice: Notice }) => {
  const [tab, setTab] = useTabSearchParam("overview");

  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label="Overview" value="overview" />
      </Tabs.List>
      <Tabs.Panel value="overview">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardHeaderContent>
                <CardTitle>Notice details</CardTitle>
              </CardHeaderContent>
            </CardHeader>
            <CardContent>
              <NoticeShowDetails />
            </CardContent>
          </Card>
          <NoticeLinkedCards notice={notice} />
        </div>
      </Tabs.Panel>
    </Tabs>
  );
};

const NoticeShowContent = () => {
  const translateEnum = useTranslateEnum();
  const notice = useRecordContext<Notice>();

  if (!notice) {
    return null;
  }

  const summary: ResourceSummaryField[] = [
    {
      labelKey: "notice.type",
      value: <span className="break-all">{notice.type}</span>,
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
      content={<NoticeShowTabs notice={notice} />}
    />
  );
};

export const NoticeShow = () => (
  <ShowBase
    loading={<Loader />}
    error={<BodyText>Something went wrong</BodyText>}
  >
    <NoticeShowContent />
  </ShowBase>
);
