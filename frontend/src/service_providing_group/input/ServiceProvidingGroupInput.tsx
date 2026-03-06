import { Form, useGetIdentity, useRecordContext } from "ra-core";
import { ServiceProvidingGroup } from "../../generated-client";
import { zServiceProvidingGroupCreateRequest } from "../../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../../zod";
import { FormContainer, Heading } from "../../components/ui";
import {
  TextInput,
  EnumInput,
  PartyReferenceInput,
  FormToolbar,
} from "../../components/EDS-ra/inputs";

export const ServiceProvidingGroupInput = () => {
  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  const record = useRecordContext<ServiceProvidingGroup>();

  if (identityLoading) return <>Loading...</>;

  const isServiceProvider = identity?.role === "flex_service_provider";
  const fields = getFields(zServiceProvidingGroupCreateRequest.shape);

  return (
    <div className="flex flex-col gap-8">
      <Form
        record={record}
        resolver={unTypedZodResolver(zServiceProvidingGroupCreateRequest)}
        defaultValues={
          isServiceProvider ? { service_provider_id: identity?.partyID } : {}
        }
      >
        <FormContainer>
          <Heading level={3} size="medium">
            Edit Service Providing Group
          </Heading>

          <div className="flex flex-row center gap-3">
            {!isServiceProvider && (
              <PartyReferenceInput {...fields.service_provider_id} />
            )}
            <TextInput {...fields.name} />
            <EnumInput
              {...fields.bidding_zone}
              enumKey="service_providing_group.bidding_zone"
              required
            />
            <EnumInput
              {...fields.status}
              enumKey="service_providing_group.status"
              required
            />
            <FormToolbar className="flex-" />
          </div>
        </FormContainer>
      </Form>
    </div>
  );
};
