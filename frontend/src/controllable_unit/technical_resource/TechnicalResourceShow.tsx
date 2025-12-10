import {
  Button,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  TopToolbar,
  usePermissions,
  useResourceContext,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { FieldStack } from "../../auth";
import { NestedResourceHistoryButton } from "../../components/history";
import EditIcon from "@mui/icons-material/Edit";
import { Link, useParams } from "react-router-dom";
import { DateField } from "../../components/datetime";
import { EventButton } from "../../event/EventButton";
import { IdentityField } from "../../components/IdentityField";
import { Permissions } from "../../auth/permissions";

export const TechnicalResourceShow = () => {
  const resource = useResourceContext()!;
  const { permissions } = usePermissions<Permissions>();
  const { id, controllable_unit_id } = useParams<{
    id: string;
    controllable_unit_id: string;
  }>();

  const isHistory = resource.endsWith("_history");

  // Permission checks
  const canUpdate = permissions?.allow("technical_resource", "update");

  return (
    <Show
      actions={
        !isHistory &&
        canUpdate && (
          <TopToolbar>
            <Button
              component={Link}
              to={`/controllable_unit/${controllable_unit_id}/technical_resource/${id}`}
              startIcon={<EditIcon />}
              label="Edit"
            />
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
            <TextField
              source="technical_resource_id"
              label="field.technical_resource_history.technical_resource_id"
            />
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
            <DateField
              source="replaced_at"
              showTime
              label="field.technical_resource_history.replaced_at"
            />
            <IdentityField
              source="replaced_by"
              label="field.technical_resource_history.replaced_by"
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
