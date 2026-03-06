import { Form, useGetIdentity, useNotify } from "ra-core";
import { useNavigate } from "react-router-dom";
import { createServiceProvidingGroup } from "../../generated-client";
import { zServiceProvidingGroupCreateRequest } from "../../generated-client/zod.gen";
import { unTypedZodResolver } from "../../zod";
import { FormContainer, Heading } from "../../components/ui";
import { FormToolbar } from "../../components/EDS-ra/inputs";
import { ServiceProvidingGroupStepper } from "./ServiceProvidingGroupStepper";
import { ServiceProvidingGroupFields } from "./ServiceProvidingGroupFields";

export const ServiceProvidingGroupCreate = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { data: identity, isLoading: identityLoading } = useGetIdentity();

  if (identityLoading) return <>Loading...</>;

  const isServiceProvider = identity?.role === "flex_service_provider";

  const onSubmit = async (values: object) => {
    const body = zServiceProvidingGroupCreateRequest.parse(
      isServiceProvider
        ? { ...values, service_provider_id: identity?.partyID }
        : values,
    );

    const result = await createServiceProvidingGroup({ body });

    if (result.error) {
      notify(result.error.message, { type: "error" });
      return;
    }

    navigate(
      `/service_providing_group/${result.data.id}/add-members?from=create`,
    );
  };

  return (
    <FormContainer>
      <ServiceProvidingGroupStepper activeStep={1} />
      <Form
        resolver={unTypedZodResolver(zServiceProvidingGroupCreateRequest)}
        defaultValues={
          isServiceProvider ? { service_provider_id: identity?.partyID } : {}
        }
        onSubmit={onSubmit}
      >
        <Heading level={3} size="medium">
          Create Service Providing Group
        </Heading>
        <div className="flex flex-row center gap-3">
          <ServiceProvidingGroupFields />
        </div>
        <FormToolbar saveLabel="Create" />
      </Form>
    </FormContainer>
  );
};
