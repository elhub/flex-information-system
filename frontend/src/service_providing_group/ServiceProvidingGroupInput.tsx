import { Form, useGetIdentity, useRecordContext } from "ra-core";
import { ServiceProvidingGroup } from "../generated-client";
import { zServiceProvidingGroupCreateRequest } from "../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../zod";
import { useCreateOrUpdate } from "../auth";
import { Divider, FormContainer, Heading } from "../components/ui";
import {
  TextInput,
  EnumInput,
  PartyReferenceInput,
  FormToolbar,
} from "../components/EDS-ra/inputs";
import { ServiceProvidingGroupMembershipTable } from "./membership/ServiceProvidingGroupMembershipTable";

export const ServiceProvidingGroupInput = () => {
  const createOrUpdate = useCreateOrUpdate();
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
            {createOrUpdate === "update"
              ? "Edit Service Providing Group"
              : "Create Service Providing Group"}
          </Heading>

          <div className="flex flex-row center gap-3">
            {!isServiceProvider && (
              <PartyReferenceInput {...fields.service_provider_id} />
            )}
            <TextInput {...fields.name} />
            <EnumInput
              {...fields.bidding_zone}
              enumKey="service_providing_group.bidding_zone"
              required={createOrUpdate === "update"}
            />
            {createOrUpdate === "update" && (
              <EnumInput
                {...fields.status}
                enumKey="service_providing_group.status"
                required
              />
            )}
            <FormToolbar className="flex-" />
          </div>
        </FormContainer>
      </Form>

      <Divider />

      {record?.id && (
        <FormContainer>
          <ServiceProvidingGroupMembershipTable
            spgId={record.id}
            biddingZone={record.bidding_zone}
          />
        </FormContainer>
      )}
    </div>
  );
};
