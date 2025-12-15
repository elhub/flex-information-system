import { Show, SimpleShowLayout, TextField } from "react-admin";
import { FieldStack } from "../auth";
import { Typography, Stack } from "@mui/material";
import { EntityClientList } from "./client/EntityClientList";

export const EntityShow = () => (
  <Show>
    <SimpleShowLayout>
      <Stack direction="column" spacing={2}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <FieldStack direction="row" spacing={2}>
          <TextField source="id" label="field.entity.id" />
          <TextField source="name" label="field.entity.name" />
          <TextField source="type" label="field.entity.type" />
          <TextField source="business_id" label="field.entity.business_id" />
          <TextField
            source="business_id_type"
            label="field.entity.business_id_type"
          />
        </FieldStack>
        <Typography variant="h6" gutterBottom>
          Clients
        </Typography>
        <EntityClientList />
      </Stack>
    </SimpleShowLayout>
  </Show>
);
