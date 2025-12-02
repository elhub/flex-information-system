import {
  NumberInput,
  required,
  SimpleForm,
  TextInput,
  useGetIdentity,
  useRecordContext,
} from "react-admin";
import { Typography, Box, Stack } from "@mui/material";
import {
  AutocompleteReferenceInput,
  PartyReferenceInput,
  InputStack,
} from "../../auth";
import { useLocation } from "react-router-dom";
import { Toolbar } from "../../components/Toolbar";
import { ValidTimeTooltip } from "../../components/ValidTimeTooltip";
import { MidnightDateInput } from "../../components/datetime";
import { useMemo } from "react";
import { countDefinedValues } from "../../util";

// keep only the fields that map to the UI
const filterRecord = ({
  controllable_unit_id,
  service_provider_id,
  end_user_id,
  contract_reference,
  valid_from,
  valid_to,
}: any) => ({
  controllable_unit_id,
  service_provider_id,
  end_user_id,
  contract_reference,
  valid_from,
  valid_to,
});

// common layout to create and edit pages
export const ControllableUnitServiceProviderInput = () => {
  const { state: overrideRecord } = useLocation();
  const hasOverride =
    countDefinedValues(filterRecord({ ...overrideRecord })) > 0;
  const actualRecord = useRecordContext();

  // priority to the restored values if they exist, otherwise normal edit mode
  // Memoize the combined record to avoid re-renders causing errors
  const record = useMemo(
    () => filterRecord({ ...actualRecord, ...overrideRecord }),
    [actualRecord, overrideRecord],
  );

  const { data: identity, isLoading: identityLoading } = useGetIdentity();

  // if we came to this page as a user who cannot see the CU, we want to input a
  // CU ID, instead of using the autocomplete component that works from the list
  // of readable CUs
  const cuIDAsNumber: boolean = !!overrideRecord?.cuIDAsNumber;

  const isServiceProvider = identity?.role == "flex_service_provider";

  const finalRecord = useMemo(() => {
    const baseRecord = { ...record };
    if (isServiceProvider) {
      baseRecord.service_provider_id = identity?.partyID;
    }
    return baseRecord;
  }, [record, isServiceProvider, identity?.partyID]);

  if (identityLoading) return <>Loading...</>;

  return (
    <SimpleForm
      record={finalRecord}
      maxWidth={1280}
      /* By default, the save button waits for an edit to be done to become
         enabled. It was made to prevent empty edit calls.
         In the case of a restore, we don't do any edit, as the modifications
         we will apply are already brought into the fields by the state passed
         into the restore button. So the save button is disabled, but we still
         want to be able to hit it right away after clicking restore. */
      toolbar={<Toolbar saveAlwaysEnabled={hasOverride} />}
    >
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          {cuIDAsNumber ? (
            <NumberInput source="controllable_unit_id" />
          ) : (
            <AutocompleteReferenceInput
              source="controllable_unit_id"
              reference="controllable_unit"
              readOnly
            />
          )}
          <PartyReferenceInput
            source="service_provider_id"
            readOnly={isServiceProvider}
          />
          <NumberInput source="end_user_id" />
        </InputStack>
        <InputStack direction="row" flexWrap="wrap">
          <TextInput source="contract_reference" validate={required()} />
        </InputStack>
        <Stack direction="row" flexWrap="wrap">
          <Typography variant="h6" gutterBottom>
            Valid time
          </Typography>
          <Box m={1} />
          <ValidTimeTooltip />
        </Stack>
        <InputStack direction="row" flexWrap="wrap">
          <MidnightDateInput source="valid_from" />
          <MidnightDateInput source="valid_to" />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
