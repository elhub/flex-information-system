import { useGetIdentity } from "react-admin";
import { Form } from "ra-core";
import { getFields, unTypedZodResolver } from "../zod";
import { zServiceProviderProductSuspensionCreateRequest } from "../generated-client/zod.gen";
import { FormContainer, Heading, VerticalSpace } from "../components/ui";
import {
  EnumInput,
  FormToolbar,
  PartyReferenceInput,
} from "../components/EDS-ra/inputs";
import { ProductTypeArrayInput } from "../product_type/components";

export const ServiceProviderProductSuspensionInput = () => {
  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  if (identityLoading) return <>Loading...</>;

  const isSystemOperator = identity?.role == "flex_system_operator";

  const fields = getFields(
    zServiceProviderProductSuspensionCreateRequest.shape,
  );

  return (
    <Form
      resolver={unTypedZodResolver(
        zServiceProviderProductSuspensionCreateRequest,
      )}
    >
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>
        <VerticalSpace size="small" />
        {!isSystemOperator && (
          <PartyReferenceInput
            {...fields.procuring_system_operator_id}
            filter={{ type: "system_operator" }}
          />
        )}
        <PartyReferenceInput {...fields.service_provider_id} />
        <ProductTypeArrayInput {...fields.product_type_ids} />
        <Heading level={3} size="medium">
          Suspension details
        </Heading>
        <VerticalSpace size="small" />
        <EnumInput
          {...fields.reason}
          enumKey="service_provider_product_suspension.reason"
        />
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
