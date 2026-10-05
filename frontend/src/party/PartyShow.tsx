import { useQuery } from "@tanstack/react-query";
import { formatDate } from "date-fns";
import {
  ShowBase,
  usePermissions,
  useRecordContext,
  useResourceContext,
  useTranslate,
} from "ra-core";
import { BodyText, Loader, Tabs } from "../components/ui";
import { PartyMembershipList } from "./membership/PartyMembershipList";
import { useTabSearchParam } from "../hooks/useTabSearchParam";
import { Permissions } from "../auth/permissions";
import { Party, readEntity } from "../generated-client";
import { throwOnError } from "../util";
import { useTranslateEnum } from "../intl/intl";
import { partyStatusVariantMap } from "./partyStatus";
import {
  ResourceShowLayout,
  ResourceSummaryField,
} from "../components/ResourceShowLayout";
import { IconPencil } from "@elhub/ds-icons";
import { PartyHistoryList } from "./PartyHistoryList";

const PartyShowTabs = ({
  isHistory,
  partyId,
}: {
  isHistory: boolean;
  partyId: number;
}) => {
  const [tab, setTab] = useTabSearchParam("party_memberships");

  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label="Party memberships" value="party_memberships" />
        {isHistory && <Tabs.Tab label="History" value="history" />}
      </Tabs.List>
      <Tabs.Panel value="party_memberships">
        <BodyText>
          The following users are allowed to assume this party in the system. If
          you are an organisation administrator, you can add or remove members
          to this party.
        </BodyText>
        <PartyMembershipList borderless />
      </Tabs.Panel>
      <Tabs.Panel value="history">
        {isHistory && <PartyHistoryList partyId={"" + partyId} />}
      </Tabs.Panel>
    </Tabs>
  );
};

const PartySummary = (): ResourceSummaryField[] => {
  const party = useRecordContext<Party>();
  const translateEnum = useTranslateEnum();

  const entity = useQuery({
    queryKey: ["entity", party?.entity_id],
    queryFn: () =>
      readEntity({ path: { id: party!.entity_id } }).then(throwOnError),
    enabled: !!party?.entity_id,
  });

  if (!party) {
    return [];
  }

  if (entity.error) {
    throw entity.error;
  }

  return [
    {
      labelKey: "party.id",
      value: party.id,
    },
    {
      labelKey: "party.name",
      value: party.name,
    },
    {
      labelKey: "party.business_id",
      value: party.business_id,
      tooltip: true,
    },
    {
      labelKey: "party.business_id_type",
      value: translateEnum(`party.business_id_type.${party.business_id_type}`),
    },
    {
      labelKey: "party.type",
      value: party.type,
    },
    {
      labelKey: "party.status",
      value: translateEnum(`party.status.${party.status}`),
      tooltip: true,
    },
    {
      labelKey: "party.recorded_at",
      value: party.recorded_at
        ? formatDate(party.recorded_at, "dd.MM.yyyy HH:mm")
        : undefined,
      tooltip: true,
    },
  ];
};

const PartyShowContent = ({
  isHistory,
  canEdit,
}: {
  isHistory: boolean;
  canEdit: boolean;
}) => {
  const translate = useTranslate();
  const translateEnum = useTranslateEnum();
  const party = useRecordContext<Party>();
  const { permissions } = usePermissions<Permissions>();

  const canReadEvents = permissions?.allow("event", "read");

  const eventsFilter = encodeURIComponent(
    JSON.stringify({ "source@eq": `/event/${party!.id}` }),
  );
  if (!party) {
    return null;
  }
  const summary = PartySummary();
  return (
    <ResourceShowLayout
      mainHeaderText={party.name}
      secondaryHeaderText={`Party #${party.id}`}
      status={{
        status: partyStatusVariantMap[party.status].status,
        label: translateEnum(`party.status.${party.status}`),
        icon: partyStatusVariantMap[party.status].icon,
      }}
      moreActions={[
        {
          to: `/party/${party.id}/edit`,
          title: translate("text.edit"),
          icon: <IconPencil />,
          shouldShow: canEdit ?? false,
        },
      ]}
      moreNavigationActions={[
        {
          to: `/event?filter=${eventsFilter}`,
          title: translate("text.events"),
          shouldShow: canReadEvents ?? false,
        },
      ]}
      summary={summary}
      content={<PartyShowTabs isHistory={isHistory} partyId={party.id} />}
    />
  );
};

export const PartyShow = () => {
  const resource = useResourceContext();
  const isHistory = !!resource?.endsWith("_history");
  const { permissions } = usePermissions<Permissions>();
  const canEdit = !!permissions?.allow("party", "update");

  return (
    <ShowBase
      loading={<Loader />}
      error={<BodyText>Something went wrong</BodyText>}
    >
      <PartyShowContent isHistory={isHistory} canEdit={canEdit} />
    </ShowBase>
  );
};
