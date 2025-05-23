import {
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  useResourceContext,
} from "react-admin";
import { PartyMembershipList } from "./membership/PartyMembershipList";
import { FieldStack } from "../auth";
import { Typography, Stack } from "@mui/material";
import {
  NestedResourceHistoryButton,
  ResourceHistoryButton,
} from "../components/history";
import { DateField } from "../components/datetime";
import { EventButton } from "../event/EventButton";
import { IdentityField } from "../components/IdentityField";

export const PartyShow = () => {
  const resource = useResourceContext()!;

  const isHistory = resource.endsWith("_history");

  return (
    <Show>
      <SimpleShowLayout>
        <Stack direction="column" spacing={2}>
          <Typography variant="h6" gutterBottom>
            Basic information
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField source="id" label="ID" />
            <TextField source="business_id" label="Business ID" />
            <TextField source="business_id_type" label="Business ID type" />
            <ReferenceField source="entity_id" reference="entity">
              <TextField source="name" />
            </ReferenceField>
            <TextField source="name" />
            <TextField source="type" />
            <TextField source="role" />
            <TextField source="status" />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField source="recorded_at" showTime />
            <IdentityField source="recorded_by" />
            <DateField source="replaced_at" showTime />
            <IdentityField source="replaced_by" />
          </FieldStack>
        </Stack>
        <ResourceHistoryButton />
        {!isHistory && <EventButton />}
        {!isHistory && (
          <>
            <Typography variant="h6" gutterBottom>
              Party memberships
            </Typography>
            <NestedResourceHistoryButton
              child="membership"
              label="party memberships"
            />
            <PartyMembershipList />
          </>
        )}
      </SimpleShowLayout>
    </Show>
  );
};
