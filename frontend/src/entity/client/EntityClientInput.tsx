import { Form, useGetList, useRecordContext } from "ra-core";
import { useLocation } from "react-router-dom";
import { zEntityClientCreateRequest } from "../../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../../zod";
import { FormContainer } from "../../components/ui";
import {
  TextInput,
  TextAreaInput,
  AutocompleteReferenceInput,
  FormToolbar,
  ScopesInput,
  PartyReferenceInput,
} from "../../components/EDS-ra/inputs";

const fields = getFields(zEntityClientCreateRequest.shape);

// common layout to create and edit pages
export const EntityClientInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();
  const record = { ...actualRecord, ...overrideRecord };
  const entityId = record?.entity_id;

  const { data: memberships = [] } = useGetList(
    "party_membership",
    {
      pagination: { page: 1, perPage: 1000 },
      sort: { field: "id", order: "ASC" },
      filter: entityId ? { entity_id: entityId } : {},
    },
    { enabled: !!entityId },
  );

  const partiesFromMembershipResource = memberships.map(
    (m: any) => m.entity_id,
  );
  const parties = [...new Set([entityId, ...partiesFromMembershipResource])];
  const partyFilter = {
    ...(parties.length ? { "entity_id@in": parties.join(",") } : {}),
  };

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
