import {
  required,
  SimpleForm,
  TextInput,
  Toolbar as RAToolbar,
  useNotify,
} from "react-admin";
import { Typography, Stack, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import UndoIcon from "@mui/icons-material/Undo";
import { apiURL } from "../../httpConfig";
import { useFormContext } from "react-hook-form";

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
export const ControllableUnitLookupInput = () => (
  <SimpleForm maxWidth={1280} toolbar={<Toolbar />}>
    <Stack direction="column" spacing={1}>
      <Typography variant="h6" gutterBottom>
        Lookup a controllable unit
      </Typography>
      <Stack direction="row" flexWrap="wrap">
        <TextInput
          label="End user business ID"
          source="end_user_business_id"
          validate={required()}
        />
        <TextInput label="Accounting point ID" source="accounting_point_id" />
        <TextInput
          label="Controllable unit business ID"
          source="controllable_unit_business_id"
        />
      </Stack>
    </Stack>
  </SimpleForm>
);
