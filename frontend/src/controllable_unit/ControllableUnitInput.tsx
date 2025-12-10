import {
  DateInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  useRecordContext,
} from "react-admin";
import {
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ControllableUnitServiceProviderLocationState } from "./service_provider/ControllableUnitServiceProviderInput";

export type ControllableUnitInputLocationState = {
  controllableUnit: Partial<ControllableUnit>;
  endUserId?: number;
};

// common layout to create and edit pages
export const ControllableUnitInput = () => {
  const createOrUpdate = useCreateOrUpdate();
  const locationState = useLocationState<ControllableUnitInputLocationState>();
  const navigate = useNavigate();

  const controllableUnitOverride: Partial<ControllableUnit> =
    locationState?.controllableUnit
      ? zControllableUnit.parse(locationState?.controllableUnit)
      : {};

  const record = useRecordContext<ControllableUnit>();

  // This should probably be handled in the api, if we dont want them to be required.
  const defaultValues: Partial<ControllableUnit> = {
    regulation_direction: "up",
    maximum_available_capacity: 1,
    status: "new",
  };

  const overridenRecord = {
    ...record,
    ...(createOrUpdate === "create" ? defaultValues : {}),
    ...controllableUnitOverride,
  } as ControllableUnit;

  const onCreate = (data: unknown) => {
    const controllableUnit = data as ControllableUnit;
    const cuspState: ControllableUnitServiceProviderLocationState = {
      cusp: {
        controllable_unit_id: controllableUnit.id,
        end_user_id: locationState?.endUserId,
        valid_from: controllableUnit.start_date,
      },
    };

    navigate(
      `/controllable_unit/${controllableUnit.id}/service_provider/create`,
      { state: cuspState },
    );
  };

  return (
    <SimpleForm
      record={overridenRecord}
      resolver={zodResolver(zControllableUnit) as any}
      toolbar={
        <Toolbar
          onSuccess={createOrUpdate === "create" ? onCreate : undefined}
        />
      }
    >
      <Typography variant="h5" gutterBottom>
        {createOrUpdate == "update"
          ? "Edit Controllable Unit"
          : "Create Controllable Unit"}
      </Typography>
      <Stack direction="column" spacing={3}>
        <InputStack direction="row" flexWrap="wrap">
          <TextInput source="name" validate={required()} />
          <AutocompleteReferenceInput
            source="accounting_point_id"
            reference="accounting_point"
            fieldName="business_id"
          />
          <DateInput source="start_date" />
          <SelectInput
            source="status"
            validate={createOrUpdate == "update" ? required() : undefined}
            choices={["new", "active", "inactive", "terminated"]}
          />
        </InputStack>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Technical Information</Typography>
          </AccordionSummary>

          <AccordionDetails>
            <InputStack direction="row" flexWrap="wrap">
              <UnitInput
                source="maximum_available_capacity"
                unit="kW"
                min={0}
                validate={required()}
              />
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
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Grid Validation</Typography>
          </AccordionSummary>

          <AccordionDetails>
            <InputStack direction="row" flexWrap="wrap">
              <TextInput source="grid_node_id" />
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
          </AccordionDetails>
        </Accordion>
      </Stack>
    </SimpleForm>
  );
};
