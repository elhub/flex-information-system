import { Form, useGetIdentity, useRecordContext } from "ra-core";
import {
  AutocompleteReferenceInput,
  EnumInput,
  FormToolbar,
  PartyReferenceInput,
} from "../../components/EDS-ra/inputs";
import { ControllableUnitSuspension } from "../../generated-client";
import useLocationState from "../../hooks/useLocationState";
import {
  zControllableUnitSuspension,
  zControllableUnitSuspensionCreateRequest,
} from "../../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../../zod";
import { FormContainer, Heading } from "../../components/ui";

export type ControllableUnitSuspensionLocationState = {
  cus?: Partial<ControllableUnitSuspension>;
};

const fields = getFields(zControllableUnitSuspensionCreateRequest.shape);

export const ControllableUnitSuspensionInput = () => {
  const locationState =
    useLocationState<ControllableUnitSuspensionLocationState>();
  const overrideRecord = zControllableUnitSuspension
    .partial()
    .parse(locationState?.cus);
  const actualRecord = useRecordContext();
  const { data: identity } = useGetIdentity();
  const isSystemOperator = identity?.role == "flex_system_operator";

  const record = {
    ...actualRecord,
    ...overrideRecord,
  };

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(zControllableUnitSuspensionCreateRequest)}
      sanitizeEmptyValues
    >
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>
        <div className="flex flex-col gap-3">
          <AutocompleteReferenceInput
            {...fields.controllable_unit_id}
            reference="controllable_unit"
            readOnly={!!record?.controllable_unit_id}
          />
          {!isSystemOperator && (
            <PartyReferenceInput
              {...fields.impacted_system_operator_id}
              filter={{ type: "system_operator" }}
            />
          )}
        </div>
        <Heading level={3} size="medium">
          Controllable unit suspension process
        </Heading>
        <div className="flex flex-col gap-3">
          <EnumInput
            {...fields.reason}
            enumKey="controllable_unit_suspension.reason"
            required
          />
        </div>
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
