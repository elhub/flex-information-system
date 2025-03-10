import {
  TextField,
  SimpleShowLayout,
  FunctionField,
  Title,
  RecordContextProvider,
} from "react-admin";
import { useLocation } from "react-router-dom";
import { Typography, Stack, Card, Box } from "@mui/material";

const ControllableUnitLookupResultItem = () => (
  <Card>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="business_id" label="Business ID" />
      <TextField source="accounting_point_id" label="Accounting point ID" />
      <TextField source="name" />
      <TextField source="end_user_id" label="End user ID" />
      <FunctionField
        source="technical_resources"
        render={(record) => JSON.stringify(record.technical_resources)}
      />
    </SimpleShowLayout>
  </Card>
);

export const ControllableUnitLookupResult = () => {
  const {
    state: { result },
  } = useLocation();

  return (
    <>
      <Title title="Controllable Unit Lookup Result" />
      <Box m={1} />
      <Typography variant="h6">Controllable units found</Typography>
      <Box m={1} />
      <Stack spacing={2}>
        {result.map((record: any) => (
          <RecordContextProvider key={record.id} value={record}>
            <ControllableUnitLookupResultItem />
          </RecordContextProvider>
        ))}
      </Stack>
    </>
  );
};
