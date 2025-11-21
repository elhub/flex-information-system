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

export const PartyMembershipShow = () => {
  const resource = useResourceContext()!;
  const { permissions } = usePermissions();

  const isHistory = resource.endsWith("_history");

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

  return (
    <Show
      actions={
        !isHistory &&
        permissions.includes("party_membership.update") && (
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
            <ReferenceField source="party_id" reference="party" link="show">
              <TextField source="name" />
            </ReferenceField>
            <ScopesField source="scopes" />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField source="recorded_at" showTime />
            <IdentityField source="recorded_by" />
          </FieldStack>
        </Stack>
        <EventButton />
        <NestedResourceHistoryButton
          child="membership"
          label="party memberships"
        />
      </SimpleShowLayout>
    </Show>
  );
};
export default PartyMembershipShow;
