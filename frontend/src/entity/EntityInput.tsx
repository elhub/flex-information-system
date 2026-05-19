import { Form } from "ra-core";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import { zEntityCreateRequest } from "../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../zod";
import { FormContainer, Heading } from "../components/ui";
import { TextInput, EnumInput, FormToolbar } from "../components/EDS-ra/inputs";
import { email, regex, regexes } from "zod";

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
  const { setValue, watch } = useFormContext();
  const entityType = watch("type");

  useEffect(() => {
    setValue(
      "business_id_type",
      businessIDTypeOfEntityType(entityType),
    );
  }, [entityType, setValue]);

  return (
    <EnumInput
      {...props}
      enumKey="entity.type"
      defaultValue="person"
      required
      onChange={(value: string | null) => {
        setValue(
          "business_id_type",
          businessIDTypeOfEntityType(value ?? ""),
        );
      }}
    />
  );
};


export const EntityInput = () => {
  const fields = getFields(zEntityCreateRequest.shape);
  return (
    <Form resolver={unTypedZodResolver(zEntityCreateRequest)}>
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>
        <div className="flex flex-col gap-3">
          <EntityTypeInput {...fields.type} />
          <EnumInput
            {...fields.business_id_type}
            enumKey="entity.business_id_type"
            defaultValue="person"
          />
          <TextInput {...fields.business_id} />
          <TextInput {...fields.name} />
        </div>
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
