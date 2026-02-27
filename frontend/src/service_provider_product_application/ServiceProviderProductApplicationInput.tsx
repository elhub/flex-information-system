import { useGetIdentity } from "react-admin";
import { Form, useRecordContext } from "ra-core";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import { useCreateOrUpdate } from "../auth";
import { zServiceProviderProductApplicationCreateRequest } from "../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../zod";
import { FormContainer, Heading, VerticalSpace } from "../components/ui";
import {
  DateTimeInput,
  EnumInput,
  FormToolbar,
  PartyReferenceInput,
} from "../components/EDS-ra/inputs";
import { ProductTypeArrayInput } from "../product_type/components";

// component restricting the selectable product types based on the
// already selected system operator
const ProductTypesInput = (props: { source: string; required: boolean }) => {
  const { setValue, watch } = useFormContext();
  const systemOperatorID = watch("system_operator_id");
  const {
    formState: { dirtyFields },
  } = useFormContext();
  const productTypeIdsDirty = dirtyFields.product_type_ids;

  // we need to filter the already selected product types
  // in cases when switching system operator
  useEffect(() => {
    if (systemOperatorID && productTypeIdsDirty) {
      setValue("product_type_ids", []);
    }
  }, [productTypeIdsDirty, systemOperatorID, setValue]);

  return <ProductTypeArrayInput systemOperatorId={undefined} {...props} />;
};

// common layout to create and edit pages
export const ServiceProviderProductApplicationInput = () => {
  const currentRecord = useRecordContext();
  const createOrUpdate = useCreateOrUpdate();

  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  if (identityLoading) return <>Loading...</>;

  const isServiceProvider = identity?.role == "flex_service_provider";

  const record = {
    ...currentRecord,
    service_provider_id:
      createOrUpdate == "create" && isServiceProvider
        ? identity?.partyID
        : currentRecord?.service_provider_id,
  };

  const fields = getFields(
    zServiceProviderProductApplicationCreateRequest.shape,
  );

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(
        zServiceProviderProductApplicationCreateRequest,
      )}
      sanitizeEmptyValues
    >
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>
        <VerticalSpace size="small" />
        <PartyReferenceInput
          {...fields.service_provider_id}
          readOnly={isServiceProvider}
        />
        <PartyReferenceInput {...fields.system_operator_id} />
        <ProductTypesInput {...fields.product_type_ids} />
        <Heading level={3} size="medium">
          Application process
        </Heading>
        <VerticalSpace size="small" />
        <EnumInput
          {...fields.status}
          enumKey="service_provider_product_application.status"
          placeholder="Select status"
        />
        <DateTimeInput {...fields.qualified_at} showNow />
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
