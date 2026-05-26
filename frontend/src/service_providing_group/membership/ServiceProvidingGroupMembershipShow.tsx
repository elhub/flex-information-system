import { useRecordContext, useResourceContext, usePermissions } from "ra-core";
import { Link } from "react-router-dom";
import { IconPencil, IconClockReset } from "@elhub/ds-icons";
import { Button, Content, Heading, VerticalSpace } from "../../components/ui";
import {
  Show,
  TextField,
  ReferenceField,
  DateField,
  IdentityField,
} from "../../components/EDS-ra";
import { EventButton } from "../../event/EventButton";
import { Permissions } from "../../auth/permissions";
import { ServiceProvidingGroupMembership } from "../../generated-client";

const EditButton = () => {
  const record = useRecordContext<ServiceProvidingGroupMembership>();
  if (!record) return null;
  return (
    <Button
      as={Link}
      to={`/service_providing_group/${record.service_providing_group_id}/membership/${record.id}`}
      variant="invisible"
      size="medium"
      icon={IconPencil}
    >
      Edit
    </Button>
  );
};

const HistoryButton = () => {
  const record = useRecordContext<ServiceProvidingGroupMembership>();
  const { permissions } = usePermissions<Permissions>();

  if (!record) return null;

  const filter =
    `?filter=` +
    encodeURIComponent(
      `{ "service_providing_group_membership_id": ${record.id} }`,
    );

  return (
    <Button
      as={Link}
      to={`/service_providing_group/${record.service_providing_group_id}/membership_history${filter}`}
      variant="invisible"
      size="medium"
      icon={IconClockReset}
      disabled={
        !permissions?.allow(
          "service_providing_group_membership_history",
          "read",
        )
      }
    >
      View History
    </Button>
  );
};

export const ServiceProvidingGroupMembershipShow = () => {
  const resource = useResourceContext();
  const isHistory = resource?.endsWith("_history");

  return (
    <Show
      editButton={<EditButton />}
      historyButton={<HistoryButton />}
      extraActions={!isHistory ? <EventButton filterOnSubject /> : undefined}
    >
      <Heading level={2} size="small" spacing>
        Basic information
      </Heading>
      <Content>
        <TextField source="id" label />
        <TextField source="service_providing_group_membership_id" label />
        <ReferenceField
          source="controllable_unit_id"
          reference="controllable_unit"
          label
        />
        <ReferenceField
          source="service_providing_group_id"
          reference="service_providing_group"
          label
        />
      </Content>
      <VerticalSpace />
      <Heading level={2} size="small" spacing>
        Valid time
      </Heading>
      <Content>
        <DateField source="valid_from" showTime label />
        <DateField source="valid_to" showTime label />
      </Content>
      <VerticalSpace />
      <Heading level={2} size="small" spacing>
        Registration
      </Heading>
      <Content>
        <DateField source="recorded_at" showTime label />
        <IdentityField source="recorded_by" label />
        <DateField source="replaced_at" showTime label />
        <IdentityField source="replaced_by" label />
      </Content>
    </Show>
  );
};
