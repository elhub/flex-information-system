import { useRecordContext, useResourceContext } from "ra-core";
import { useNavigate } from "react-router-dom";
import { IconPencil, IconClockReset } from "@elhub/ds-icons";
import { Button, Content, Heading } from "../../components/ui";
import {
  DateField,
  EnumField,
  IdentityField,
  ReferenceField,
  Show,
  TextField,
} from "../../components/EDS-ra";
import { EventButton } from "../../event/EventButton";
import { Permissions } from "../../auth/permissions";
import { usePermissions } from "ra-core";
import { ControllableUnitSuspension } from "../../generated-client";
import { getFields } from "../../zod";
import { zControllableUnitSuspensionHistory } from "../../generated-client/zod.gen";

const fields = getFields(zControllableUnitSuspensionHistory.shape);

const EditButton = () => {
  const record = useRecordContext<ControllableUnitSuspension>();
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
          `/controllable_unit/${record.controllable_unit_id}/suspension/${record.id}/edit`,
        );
      }}
    >
      Edit
    </Button>
  );
};

const HistoryButton = () => {
  const record = useRecordContext<ControllableUnitSuspension>();
  const { permissions } = usePermissions<Permissions>();
  const navigate = useNavigate();

  if (!record || record.id == null) return null;

  const filter =
    `?filter=` +
    encodeURIComponent(`{ "controllable_unit_suspension_id": ${record.id} }`);

  return (
    <Button
      variant="invisible"
      size="medium"
      icon={IconClockReset}
      disabled={
        !permissions?.allow("controllable_unit_suspension_history", "read")
      }
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(
          `/controllable_unit/${record.controllable_unit_id}/suspension_history${filter}`,
        );
      }}
    >
      View History
    </Button>
  );
};

export const ControllableUnitSuspensionShow = () => {
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
        <TextField source={fields.id.source} label />
        <TextField
          source={fields.controllable_unit_suspension_id.source}
          label
        />
        <ReferenceField
          source={fields.controllable_unit_id.source}
          reference="controllable_unit"
          label
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          source={fields.impacted_system_operator_id.source}
          reference="party"
          label
        >
          <TextField source="name" />
        </ReferenceField>
      </Content>

      <Heading level={2} size="small" spacing>
        Controllable unit suspension process
      </Heading>
      <Content>
        <EnumField
          source={fields.reason.source}
          enumKey="controllable_unit_suspension.reason"
          label
        />
        <DateField source={fields.recorded_at.source} showTime label />
        <IdentityField source={fields.recorded_by.source} label />
        <DateField source={fields.replaced_at.source} showTime label />
        <IdentityField source={fields.replaced_by.source} label />
      </Content>
    </Show>
  );
};
