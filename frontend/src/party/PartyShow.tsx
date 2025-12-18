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
import { EnumField } from "../components/enum";

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
            <TextField source="id" label="field.party.id" />
            <TextField source="party_id" label="field.party_history.party_id" />
            <TextField source="business_id" label="field.party.business_id" />
            <EnumField
              source="business_id_type"
              label="field.party.business_id_type"
              enumKey="party.business_id_type"
            />
            <ReferenceField
              source="entity_id"
              reference="entity"
              label="field.party.entity_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <TextField source="name" label="field.party.name" />
            <EnumField
              source="type"
              label="field.party.type"
              enumKey="party.type"
            />
            <EnumField
              source="role"
              label="field.party.role"
              enumKey="party.role"
            />
            <EnumField
              source="status"
              label="field.party.status"
              enumKey="party.status"
            />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField
              source="recorded_at"
              showTime
              label="field.party.recorded_at"
            />
            <IdentityField
              source="recorded_by"
              label="field.party.recorded_by"
            />
            <DateField
              source="replaced_at"
              showTime
              label="field.party_history.replaced_at"
            />
            <IdentityField
              source="replaced_by"
              label="field.party_history.replaced_by"
            />
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
