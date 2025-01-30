import {
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  useGetList,
  useRecordContext,
  useTranslateLabel,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { Toolbar } from "../../Toolbar";
import { useLocation } from "react-router-dom";
import {
  PartyReferenceInput,
  InputStack,
  AutocompleteReferenceInput,
} from "../../auth";
import { DateTimeInput } from "../../datetime";

// keep only the fields that map to the UI
const filterRecord = ({
  service_providing_group_id,
  procuring_system_operator_id,
  product_type_id,
  status,
  notes,
  last_prequalified,
  last_verified,
}: any) => ({
  service_providing_group_id,
  procuring_system_operator_id,
  product_type_id,
  status,
  notes,
  last_prequalified,
  last_verified,
});

// common layout to create and edit pages
export const ServiceProvidingGroupProductApplicationInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();
  const record = filterRecord({ ...actualRecord, ...overrideRecord });

  const { data } = useGetList("product_type");
  const translateLabel = useTranslateLabel();

  const productTypes = data?.map((product_type) => {
    return {
      id: product_type.id,
      name: translateLabel({ source: product_type.business_id }),
    };
  });
  productTypes?.sort((pt1, pt2) => pt1.id - pt2.id);

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
          <SelectInput
            source="product_type_id"
            validate={required()}
            choices={productTypes}
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
          <DateTimeInput source="last_prequalified" />
          <DateTimeInput source="last_verified" />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
