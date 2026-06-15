import { useQuery } from "@tanstack/react-query";
import { formatDate } from "date-fns";
import {
  usePermissions,
  useRecordContext,
  useResourceContext,
  ShowBase,
} from "ra-core";
import { Badge, BodyText, Link, Loader, Panel, Tabs } from "../components/ui";
import { Link as RouterLink } from "react-router-dom";
import { PartyMembershipList } from "./membership/PartyMembershipList";
import { ShowPageLayout } from "../components/ShowPageLayout";
import { useTabSearchParam } from "../hooks/useTabSearchParam";
import { Permissions } from "../auth/permissions";
import { LabelValue } from "../components/LabelValue";
import { readEntity, Party } from "../generated-client";
import { throwOnError } from "../util";
import { useTranslateEnum } from "../intl/intl";
import { partyStatusVariantMap } from "./partyStatus";
import {
  EventButton,
  EditButton,
  ResourceHistoryButton,
} from "../components/EDS-ra";

const PartyShowTabs = () => {
  const [tab, setTab] = useTabSearchParam("party_memberships");

  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label="Party memberships" value="party_memberships" />
      </Tabs.List>
      <Tabs.Panel value="party_memberships">
        <BodyText>
          The following users are allowed to assume this party in the system. If
          you are an organisation administrator, you can add or remove members
          to this party.
        </BodyText>
        <PartyMembershipList borderless />
      </Tabs.Panel>
    </Tabs>
  );
};

const PartyShowSummary = ({
  isHistory,
  canEdit,
}: {
  isHistory: boolean;
  canEdit: boolean;
}) => {
  const party = useRecordContext<Party>();
  const translateEnum = useTranslateEnum();

  const entity = useQuery({
    queryKey: ["entity", party?.entity_id],
    queryFn: () =>
      readEntity({ path: { id: party!.entity_id } }).then(throwOnError),
    enabled: !!party?.entity_id,
  });

  if (!party) {
    return null;
  }

  if (entity.error) {
    throw entity.error;
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel
        border
        className="bg-semantic-background-alternative h-fit p-4 sm:p-5"
      >
        {!isHistory && canEdit && (
          <div className="flex justify-end">
            <EditButton />
          </div>
        )}
        <div className="flex flex-col gap-4">
          <LabelValue size="small" labelKey="party.id" value={party.id} />
          <LabelValue size="small" labelKey="party.name" value={party.name} />
          <LabelValue
            size="small"
            labelKey="party.business_id"
            value={party.business_id}
            tooltip
          />
          <LabelValue
            size="small"
            labelKey="party.business_id_type"
            value={translateEnum(
              `party.business_id_type.${party.business_id_type}`,
            )}
          />
          <LabelValue
            size="small"
            labelKey="party.entity_id"
            value={
              <Link as={RouterLink} to={`/entity/${party.entity_id}/show`}>
                {entity.data?.name ?? party.entity_id}
              </Link>
            }
          />
          <LabelValue
            size="small"
            labelKey="party.type"
            value={translateEnum(`party.type.${party.type}`)}
            tooltip
          />
          <LabelValue
            size="small"
            labelKey="party.status"
            value={translateEnum(`party.status.${party.status}`)}
            tooltip
          />
          <LabelValue
            size="small"
            labelKey="party.recorded_at"
            value={
              party.recorded_at
                ? formatDate(party.recorded_at, "dd.MM.yyyy HH:mm")
                : undefined
            }
            tooltip
          />
        </div>
      </Panel>
      {!isHistory && (
        <div className="flex items-center gap-2">
          <ResourceHistoryButton />
          <EventButton />
        </div>
      )}
    </div>
  );
};

const PartyShowContent = ({
  isHistory,
  canEdit,
}: {
  isHistory: boolean;
  canEdit: boolean;
}) => {
  const translateEnum = useTranslateEnum();
  const party = useRecordContext<Party>();

  return (
    <ShowPageLayout
      backTo={{ pathname: "/party", label: "Parties" }}
      title={party?.name ? `Party - ${party.name}` : "Party"}
      badge={
        party?.status ? (
          <Badge
            size="small"
            status={partyStatusVariantMap[party.status].status}
            variant="block"
            icon={partyStatusVariantMap[party.status].icon}
          >
            {translateEnum(`party.status.${party.status}`)}
          </Badge>
        ) : undefined
      }
    >
      <PartyShowSummary isHistory={isHistory} canEdit={canEdit} />
      {isHistory ? <div /> : <PartyShowTabs />}
    </ShowPageLayout>
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
