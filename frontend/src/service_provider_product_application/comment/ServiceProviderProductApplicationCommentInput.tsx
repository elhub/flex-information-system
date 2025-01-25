import {
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  useRecordContext,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { InputStack } from "../../auth";
import { useLocation } from "react-router-dom";
import { Toolbar } from "../../Toolbar";

// keep only the fields that map to the UI
const filterRecord = ({
  service_provider_product_application_id,
  visibility,
  content,
}: any) => ({
  service_provider_product_application_id,
  visibility,
  content,
});

// common layout to create and edit pages
export const ServiceProviderProductApplicationCommentInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();
  // priority to the restored values if they exist, otherwise normal edit mode
  const record: any = filterRecord({ ...actualRecord, ...overrideRecord });

  return (
    <SimpleForm
      record={record}
      maxWidth={1280}
      toolbar={<Toolbar saveAlwaysEnabled={!!overrideRecord?.id} />}
    >
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <TextInput
            source="service_provider_product_application_id"
            readOnly
          />
          <SelectInput
            source="visibility"
            validate={required()}
            defaultValue="same_party"
            choices={["same_party", "same_party_type", "any_party"]}
          />
        </InputStack>

        <Typography variant="h6" gutterBottom>
          Content
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <TextInput
            source="content"
            multiline={true}
            minRows={3}
            sx={{ minWidth: { xs: 300, md: 500 } }}
          />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
