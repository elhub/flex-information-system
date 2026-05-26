import { useRecordContext, usePermissions } from "ra-core";
import { useNavigate } from "react-router-dom";
import { IconPencil, IconClockReset } from "@elhub/ds-icons";
import { Button, Content, Heading } from "../../components/ui";
import {
  DateField,
  IdentityField,
  ReferenceField,
  Show,
  TextField,
} from "../../components/EDS-ra";
import { EventButton } from "../../event/EventButton";
import { RestoreButton } from "../../components/history";
import { Permissions } from "../../auth/permissions";
import { ControllableUnitServiceProvider } from "../../generated-client";

const EditButton = () => {
  const record = useRecordContext<ControllableUnitServiceProvider>();
  const navigate = useNavigate();

  if (!record || record.id == null) return null;

  return (
    <Button
      variant="invisible"
      size="medium"
      icon={IconPencil}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(
          `/controllable_unit/${record.controllable_unit_id}/service_provider/${record.id}/edit`,
        );
      }}
    >
      Edit
    </Button>
  );
};

const HistoryButton = () => {
  const record = useRecordContext<ControllableUnitServiceProvider>();
  const { permissions } = usePermissions<Permissions>();
  const navigate = useNavigate();

  if (!record || record.id == null) return null;

  const filter =
    `?filter=` +
    encodeURIComponent(
      `{ "controllable_unit_service_provider_id": ${record.id} }`,
    );

  return (
    <Button
      variant="invisible"
      size="medium"
      icon={IconClockReset}
      disabled={
        !permissions?.allow(
          "controllable_unit_service_provider_history",
          "read",
        )
      }
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(
          `/controllable_unit/${record.controllable_unit_id}/service_provider_history${filter}`,
        );
      }}
    >
      View History
    </Button>
  );
};

export const ControllableUnitServiceProviderShow = () => {
  return (
    <Show
      editButton={<EditButton />}
      historyButton={<HistoryButton />}
      extraActions={<EventButton filterOnSubject />}
      historyOnlyActions={
        <RestoreButton parent="controllable_unit" child="service_provider" />
      }
    >
      <Heading level={2} size="small" spacing>
        Basic information
      </Heading>
      <Content>
        <TextField source="id" label />
        <TextField source="controllable_unit_service_provider_id" label />
        <ReferenceField
          source="controllable_unit_id"
          reference="controllable_unit"
          label
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="service_provider_id" reference="party" label>
          <TextField source="name" />
        </ReferenceField>
        <TextField source="end_user_id" label />
        <TextField source="contract_reference" label />
      </Content>

      <Heading level={2} size="small" spacing>
        Valid time
      </Heading>
      <Content>
        <DateField source="valid_from" showTime label />
        <DateField source="valid_to" showTime label />
      </Content>

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
