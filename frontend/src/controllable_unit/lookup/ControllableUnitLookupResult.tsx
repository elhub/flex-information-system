import {
  TextField,
  SimpleShowLayout,
  Title,
  RecordContextProvider,
  Button,
  useRecordContext,
  ReferenceField,
} from "react-admin";
import { Link, useLocation } from "react-router-dom";
import { Typography, Stack, Card, Box } from "@mui/material";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { FieldStack } from "../../auth";

// button to redirect to the CU-SP create page with the CU ID pre-filled
const CreateCUSPButton = () => {
  const record = useRecordContext();
  return (
    <Button
      component={Link}
      to={`/controllable_unit_service_provider/create`}
      startIcon={<BookmarkAddIcon />}
      // input a CU ID instead of from a list of names (cf. CUSP input)
      state={{ controllable_unit_id: record?.id, cuIDAsNumber: true }}
      label="Manage this controllable unit"
    />
  );
};

// local list of TRs for each CU
const TechnicalResourceList = ({ data }: any) => (
  <TableContainer component={Paper}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell align="right">Name</TableCell>
          <TableCell align="right">Details</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((record: any) => (
          <TableRow key={record.id}>
            <TableCell component="th" scope="row">
              {record.id}
            </TableCell>
            <TableCell align="right">{record.name}</TableCell>
            <TableCell align="right">{record.details}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

// one instance of this component per CU found in the lookup operation
const ControllableUnitLookupResultItem = () => {
  const record = useRecordContext()!;

  return (
    <Card>
      <SimpleShowLayout>
        <FieldStack
          spacing={2}
          direction="row"
          flexWrap="wrap"
          allowAll
          resource="controllable_unit_lookup_response"
        >
          <TextField source="id" label="ID" />
          <TextField source="business_id" label="Business ID" />
          <TextField source="accounting_point_id" label="Accounting point ID" />
          <ReferenceField
            source="accounting_point_id"
            reference="accounting_point"
          >
            <TextField source="business_id" />
          </ReferenceField>
          <TextField source="name" />
        </FieldStack>
        <FieldStack
          spacing={2}
          allowAll
          resource="controllable_unit_lookup_response"
        >
          <TechnicalResourceList
            source="technical_resources"
            data={record.technical_resources}
          />
        </FieldStack>
        <CreateCUSPButton />
      </SimpleShowLayout>
    </Card>
  );
};

// page to display results of controllable unit lookup operation
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
