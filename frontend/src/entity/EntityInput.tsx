import { email, regex, required, SimpleForm, TextInput } from "react-admin";
import { Typography, Stack } from "@mui/material";
import { InputStack } from "../auth";
import { Toolbar } from "../components/Toolbar";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import { zEntityCreateRequest } from "../generated-client/zod.gen";
import { unTypedZodResolver } from "../util";
import { EnumInput } from "../components/enum";

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
    <EnumInput
      enumKey="entity.type"
      defaultValue="person"
      validate={required()}
      onChange={(event: any) => {
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
    <SimpleForm
      maxWidth={1280}
      resolver={unTypedZodResolver(zEntityCreateRequest)}
      toolbar={<Toolbar />}
    >
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <EntityTypeInput source="type" label="field.entity.type" />
          <EnumInput
            source="business_id_type"
            label="field.entity.business_id_type"
            enumKey="entity.business_id_type"
            defaultValue="person"
            readOnly
          />
          <EntityBusinessIDInput
            source="business_id"
            label="field.entity.business_id"
          />
          <TextInput source="name" label="field.entity.name" />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
