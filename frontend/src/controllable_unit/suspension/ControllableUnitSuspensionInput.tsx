import {
  required,
  SelectInput,
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
      toolbar={<Toolbar saveAlwaysEnabled />}
    >
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <AutocompleteReferenceInput
            source="controllable_unit_id"
            reference="controllable_unit"
            readOnly={!!record?.controllable_unit_id}
          />
        </InputStack>
        <InputStack direction="row" flexWrap="wrap">
          {!isSystemOperator && (
            <PartyReferenceInput
              source="impacted_system_operator_id"
              filter={{ type: "system_operator" }}
            />
          )}
        </InputStack>
        <Typography variant="h6" gutterBottom>
          Controllable unit suspension process
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <SelectInput
            source="reason"
            validate={required()}
            choices={["compromises_safe_operation", "other"]}
          />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
