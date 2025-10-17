import {
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  useRecordContext,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import {
  AutocompleteReferenceInput,
  InputStack,
  PartyReferenceInput,
  useCreateOrUpdate,
} from "../../auth";
import { useLocation } from "react-router-dom";
import { Toolbar } from "../../components/Toolbar";
import { DateTimeInput } from "../../components/datetime";
import { useMemo } from "react";

// keep only the fields that map to the UI
const filterRecord = ({
  service_providing_group_id,
  impacted_system_operator_id,
  status,
  notes,
  prequalified_at,
}: any) => ({
  service_providing_group_id,
  impacted_system_operator_id,
  status,
  notes,
  prequalified_at,
});

// common layout to create and edit pages
export const ServiceProvidingGroupGridPrequalificationInput = () => {
  const createOrUpdate = useCreateOrUpdate();
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
            readOnly={record?.service_providing_group_id}
          />
          <PartyReferenceInput
            source="impacted_system_operator_id"
            filter={{ type: "system_operator" }}
          />
          <SelectInput
            source="status"
            validate={createOrUpdate == "update" ? required() : undefined}
            choices={[
              "requested",
              "in_progress",
              "conditionally_approved",
              "approved",
              "not_approved",
            ]}
          />
          <TextInput
            source="notes"
            multiline={true}
            minRows={3}
            sx={{ minWidth: { xs: 300, md: 500 } }}
          />
          <DateTimeInput source="prequalified_at" />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
