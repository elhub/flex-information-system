import {
  BooleanField,
  FunctionField,
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
} from "../components/history";
import { DateField } from "../components/datetime";
import { TechnicalResourceList } from "./technical_resource/TechnicalResourceList";
import { UnitField } from "../components/unitComponents";
import { EventButton } from "../event/EventButton";
import { IdentityField } from "../components/IdentityField";
import { ControllableUnitBalanceResponsiblePartyList } from "./balance_responsible_party/ControllableUnitBalanceResponsiblePartyList";
import { ControllableUnitEnergySupplierList } from "./energy_supplier/ControllableUnitEnergySupplierList";
import { ControllableUnitSuspensionList } from "./suspension/ControllableUnitSuspensionList";

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
            <TextField source="id" label="field.controllable_unit.id" />
            <TextField
              source="controllable_unit_id"
              label="field.controllable_unit_history.controllable_unit_id"
            />
            <TextField
              source="business_id"
              label="field.controllable_unit.business_id"
            />
            <TextField source="name" label="field.controllable_unit.name" />
            <DateField
              source="start_date"
              label="field.controllable_unit.start_date"
            />
            <TextField source="status" label="field.controllable_unit.status" />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Type
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <UnitField
              source="maximum_available_capacity"
              unit="kW"
              label="field.controllable_unit.maximum_available_capacity"
            />
            <BooleanField
              source="is_small"
              label="field.controllable_unit.is_small"
            />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Technical information
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField
              source="regulation_direction"
              label="field.controllable_unit.regulation_direction"
            />
            <UnitField
              source="minimum_duration"
              unit="s"
              label="field.controllable_unit.minimum_duration"
            />
            <UnitField
              source="maximum_duration"
              unit="s"
              label="field.controllable_unit.maximum_duration"
            />
            <UnitField
              source="recovery_duration"
              unit="s"
              label="field.controllable_unit.recovery_duration"
            />
            <UnitField
              source="ramp_rate"
              unit="kW/min"
              label="field.controllable_unit.ramp_rate"
            />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Locations
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <ReferenceField
              source="accounting_point_id"
              reference="accounting_point"
              label="field.controllable_unit.accounting_point_id"
            >
              <Stack direction="row" spacing={1}>
                <TextField source="business_id" />
                {!isHistory && (
                  <ReferenceField source="system_operator_id" reference="party">
                    <FunctionField render={(record) => `(${record.name})`} />
                  </ReferenceField>
                )}
              </Stack>
            </ReferenceField>
            <TextField
              source="grid_node_id"
              label="field.controllable_unit.grid_node_id"
            />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Grid validation
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField
              source="grid_validation_status"
              label="field.controllable_unit.grid_validation_status"
            />
            <TextField
              source="grid_validation_notes"
              label="field.controllable_unit.grid_validation_notes"
            />
            <DateField
              source="validated_at"
              showTime
              label="field.controllable_unit.validated_at"
            />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField
              source="recorded_at"
              showTime
              label="field.controllable_unit.recorded_at"
            />
            <IdentityField
              source="recorded_by"
              label="field.controllable_unit.recorded_by"
            />
            <DateField
              source="replaced_at"
              showTime
              label="field.controllable_unit_history.replaced_at"
            />
            <IdentityField
              source="replaced_by"
              label="field.controllable_unit_history.replaced_by"
            />
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
              childAPIResource="technical_resource"
              label="technical resources"
            />
            <TechnicalResourceList />
            <Typography variant="h6" gutterBottom>
              Balance responsible parties
            </Typography>
            <ControllableUnitBalanceResponsiblePartyList />
            <Typography variant="h6" gutterBottom>
              CU suspension
            </Typography>
            <NestedResourceHistoryButton
              child="suspension"
              label="suspension resources"
            />
            <ControllableUnitSuspensionList />
            <Typography variant="h6" gutterBottom>
              Energy suppliers
            </Typography>
            <ControllableUnitEnergySupplierList />
          </>
        )}
      </SimpleShowLayout>
    </Show>
  );
};
