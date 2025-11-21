import {
  email,
  regex,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { InputStack } from "../auth";
import { Toolbar } from "../components/Toolbar";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";

const businessIDTypeOfEntityType = (entityType: string) => {
  switch (entityType) {
    case "person":
      return "email";
    case "organisation":
      return "org";
    default:
      return null;
  }
};

// component updating the business_id_type fields automatically based on the
// type field
const EntityTypeInput = (props: any) => {
  const formContext = useFormContext();
  const entityType = formContext.watch("type");

  useEffect(() => {
    formContext.setValue(
      "business_id_type",
      businessIDTypeOfEntityType(entityType),
    );
  });

  return (
    <SelectInput
      choices={[
        { id: "person", name: "Person" },
        { id: "organisation", name: "Organisation" },
      ]}
      defaultValue="person"
      validate={required()}
      onChange={(event) => {
        formContext.setValue(
          "business_id_type",
          businessIDTypeOfEntityType(event.target.value),
        );
      }}
      {...props}
    />
  );
};

const EntityBusinessIDInput = (props: any) => {
  const formContext = useFormContext();
  const entityType = formContext.watch("type");

  return (
    <TextInput
      source="business_id"
      validate={[
        required(),
        (businessID) =>
          entityType == "organisation"
            ? regex(
                /^[1-9]\d{8}$/,
                "Please enter a valid organisation number.",
              )(businessID)
            : email("Please enter a valid email.")(businessID),
      ]}
      {...props}
    />
  );
};

export const EntityInput = () => {
  return (
    <SimpleForm maxWidth={1280} toolbar={<Toolbar saveAlwaysEnabled />}>
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <EntityTypeInput source="type" />
          <TextInput
            source="business_id_type"
            label="Business ID Type"
            defaultValue="person"
            readOnly
          />
          <EntityBusinessIDInput source="business_id" label="Business ID" />
          <TextInput source="name" />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
export default EntityInput;
