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
import { DateField } from "../../components/datetime";
import { NestedResourceHistoryButton } from "../../components/history";
import { EventButton } from "../../event/EventButton";
import { IdentityField } from "../../components/IdentityField";
import { ScopesField } from "../../components/scopes";
import { Link } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import { Permissions } from "../../auth/permissions";

const EditButton = () => {
  const record = useRecordContext()!;
  return (
    <Button
      component={Link}
      to={`/party/${record.party_id}/membership/${record.id}`}
      startIcon={<EditIcon />}
      label="Edit"
    />
  );
};

export const PartyMembershipShow = () => {
  const resource = useResourceContext()!;
  const { permissions } = usePermissions<Permissions>();

  const isHistory = resource.endsWith("_history");

  // Permission checks
  const canUpdate = permissions?.allow("party_membership", "update");

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
            <TextField source="id" label="field.party_membership.id" />
            <ReferenceField
              source="entity_id"
              reference="entity"
              link="show"
              label="field.party_membership.entity_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <ReferenceField
              source="party_id"
              reference="party"
              link="show"
              label="field.party_membership.party_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <ScopesField
              source="scopes"
              label="field.party_membership.scopes"
            />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField
              source="recorded_at"
              showTime
              label="field.party_membership.recorded_at"
            />
            <IdentityField
              source="recorded_by"
              label="field.party_membership.recorded_by"
            />
          </FieldStack>
        </Stack>
        <EventButton filterOnSubject />
        <NestedResourceHistoryButton
          child="membership"
          label="party memberships"
        />
      </SimpleShowLayout>
    </Show>
  );
};
