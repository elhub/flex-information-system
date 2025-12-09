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
import { NestedResourceHistoryButton } from "../../components/history";
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router-dom";
import { DateField } from "../../components/datetime";
import { EventButton } from "../../event/EventButton";
import { IdentityField } from "../../components/IdentityField";
import { Permissions } from "../../auth/permissions";
import { CommentList } from "../../components/comments";
import { ResourceHierarchyRedirect } from "../../components/resource";

export const ServiceProvidingGroupGridPrequalificationShow = () => {
  const resource = useResourceContext()!;
  const { permissions } = usePermissions<Permissions>();

  const isHistory = resource.endsWith("_history");

  // Permission checks
  const canUpdate = permissions?.allow(
    "service_providing_group_grid_prequalification",
    "update",
  );

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
      <ResourceHierarchyRedirect />
      <SimpleShowLayout>
        <Stack direction="column" spacing={2}>
          <Typography variant="h6" gutterBottom>
            Basic information
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField source="id" label="ID" />
            <ReferenceField
              source="service_providing_group_id"
              reference="service_providing_group"
            >
              <TextField source="name" />
            </ReferenceField>
            <ReferenceField
              source="impacted_system_operator_id"
              reference="party"
            >
              <TextField source="name" />
            </ReferenceField>
            <TextField source="status" />
            <DateField source="prequalified_at" showTime />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField source="recorded_at" showTime />
            <IdentityField source="recorded_by" />
          </FieldStack>
        </Stack>
        {!isHistory && <EventButton />}
        {!isHistory && (
          <>
            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>
            <NestedResourceHistoryButton child="comment" label="comments" />
            <CommentList />
          </>
        )}
        <NestedResourceHistoryButton
          child="grid_prequalification"
          label="grid prequalification resources"
        />
      </SimpleShowLayout>
    </Show>
  );
};
