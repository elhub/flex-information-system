import { Form, useRecordContext } from "ra-core";
import { ControllableUnit } from "../generated-client";
import { useTypedLocationState } from "../routes";
import {
  zControllableUnit,
  zControllableUnitCreateRequest,
} from "../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../zod";
import { useCreateOrUpdate } from "../auth";
import { FormContainer, Heading, FlexDiv, Accordion } from "../components/ui";
import {
  TextInput,
  EnumInput,
  AutocompleteReferenceInput,
  DateInput,
  UnitInput,
  FormToolbar,
  TextAreaInput,
} from "../components/EDS-ra/inputs";
import { formatDateToMidnightISO } from "../components/datetime";

export type ControllableUnitInputLocationState = {
  controllableUnit: Partial<ControllableUnit>;
  endUserId?: number;
};

export const ControllableUnitInput = () => {
  const createOrUpdate = useCreateOrUpdate();
  const locationState = useTypedLocationState("controllable_unit_edit");

  const controllableUnitOverride: Partial<ControllableUnit> = zControllableUnit
    .partial()
    .parse(locationState?.controllableUnit ?? {});

  const record = useRecordContext<ControllableUnit>();

  const defaultValues: Partial<ControllableUnit> = {
    regulation_direction: "up",
    maximum_active_power: 1,
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
      sanitizeEmptyValues
    >
      <FormContainer>
        <Heading level={3} size="medium">
          {createOrUpdate == "update"
            ? "Edit Controllable Unit"
            : "Create Controllable Unit"}
        </Heading>

        <FlexDiv style={{ gap: "var(--eds-size-3)", flexDirection: "column" }}>
          <TextInput {...fields.name} description tooltip={false} />
          <AutocompleteReferenceInput
            {...fields.accounting_point_id}
            reference="accounting_point"
            description
            tooltip={false}
          />
          <DateInput {...fields.start_date} description tooltip={false} />
          <EnumInput
            {...fields.status}
            enumKey="controllable_unit.status"
            required={createOrUpdate == "update"}
            description
            tooltip={false}
          />
          <TextAreaInput
            {...fields.additional_information}
            rows={5}
            description
            tooltip={false}
          />
        </FlexDiv>

        <Accordion border>
          <Accordion.Item>
            <Accordion.Header>Technical Information</Accordion.Header>
            <Accordion.Content>
              <FlexDiv
                style={{ gap: "var(--eds-size-3)", flexDirection: "column" }}
              >
                <UnitInput
                  {...fields.maximum_active_power}
                  units={[
                    { label: "kW", scale: 1 },
                    { label: "MW", scale: 1000 },
                  ]}
                  description
                  tooltip={false}
                />
                <EnumInput
                  {...fields.regulation_direction}
                  enumKey="controllable_unit.regulation_direction"
                  description
                  tooltip={false}
                />
              </FlexDiv>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>

        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
