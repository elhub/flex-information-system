import { useGetIdentity, useRecordContext } from "react-admin";
import { Form } from "ra-core";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { getFields, unTypedZodResolver } from "../../zod";
import { zServiceProvidingGroupProductSuspensionCreateRequest } from "../../generated-client/zod.gen";
import { FormContainer, Heading, VerticalSpace } from "../../components/ui";
import {
  EnumInput,
  AutocompleteReferenceInput,
  PartyReferenceInput,
  FormToolbar,
} from "../../components/EDS-ra/inputs";
import { ProductTypeArrayInput } from "../../product_type/components";

const filterRecord = ({
  service_providing_group_id,
  procuring_system_operator_id,
  product_type_ids,
  reason,
}: any) => ({
  service_providing_group_id,
  procuring_system_operator_id,
  product_type_ids,
  reason,
});

export const ServiceProvidingGroupProductSuspensionInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();
  const { data: identity } = useGetIdentity();
  const isSystemOperator = identity?.role == "flex_system_operator";

  const record = useMemo(
    () => filterRecord({ ...actualRecord, ...overrideRecord }),
    [actualRecord, overrideRecord],
  );

  const fields = getFields(
    zServiceProvidingGroupProductSuspensionCreateRequest.shape,
  );

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(
        zServiceProvidingGroupProductSuspensionCreateRequest,
      )}
    >
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>
        <VerticalSpace size="small" />
        <AutocompleteReferenceInput
          {...fields.service_providing_group_id}
          reference="service_providing_group"
          readOnly={!!record?.service_providing_group_id}
        />
        {!isSystemOperator && (
          <PartyReferenceInput
            {...fields.procuring_system_operator_id}
            filter={{ type: "system_operator" }}
          />
        )}
        <ProductTypeArrayInput {...fields.product_type_ids} />
        <Heading level={3} size="medium">
          Product suspension process
        </Heading>
        <VerticalSpace size="small" />
        <EnumInput
          {...fields.reason}
          enumKey="service_providing_group_product_suspension.reason"
        />
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
