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
import { apiURL } from "../../httpConfig";
import { useFormContext } from "react-hook-form";
import { InputStack } from "../../auth";
import { useEffect } from "react";

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

    const response = await fetch(apiURL + "/controllable_unit/lookup", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(body),
    });
    const lookupResult = await response.json();

    if (!response.ok) {
      // error, just notify the user like in the other pages
      notify(lookupResult.message, { type: "error" });
    } else {
      // navigate to the dedicated show page for the result
      navigate("/controllable_unit/lookup/result", {
        state: { result: lookupResult },
      });
    }
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
  const {
    state: { controllable_unit },
  } = useLocation();

  const ControllableUnitLookupForm = () => {
    const { getValues, setValue } = useFormContext();

    useEffect(() => {
      if (controllable_unit) {
        setValue("controllable_unit", controllable_unit);
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
        <p>Mandatory : end user and exactly one of the other fields</p>
        <ControllableUnitLookupForm />
      </Stack>
    </SimpleForm>
  );
};
