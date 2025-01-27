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
import { DateField } from "../../DateField";
import { EventButton } from "../../event/EventButton";

export const TechnicalResourceShow = () => {
  const resource = useResourceContext()!;
  const { permissions } = usePermissions();

  const isHistory = resource.endsWith("_history");

  const EditButton = () => {
    const record = useRecordContext()!;
    return (
      <Button
        component={Link}
        to={`/controllable_unit/${record.controllable_unit_id}/technical_resource/${record.id}`}
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
            <TextField source="name" />
            <ReferenceField
              source="controllable_unit_id"
              reference="controllable_unit"
            >
              <TextField source="name" />
            </ReferenceField>
          </FieldStack>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField source="details" sx={{ whiteSpace: "pre-wrap" }} />
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
        {!isHistory && permissions.includes("technical_resource.update") && (
          <EditButton />
        )}
        <NestedResourceHistoryButton
          parent="controllable_unit"
          child="technical_resource"
          label="technical resources"
          noResourceNameMerge
        />
      </SimpleShowLayout>
    </Show>
  );
};
