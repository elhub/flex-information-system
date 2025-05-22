import { SimpleForm, useRecordContext } from "react-admin";
import { Typography, Box, Stack } from "@mui/material";
import { AutocompleteReferenceInput, InputStack } from "../../auth";
import { useLocation } from "react-router-dom";
import { Toolbar } from "../../components/Toolbar";
import { ValidTimeTooltip } from "../../components/ValidTimeTooltip";
import { MidnightDateInput } from "../../components/datetime";

// keep only the fields that map to the UI
const filterRecord = ({
  service_providing_group_id,
  controllable_unit_id,
  valid_from,
  valid_to,
}: any) => ({
  service_providing_group_id,
  controllable_unit_id,
  valid_from,
  valid_to,
});

// common layout to create and edit pages
export const ServiceProvidingGroupMembershipInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();
  // priority to the restored values if they exist, otherwise normal edit mode
  const record = filterRecord({ ...actualRecord, ...overrideRecord });
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
            source="service_providing_group_id"
            reference="service_providing_group"
            readOnly={!!overrideRecord?.service_providing_group_id}
          />
          <AutocompleteReferenceInput
            source="controllable_unit_id"
            reference="controllable_unit"
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
          <MidnightDateInput source="valid_from" />
          <MidnightDateInput source="valid_to" />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
