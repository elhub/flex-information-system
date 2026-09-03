import { Form, useRecordContext } from "ra-core";
import { useLocation } from "react-router-dom";
import { zEntityClientCreateRequest } from "../../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../../zod";
import { FormContainer } from "../../components/ui";
import { AutocompleteReferenceInput } from "../../components/EDS-ra/inputs/AutocompleteReferenceInput";
import { FormToolbar } from "../../components/EDS-ra/inputs/FormToolbar";
import { PartyReferenceInput } from "../../components/EDS-ra/inputs/PartyReferenceInput";
import { ScopesInput } from "../../components/EDS-ra/inputs/ScopesInput";
import { TextAreaInput } from "../../components/EDS-ra/inputs/TextAreaInput";
import { TextInput } from "../../components/EDS-ra/inputs/TextInput";

const fields = getFields(zEntityClientCreateRequest.shape);

// common layout to create and edit pages
export const EntityClientInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();
  const record = { ...actualRecord, ...overrideRecord };
  const entityId = record?.entity_id;

  const partyFilter = entityId
    ? {
        embed: "membership",
        "membership.entity_id": entityId,
        or: `(entity_id.eq.${entityId},membership.not.is.null)`,
      }
    : {};
  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(zEntityClientCreateRequest)}
      sanitizeEmptyValues
    >
      <FormContainer>
        <div className="flex flex-col gap-3">
          <AutocompleteReferenceInput
            {...fields.entity_id}
            reference="entity"
            readOnly
          />
          <TextInput source="client_id" />
          <TextInput {...fields.name} />
          <PartyReferenceInput
            {...fields.party_id}
            reference="party"
            filter={partyFilter}
          />
          <ScopesInput source="scopes" />
          <TextInput {...fields.client_secret} type="password" />
          <TextAreaInput {...fields.public_key} rows={3} />
        </div>
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
