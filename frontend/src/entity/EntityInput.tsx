import { PasswordInput, SimpleForm, TextInput } from "react-admin";
import { Toolbar } from "../Toolbar";
import { Typography, Stack } from "@mui/material";
import { InputStack } from "../auth";

export const EntityInput = () => (
  <SimpleForm maxWidth={1280} toolbar={<Toolbar saveAlwaysEnabled />}>
    <Stack direction="column" spacing={1}>
      <Typography variant="h6" gutterBottom>
        Authentication
      </Typography>
      <InputStack direction="row" flexWrap="wrap">
        <PasswordInput source="client_secret" />
        <TextInput
          source="client_public_key"
          multiline={true}
          minRows={3}
          sx={{ minWidth: { xs: 300, md: 500 } }}
        />
      </InputStack>
    </Stack>
  </SimpleForm>
);
