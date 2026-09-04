import { Form, useGetIdentity, useRecordContext } from "ra-core";
import { useCreateOrUpdate } from "../auth";
import { zServiceProviderProductApplicationCreateRequest } from "../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../zod";
import { Alert, FormContainer, Heading, VerticalSpace } from "../components/ui";
import {
  isProductApplicationBlocked,
  getProductApplicationBlockDate,
} from "../productApplicationBlock";
import {
  DateTimeInput,
  EnumInput,
  FormToolbar,
  PartyReferenceInput,
} from "../components/EDS-ra/inputs";
import { SystemOperatorProductTypesInput } from "../product_type/components";

// common layout to create and edit pages
export const ServiceProviderProductApplicationInput = () => {
  const currentRecord = useRecordContext();
  const createOrUpdate = useCreateOrUpdate();

  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  if (identityLoading) return <>Loading...</>;

  const isServiceProvider = identity?.role == "flex_service_provider";

  if (createOrUpdate === "create" && isProductApplicationBlocked()) {
    return (
      <FormContainer>
        <Alert variant="warning">
          Product applications cannot be created before{" "}
          {getProductApplicationBlockDate()}.
        </Alert>
      </FormContainer>
    );
  }

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
          {createOrUpdate === "create"
            ? "Create service provider product application"
            : "Edit service provider product application"}
        </Heading>
        <VerticalSpace size="small" />
        <PartyReferenceInput
          {...fields.service_provider_id}
          readOnly={isServiceProvider}
          optionText={(record) => record.name}
        />
        <PartyReferenceInput
          {...fields.system_operator_id}
          filter={{
            type: "system_operator",
            embed: "system_operator_product_type!",
            "system_operator_product_type.status": "active",
          }}
          optionText={(record) => record.name}
        />
        <SystemOperatorProductTypesInput
          {...fields.product_type_ids}
          systemOperatorSource="system_operator_id"
        />

        <VerticalSpace size="small" />
        {createOrUpdate === "update" && (
          <EnumInput
            {...fields.status}
            enumKey="service_provider_product_application.status"
            placeholder="Select status"
          />
        )}
        <DateTimeInput {...fields.qualified_at} showNow />
        <VerticalSpace size="large" />
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
