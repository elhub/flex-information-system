import { EntityClientList } from "./client/EntityClientList";
import { EntityPartyMembershipList } from "./party_membership/EntityPartyMembershipList";
import { EntityPartyOwnershipList } from "./party_ownership/EntityPartyOwnershipList";
import { readEntity } from "../generated-client/index";
import { throwOnError } from "../util";
import { useParams } from "react-router-dom";
import {
  ResourceShowLayout,
  ResourceSummaryField,
} from "../components/ResourceShowLayout";
import { BodyText, Loader, Tabs } from "../components/ui";
import { useTabSearchParam } from "../hooks/useTabSearchParam";
import { usePermissions, useTranslate } from "ra-core";
import { IconPencil } from "@elhub/ds-icons";
import { useQuery } from "@tanstack/react-query";

const EntityTabs = ({ id }: { id: string }) => {
  const [tab, setTab] = useTabSearchParam("client");
  const translate = useTranslate();
  return (
    <Tabs value={tab} onChange={setTab}>
      <Tabs.List>
        <Tabs.Tab label={translate("text.entity.client")} value="client" />
        <Tabs.Tab
          label={translate("text.entity.party_memberships")}
          value="party_memberships"
        />
        <Tabs.Tab
          label={translate("text.entity.party_ownerships")}
          value="party_ownerships"
        />
      </Tabs.List>
      <Tabs.Panel value="client">
        <BodyText className="mb-4">
          {translate("text.entity.client_description")}
        </BodyText>
        <EntityClientList entityId={id} />
      </Tabs.Panel>
      <Tabs.Panel value="party_memberships">
        <BodyText className="mb-4">
          {translate("text.entity.party_memberships_description")}
        </BodyText>
        <EntityPartyMembershipList entityId={Number(id)} />
      </Tabs.Panel>
      <Tabs.Panel value="party_ownerships">
        <BodyText className="mb-4">
          {translate("text.entity.party_ownerships_description")}
        </BodyText>
        <EntityPartyOwnershipList entityId={Number(id)} />
      </Tabs.Panel>
    </Tabs>
  );
};

export const EntityShow = () => {
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();
  const { permissions } = usePermissions();
  const canEdit = permissions?.allow("entity", "update");

  const { data, isLoading, error } = useQuery({
    queryKey: ["entity", id],
    queryFn: () => readEntity({ path: { id: Number(id) } }).then(throwOnError),
    enabled: !!id,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    throw error;
  }
  if (!data) {
    return <div>{translate("text.simple_table.no_results")}</div>;
  }

  const summary: ResourceSummaryField[] = [
    {
      labelKey: "entity.type",
      value: data.type,
    },
    {
      labelKey: "entity.business_id",
      value: data.business_id,
    },
    {
      labelKey: "entity.business_id_type",
      value: data.business_id_type,
    },
  ];

  const eventsFilter = encodeURIComponent(
    JSON.stringify({ "source@eq": `/entity/${data.id}` }),
  );

  return (
    <ResourceShowLayout
      secondaryHeaderText={`${translate("text.entity.name")} #${data.id}`}
      mainHeaderText={data.name}
      summary={summary}
      content={<EntityTabs id={"" + data.id} />}
      moreActions={[
        {
          to: `/entity/${data.id}/edit`,
          title: translate("text.edit"),
          icon: <IconPencil />,
          shouldShow: canEdit,
        },
      ]}
      moreNavigationActions={[
        {
          to: `/event?filter=${eventsFilter}`,
          title: translate("text.events"),
          shouldShow: true,
        },
      ]}
    />
  );
};
