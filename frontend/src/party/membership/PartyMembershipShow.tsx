import { ReferenceField, Show, SimpleShowLayout, TextField } from "react-admin";
import { Typography, Stack } from "@mui/material";
import { FieldStack } from "../../auth";
import { DateField } from "../../DateField";
import { NestedResourceHistoryButton } from "../../history";
import { EventButton } from "../../event/EventButton";

export const PartyMembershipShow = () => (
  <Show>
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
          <ReferenceField source="party_id" reference="party" link="show">
            <TextField source="name" />
          </ReferenceField>
        </FieldStack>

        <Typography variant="h6" gutterBottom>
          Registration
        </Typography>
        <FieldStack direction="row" flexWrap="wrap" spacing={2}>
          <DateField source="recorded_at" showTime />
          <TextField source="recorded_by" />
        </FieldStack>
      </Stack>
      <EventButton />
      <NestedResourceHistoryButton
        parent="party"
        child="membership"
        label="party memberships"
      />
    </SimpleShowLayout>
  </Show>
);
