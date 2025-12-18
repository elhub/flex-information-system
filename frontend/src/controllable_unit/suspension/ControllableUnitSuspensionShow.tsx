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
import { EventButton } from "../../event/EventButton";
import { DateField } from "../../components/datetime";
import { FieldStack } from "../../auth";
import { CommentList as GenericCommentList } from "../../components/comments";
import { IdentityField } from "../../components/IdentityField";
import { Permissions } from "../../auth/permissions";
import HistoryIcon from "@mui/icons-material/History";
import { ControllableUnitSuspension } from "../../generated-client";
import { EnumField } from "../../components/enum";

const EditButton = () => {
  const record = useRecordContext<ControllableUnitSuspension>();
  return (
    <Button
      component={Link}
      to={`/controllable_unit/${record?.controllable_unit_id}/suspension/${record?.id}`}
      startIcon={<EditIcon />}
      label="Edit"
    />
  );
};

// manual components to support both flat and nested URLs for this resource

const HistoryButton = () => {
  const record = useRecordContext<ControllableUnitSuspension>();
  const { permissions } = usePermissions<Permissions>();

  const filter =
    `?filter=` +
    encodeURIComponent(`{ "controllable_unit_suspension_id": ${record?.id} }`);

  return (
    <Button
      component={Link}
      disabled={
        !permissions?.allow("controllable_unit_suspension_history", "read")
      }
      to={`/controllable_unit/${record?.controllable_unit_id}/suspension_history${filter}`}
      startIcon={<HistoryIcon />}
      label="View History"
    />
  );
};

const CommentHistoryButton = () => {
  const record = useRecordContext<ControllableUnitSuspension>();
  const { permissions } = usePermissions<Permissions>();

  return (
    <Button
      component={Link}
      disabled={
        !permissions?.allow(
          "controllable_unit_suspension_comment_history",
          "read",
        )
      }
      to={`/controllable_unit/${record?.controllable_unit_id}/suspension/${record?.id}/comment_history`}
      startIcon={<HistoryIcon />}
      label="View History of Comments"
    />
  );
};

const CommentList = () => {
  const record = useRecordContext<ControllableUnitSuspension>();
  return (
    <GenericCommentList
      parentPath={
        record
          ? [
              {
                resource: "controllable_unit",
                id: record.controllable_unit_id!,
              },
              { resource: "suspension", id: record.id! },
            ]
          : undefined
      }
    />
  );
};

export const ControllableUnitSuspensionShow = () => {
  const resource = useResourceContext()!;
  const { permissions } = usePermissions<Permissions>();

  const isHistory = resource.endsWith("_history");

  // Permission checks
  const canUpdate = permissions?.allow(
    "controllable_unit_suspension",
    "update",
  );

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
            <TextField
              source="id"
              label="field.controllable_unit_suspension.id"
            />
            <TextField
              source="controllable_unit_suspension_id"
              label="field.controllable_unit_suspension_history.controllable_unit_suspension_id"
            />
            <ReferenceField
              source="controllable_unit_id"
              reference="controllable_unit"
              label="field.controllable_unit_suspension.controllable_unit_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <ReferenceField
              source="impacted_system_operator_id"
              reference="party"
              label="field.controllable_unit_suspension.impacted_system_operator_id"
            >
              <TextField source="name" />
            </ReferenceField>
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Controllable unit suspension process
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <EnumField
              source="reason"
              label="field.controllable_unit_suspension.reason"
              enumKey="controllable_unit_suspension.reason"
            />
            <DateField
              source="recorded_at"
              showTime
              label="field.controllable_unit_suspension.recorded_at"
            />
            <IdentityField
              source="recorded_by"
              label="field.controllable_unit_suspension.recorded_by"
            />
            <DateField
              source="replaced_at"
              showTime
              label="field.controllable_unit_suspension_history.replaced_at"
            />
            <IdentityField
              source="replaced_by"
              label="field.controllable_unit_suspension_history.replaced_by"
            />
          </FieldStack>
        </Stack>
        <HistoryButton />
        {!isHistory && <EventButton filterOnSubject />}
        {!isHistory && (
          <>
            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>
            <CommentHistoryButton />
            <CommentList />
          </>
        )}
      </SimpleShowLayout>
    </Show>
  );
};
