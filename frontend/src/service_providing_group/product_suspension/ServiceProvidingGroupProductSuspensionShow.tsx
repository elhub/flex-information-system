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
  EnumField,
} from "../../components/EDS-ra";
import { EventButton } from "../../event/EventButton";
import { ProductTypeArrayField } from "../../product_type/components";
import { Permissions } from "../../auth/permissions";
import { ServiceProvidingGroupProductSuspension } from "../../generated-client";
import { getFields } from "../../zod";
import { zServiceProvidingGroupProductSuspensionHistory } from "../../generated-client/zod.gen";

const fields = getFields(zServiceProvidingGroupProductSuspensionHistory.shape);

const EditButton = () => {
  const record = useRecordContext<ServiceProvidingGroupProductSuspension>();
  if (!record) return null;
  return (
    <Button
      as={Link}
      to={`/service_providing_group/${record.service_providing_group_id}/product_suspension/${record.id}`}
      variant="invisible"
      size="medium"
      icon={IconPencil}
    >
      Edit
    </Button>
  );
};

const HistoryButton = () => {
  const record = useRecordContext<ServiceProvidingGroupProductSuspension>();
  const { permissions } = usePermissions<Permissions>();

  if (!record) return null;

  const filter =
    `?filter=` +
    encodeURIComponent(
      `{ "service_providing_group_product_suspension_id": ${record.id} }`,
    );

  return (
    <Button
      as={Link}
      to={`/service_providing_group/${record.service_providing_group_id}/product_suspension_history${filter}`}
      variant="invisible"
      size="medium"
      icon={IconClockReset}
      disabled={
        !permissions?.allow(
          "service_providing_group_product_suspension_history",
          "read",
        )
      }
    >
      View History
    </Button>
  );
};

export const ServiceProvidingGroupProductSuspensionShow = () => {
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
        <TextField source={fields.service_providing_group_product_suspension_id.source} label />
        <ReferenceField
          source={fields.service_providing_group_id.source}
          reference="service_providing_group"
          label
        />
        <ReferenceField
          source={fields.procuring_system_operator_id.source}
          reference="party"
          label
        />
        <ProductTypeArrayField source={fields.product_type_ids.source} label />
      </Content>
      <VerticalSpace />
      <Heading level={2} size="small" spacing>
        Product suspension process
      </Heading>
      <Content>
        <EnumField
          source={fields.reason.source}
          enumKey="service_providing_group_product_suspension.reason"
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
