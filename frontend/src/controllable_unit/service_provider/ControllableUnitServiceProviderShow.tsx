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
import { RestoreButton } from "../../components/history";
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router-dom";
import { DateField } from "../../components/datetime";
import { EventButton } from "../../event/EventButton";
import { IdentityField } from "../../components/IdentityField";
import { Permissions } from "../../auth/permissions";
import HistoryIcon from "@mui/icons-material/History";
import { ControllableUnitServiceProvider } from "../../generated-client";

const EditButton = () => {
  const record = useRecordContext<ControllableUnitServiceProvider>();
  return (
    <Button
      component={Link}
      to={`/controllable_unit/${record?.controllable_unit_id}/service_provider/${record?.id}`}
      startIcon={<EditIcon />}
      label="Edit"
    />
  );
};

// manual component to support both flat and nested URLs for this resource

const HistoryButton = () => {
  const record = useRecordContext<ControllableUnitServiceProvider>();
  const { permissions } = usePermissions<Permissions>();

  const filter =
    `?filter=` +
    encodeURIComponent(
      `{ "controllable_unit_service_provider_id": ${record?.id} }`,
    );

  return (
    <Button
      component={Link}
      disabled={
        !permissions?.allow(
          "controllable_unit_service_provider_history",
          "read",
        )
      }
      to={`/controllable_unit/${record?.controllable_unit_id}/service_provider_history${filter}`}
      startIcon={<HistoryIcon />}
      label="View History"
    />
  );
};

export const ControllableUnitServiceProviderShow = () => {
  const resource = useResourceContext()!;
  const { permissions } = usePermissions<Permissions>();

  const isHistory = resource.endsWith("_history");

  // Permission checks
  const canUpdate = permissions?.allow(
    "controllable_unit_service_provider",
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
              label="field.controllable_unit_service_provider.id"
            />
            <TextField
              source="controllable_unit_service_provider_id"
              label="field.controllable_unit_service_provider_history.controllable_unit_service_provider_id"
            />
            <ReferenceField
              source="controllable_unit_id"
              reference="controllable_unit"
              label="field.controllable_unit_service_provider.controllable_unit_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <ReferenceField
              source="service_provider_id"
              reference="party"
              label="field.controllable_unit_service_provider.service_provider_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <TextField
              source="end_user_id"
              label="field.controllable_unit_service_provider.end_user_id"
            />
          </FieldStack>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField
              source="contract_reference"
              label="field.controllable_unit_service_provider.contract_reference"
            />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Valid time
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField
              source="valid_from"
              showTime
              label="field.controllable_unit_service_provider.valid_from"
            />
            <DateField
              source="valid_to"
              showTime
              label="field.controllable_unit_service_provider.valid_to"
            />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField
              source="recorded_at"
              showTime
              label="field.controllable_unit_service_provider.recorded_at"
            />
            <IdentityField
              source="recorded_by"
              label="field.controllable_unit_service_provider.recorded_by"
            />
            <DateField
              source="replaced_at"
              showTime
              label="field.controllable_unit_service_provider_history.replaced_at"
            />
            <IdentityField
              source="replaced_by"
              label="field.controllable_unit_service_provider_history.replaced_by"
            />
          </FieldStack>
        </Stack>
        <HistoryButton />
        {!isHistory && <EventButton filterOnSubject />}
        {isHistory && (
          <RestoreButton parent="controllable_unit" child="service_provider" />
        )}
      </SimpleShowLayout>
    </Show>
  );
};
