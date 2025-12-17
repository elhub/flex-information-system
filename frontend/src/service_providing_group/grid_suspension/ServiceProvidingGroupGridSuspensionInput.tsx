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
import { zServiceProvidingGroupGridSuspension } from "../../generated-client/zod.gen";
import { zodResolver } from "@hookform/resolvers/zod";

// keep only the fields that map to the UI
const filterRecord = ({
  service_providing_group_id,
  impacted_system_operator_id,
  reason,
}: any) => ({
  service_providing_group_id,
  impacted_system_operator_id,
  reason,
});

// common layout to create and edit pages
export const ServiceProvidingGroupGridSuspensionInput = () => {
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
      resolver={zodResolver(zServiceProvidingGroupGridSuspension)}
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
            label="field.service_providing_group_grid_suspension.service_providing_group_id"
            readOnly={!!record?.service_providing_group_id}
          />
        </InputStack>
        <InputStack direction="row" flexWrap="wrap">
          {!isSystemOperator && (
            <PartyReferenceInput
              source="impacted_system_operator_id"
              label="field.service_providing_group_grid_suspension.impacted_system_operator_id"
              filter={{ type: "system_operator" }}
            />
          )}
        </InputStack>
        <Typography variant="h6" gutterBottom>
          Grid suspension process
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <SelectInput
            source="reason"
            label="field.service_providing_group_grid_suspension.reason"
            validate={required()}
            choices={[
              "breach_of_conditions",
              "significant_group_change",
              "other",
            ]}
          />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
