import {
  usePermissions,
  useRecordContext,
  useResourceContext,
  useTranslate,
} from "ra-core";
import { Link as RouterLink } from "react-router-dom";
import { useTypedNavigate, buildPath } from "../../routes";
import {
  Heading,
  Tag,
  VerticalSpace,
  BodyText,
  Link,
} from "../../components/ui";
import {
  BaseField,
  DateField,
  EnumField,
  FieldTooltip,
  IdentityField,
  ReferenceField,
  Show,
  TextField,
} from "../../components/EDS-ra";
import { TechnicalResource } from "../../generated-client";
import { Button } from "../../components/ui";
import { IconClockReset, IconPencil } from "@elhub/ds-icons";
import { Permissions } from "../../auth/permissions";

const EnumTagsField = ({
  source,
  enumKey,
}: {
  source: string;
  enumKey: string;
}) => {
  const translate = useTranslate();
  const record = useRecordContext<TechnicalResource>();
  const resource = useResourceContext()!;
  const labelText = translate(`field.${resource}.${source}`);
  const values: string[] = (record as any)?.[source] ?? [];

  return (
    <div className="contents">
      <BodyText weight="bold">{labelText} :</BodyText>
      <div className="flex gap-2 items-center flex-wrap">
        {values.map((v) => (
          <Tag key={v}>{translate(`enum.${enumKey}.${v}`, { _: v })}</Tag>
        ))}
        <FieldTooltip resource={resource} field={source} />
      </div>
    </div>
  );
};

const TechnicalResourceLink = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <Link
      to={buildPath("cu_technical_resource_show", {
        controllable_unit_id: String(record.controllable_unit_id),
        id: String(record.technical_resource_id),
      })}
      as={RouterLink}
    >
      {record.technical_resource_id}
    </Link>
  );
};

const ControllableUnitLink = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <Link
      to={buildPath("controllable_unit_show", { id: String(record.id) })}
      as={RouterLink}
    >
      {record.name}
    </Link>
  );
};

const EditButton = () => {
  const record = useRecordContext<TechnicalResource>();
  const navigate = useTypedNavigate();
  return (
    <Button
      variant="invisible"
      size="medium"
      icon={IconPencil}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        navigate({
          to: "cu_technical_resource_edit",
          params: {
            controllable_unit_id: String(record?.controllable_unit_id),
            id: String(record?.id),
          },
        });
      }}
    >
      Edit
    </Button>
  );
};

const HistoryButton = () => {
  const record = useRecordContext<TechnicalResource>();
  const { permissions } = usePermissions<Permissions>();

  if (!record || !permissions?.allow("technical_resource_history", "read")) {
    return null;
  }

  const filter = `?filter=${encodeURIComponent(JSON.stringify({ technical_resource_id: record.id }))}`;

  return (
    <Button
      as={RouterLink}
      to={`${buildPath("cu_technical_resource_history", { controllable_unit_id: String(record.controllable_unit_id) })}${filter}`}
      variant="invisible"
      icon={IconClockReset}
    >
      View History
    </Button>
  );
};

export const TechnicalResourceShow = () => {
  const resource = useResourceContext();
  const isHistoryResource = resource?.endsWith("_history");

  return (
    <Show editButton={<EditButton />} historyButton={<HistoryButton />}>
      <Heading level={2} size="small" spacing>
        Basic information
      </Heading>
      <div className="grid grid-cols-[1fr_5fr] gap-2">
        <TextField source="id" label tooltip />
        {isHistoryResource && (
          <BaseField source="technical_resource_id" label tooltip>
            <TechnicalResourceLink />
          </BaseField>
        )}
        <TextField source="name" label tooltip />
        <ReferenceField
          source="controllable_unit_id"
          reference="controllable_unit"
          label
          tooltip
        >
          <ControllableUnitLink />
        </ReferenceField>
      </div>

      <VerticalSpace />
      <Heading level={2} size="small" spacing>
        Technical information
      </Heading>
      <div className="grid grid-cols-[1fr_5fr] gap-2">
        <EnumTagsField source="technology" enumKey="technology" />
        <EnumTagsField source="category" enumKey="category" />
        <TextField source="maximum_active_power" label tooltip unit="kW" />
      </div>
      <VerticalSpace />
      <Heading level={2} size="small" spacing>
        Device information
      </Heading>
      <VerticalSpace />
      <div className="grid grid-cols-[1fr_5fr] gap-2">
        <EnumField source="device_type" enumKey="device_type" label tooltip />
        <TextField source="make" label tooltip />
        <TextField source="model" label tooltip />
        <TextField source="business_id" label tooltip />
        <EnumField
          source="business_id_type"
          enumKey="technical_resource.business_id_type"
          label
          tooltip
        />
        <TextField source="additional_information" label tooltip />
      </div>

      <VerticalSpace />
      <Heading level={2} size="small" spacing>
        Audit
      </Heading>
      <div className="grid grid-cols-[1fr_5fr] gap-2">
        <DateField source="recorded_at" showTime label tooltip />
        <IdentityField source="recorded_by" label tooltip />
        {isHistoryResource && (
          <>
            <DateField source="replaced_at" showTime label tooltip />
            <IdentityField source="replaced_by" label tooltip />
          </>
        )}
      </div>
    </Show>
  );
};
