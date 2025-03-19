import {
  PasswordInput,
  SimpleForm,
  TextInput,
  useRecordContext,
} from "react-admin";
import { AutocompleteReferenceInput, InputStack } from "../../auth";
import { useLocation } from "react-router-dom";
import { Toolbar } from "../../Toolbar";

// common layout to create and edit pages
export const EntityClientInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();
  const record = { ...actualRecord, ...overrideRecord };

  return (
    <SimpleForm
      record={record}
      maxWidth={1280}
      toolbar={<Toolbar saveAlwaysEnabled />}
    >
      <InputStack>
        <AutocompleteReferenceInput
          source="entity_id"
          reference="entity"
          readOnly
        />
        <TextInput source="client_id" label="Client ID" />
        <TextInput source="name" />
        <PasswordInput source="client_secret" />
        <TextInput
          source="public_key"
          multiline={true}
          minRows={3}
          sx={{ minWidth: { xs: 300, md: 500 } }}
        />
      </InputStack>
    </SimpleForm>
  );
};
