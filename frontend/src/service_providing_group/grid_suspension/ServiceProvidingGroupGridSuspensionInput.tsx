import {
  required,
  SelectInput,
  SimpleForm,
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
import { DateTimeInput } from "../../components/datetime";

// keep only the fields that map to the UI
const filterRecord = ({
  service_providing_group_id,
  procuring_system_operator_id,
  product_type_ids,
  status,
  notes,
  prequalified_at,
  verified_at,
}: any) => ({
  service_providing_group_id,
  procuring_system_operator_id,
  product_type_ids,
  status,
  notes,
  prequalified_at,
  verified_at,
});

// common layout to create and edit pages
export const ServiceProvidingGroupGridSuspensionInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();
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
            readOnly={!!record?.service_providing_group_id}
          />
          <PartyReferenceInput
            source="impacted_system_operator_id"
            filter={{ type: "system_operator" }}
          />
        </InputStack>
        <Typography variant="h6" gutterBottom>
          Grid suspension process
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <SelectInput
            source="reason"
            validate={required()}
            choices={[
              "breach_of_conditions",
              "significant_alteration",
              "other",
            ]}
          />
          <DateTimeInput source="recorded_at" />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
