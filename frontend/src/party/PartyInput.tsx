import { Form, useRecordContext } from "ra-core";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import {
  zPartyCreateRequest,
  zPartyUpdateRequest,
} from "../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../util";
import { useCreateOrUpdate } from "../auth";
import { FormContainer, Heading, VerticalSpace } from "../components/ui";
import {
  TextInput,
  EnumInput,
  AutocompleteReferenceInput,
  FormToolbar,
} from "../components/EDS-ra/inputs";
import { Party } from "../generated-client/types.gen";
import useLocationState from "../hooks/useLocationState";

// component updating the role field automatically based on the type field
const PartyTypeInput = (props: { source: string; required: boolean }) => {
  const formContext = useFormContext();
  const record = useRecordContext();

  // if the form is filled from an existing record, make sure role is defined
  useEffect(() => {
    if (record?.type) formContext.setValue("role", `flex_${record.type}`);
  });

  return (
    <EnumInput
      placeholder="Select a party type"
      enumKey="party.type"
      defaultValue="balance_responsible_party"
      /* Here, we are letting the user (FISO) choose the party type of the party
         they want to create, and the role field is supposed to be just
         prefixing it with flex_. This is not enforced anywhere in the DB, but
         if a role does not exist the create operation will fail.
         To limit potential client-side mistakes while not adding a restriction
         to the DB, we make the text field for role read only and dependent on
         the type field, so the call is kind of always valid and the user does
         not have to care about it. */
      onChange={(value) => {
        formContext.setValue("role", `flex_${value}`);
      }}
      {...props}
    />
  );
};

// component restricting the business_id_type field automatically
// based on the party type field
const PartyBusinessIDTypeInput = (props: {
  source: string;
  required: boolean;
}) => {
  const formContext = useFormContext();

  const partyType = formContext.watch("type");
  const isEndUser = partyType == "end_user";

  useEffect(() => {
    if (isEndUser) {
      formContext.setValue("business_id_type", "uuid");
    }
  }, [formContext, isEndUser]);

  return (
    <EnumInput
      placeholder="Select a business ID type"
      enumKey="party.business_id_type"
      defaultValue="gln"
      readOnly={isEndUser}
      {...props}
    />
  );
};

export type PartyInputLocationState = {
  party?: Partial<Party>;
};

// common layout to create and edit pages
export const PartyInput = () => {
  const actualRecord = useRecordContext();
  const locationState = useLocationState<PartyInputLocationState>();
  const createOrUpdate = useCreateOrUpdate();
  const overrideRecord = zPartyUpdateRequest
    .partial()
    .parse(locationState?.party ?? {});

  const record = {
    ...actualRecord,
    ...overrideRecord,
  };

  const fields = getFields(zPartyCreateRequest.shape);

  return (
    <Form record={record} resolver={unTypedZodResolver(zPartyCreateRequest)}>
      <FormContainer>
        <Heading level={3} size="medium">
          {createOrUpdate == "update" ? "Edit Party" : "Create Party"}
        </Heading>
        <VerticalSpace size="small" />
        <TextInput {...fields.name} />
        <TextInput {...fields.business_id} />
        <PartyBusinessIDTypeInput {...fields.business_id_type} />
        <PartyTypeInput {...fields.type} />
        <AutocompleteReferenceInput {...fields.entity_id} reference="entity" />
        <EnumInput
          {...fields.role}
          placeholder="Select a role"
          enumKey="party.role"
          readOnly
          defaultValue="flex_balance_responsible_party"
        />
        <EnumInput
          {...fields.status}
          placeholder="Select status"
          enumKey="party.status"
        />
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
