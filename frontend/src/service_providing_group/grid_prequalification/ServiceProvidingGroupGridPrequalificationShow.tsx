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
import { FieldStack } from "../../auth";
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router-dom";
import { DateField } from "../../components/datetime";
import { EventButton } from "../../event/EventButton";
import { IdentityField } from "../../components/IdentityField";
import { Permissions } from "../../auth/permissions";
import HistoryIcon from "@mui/icons-material/History";
import { CommentList as GenericCommentList } from "../../components/comments";
import { ServiceProvidingGroupGridPrequalification } from "../../generated-client";

const EditButton = () => {
  const record = useRecordContext();
  return (
    <Button
      component={Link}
      to={`/service_providing_group/${record?.service_providing_group_id}/grid_prequalification/${record?.id}`}
      startIcon={<EditIcon />}
      label="Edit"
    />
  );
};

// manual components to support both flat and nested URLs for this resource

const HistoryButton = () => {
  const record = useRecordContext<ServiceProvidingGroupGridPrequalification>();
  const { permissions } = usePermissions<Permissions>();

  const filter =
    `?filter=` +
    encodeURIComponent(
      `{ "service_providing_group_grid_prequalification_id": ${record?.id} }`,
    );

  return (
    <Button
      component={Link}
      disabled={
        !permissions?.allow(
          "service_providing_group_grid_prequalification_history",
          "read",
        )
      }
      to={`/service_providing_group/${record?.service_providing_group_id}/grid_prequalification_history${filter}`}
      startIcon={<HistoryIcon />}
      label="View History"
    />
  );
};

const CommentHistoryButton = () => {
  const record = useRecordContext<ServiceProvidingGroupGridPrequalification>();
  const { permissions } = usePermissions<Permissions>();

  return (
    <Button
      component={Link}
      disabled={
        !permissions?.allow(
          "service_providing_group_grid_prequalification_comment_history",
          "read",
        )
      }
      to={`/service_providing_group/${record?.service_providing_group_id}/grid_prequalification/${record?.id}/comment_history`}
      startIcon={<HistoryIcon />}
      label="View History of Comments"
    />
  );
};

const CommentList = () => {
  const record = useRecordContext<ServiceProvidingGroupGridPrequalification>();
  return (
    <GenericCommentList
      parentPath={
        record
          ? [
              {
                resource: "service_providing_group",
                id: record.service_providing_group_id!,
              },
              { resource: "grid_prequalification", id: record.id! },
            ]
          : undefined
      }
    />
  );
};

export const ServiceProvidingGroupGridPrequalificationShow = () => {
  const resource = useResourceContext()!;
  const { permissions } = usePermissions<Permissions>();

  const isHistory = resource.endsWith("_history");

  // Permission checks
  const canUpdate = permissions?.allow(
    "service_providing_group_grid_prequalification",
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
              label="field.service_providing_group_grid_prequalification.id"
            />
            <TextField
              source="service_providing_group_grid_prequalification_id"
              label="field.service_providing_group_grid_prequalification_history.service_providing_group_grid_prequalification_id"
            />
            <ReferenceField
              source="service_providing_group_id"
              reference="service_providing_group"
              label="field.service_providing_group_grid_prequalification.service_providing_group_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <ReferenceField
              source="impacted_system_operator_id"
              reference="party"
              label="field.service_providing_group_grid_prequalification.impacted_system_operator_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <TextField
              source="status"
              label="field.service_providing_group_grid_prequalification.status"
            />
            <DateField
              source="prequalified_at"
              showTime
              label="field.service_providing_group_grid_prequalification.prequalified_at"
            />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField
              source="recorded_at"
              showTime
              label="field.service_providing_group_grid_prequalification.recorded_at"
            />
            <IdentityField
              source="recorded_by"
              label="field.service_providing_group_grid_prequalification.recorded_by"
            />
            <DateField
              source="replaced_at"
              showTime
              label="field.service_providing_group_grid_prequalification_history.replaced_at"
            />
            <IdentityField
              source="replaced_by"
              label="field.service_providing_group_grid_prequalification_history.replaced_by"
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
