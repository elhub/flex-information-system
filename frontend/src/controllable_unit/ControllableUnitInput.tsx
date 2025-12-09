import {
  DateInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  useRecordContext,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import {
  AutocompleteReferenceInput,
  InputStack,
  useCreateOrUpdate,
} from "../auth";
import { Toolbar } from "../components/Toolbar";
import { UnitInput } from "../components/unitComponents";
import { DateTimeInput } from "../components/datetime";
import { ControllableUnit } from "../generated-client";
import useLocationState from "../hooks/useLocationState";
import { zControllableUnit } from "../generated-client/zod.gen";

export type ControllableUnitInputLocationState = {
  controllableUnit: Partial<ControllableUnit>;
};

// common layout to create and edit pages
export const ControllableUnitInput = () => {
  const createOrUpdate = useCreateOrUpdate();
  const locationState = useLocationState<ControllableUnitInputLocationState>();

  const controllableUnitOverride: Partial<ControllableUnit> =
    zControllableUnit.parse(locationState?.controllableUnit) || {};

  const record = useRecordContext<ControllableUnit>();

  // This should probably be handled in the api, if we dont want them to be required.
  const defaultValues: Partial<ControllableUnit> = {
    regulation_direction: "up",
    maximum_available_capacity: 0,
  };

  const overridenRecord = {
    ...record,
    ...(createOrUpdate === "create" ? defaultValues : {}),
    ...controllableUnitOverride,
  } as ControllableUnit;

  return (
    <SimpleForm record={overridenRecord} maxWidth={1280} toolbar={<Toolbar />}>
      <Typography variant="h5" gutterBottom>
        {createOrUpdate == "update"
          ? "Edit Controllable Unit"
          : "Create Controllable Unit"}
      </Typography>
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
            choices={["new", "active", "inactive", "terminated"]}
          />
        </InputStack>

        <Typography variant="h6" gutterBottom>
          Locations
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <AutocompleteReferenceInput
            source="accounting_point_id"
            reference="accounting_point"
            fieldName="business_id"
          />
          <TextInput source="grid_node_id" />
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
          <DateTimeInput source="validated_at" />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
