import { Form } from "ra-core";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import { zEntityCreateRequest } from "../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../zod";
import { FormContainer, Heading } from "../components/ui";
import {
  TextInput,
  EnumInput,
  FormToolbar,
} from "../components/EDS-ra/inputs";

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
      {...props}
      enumKey="entity.type"
      defaultValue="person"
      required
      onChange={(value: string | null) => {
        formContext.setValue(
          "business_id_type",
          businessIDTypeOfEntityType(value ?? ""),
        );
      }}
    />
  );
};

const EntityBusinessIDInput = (props: any) => {
  const formContext = useFormContext();
  const entityType = formContext.watch("type");
  void entityType; // used for context, validation handled by Zod

  return <TextInput {...props} />;
};

const fields = getFields(zEntityCreateRequest.shape);

export const EntityInput = () => {
  return (
    <Form resolver={unTypedZodResolver(zEntityCreateRequest)}>
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>
        <div className="flex flex-col gap-3">
          <EntityTypeInput source="type" />
          <EnumInput
            source="business_id_type"
            enumKey="entity.business_id_type"
            defaultValue="person"
            readOnly
          />
          <EntityBusinessIDInput source="business_id" />
          <TextInput source="name" />
        </div>
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
