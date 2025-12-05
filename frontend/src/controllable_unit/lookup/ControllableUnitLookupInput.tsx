import {
  required,
  SimpleForm,
  TextInput,
  Toolbar as RAToolbar,
  useNotify,
} from "react-admin";
import { Typography, Stack, Button, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import UndoIcon from "@mui/icons-material/Undo";
import { useFormContext } from "react-hook-form";
import { InputStack } from "../../auth";
import { callControllableUnitLookup } from "../../generated-client";
import { zControllableUnitLookupRequest } from "../../generated-client/zod.gen";
import { zodResolver } from "@hookform/resolvers/zod";

const Toolbar = () => {
  const navigate = useNavigate();

  return (
    <RAToolbar>
      <Button
        color="primary"
        variant="contained"
        startIcon={<TravelExploreIcon />}
        type="submit"
      >
        Lookup
      </Button>
      <Box width="1em" />
      <Button
        color="inherit"
        variant="contained"
        startIcon={<UndoIcon />}
        onClick={() => navigate(-1)}
      >
        Cancel
      </Button>
    </RAToolbar>
  );
};

const ControllableUnitLookupForm = () => {
  const { watch } = useFormContext();
  const controllableUnit = watch("controllable_unit");
  const accountingPoint = watch("accounting_point");

  const accountingPointDisabled =
    controllableUnit && controllableUnit.length > 0;
  const controllableUnitDisabled =
    accountingPoint && accountingPoint.length > 0;

  return (
    <InputStack direction="row" flexWrap="wrap">
      <TextInput source="end_user" validate={required()} />
      <TextInput source="accounting_point" disabled={accountingPointDisabled} />
      <TextInput
        source="controllable_unit"
        disabled={controllableUnitDisabled}
      />
    </InputStack>
  );
};

// page to enter data required for controllable unit lookup
export const ControllableUnitLookupInput = () => {
  const { state } = useLocation();
  const defaultControllableUnit = state?.controllable_unit as
    | string
    | undefined;

  const navigate = useNavigate();
  const notify = useNotify();

  // launch lookup request
  const lookup = async (data: unknown) => {
    const lookupRequest = zControllableUnitLookupRequest.safeParse(data);

    if (!lookupRequest.success) {
      // You should not end up here since zod validation is done before submission
      notify("Invalid input data", { type: "error" });
      return;
    }

    const response = await callControllableUnitLookup({
      body: lookupRequest.data,
    });

    if (response.error) {
      // error, just notify the user like in the other pages
      notify(response.error.message, { type: "error" });
      return;
    }
    // navigate to the dedicated show page for the result
    return navigate("/controllable_unit/lookup/result", {
      state: { result: response.data },
    });
  };

  return (
    <SimpleForm
      maxWidth={1280}
      onSubmit={lookup}
      defaultValues={{ controllable_unit: defaultControllableUnit }}
      // React admin types does not handle required types in validation resolvers, but it works at runtime.
      resolver={zodResolver(zControllableUnitLookupRequest) as any}
      toolbar={<Toolbar />}
    >
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Lookup a controllable unit
        </Typography>
        <p>
          This operation allows you to get information about one or several
          controllable units registered in the Flexibility Information System,
          in order to, for instance, create controllable unit service provider
          resources.
        </p>
        <p>
          Input the business ID of the end user behind the controllable unit,
          and either the GSRN of the accounting point or the business ID of the
          controllable unit.
        </p>
        <ControllableUnitLookupForm />
      </Stack>
    </SimpleForm>
  );
};
