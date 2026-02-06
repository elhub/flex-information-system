import { Form, useRecordContext } from "ra-core";
import { ControllableUnit } from "../generated-client";
import useLocationState from "../hooks/useLocationState";
import {
  zControllableUnit,
  zControllableUnitCreateRequest,
} from "../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../util";
import { useCreateOrUpdate } from "../auth";
import { FormContainer, Heading, FlexDiv, Accordion } from "../components/ui";
import {
  TextInput,
  EnumInput,
  AutocompleteReferenceInput,
  DateInput,
  FormToolbar,
} from "../components/EDS-ra/inputs";
import { formatDateToMidnightISO } from "../components/datetime";

export type ControllableUnitInputLocationState = {
  controllableUnit: Partial<ControllableUnit>;
  endUserId?: number;
};

export const ControllableUnitInput = () => {
  const createOrUpdate = useCreateOrUpdate();
  const locationState = useLocationState<ControllableUnitInputLocationState>();

  const controllableUnitOverride: Partial<ControllableUnit> = zControllableUnit
    .partial()
    .parse(locationState?.controllableUnit ?? {});

  const record = useRecordContext<ControllableUnit>();

  const defaultValues: Partial<ControllableUnit> = {
    regulation_direction: "up",
    maximum_available_capacity: 1,
    status: "new",
    start_date: formatDateToMidnightISO(new Date().toISOString()) ?? undefined,
  };

  const overridenRecord = {
    ...record,
    ...(createOrUpdate === "create" ? defaultValues : {}),
    ...controllableUnitOverride,
  } as ControllableUnit;

  const fields = getFields(zControllableUnitCreateRequest.shape);

  return (
    <Form
      record={overridenRecord}
      resolver={unTypedZodResolver(zControllableUnitCreateRequest)}
    >
      <FormContainer>
        <Heading level={3} size="medium">
          {createOrUpdate == "update"
            ? "Edit Controllable Unit"
            : "Create Controllable Unit"}
        </Heading>

        <FlexDiv style={{ gap: "var(--eds-size-3)", flexDirection: "column" }}>
          <TextInput {...fields.name} />
          <AutocompleteReferenceInput
            {...fields.accounting_point_id}
            reference="accounting_point"
          />
          <DateInput {...fields.start_date} />
          <EnumInput
            {...fields.status}
            enumKey="controllable_unit.status"
            required={createOrUpdate == "update"}
          />
        </FlexDiv>

        <Accordion border>
          <Accordion.Item>
            <Accordion.Header>Technical Information</Accordion.Header>
            <Accordion.Content>
              <FlexDiv
                style={{ gap: "var(--eds-size-3)", flexDirection: "column" }}
              >
                <TextInput
                  {...fields.maximum_available_capacity}
                  type="number"
                />
                <EnumInput
                  {...fields.regulation_direction}
                  enumKey="controllable_unit.regulation_direction"
                />
                <TextInput {...fields.minimum_duration} type="number" />
                <TextInput {...fields.maximum_duration} type="number" />
                <TextInput {...fields.recovery_duration} type="number" />
                <TextInput {...fields.ramp_rate} type="number" />
              </FlexDiv>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item>
            <Accordion.Header>Grid Validation</Accordion.Header>
            <Accordion.Content>
              <FlexDiv
                style={{ gap: "var(--eds-size-3)", flexDirection: "column" }}
              >
                <TextInput {...fields.grid_node_id} />
                <EnumInput
                  {...fields.grid_validation_status}
                  enumKey="controllable_unit.grid_validation_status"
                />
                <TextInput {...fields.grid_validation_notes} />
                <DateInput {...fields.validated_at} />
              </FlexDiv>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>

        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
