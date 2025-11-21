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
          <TextField source="id" label="ID" />
          <TextField source="name" />
          <TextField source="type" />
          <TextField source="business_id" label="Business ID" />
          <TextField source="business_id_type" label="Business ID type" />
        </FieldStack>
        <Typography variant="h6" gutterBottom>
          Clients
        </Typography>
        <EntityClientList />
      </Stack>
    </SimpleShowLayout>
  </Show>
);
export default EntityShow;
