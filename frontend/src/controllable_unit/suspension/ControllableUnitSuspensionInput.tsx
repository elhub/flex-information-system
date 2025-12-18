import {
  required,
  SimpleForm,
  useGetIdentity,
  useRecordContext,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { Toolbar } from "../../components/Toolbar";
import { useLocation } from "react-router-dom";
import {
  PartyReferenceInput,
  InputStack,
  AutocompleteReferenceInput,
} from "../../auth";
import { useMemo } from "react";
import { zControllableUnitSuspension } from "../../generated-client/zod.gen";
import { zodResolver } from "@hookform/resolvers/zod";
import { EnumInput } from "../../components/enum";

// keep only the fields that map to the UI
const filterRecord = ({
  controllable_unit_id,
  impacted_system_operator_id,
  reason,
}: any) => ({
  controllable_unit_id,
  impacted_system_operator_id,
  reason,
});

// common layout to create and edit pages
export const ControllableUnitSuspensionInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();
  const { data: identity } = useGetIdentity();
  const isSystemOperator = identity?.role == "flex_system_operator";

  // Memoize the combined record to avoid re-renders causing errors
  const record = useMemo(
    () => filterRecord({ ...actualRecord, ...overrideRecord }),
    [actualRecord, overrideRecord],
  );

  return (
    <SimpleForm
      record={record}
      maxWidth={1280}
      resolver={zodResolver(zControllableUnitSuspension)}
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
