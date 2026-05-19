import { Form, useRecordContext } from "ra-core";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { zPartyMembershipCreateRequest } from "../../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../../zod";
import { FormContainer, Heading } from "../../components/ui";
import {
  TextInput,
  AutocompleteReferenceInput,
  PartyReferenceInput,
  FormToolbar,
} from "../../components/EDS-ra/inputs";
import { ScopesInput } from "../../components/scopes";

const filterRecord = ({ party_id, entity_id, scopes }: any) => ({
  party_id,
  entity_id,
  scopes,
});

const fields = getFields(zPartyMembershipCreateRequest.shape);

export const PartyMembershipInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();

  const record = useMemo(
    () => filterRecord({ ...actualRecord, ...overrideRecord }),
    [actualRecord, overrideRecord],
  );

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(zPartyMembershipCreateRequest)}
      sanitizeEmptyValues
    >
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>
        <div className="flex flex-col gap-3">
          <PartyReferenceInput {...fields.party_id} readOnly />
          {overrideRecord?.showTechnicalEntityID ? (
            <TextInput {...fields.entity_id} type="number" readOnly />
          ) : (
            <AutocompleteReferenceInput
              {...fields.entity_id}
              reference="entity"
            />
          )}
          <ScopesInput source="scopes" label="field.party_membership.scopes" />
        </div>
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
