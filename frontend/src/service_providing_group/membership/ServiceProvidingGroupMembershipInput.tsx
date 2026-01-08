import { SimpleForm, useRecordContext } from "react-admin";
import { Typography, Box, Stack } from "@mui/material";
import { AutocompleteReferenceInput, InputStack } from "../../auth";
import { useLocation } from "react-router-dom";
import { Toolbar } from "../../components/Toolbar";
import { ValidTimeTooltip } from "../../components/ValidTimeTooltip";
import { MidnightDateInput } from "../../components/datetime";
import { useMemo } from "react";
import { zServiceProvidingGroupMembershipCreateRequest } from "../../generated-client/zod.gen";
import { unTypedZodResolver } from "../../util";

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
  // Memoize the combined record to avoid re-renders causing errors
  const record = useMemo(
    () => filterRecord({ ...actualRecord, ...overrideRecord }),
    [actualRecord, overrideRecord],
  );

  return (
    <SimpleForm
      record={record}
      maxWidth={1280}
      resolver={unTypedZodResolver(
        zServiceProvidingGroupMembershipCreateRequest,
      )}
      toolbar={<Toolbar />}
    >
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <AutocompleteReferenceInput
            source="service_providing_group_id"
            reference="service_providing_group"
            label="field.service_providing_group_membership.service_providing_group_id"
            readOnly={!!overrideRecord?.service_providing_group_id}
          />
          <AutocompleteReferenceInput
            source="controllable_unit_id"
            reference="controllable_unit"
            label="field.service_providing_group_membership.controllable_unit_id"
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
          <MidnightDateInput
            source="valid_from"
            label="field.service_providing_group_membership.valid_from"
          />
          <MidnightDateInput
            source="valid_to"
            label="field.service_providing_group_membership.valid_to"
          />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
