import {
  PasswordInput,
  SimpleForm,
  TextInput,
  useRecordContext,
} from "react-admin";
import { AutocompleteReferenceInput, InputStack } from "../../auth";
import { useLocation } from "react-router-dom";
import { Toolbar } from "../../components/Toolbar";
import { ScopesInput } from "../../components/scopes";
import { zEntityClientCreateRequest } from "../../generated-client/zod.gen";
import { unTypedZodResolver } from "../../util";

// common layout to create and edit pages
export const EntityClientInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();
  const record = { ...actualRecord, ...overrideRecord };

  return (
    <SimpleForm
      record={record}
      maxWidth={1280}
      resolver={unTypedZodResolver(zEntityClientCreateRequest)}
      toolbar={<Toolbar />}
    >
      <InputStack>
        <AutocompleteReferenceInput
          source="entity_id"
          reference="entity"
          label="field.entity_client.entity_id"
          readOnly
        />
        <TextInput source="client_id" label="field.entity_client.client_id" />
        <TextInput source="name" label="field.entity_client.name" />
        <AutocompleteReferenceInput
          source="party_id"
          reference="party"
          label="field.entity_client.party_id"
        />
        <ScopesInput source="scopes" label="field.entity_client.scopes" />
        <PasswordInput
          source="client_secret"
          label="field.entity_client.client_secret"
        />
        <TextInput
          source="public_key"
          label="field.entity_client.public_key"
          multiline={true}
          minRows={3}
          sx={{ minWidth: { xs: 300, md: 500 } }}
        />
      </InputStack>
    </SimpleForm>
  );
};
