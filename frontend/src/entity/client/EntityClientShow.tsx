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

export const EntityClientShow = () => {
  const { permissions } = usePermissions();

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
        permissions.includes("entity_client.update") && (
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
            <TextField source="id" label="ID" />
            <ReferenceField source="entity_id" reference="entity" link="show">
              <TextField source="name" />
            </ReferenceField>
            <TextField source="name" />
            <TextField source="client_id" label="Client ID" />
            <TextField source="client_secret" />
          </FieldStack>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <FunctionField
              sx={{ whiteSpace: "pre-wrap" }}
              source="public_key"
              render={(record) => record.public_key ?? "--"}
            />
          </FieldStack>
          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField source="recorded_at" showTime />
            <IdentityField source="recorded_by" />
          </FieldStack>
        </Stack>
      </SimpleShowLayout>
    </Show>
  );
};
