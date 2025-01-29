import {
  DateTimeInput,
  SimpleForm,
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
import { Toolbar } from "../../Toolbar";
import { ValidTimeTooltip } from "../../ValidTimeTooltip";

// keep only the fields that map to the UI
const filterRecord = ({
  controllable_unit_id,
  service_provider_id,
  valid_from,
  valid_to,
}: any) => ({
  controllable_unit_id,
  service_provider_id,
  valid_from,
  valid_to,
});

// common layout to create and edit pages
export const ControllableUnitServiceProviderInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();

  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  if (identityLoading) return <>Loading...</>;

  // priority to the restored values if they exist, otherwise normal edit mode
  const record = filterRecord({ ...actualRecord, ...overrideRecord });

  const isServiceProvider = identity?.role == "flex_service_provider";
  if (isServiceProvider) {
    record["service_provider_id"] = identity?.party_id;
  }

  return (
    <SimpleForm
      record={record}
      maxWidth={1280}
      /* By default, the save button waits for an edit to be done to become
         enabled. It was made to prevent empty edit calls.
         In the case of a restore, we don't do any edit, as the modifications
         we will apply are already brought into the fields by the state passed
         into the restore button. So the save button is disabled, but we still
         want to be able to hit it right away after clicking restore. */
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
            readOnly
          />
          <PartyReferenceInput
            source="service_provider_id"
            readOnly={isServiceProvider}
          />
        </InputStack>

        <Stack direction="row" flexWrap="wrap">
          <Typography variant="h6" gutterBottom>
            Valid time
          </Typography>
          <Box m={1} />
          <ValidTimeTooltip />
        </Stack>
        <InputStack direction="row" flexWrap="wrap">
          <DateTimeInput source="valid_from" />
          <DateTimeInput source="valid_to" />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
