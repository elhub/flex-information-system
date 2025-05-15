import {
  DateInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import {
  AutocompleteReferenceInput,
  InputStack,
  useCreateOrUpdate,
} from "../auth";
import { Toolbar } from "../Toolbar";
import { UnitInput } from "../unitComponents";
import { DateTimeInput } from "../datetime";

// common layout to create and edit pages
export const ControllableUnitInput = () => {
  const createOrUpdate = useCreateOrUpdate();

  return (
    <SimpleForm maxWidth={1280} toolbar={<Toolbar saveAlwaysEnabled />}>
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <TextInput source="name" validate={required()} />
          <DateInput source="start_date" />
          <SelectInput
            source="status"
            validate={createOrUpdate == "update" ? required() : undefined}
            choices={["new", "active", "suspended", "terminated"]}
          />
        </InputStack>

        <Typography variant="h6" gutterBottom>
          Type
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <UnitInput
            source="maximum_available_capacity"
            unit="kW"
            min={0}
            validate={required()}
          />
        </InputStack>

        <Typography variant="h6" gutterBottom>
          Technical information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <SelectInput
            source="regulation_direction"
            defaultValue="up"
            validate={required()}
            choices={["up", "down", "both"]}
          />
          <UnitInput source="minimum_duration" unit="s" />
          <UnitInput source="maximum_duration" unit="s" />
          <UnitInput source="recovery_duration" unit="s" />
          <UnitInput source="ramp_rate" unit="kW/min" min={0.001} />
        </InputStack>

        <Typography variant="h6" gutterBottom>
          Locations
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <AutocompleteReferenceInput
            source="accounting_point_id"
            reference="accounting_point"
            field="business_id"
          />
          <TextInput source="grid_node_id" />
        </InputStack>

        <Typography variant="h6" gutterBottom>
          Prequalification
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <SelectInput
            source="grid_validation_status"
            validate={required()}
            choices={[
              "pending",
              "in_progress",
              "incomplete_information",
              "validated",
              "validation_failed",
            ]}
          />
          <TextInput
            source="grid_validation_notes"
            multiline={true}
            minRows={3}
            sx={{ minWidth: { xs: 300, md: 500 } }}
          />
          <DateTimeInput source="last_validated" />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
