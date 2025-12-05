import { NumberInput, SimpleForm, useRecordContext } from "react-admin";
import { Typography, Stack } from "@mui/material";
import {
  AutocompleteReferenceInput,
  PartyReferenceInput,
  InputStack,
} from "../../auth";
import { useLocation } from "react-router-dom";
import { Toolbar } from "../../components/Toolbar";
import { ScopesInput } from "../../components/scopes";
import { useMemo } from "react";

// keep only the fields that map to the UI
const filterRecord = ({ party_id, entity_id, scopes }: any) => ({
  party_id,
  entity_id,
  scopes,
});

// common layout to create and edit pages
export const PartyMembershipInput = () => {
  const { state: overrideRecord } = useLocation();

  const actualRecord = useRecordContext();
  // priority to the restored values if they exist, otherwise normal edit mode
  // Memoize the combined record to avoid re-renders causing errors
  const record = useMemo(
    () => filterRecord({ ...actualRecord, ...overrideRecord }),
    [actualRecord, overrideRecord],
  );

  return (
    <SimpleForm record={record} maxWidth={1280} toolbar={<Toolbar />}>
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <PartyReferenceInput source="party_id" readOnly />
          {overrideRecord?.showTechnicalEntityID ? (
            <NumberInput source="entity_id" readOnly />
          ) : (
            <AutocompleteReferenceInput source="entity_id" reference="entity" />
          )}
        </InputStack>
        <ScopesInput source="scopes" />
      </Stack>
    </SimpleForm>
  );
};
