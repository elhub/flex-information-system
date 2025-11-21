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

const Toolbar = () => {
  const navigate = useNavigate();
  const { getValues } = useFormContext();
  const notify = useNotify();

  // fetch party ID saved from the party membership list
  const {
    state: { party_id },
  } = useLocation();

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
      // navigate to the create party membership page with all information
      navigate(`/party/${party_id}/membership/create`, {
        state: {
          party_id: party_id,
          entity_id: lookupResult?.entity_id,
          // tell the party membership input page not to try to read the name
          // of the entity: since it is looked up, we have no idea whether
          // the party doing the lookup has permission to see its details
          showTechnicalEntityID: true,
        },
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
          label="Business ID (Person Number)"
          validate={required()}
        />
        <TextInput source="name" validate={required()} />
        <TextInput
          source="type"
          validate={required()}
          defaultValue={"person"}
          readOnly
        />
      </InputStack>
    </Stack>
  </SimpleForm>
);
export default EntityLookupInput;
