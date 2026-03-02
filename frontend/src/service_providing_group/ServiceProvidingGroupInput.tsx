import { Form, useGetIdentity } from "ra-core";
import { zServiceProvidingGroupCreateRequest } from "../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../zod";
import { useCreateOrUpdate } from "../auth";
import { FormContainer, Heading } from "../components/ui";
import {
  TextInput,
  EnumInput,
  PartyReferenceInput,
  FormToolbar,
} from "../components/EDS-ra/inputs";

export const ServiceProvidingGroupInput = () => {
  const createOrUpdate = useCreateOrUpdate();
  const { data: identity, isLoading: identityLoading } = useGetIdentity();

  if (identityLoading) return <>Loading...</>;

  const isServiceProvider = identity?.role === "flex_service_provider";
  const fields = getFields(zServiceProvidingGroupCreateRequest.shape);

  return (
    <Form
      defaultValues={{
        service_provider_id: identity?.partyID,
      }}
      resolver={unTypedZodResolver(zServiceProvidingGroupCreateRequest)}
    >
      <FormContainer>
        <Heading level={3} size="medium">
          {createOrUpdate === "update"
            ? "Edit Service Providing Group"
            : "Create Service Providing Group"}
        </Heading>

        <div className="flex flex-col gap-3">
          <PartyReferenceInput
            {...fields.service_provider_id}
            readOnly={isServiceProvider}
          />
          <TextInput {...fields.name} />
          <EnumInput
            {...fields.bidding_zone}
            enumKey="service_providing_group.bidding_zone"
            required={createOrUpdate === "update"}
          />
          <EnumInput
            {...fields.status}
            enumKey="service_providing_group.status"
            required={createOrUpdate === "update"}
          />
        </div>

        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
