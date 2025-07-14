import {
  required,
  SimpleForm,
  TextInput,
  Toolbar as RAToolbar,
  useNotify,
  SelectInput,
} from "react-admin";
import { Typography, Stack, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import UndoIcon from "@mui/icons-material/Undo";
import { apiURL } from "../../httpConfig";
import { useFormContext } from "react-hook-form";
import { InputStack } from "../../auth";

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

    const response = await fetch(apiURL + "/entity/lookup", {
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
      navigate("/entity/lookup/result", {
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

// page to enter data required for entity lookup
export const EntityLookupInput = () => (
  <SimpleForm maxWidth={1280} toolbar={<Toolbar />}>
    <Stack direction="column" spacing={1}>
      <Typography variant="h6" gutterBottom>
        Lookup an entity
      </Typography>
      <InputStack
        direction="row"
        flexWrap="wrap"
        allowAll
        resource="entity_lookup_request"
      >
        <TextInput
          source="business_id"
          label="Business ID"
          validate={required()}
        />
        <TextInput source="name" validate={required()} />
        <SelectInput
          source="type"
          validate={required()}
          choices={["person", "organisation"]}
          defaultValue={"person"}
        />
      </InputStack>
    </Stack>
  </SimpleForm>
);
