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
  TextAreaInput,
  EnumInput,
  AutocompleteReferenceInput,
  PartyReferenceInput,
  DateTimeInput,
  FormToolbar,
  UnitInput,
  type BaseInputProps,
} from "../../components/EDS-ra/inputs";
import { ProductTypeArrayInput } from "../../product_type/components";

// component restricting the selectable product types based on the
// already selected procuring system operator
const ProductTypesInput = (
  props: Pick<
    BaseInputProps,
    "source" | "required" | "description" | "tooltip"
  >,
) => {
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
          description
          tooltip={false}
        />
        <PartyReferenceInput
          {...fields.procuring_system_operator_id}
          filter={{ type: "system_operator" }}
          description
          tooltip={false}
        />
        <ProductTypesInput
          {...fields.product_type_ids}
          description
          tooltip={false}
        />
        <Heading level={3} size="medium">
          Application process
        </Heading>
        <VerticalSpace size="small" />
        <EnumInput
          {...fields.status}
          enumKey="service_providing_group_product_application.status"
          defaultValue="requested"
          readOnly={createOrUpdate === "create"}
          description
          tooltip={false}
        />
        <UnitInput
          {...fields.maximum_active_power_up}
          units={[
            { label: "kW", scale: 1 },
            { label: "MW", scale: 1000 },
          ]}
          description
          tooltip={false}
        />
        <UnitInput
          {...fields.maximum_active_power_down}
          units={[
            { label: "kW", scale: 1 },
            { label: "MW", scale: 1000 },
          ]}
          description
          tooltip={false}
        />
        <TextAreaInput
          {...fields.additional_information}
          rows={8}
          description
          tooltip={false}
        />
        <DateTimeInput
          {...fields.prequalified_at}
          description
          tooltip={false}
        />
        <DateTimeInput {...fields.verified_at} description tooltip={false} />
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
