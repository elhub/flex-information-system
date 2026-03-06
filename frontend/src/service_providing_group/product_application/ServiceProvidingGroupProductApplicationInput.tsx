import { useRecordContext } from "react-admin";
import { Form } from "ra-core";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getFields, unTypedZodResolver } from "../../zod";
import { useCreateOrUpdate } from "../../auth";
import { zServiceProvidingGroupProductApplicationCreateRequest } from "../../generated-client/zod.gen";
import { FormContainer, Heading, VerticalSpace } from "../../components/ui";
import {
  TextInput,
  TextAreaInput,
  EnumInput,
  AutocompleteReferenceInput,
  PartyReferenceInput,
  DateTimeInput,
  FormToolbar,
} from "../../components/EDS-ra/inputs";
import { ProductTypeArrayInput } from "../../product_type/components";

// component restricting the selectable product types based on the
// already selected procuring system operator
const ProductTypesInput = (props: { source: string; required: boolean }) => {
  const { setValue, watch } = useFormContext();
  const {
    formState: { dirtyFields },
  } = useFormContext();
  const productTypeIdsDirty = dirtyFields.product_type_ids;
  const systemOperatorID = watch("procuring_system_operator_id");

  useEffect(() => {
    if (systemOperatorID && productTypeIdsDirty) {
      setValue("product_type_ids", []);
    }
  }, [productTypeIdsDirty, systemOperatorID, setValue]);

  return (
    <ProductTypeArrayInput systemOperatorId={systemOperatorID} {...props} />
  );
};

// common layout to create and edit pages
export const ServiceProvidingGroupProductApplicationInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();
  const parsedOverrideRecord =
    zServiceProvidingGroupProductApplicationCreateRequest
      .partial()
      .parse(overrideRecord ?? {});

  const record = { ...actualRecord, ...parsedOverrideRecord };
  const createOrUpdate = useCreateOrUpdate();

  const fields = getFields(
    zServiceProvidingGroupProductApplicationCreateRequest.shape,
  );

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(
        zServiceProvidingGroupProductApplicationCreateRequest,
      )}
      sanitizeEmptyValues
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
        <PartyReferenceInput
          {...fields.procuring_system_operator_id}
          filter={{ type: "system_operator" }}
        />
        <ProductTypesInput {...fields.product_type_ids} />
        <Heading level={3} size="medium">
          Application process
        </Heading>
        <VerticalSpace size="small" />
        <EnumInput
          {...fields.status}
          enumKey="service_providing_group_product_application.status"
          defaultValue="requested"
          readOnly={createOrUpdate === "create"}
        />
        <TextInput {...fields.maximum_active_power} type="number" />
        <TextAreaInput {...fields.additional_information} />
        <DateTimeInput {...fields.prequalified_at} />
        <DateTimeInput {...fields.verified_at} />
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
