import {
  required,
  SelectInput,
  SimpleForm,
  TextInput,
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
import { ProductTypeArrayInput } from "../../product_type/components";
import { useMemo } from "react";

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
export const ServiceProvidingGroupProductApplicationInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();
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
            readOnly={!!record?.service_providing_group_id}
          />
          <PartyReferenceInput
            source="procuring_system_operator_id"
            filter={{ type: "system_operator" }}
          />
          <ProductTypeArrayInput
            source="product_type_ids"
            validate={required()}
          />
        </InputStack>
        <Typography variant="h6" gutterBottom>
          Application process
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <SelectInput
            source="status"
            validate={required()}
            choices={[
              "requested",
              "prequalification_pending",
              "in_progress",
              "temporary_qualified",
              "prequalified",
              "verified",
              "rejected",
            ]}
          />
          <TextInput
            source="notes"
            multiline={true}
            minRows={3}
            sx={{ minWidth: { xs: 300, md: 500 } }}
          />
          <DateTimeInput source="prequalified_at" />
          <DateTimeInput source="verified_at" />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
