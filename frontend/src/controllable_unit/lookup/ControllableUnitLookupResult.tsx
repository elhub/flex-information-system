import {
  TextField,
  SimpleShowLayout,
  Title,
  RecordContextProvider,
  Button,
  useTranslate,
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
import { zControllableUnitLookup } from "../../generated-client/zod.gen";
import { ControllableUnitLookup } from "../../generated-client";
import { ControllableUnitServiceProviderLocationState } from "../service_provider/ControllableUnitServiceProviderInput";
import { ControllableUnitInputLocationState } from "../ControllableUnitInput";

type LookupResponse_ControllableUnit =
  ControllableUnitLookup["controllable_units"][number];
type LookupResponse_TechnicalResource =
  LookupResponse_ControllableUnit["technical_resources"][number];

const CreateCUButton = ({
  accountingPointId,
  endUserId,
}: {
  accountingPointId: number;
  endUserId?: number;
}) => {
  const cuspLocationState: ControllableUnitInputLocationState = {
    controllableUnit: {
      accounting_point_id: accountingPointId,
    },
    endUserId: endUserId,
  };

  return (
    <Button
      component={Link}
      to={`/controllable_unit/create`}
      startIcon={<BookmarkAddIcon />}
      state={cuspLocationState}
      label="Create a new controllable unit"
    />
  );
};
// local list of TRs for each CU
const TechnicalResourceList = ({
  technical_resources,
}: {
  technical_resources: LookupResponse_TechnicalResource[];
}) => {
  const translate = useTranslate();

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{translate("field.technical_resource.id")}</TableCell>
            <TableCell align="right">
              {translate("field.technical_resource.name")}
            </TableCell>
            <TableCell align="right">
              {translate("field.technical_resource.details")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {technical_resources.map((tr: LookupResponse_TechnicalResource) => (
            <TableRow key={tr.id}>
              <TableCell component="th" scope="row">
                {tr.id}
              </TableCell>
              <TableCell align="right">{tr.name}</TableCell>
              <TableCell align="right">{tr.details}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// one instance of this component per CU found in the lookup operation
const ControllableUnitLookupResultItem = ({
  controllableUnit,
  endUserId,
}: {
  controllableUnit: LookupResponse_ControllableUnit;
  endUserId: number;
}) => {
  const cuspLocationState: ControllableUnitServiceProviderLocationState = {
    cusp: {
      controllable_unit_id: controllableUnit.id,
      end_user_id: endUserId,
    },
    cuIDAsNumber: true,
  };

  return (
    <Card>
      <SimpleShowLayout>
        <FieldStack
          spacing={2}
          direction="row"
          flexWrap="wrap"
          allowAll
          hideTooltips
        >
          <TextField source="id" label="field.controllable_unit.id" />
          <TextField
            source="business_id"
            label="field.controllable_unit.business_id"
          />
          <TextField source="name" label="field.controllable_unit.name" />
        </FieldStack>
        <FieldStack spacing={2} allowAll hideTooltips>
          <TechnicalResourceList
            technical_resources={controllableUnit.technical_resources}
          />
        </FieldStack>
        <Button
          component={Link}
          to={`/controllable_unit_service_provider/create`}
          startIcon={<BookmarkAddIcon />}
          // input a CU ID instead of from a list of names (cf. CUSP input)
          state={cuspLocationState}
          label="Manage this controllable unit"
        />
      </SimpleShowLayout>
    </Card>
  );
};

// page to display results of controllable unit lookup operation
export const ControllableUnitLookupResult = () => {
  const {
    state: { result },
  } = useLocation();
  const controllableUnitLookUpResult = zControllableUnitLookup.parse(
    result ?? {},
  );

  return (
    <RecordContextProvider value={controllableUnitLookUpResult}>
      <Stack spacing={2}>
        <Box m={1} />
        <Title title="Controllable Unit Lookup Result" />
        <Typography variant="h6">Technical information</Typography>
        <Stack direction="row" spacing={2}>
          <Card>
            <Box m={2}>
              <Stack spacing={2}>
                <Typography variant="h6">Accounting point</Typography>
                <FieldStack
                  spacing={2}
                  direction="row"
                  flexWrap="wrap"
                  allowAll
                  hideTooltips
                >
                  <TextField
                    source="accounting_point.id"
                    label="field.accounting_point.id"
                  />
                  <TextField
                    source="accounting_point.business_id"
                    label="field.accounting_point.business_id"
                  />
                </FieldStack>
              </Stack>
            </Box>
          </Card>
          <Card>
            <Box m={2}>
              <Stack spacing={2}>
                <Typography variant="h6">End user</Typography>
                <FieldStack
                  spacing={2}
                  direction="row"
                  flexWrap="wrap"
                  allowAll
                  hideTooltips
                >
                  <TextField source="end_user.id" label="field.party.id" />
                </FieldStack>
              </Stack>
            </Box>
          </Card>
        </Stack>
        <CreateCUButton
          accountingPointId={controllableUnitLookUpResult.accounting_point.id}
          endUserId={controllableUnitLookUpResult.end_user.id}
        />
        {controllableUnitLookUpResult.controllable_units.length == 0 ? (
          <Typography variant="h6">No controllable units found</Typography>
        ) : (
          <>
            <Typography variant="h6">Controllable units found</Typography>
            <Stack spacing={2}>
              {controllableUnitLookUpResult.controllable_units.map((record) => (
                <RecordContextProvider key={record.id} value={record}>
                  <ControllableUnitLookupResultItem
                    controllableUnit={record}
                    endUserId={controllableUnitLookUpResult.end_user.id}
                  />
                </RecordContextProvider>
              ))}
            </Stack>
          </>
        )}
      </Stack>
    </RecordContextProvider>
  );
};
