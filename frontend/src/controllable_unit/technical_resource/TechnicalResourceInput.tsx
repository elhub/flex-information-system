import { SimpleForm, TextInput, useRecordContext } from "react-admin";
import { Typography, Stack } from "@mui/material";
import { AutocompleteReferenceInput, InputStack } from "../../auth";
import { useLocation } from "react-router-dom";
import { Toolbar } from "../../components/Toolbar";
import { useMemo } from "react";
import { zTechnicalResource } from "../../generated-client/zod.gen";
import { zodResolver } from "@hookform/resolvers/zod";

const filterRecord = ({ name, controllable_unit_id, details }: any) => ({
  name,
  controllable_unit_id,
  details,
});

// common layout to create and edit pages
export const TechnicalResourceInput = () => {
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
      resolver={zodResolver(zTechnicalResource)}
      toolbar={<Toolbar />}
    >
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <TextInput source="name" label="field.technical_resource.name" />
          <AutocompleteReferenceInput
            source="controllable_unit_id"
            reference="controllable_unit"
            label="field.technical_resource.controllable_unit_id"
            readOnly
          />
          <TextInput
            source="details"
            label="field.technical_resource.details"
            multiline={true}
            minRows={3}
            sx={{ minWidth: { xs: 300, md: 500 } }}
          />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
