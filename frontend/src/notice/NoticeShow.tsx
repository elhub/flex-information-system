import { ReactNode } from "react";
import { formatDate } from "date-fns";
import { Link as RouterLink } from "react-router-dom";
import { ShowBase, useRecordContext } from "ra-core";
import { IconExternal } from "@elhub/ds-icons";
import {
  ResourceShowLayout,
  ResourceSummaryField,
} from "../components/ResourceShowLayout";
import { useTabSearchParam } from "../hooks/useTabSearchParam";
import { useParty } from "../hooks/party";
import { useTranslateEnum } from "../intl/intl";
import {
  Badge,
  BodyText,
  Card,
  CardContent,
  CardHeader,
  CardHeaderContent,
  CardTitle,
  Link,
  Loader,
  Tabs,
} from "../components/ui";
import { Notice } from "../generated-client";
import { partyStatusVariantMap } from "../party/partyStatus";
import { noticeStatusVariantMap } from "./noticeStatus";
import { NoticeShowDetails } from "./NoticeShowDetails";
import noticeTypes from "./noticeTypes";

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-semibold uppercase">{label}</span>
    <BodyText as="div" size="small">
      {children}
    </BodyText>
  </div>
);

const NewPageLink = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link
    as={RouterLink}
    to={to}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 font-semibold"
  >
    {children}
    <IconExternal fontSize="small" />
  </Link>
);

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
  const translateEnum = useTranslateEnum();
  const { data: party } = useParty(partyId);
  const statusVariant = party?.status
    ? partyStatusVariantMap[party.status]
    : undefined;

  return (
    <Card>
      <CardHeader>
        <CardHeaderContent>
          <CardTitle>{title}</CardTitle>
        </CardHeaderContent>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <Field label="Name">
            <NewPageLink to={`/party/${partyId}/show`}>
              {party?.name ?? `Party ${partyId}`}
            </NewPageLink>
          </Field>
          <Field label="Type">
            {party?.type ? translateEnum(`party.type.${party.type}`) : "-"}
          </Field>
          <Field
            label={
              party?.business_id_type
                ? translateEnum(
                    `party.business_id_type.${party.business_id_type}`,
                  )
                : "Business ID"
            }
          >
            {party?.business_id ?? "-"}
          </Field>
          <Field label="Status">
            {party?.status && statusVariant ? (
              <Badge
                size="small"
                status={statusVariant.status}
                variant="block"
                icon={statusVariant.icon}
              >
                {translateEnum(`party.status.${party.status}`)}
              </Badge>
            ) : (
              "-"
            )}
          </Field>
        </div>
      </CardContent>
    </Card>
  );
};

const SourceCard = ({ source }: { source: string }) => (
  <Card>
    <CardHeader>
      <CardHeaderContent>
        <CardTitle>Source</CardTitle>
      </CardHeaderContent>
    </CardHeader>
    <CardContent>
      <Field label="Resource">
        <NewPageLink to={`${source}/show`}>
          <span className="break-all">{source}</span>
        </NewPageLink>
      </Field>
    </CardContent>
  </Card>
);

const NoticeLinkedCards = ({ notice }: { notice: Notice }) => {
  const sourcePartyId = parsePartyId(notice.source);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <PartyCard title="Receiver" partyId={notice.party_id} />
      {notice.source &&
        (sourcePartyId ? (
          <PartyCard title="Source party" partyId={sourcePartyId} />
        ) : (
          <SourceCard source={notice.source} />
        ))}
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
    { labelKey: "notice.id", value: notice.id },
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
