import { Form, useGetIdentity, useRecordContext } from "ra-core";
import { ServiceProvidingGroup } from "../../generated-client";
import { zServiceProvidingGroupCreateRequest } from "../../generated-client/zod.gen";
import { unTypedZodResolver } from "../../zod";
import { FormContainer, Heading } from "../../components/ui";
import { FormToolbar } from "../../components/EDS-ra/inputs";
import { ServiceProvidingGroupFields } from "./ServiceProvidingGroupFields";

export const ServiceProvidingGroupInput = () => {
  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  const record = useRecordContext<ServiceProvidingGroup>();

  if (identityLoading) return <>Loading...</>;

  const isServiceProvider = identity?.role === "flex_service_provider";

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
            <ServiceProvidingGroupFields isEdit />
            <FormToolbar className="flex-" />
          </div>
        </FormContainer>
      </Form>
    </div>
  );
};
