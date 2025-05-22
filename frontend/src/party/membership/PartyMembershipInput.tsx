import { SimpleForm, useRecordContext } from "react-admin";
import { Typography, Stack } from "@mui/material";
import {
  AutocompleteReferenceInput,
  PartyReferenceInput,
  InputStack,
} from "../../auth";
import { useLocation } from "react-router-dom";
import { Toolbar } from "../../components/Toolbar";

// keep only the fields that map to the UI
const filterRecord = ({ party_id, entity_id }: any) => ({
  party_id,
  entity_id,
});

// common layout to create and edit pages
export const PartyMembershipInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();
  // priority to the restored values if they exist, otherwise normal edit mode
  const record = filterRecord({ ...actualRecord, ...overrideRecord });
  return (
    <SimpleForm
      record={record}
      maxWidth={1280}
      toolbar={overrideRecord?.id ? <Toolbar saveAlwaysEnabled /> : undefined}
    >
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <PartyReferenceInput source="party_id" noFilter readOnly />
          <AutocompleteReferenceInput source="entity_id" reference="entity" />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
