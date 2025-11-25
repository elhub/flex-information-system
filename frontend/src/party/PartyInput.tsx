import {
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  useRecordContext,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import {
  InputStack,
  AutocompleteReferenceInput,
  useCreateOrUpdate,
} from "../auth";
import { Toolbar } from "../components/Toolbar";
import { useFormContext } from "react-hook-form";
import { roleNames } from "../roles";
import { useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";

// component updating the role field automatically based on the type field
const PartyTypeInput = (props: any) => {
  const formContext = useFormContext();
  const record = useRecordContext();

  // all roles can be chosen except anonymous and entity
  const roles = { ...roleNames };
  delete roles.flex_anonymous;
  delete roles.flex_entity;

  // if the form is filled from an existing record, make sure role is defined
  useEffect(() => {
    if (record?.type) formContext.setValue("role", `flex_${record.type}`);
  });

  return (
    <SelectInput
      choices={Object.entries(roles).map(([role, name]) => {
        return { id: role.slice("flex_".length), name };
      })}
      defaultValue="balance_responsible_party"
      // no empty choice allowed
      validate={required()}
      /* Here, we are letting the user (FISO) choose the party type of the party
         they want to create, and the role field is supposed to be just
         prefixing it with flex_. This is not enforced anywhere in the DB, but
         if a role does not exist the create operation will fail.
         To limit potential client-side mistakes while not adding a restriction
         to the DB, we make the text field for role read only and dependent on
         the type field, so the call is kind of always valid and the user does
         not have to care about it. */
      onChange={(event) => {
        formContext.setValue("role", `flex_${event.target.value}`);
      }}
      {...props}
    />
  );
};

// component restricting the business_id_type field automatically
// based on the party type field
const PartyBusinessIDTypeInput = (props: any) => {
  const formContext = useFormContext();

  const partyType = formContext.watch("type");
  const isEndUser = partyType == "end_user";

  useEffect(() => {
    if (isEndUser) {
      formContext.setValue("business_id_type", "uuid");
    }
  }, [formContext, isEndUser]);

  // Map for human-readable display names
  const businessIDTypeLabels: Record<string, string> = {
    uuid: "UUID (Universally Unique Identifier)",
    eic_x: "EIC-X (Energy Identification Code for Parties)",
    gln: "GLN (Global Location Number)",
    org: "ORG (Organisation Number)",
  };
  const businessIDTypes = ["uuid", "eic_x", "gln", "org"];

  return (
    <SelectInput
      choices={businessIDTypes.map((idType) => ({
        id: idType,
        name: businessIDTypeLabels[idType] || idType,
      }))}
      defaultValue="gln"
      validate={required()}
      readOnly={isEndUser}
      {...props}
    />
  );
};

// keep only the fields that map to the UI
const filterRecord = ({
  name,
  business_id,
  business_id_type,
  entity_id,
  type,
  role,
  status,
}: any) => ({
  name,
  business_id,
  business_id_type,
  entity_id,
  type,
  role,
  status,
});

// common layout to create and edit pages
export const PartyInput = () => {
  const createOrUpdate = useCreateOrUpdate();

  const actualRecord = useRecordContext();
  const { state: overrideRecord } = useLocation();

  // priority to the values coming from notice buttons if they exist
  // Memoize the combined record to avoid re-renders causing errors
  const record = useMemo(
    () => filterRecord({ ...actualRecord, ...overrideRecord }),
    [actualRecord, overrideRecord],
  );

  return (
    <SimpleForm
      record={record}
      maxWidth={1280}
      toolbar={<Toolbar saveAlwaysEnabled />}
    >
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <TextInput source="name" />
          <TextInput source="business_id" label="Business ID" />
          <PartyBusinessIDTypeInput
            source="business_id_type"
            label="Business ID type"
          />
          <PartyTypeInput source="type" />
          <TextInput
            source="role"
            readOnly // see comment in PartyTypeInput
            defaultValue="flex_balance_responsible_party"
          />
          <AutocompleteReferenceInput source="entity_id" reference="entity" />
          <SelectInput
            source="status"
            validate={createOrUpdate == "update" ? required() : undefined}
            choices={["new", "active", "inactive", "suspended", "terminated"]}
          />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
