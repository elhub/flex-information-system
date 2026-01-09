import {
  DateInput,
  required,
  SimpleForm,
  TextInput,
  useNotify,
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
import {
  zControllableUnit,
  zControllableUnitCreateRequest,
} from "../generated-client/zod.gen";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ControllableUnitServiceProviderLocationState } from "./service_provider/ControllableUnitServiceProviderInput";
import { EnumInput } from "../components/enum";

export type ControllableUnitInputLocationState = {
  controllableUnit: Partial<ControllableUnit>;
  endUserId?: number;
};

// common layout to create and edit pages
export const ControllableUnitInput = () => {
  const createOrUpdate = useCreateOrUpdate();
  const locationState = useLocationState<ControllableUnitInputLocationState>();
  const navigate = useNavigate();
  const notify = useNotify();

  const controllableUnitOverride: Partial<ControllableUnit> = zControllableUnit
    .partial()
    .parse(locationState?.controllableUnit ?? {});

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
    const controllableUnit = zControllableUnit.partial().parse(data ?? {});
    const cuspState: ControllableUnitServiceProviderLocationState = {
      cusp: {
        controllable_unit_id: controllableUnit.id,
        end_user_id: locationState?.endUserId,
        valid_from: controllableUnit.start_date,
      },
    };

    notify("Controllable Unit created successfully", { type: "success" });

    navigate(
      `/controllable_unit/${controllableUnit.id}/service_provider/create`,
      { state: cuspState, replace: true },
    );
  };

  return (
    <SimpleForm
      record={overridenRecord}
      resolver={zodResolver(zControllableUnitCreateRequest) as any}
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
          <TextInput
            source="name"
            label="field.controllable_unit.name"
            validate={required()}
          />
          <AutocompleteReferenceInput
            source="accounting_point_id"
            reference="accounting_point"
            label="field.controllable_unit.accounting_point_id"
            fieldName="business_id"
          />
          <DateInput
            source="start_date"
            label="field.controllable_unit.start_date"
          />
          <EnumInput
            source="status"
            label="field.controllable_unit.status"
            enumKey="controllable_unit.status"
            validate={createOrUpdate == "update" ? required() : undefined}
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
                label="field.controllable_unit.maximum_available_capacity"
                unit="kW"
                min={0}
                validate={required()}
              />
              <EnumInput
                enumKey="controllable_unit.regulation_direction"
                source="regulation_direction"
                label="field.controllable_unit.regulation_direction"
                defaultValue="up"
                validate={required()}
              />
              <UnitInput
                source="minimum_duration"
                label="field.controllable_unit.minimum_duration"
                unit="s"
              />
              <UnitInput
                source="maximum_duration"
                label="field.controllable_unit.maximum_duration"
                unit="s"
              />
              <UnitInput
                source="recovery_duration"
                label="field.controllable_unit.recovery_duration"
                unit="s"
              />
              <UnitInput
                source="ramp_rate"
                label="field.controllable_unit.ramp_rate"
                unit="kW/min"
                min={0.001}
              />
            </InputStack>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Grid Validation</Typography>
          </AccordionSummary>

          <AccordionDetails>
            <InputStack direction="row" flexWrap="wrap">
              <TextInput
                source="grid_node_id"
                label="field.controllable_unit.grid_node_id"
              />
              <EnumInput
                source="grid_validation_status"
                label="field.controllable_unit.grid_validation_status"
                enumKey="controllable_unit.grid_validation_status"
                validate={required()}
              />
              <TextInput
                source="grid_validation_notes"
                label="field.controllable_unit.grid_validation_notes"
                multiline={true}
                minRows={3}
                sx={{ minWidth: { xs: 300, md: 500 } }}
              />
              <DateTimeInput
                source="validated_at"
                label="field.controllable_unit.validated_at"
              />
            </InputStack>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </SimpleForm>
  );
};
