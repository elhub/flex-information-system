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

export const TechnicalResourceShow = () => {
  const resource = useResourceContext()!;
  const { permissions } = usePermissions<Permissions>();

  const isHistory = resource.endsWith("_history");

  // Permission checks
  const canUpdate = permissions?.allow("technical_resource", "update");

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
            <TextField source="id" label="field.technical_resource.id" />
            <TextField source="name" label="field.technical_resource.name" />
            <ReferenceField
              source="controllable_unit_id"
              reference="controllable_unit"
              label="field.technical_resource.controllable_unit_id"
            >
              <TextField source="name" />
            </ReferenceField>
          </FieldStack>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField
              source="details"
              sx={{ whiteSpace: "pre-wrap" }}
              label="field.technical_resource.details"
            />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField
              source="recorded_at"
              showTime
              label="field.technical_resource.recorded_at"
            />
            <IdentityField
              source="recorded_by"
              label="field.technical_resource.recorded_by"
            />
          </FieldStack>
        </Stack>
        {!isHistory && <EventButton filterOnSubject />}
        <NestedResourceHistoryButton
          child="technical_resource"
          childAPIResource="technical_resource"
          label="technical resources"
        />
      </SimpleShowLayout>
    </Show>
  );
};
