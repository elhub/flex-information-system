import {
  Button,
  FunctionField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  TopToolbar,
  usePermissions,
  useRecordContext,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { FieldStack } from "../../auth";
import { DateField } from "../../components/datetime";
import { IdentityField } from "../../components/IdentityField";
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router-dom";
import { ScopesField } from "../../components/scopes";
import { Permissions } from "../../auth/permissions";

export const EntityClientShow = () => {
  const { permissions } = usePermissions<Permissions>();

  // Permission checks
  const canUpdate = permissions?.allow("entity_client", "update");

  const EditButton = () => {
    const record = useRecordContext()!;
    return (
      <Button
        component={Link}
        to={`/entity/${record.entity_id}/client/${record.id}`}
        startIcon={<EditIcon />}
        label="Edit"
      />
    );
  };

  return (
    <Show
      actions={
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
            <TextField source="id" label="field.entity_client.id" />
            <ReferenceField
              source="entity_id"
              reference="entity"
              link="show"
              label="field.entity_client.entity_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <TextField source="name" label="field.entity_client.name" />
            <TextField
              source="client_id"
              label="field.entity_client.client_id"
            />
            <ReferenceField
              source="party_id"
              reference="party"
              link="show"
              label="field.entity_client.party_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <ScopesField source="scopes" label="field.entity_client.scopes" />
            <TextField
              source="client_secret"
              label="field.entity_client.client_secret"
            />
          </FieldStack>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <FunctionField
              sx={{ whiteSpace: "pre-wrap" }}
              source="public_key"
              render={(record) => record.public_key ?? "--"}
              label="field.entity_client.public_key"
            />
          </FieldStack>
          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField
              source="recorded_at"
              showTime
              label="field.entity_client.recorded_at"
            />
            <IdentityField
              source="recorded_by"
              label="field.entity_client.recorded_by"
            />
          </FieldStack>
        </Stack>
      </SimpleShowLayout>
    </Show>
  );
};
