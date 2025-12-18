import { Show, SimpleShowLayout, TextField } from "react-admin";
import { FieldStack } from "../auth";
import { Typography, Stack } from "@mui/material";
import { EntityClientList } from "./client/EntityClientList";
import { EnumField } from "../components/enum";

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
          <EnumField
            source="type"
            label="field.entity.type"
            enumKey="entity.type"
          />
          <TextField source="business_id" label="field.entity.business_id" />
          <EnumField
            source="business_id_type"
            label="field.entity.business_id_type"
            enumKey="entity.business_id_type"
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
