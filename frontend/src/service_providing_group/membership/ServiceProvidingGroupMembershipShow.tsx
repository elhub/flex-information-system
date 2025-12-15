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
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router-dom";
import { DateField } from "../../components/datetime";
import { EventButton } from "../../event/EventButton";
import { IdentityField } from "../../components/IdentityField";
import { Permissions } from "../../auth/permissions";
import HistoryIcon from "@mui/icons-material/History";
import { ServiceProvidingGroupMembership } from "../../generated-client";

const EditButton = () => {
  const record = useRecordContext();
  return (
    <Button
      component={Link}
      to={`/service_providing_group/${record?.service_providing_group_id}/membership/${record?.id}`}
      startIcon={<EditIcon />}
      label="Edit"
    />
  );
};

// manual components to support both flat and nested URLs for this resource

const HistoryButton = () => {
  const record = useRecordContext<ServiceProvidingGroupMembership>();
  const { permissions } = usePermissions<Permissions>();

  const filter =
    `?filter=` +
    encodeURIComponent(
      `{ "service_providing_group_membership_id": ${record?.id} }`,
    );

  return (
    <Button
      component={Link}
      disabled={
        !permissions?.allow(
          "service_providing_group_membership_history",
          "read",
        )
      }
      to={`/service_providing_group/${record?.service_providing_group_id}/membership_history${filter}`}
      startIcon={<HistoryIcon />}
      label="View History"
    />
  );
};

export const ServiceProvidingGroupMembershipShow = () => {
  const resource = useResourceContext()!;
  const { permissions } = usePermissions<Permissions>();

  const isHistory = resource.endsWith("_history");

  // Permission checks
  const canUpdate = permissions?.allow(
    "service_providing_group_membership",
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
              label="field.service_providing_group_membership.id"
            />
            <ReferenceField
              source="controllable_unit_id"
              reference="controllable_unit"
              label="field.service_providing_group_membership.controllable_unit_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <ReferenceField
              source="service_providing_group_id"
              reference="service_providing_group"
              label="field.service_providing_group_membership.service_providing_group_id"
            >
              <TextField source="name" />
            </ReferenceField>
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Valid time
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField
              source="valid_from"
              showTime
              label="field.service_providing_group_membership.valid_from"
            />
            <DateField
              source="valid_to"
              showTime
              label="field.service_providing_group_membership.valid_to"
            />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField
              source="recorded_at"
              showTime
              label="field.service_providing_group_membership.recorded_at"
            />
            <IdentityField
              source="recorded_by"
              label="field.service_providing_group_membership.recorded_by"
            />
          </FieldStack>
        </Stack>
        <HistoryButton />
        {!isHistory && <EventButton filterOnSubject />}
      </SimpleShowLayout>
    </Show>
  );
};
