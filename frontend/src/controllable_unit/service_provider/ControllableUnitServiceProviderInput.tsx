import {
  NumberInput,
  required,
  SimpleForm,
  TextInput,
  useGetIdentity,
  useRecordContext,
  UserIdentity,
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
import {
  formatDateToMidnightISO,
  MidnightDateInput,
} from "../../components/datetime";
import { countDefinedValues } from "../../util";
import { zControllableUnitServiceProvider } from "../../generated-client/zod.gen";
import { ControllableUnitServiceProvider } from "../../generated-client";
import { zodResolver } from "@hookform/resolvers/zod";

export type ControllableUnitServiceProviderLocationState = {
  cusp?: Partial<ControllableUnitServiceProvider>;
  // if we came to this page as a user who cannot see the CU, we want to input a
  // CU ID, instead of using the autocomplete component that works from the list
  // of readable CUs
  cuIDAsNumber?: boolean;
};

// common layout to create and edit pages
export const ControllableUnitServiceProviderInput = () => {
  const { state } = useLocation();
  const { cusp, cuIDAsNumber } =
    state as ControllableUnitServiceProviderLocationState;
  const actualRecord = useRecordContext<ControllableUnitServiceProvider>();

  const overrideRecord =
    zControllableUnitServiceProvider.safeParse(cusp).data || {};
  const hasOverride = countDefinedValues(overrideRecord) > 0;

  const overridenRecord = {
    ...actualRecord,
    ...overrideRecord,
    valid_from: overrideRecord.valid_from
      ? formatDateToMidnightISO(overrideRecord.valid_from)
      : actualRecord?.valid_from,
  } as ControllableUnitServiceProvider;

  const { data: identity, isLoading: identityLoading } = useGetIdentity();

  if (identityLoading) return <>Loading...</>;

  return (
    <ControllableUnitServiceProviderForm
      record={overridenRecord}
      hasOverride={hasOverride}
      cuIDAsNumber={!!cuIDAsNumber}
      identity={identity}
    />
  );
};

const ControllableUnitServiceProviderForm = ({
  record,
  hasOverride,
  cuIDAsNumber,
  identity,
}: {
  record: ControllableUnitServiceProvider;
  hasOverride: boolean;
  cuIDAsNumber: boolean;
  identity: UserIdentity | undefined;
}) => {
  const isServiceProvider = identity?.role == "flex_service_provider";
  const recordWithPartyId = isServiceProvider
    ? {
        ...record,
        service_provider_id: identity?.partyID,
      }
    : record;

  return (
    <SimpleForm
      record={recordWithPartyId}
      maxWidth={1280}
      resolver={zodResolver(zControllableUnitServiceProvider)}
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
