import { TextField, Title, RecordContextProvider, Labeled } from "react-admin";
import { useLocation } from "react-router-dom";
import { Typography, Stack, Card, Box } from "@mui/material";

// page to display results of entity lookup operation
export const EntityLookupResult = () => {
  const {
    state: { result },
  } = useLocation();

  return (
    <RecordContextProvider value={result}>
      <Stack spacing={2}>
        <Box m={1} />
        <Title title="Entity Lookup Result" />
        <Typography variant="h6">Technical information</Typography>
        <Card>
          <Box m={2}>
            <Labeled>
              <TextField source="entity_id" label="Entity ID" />
            </Labeled>
          </Box>
        </Card>
      </Stack>
    </RecordContextProvider>
  );
};
