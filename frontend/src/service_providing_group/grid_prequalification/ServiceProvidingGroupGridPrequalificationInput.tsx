import { Form, useRecordContext } from "ra-core";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import {
  AutocompleteReferenceInput,
  DateTimeInput,
  EnumInput,
  FormToolbar,
  PartyReferenceInput,
} from "../../components/EDS-ra/inputs";
import { useCreateOrUpdate } from "../../auth";
import { zServiceProvidingGroupGridPrequalificationCreateRequest } from "../../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../../zod";
import { FormContainer, Heading } from "../../components/ui";

const filterRecord = ({
  service_providing_group_id,
  impacted_system_operator_id,
  status,
  prequalified_at,
}: any) => ({
  service_providing_group_id,
  impacted_system_operator_id,
  status,
  prequalified_at,
});

const fields = getFields(
  zServiceProvidingGroupGridPrequalificationCreateRequest.shape,
);

export const ServiceProvidingGroupGridPrequalificationInput = () => {
  const createOrUpdate = useCreateOrUpdate();
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();

  const record = useMemo(
    () => filterRecord({ ...actualRecord, ...overrideRecord }),
    [actualRecord, overrideRecord],
  );

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(
        zServiceProvidingGroupGridPrequalificationCreateRequest,
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
            readOnly={!!record?.service_providing_group_id}
          />
          <PartyReferenceInput
            {...fields.impacted_system_operator_id}
            filter={{ type: "system_operator" }}
          />
          <EnumInput
            {...fields.status}
            enumKey="service_providing_group_grid_prequalification.status"
            required={createOrUpdate == "update"}
          />
          <DateTimeInput {...fields.prequalified_at} />
        </div>
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
