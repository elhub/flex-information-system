import {
  BooleanField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  useResourceContext,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { FieldStack } from "../auth";
import { ControllableUnitServiceProviderList } from "./service_provider/ControllableUnitServiceProviderList";
import {
  ResourceHistoryButton,
  NestedResourceHistoryButton,
  RestoreButton,
} from "../history";
import { DateField } from "../datetime";
import { TechnicalResourceList } from "./technical_resource/TechnicalResourceList";
import { UnitField } from "../unitComponents";
import { EventButton } from "../event/EventButton";
import { IdentityField } from "../IdentityField";
import { ControllableUnitBalanceResponsiblePartyList } from "./balance_responsible_party/ControllableUnitBalanceResponsiblePartyList";

export const ControllableUnitShow = () => {
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
            <TextField source="controllable_unit_id" />
            <TextField source="business_id" label="Business ID" />
            <TextField source="name" />
            <DateField source="start_date" />
            <TextField source="status" />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Type
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <UnitField source="maximum_available_capacity" unit="kW" />
            <BooleanField source="is_small" />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Technical information
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField source="regulation_direction" />
            <UnitField source="minimum_duration" unit="s" />
            <UnitField source="maximum_duration" unit="s" />
            <UnitField source="recovery_duration" unit="s" />
            <UnitField source="ramp_rate" unit="kW/min" />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Relationships
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <ReferenceField
              source="connecting_system_operator_id"
              reference="party"
            >
              <TextField source="name" />
            </ReferenceField>
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Locations
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <ReferenceField
              source="accounting_point_id"
              reference="accounting_point"
            >
              <TextField source="business_id" />
            </ReferenceField>
            <TextField source="grid_node_id" />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Grid validation
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField source="grid_validation_status" />
            <TextField source="grid_validation_notes" />
            <DateField source="last_validated" showTime />
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
              Service provider relations
            </Typography>
            <NestedResourceHistoryButton
              child="service_provider"
              label="service provider contracts"
            />
            <ControllableUnitServiceProviderList />
            <Typography variant="h6" gutterBottom>
              Technical resources
            </Typography>
            <NestedResourceHistoryButton
              child="technical_resource"
              label="technical resources"
              noResourceNameMerge
            />
            <TechnicalResourceList />
            <Typography variant="h6" gutterBottom>
              Balance responsible parties
            </Typography>
            <ControllableUnitBalanceResponsiblePartyList />
          </>
        )}
        {isHistory && <RestoreButton />}
      </SimpleShowLayout>
    </Show>
  );
};
