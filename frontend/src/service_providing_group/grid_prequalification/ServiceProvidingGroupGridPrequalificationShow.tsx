import {
  Button,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  usePermissions,
  useRecordContext,
  useResourceContext,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { FieldStack } from "../../auth";
import { NestedResourceHistoryButton } from "../../history";
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router-dom";
import { DateField } from "../../datetime";
import { EventButton } from "../../event/EventButton";

export const ServiceProvidingGroupGridPrequalificationShow = () => {
  const resource = useResourceContext()!;
  const { permissions } = usePermissions();

  const isHistory = resource.endsWith("_history");

  const EditButton = () => {
    const record = useRecordContext()!;
    return (
      <Button
        component={Link}
        to={`/service_providing_group/${record.service_providing_group_id}/grid_prequalification/${record.id}`}
        startIcon={<EditIcon />}
        label="Edit"
      />
    );
  };

  return (
    <Show>
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
            <DateField source="last_prequalified" showTime />
            <TextField source="notes" />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField source="recorded_at" showTime />
            <TextField source="recorded_by" />
          </FieldStack>
        </Stack>
        {!isHistory && <EventButton />}
        {!isHistory &&
          permissions.includes(
            "service_providing_group_grid_prequalification.update",
          ) && <EditButton />}
        <NestedResourceHistoryButton
          parent="service_providing_group"
          child="grid_prequalification"
          label="grid prequalification resources"
        />
      </SimpleShowLayout>
    </Show>
  );
};
