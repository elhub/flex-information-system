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
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router-dom";
import { NestedResourceHistoryButton } from "../../components/history";
import { EventButton } from "../../event/EventButton";
import { DateField } from "../../components/datetime";
import { FieldStack } from "../../auth";
import { CommentList } from "../../components/comments";
import { IdentityField } from "../../components/IdentityField";

const EditButton = () => {
  const record = useRecordContext()!;
  return (
    <Button
      component={Link}
      to={`/controllable_unit/${record.controllable_unit_id}/suspension/${record.id}`}
      startIcon={<EditIcon />}
      label="Edit"
    />
  );
};

export const ControllableUnitSuspensionShow = () => {
  const resource = useResourceContext()!;
  const { permissions } = usePermissions();

  const isHistory = resource.endsWith("_history");

  return (
    <Show
      actions={
        !isHistory &&
        permissions.includes("controllable_unit_suspension.update") && (
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
            <ReferenceField
              source="controllable_unit_id"
              reference="controllable_unit"
            >
              <TextField source="name" />
            </ReferenceField>
            <ReferenceField
              source="impacted_system_operator_id"
              reference="party"
            >
              <TextField source="name" />
            </ReferenceField>
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Controllable unit suspension process
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField source="reason" />
            <DateField source="recorded_at" showTime />
            <IdentityField source="recorded_by" />
          </FieldStack>
        </Stack>
        {!isHistory && <EventButton />}
        {!isHistory && (
          <>
            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>
            <NestedResourceHistoryButton child="comment" label="comments" />
            <CommentList />
          </>
        )}
      </SimpleShowLayout>
    </Show>
  );
};
