import {
  Button,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  TopToolbar,
  usePermissions,
  useRecordContext,
  useResourceContext,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router-dom";
import { EventButton } from "../../event/EventButton";
import { DateField } from "../../components/datetime";
import { FieldStack } from "../../auth";
import { IdentityField } from "../../components/IdentityField";
import { ProductTypeArrayField } from "../../product_type/components";
import { CommentList as GenericCommentList } from "../../components/comments";
import { Permissions } from "../../auth/permissions";
import HistoryIcon from "@mui/icons-material/History";
import { ServiceProvidingGroupProductApplication } from "../../generated-client";
import { EnumField } from "../../components/enum";
import { UnitField } from "../../components/unitComponents";

const EditButton = () => {
  const record = useRecordContext();
  return (
    <Button
      component={Link}
      to={`/service_providing_group/${record?.service_providing_group_id}/product_application/${record?.id}`}
      startIcon={<EditIcon />}
      label="Edit"
    />
  );
};

// manual components to support both flat and nested URLs for this resource

const HistoryButton = () => {
  const record = useRecordContext<ServiceProvidingGroupProductApplication>();
  const { permissions } = usePermissions<Permissions>();

  const filter =
    `?filter=` +
    encodeURIComponent(
      `{ "service_providing_group_product_application_id": ${record?.id} }`,
    );

  return (
    <Button
      component={Link}
      disabled={
        !permissions?.allow(
          "service_providing_group_product_application_history",
          "read",
        )
      }
      to={`/service_providing_group/${record?.service_providing_group_id}/product_application_history${filter}`}
      startIcon={<HistoryIcon />}
      label="View History"
    />
  );
};

const CommentHistoryButton = () => {
  const record = useRecordContext<ServiceProvidingGroupProductApplication>();
  const { permissions } = usePermissions<Permissions>();

  return (
    <Button
      component={Link}
      disabled={
        !permissions?.allow(
          "service_providing_group_product_application_comment_history",
          "read",
        )
      }
      to={`/service_providing_group/${record?.service_providing_group_id}/product_application/${record?.id}/comment_history`}
      startIcon={<HistoryIcon />}
      label="View History of Comments"
    />
  );
};

const CommentList = () => {
  const record = useRecordContext<ServiceProvidingGroupProductApplication>();
  return (
    <GenericCommentList
      parentPath={
        record
          ? [
              {
                resource: "service_providing_group",
                id: record.service_providing_group_id,
              },
              { resource: "product_application", id: record.id },
            ]
          : undefined
      }
    />
  );
};

export const ServiceProvidingGroupProductApplicationShow = () => {
  const resource = useResourceContext()!;
  const { permissions } = usePermissions<Permissions>();

  const isHistory = resource.endsWith("_history");

  // Permission checks
  const canUpdate = permissions?.allow(
    "service_providing_group_product_application",
    "update",
  );

  return (
    <Show
      actions={
        !isHistory &&
        canUpdate && (
          <TopToolbar>
            <EditButton />
          </TopToolbar>
        )
      }
    >
      <SimpleShowLayout>
        <Stack direction="column" spacing={2}>
          <Typography variant="h6" gutterBottom>
            Basic information
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField
              source="id"
              label="field.service_providing_group_product_application.id"
            />
            <TextField
              source="service_providing_group_product_application_id"
              label="field.service_providing_group_product_application_history.service_providing_group_product_application_id"
            />
            <ReferenceField
              source="service_providing_group_id"
              reference="service_providing_group"
              label="field.service_providing_group_product_application.service_providing_group_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <ReferenceField
              source="procuring_system_operator_id"
              reference="party"
              label="field.service_providing_group_product_application.procuring_system_operator_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <ProductTypeArrayField
              label="field.service_providing_group_product_application.product_type_ids"
              source="product_type_ids"
            />
            <UnitField
              source="maximum_active_power"
              label="field.service_providing_group_product_application.maximum_active_power"
              unit="kW"
            />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Application process
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <EnumField
              source="status"
              enumKey="service_providing_group_product_application.status"
              label="field.service_providing_group_product_application.status"
            />
            <DateField
              source="prequalified_at"
              showTime
              label="field.service_providing_group_product_application.prequalified_at"
            />
            <DateField
              source="verified_at"
              showTime
              label="field.service_providing_group_product_application.verified_at"
            />
          </FieldStack>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField
              component="pre"
              source="additional_information"
              label="field.service_providing_group_product_application.additional_information"
            />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField
              source="recorded_at"
              showTime
              label="field.service_providing_group_product_application.recorded_at"
            />
            <IdentityField
              source="recorded_by"
              label="field.service_providing_group_product_application.recorded_by"
            />
            <DateField
              source="replaced_at"
              showTime
              label="field.service_providing_group_product_application_history.replaced_at"
            />
            <IdentityField
              source="replaced_by"
              label="field.service_providing_group_product_application_history.replaced_by"
            />
          </FieldStack>
        </Stack>
        <HistoryButton />
        {!isHistory && <EventButton filterOnSubject />}
        {!isHistory && (
          <>
            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>
            <CommentHistoryButton />
            <CommentList />
          </>
        )}
      </SimpleShowLayout>
    </Show>
  );
};
