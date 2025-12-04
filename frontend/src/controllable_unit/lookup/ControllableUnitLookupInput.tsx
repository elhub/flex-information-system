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
import { useEffect } from "react";
import { callControllableUnitLookup } from "../../generated-client";

const Toolbar = () => {
  const navigate = useNavigate();
  const { getValues } = useFormContext();
  const notify = useNotify();

  // launch lookup request
  const lookup = async () => {
    let body: any = {};
    const values = getValues();

    // do not put undefined/null into the request body
    for (const key in values) {
      if (values[key]) {
        body[key] = values[key];
      }
    }
    const response = await callControllableUnitLookup({
      body: {
        end_user: body.end_user,
        accounting_point: body.accounting_point,
        controllable_unit: body.controllable_unit,
      },
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
    <RAToolbar>
      <Button
        color="primary"
        variant="contained"
        startIcon={<TravelExploreIcon />}
        onClick={lookup}
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

// page to enter data required for controllable unit lookup
export const ControllableUnitLookupInput = () => {
  const { state } = useLocation();

  const ControllableUnitLookupForm = () => {
    const { getValues, setValue } = useFormContext();

    useEffect(() => {
      if (state?.controllable_unit) {
        setValue("controllable_unit", state?.controllable_unit);
      }
    });

    const values = getValues();
    const accountingPointDefined =
      values.accounting_point && values.accounting_point.length > 0;
    const controllableUnitDefined =
      values.controllable_unit && values.controllable_unit.length > 0;

    return (
      <InputStack
        direction="row"
        flexWrap="wrap"
        allowAll
        resource="controllable_unit_lookup_request"
      >
        <TextInput source="end_user" validate={required()} />
        <TextInput
          source="accounting_point"
          disabled={controllableUnitDefined}
        />
        <TextInput
          source="controllable_unit"
          disabled={accountingPointDefined}
        />
      </InputStack>
    );
  };

  return (
    <SimpleForm maxWidth={1280} toolbar={<Toolbar />}>
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
