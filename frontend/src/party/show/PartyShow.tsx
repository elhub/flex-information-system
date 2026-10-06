import { formatDate } from "date-fns";
import {
  ShowBase,
  usePermissions,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { BodyText, Loader, Tabs } from "../../components/ui/index";
import { PartyMembershipList } from "../membership/PartyMembershipList";
import { useTabSearchParam } from "../../hooks/useTabSearchParam";
import { Permissions } from "../../auth/permissions";
import { Party } from "../../generated-client/index";
import { useTranslateEnum } from "../../intl/intl";
import { partyStatusVariantMap } from "../partyStatus";
import {
  ResourceShowLayout,
  ResourceSummaryField,
} from "../../components/ResourceShowLayout";
import { IconPencil } from "@elhub/ds-icons";
import { PartyHistoryList } from "../PartyHistoryList";
import { EntityShow } from "./EntityShow";

const PartyShowTabs = ({
  partyId,
  entityId,
}: {
  partyId: number;
  entityId: number;
}) => {
  const [tab, setTab] = useTabSearchParam("party_memberships");
  const { permissions } = usePermissions<Permissions>();
  const canViewHistory = !!permissions?.allow("party_history", "read");

  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label="Party memberships" value="party_memberships" />
        <Tabs.Tab label="Entity" value="entity" />
        {canViewHistory && <Tabs.Tab label="History" value="history" />}
      </Tabs.List>
      <Tabs.Panel value="party_memberships">
        <BodyText>
          The following users are allowed to assume this party in the system. If
          you are an organisation administrator, you can add or remove members
          to this party.
        </BodyText>
        <PartyMembershipList borderless />
      </Tabs.Panel>
      <Tabs.Panel value="entity">
        <EntityShow entityId={entityId} />
      </Tabs.Panel>
      {canViewHistory && (
        <Tabs.Panel value="history">
          <PartyHistoryList partyId={"" + partyId} />
        </Tabs.Panel>
      )}
    </Tabs>
  );
};

const PartySummary = (): ResourceSummaryField[] => {
  const party = useRecordContext<Party>();
  const translateEnum = useTranslateEnum();

  if (!party) {
    return [];
  }

  return [
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

const PartyShowContent = ({ canEdit }: { canEdit: boolean }) => {
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
      content={<PartyShowTabs partyId={party.id} entityId={party.entity_id} />}
    />
  );
};

export const PartyShow = () => {
  const { permissions } = usePermissions<Permissions>();
  const canEdit = !!permissions?.allow("party", "update");

  return (
    <ShowBase
      loading={<Loader />}
      error={<BodyText>Something went wrong</BodyText>}
    >
      <PartyShowContent canEdit={canEdit} />
    </ShowBase>
  );
};
