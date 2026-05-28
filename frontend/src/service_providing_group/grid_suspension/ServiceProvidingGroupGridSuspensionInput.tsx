import { Form, useGetIdentity, useRecordContext } from "ra-core";
import {
  AutocompleteReferenceInput,
  EnumInput,
  FormToolbar,
  PartyReferenceInput,
} from "../../components/EDS-ra/inputs";
import {
  ServiceProvidingGroupGridSuspension,
  ServiceProvidingGroupGridSuspensionCreateRequest,
  ServiceProvidingGroupGridSuspensionUpdateRequest,
} from "../../generated-client";
import useLocationState from "../../hooks/useLocationState";
import {
  zServiceProvidingGroupGridSuspension,
  zServiceProvidingGroupGridSuspensionCreateRequest,
} from "../../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../../zod";
import { FormContainer, Heading } from "../../components/ui";

export type ServiceProvidingGroupGridSuspensionLocationState = {
  spggs: Partial<ServiceProvidingGroupGridSuspension>;
};

const fields = getFields(
  zServiceProvidingGroupGridSuspensionCreateRequest.shape,
);

export const ServiceProvidingGroupGridSuspensionInput = () => {
  const locationState =
    useLocationState<ServiceProvidingGroupGridSuspensionLocationState>();
  const overrideRecord = zServiceProvidingGroupGridSuspension
    .partial()
    .safeParse(locationState?.spggs ?? {});

  const actualRecord = useRecordContext<ServiceProvidingGroupGridSuspension>();
  const { data: identity } = useGetIdentity();
  const isSystemOperator = identity?.role == "flex_system_operator";

  const record:
    | ServiceProvidingGroupGridSuspensionCreateRequest
    | ServiceProvidingGroupGridSuspensionUpdateRequest = {
    ...actualRecord,
    ...(overrideRecord.data ?? {}),
  };

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(
        zServiceProvidingGroupGridSuspensionCreateRequest,
      )}
      sanitizeEmptyValues
    >
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>
        <div className="flex flex-col gap-3">
          <AutocompleteReferenceInput
            {...fields.service_providing_group_id}
            reference="service_providing_group"
            readOnly={
              "service_providing_group_id" in record &&
              !!record.service_providing_group_id
            }
          />
          {!isSystemOperator && (
            <PartyReferenceInput
              {...fields.impacted_system_operator_id}
              filter={{ type: "system_operator" }}
            />
          )}
        </div>
        <Heading level={3} size="medium">
          Grid suspension process
        </Heading>
        <div className="flex flex-col gap-3">
          <EnumInput
            {...fields.reason}
            enumKey="service_providing_group_grid_suspension.reason"
            required
          />
        </div>
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
