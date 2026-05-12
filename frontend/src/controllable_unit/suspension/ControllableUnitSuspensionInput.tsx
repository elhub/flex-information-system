import {
  required,
  SimpleForm,
  useGetIdentity,
  useRecordContext,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { Toolbar } from "../../components/Toolbar";
import {
  PartyReferenceInput,
  InputStack,
  AutocompleteReferenceInput,
} from "../../auth";
import { ControllableUnitSuspension } from "../../generated-client";
import useLocationState from "../../hooks/useLocationState";
import {
  zControllableUnitSuspension,
  zControllableUnitSuspensionCreateRequest,
} from "../../generated-client/zod.gen";
import { EnumInput } from "../../components/enum";
import { unTypedZodResolver } from "../../zod";

export type ControllableUnitSuspensionLocationState = {
  cus?: Partial<ControllableUnitSuspension>;
};

// common layout to create and edit pages
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
    <SimpleForm
      record={record}
      maxWidth={1280}
      resolver={unTypedZodResolver(zControllableUnitSuspensionCreateRequest)}
      toolbar={<Toolbar />}
    >
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <AutocompleteReferenceInput
            source="controllable_unit_id"
            reference="controllable_unit"
            label="field.controllable_unit_suspension.controllable_unit_id"
            readOnly={!!record?.controllable_unit_id}
          />
        </InputStack>
        <InputStack direction="row" flexWrap="wrap">
          {!isSystemOperator && (
            <PartyReferenceInput
              source="impacted_system_operator_id"
              label="field.controllable_unit_suspension.impacted_system_operator_id"
              filter={{ type: "system_operator" }}
            />
          )}
        </InputStack>
        <Typography variant="h6" gutterBottom>
          Controllable unit suspension process
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <EnumInput
            source="reason"
            label="field.controllable_unit_suspension.reason"
            validate={required()}
            enumKey="controllable_unit_suspension.reason"
          />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
