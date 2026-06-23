import { Form, useRecordContext, useTranslate } from "ra-core";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { z } from "zod";
import { getFields, unTypedZodResolver } from "../../zod";
import { useCreateOrUpdate } from "../../auth";
import {
  zServiceProvidingGroupProductApplicationCreateRequest,
  zServiceProvidingGroupProductApplicationRampingCapability,
} from "../../generated-client/zod.gen";
import {
  Alert,
  FormContainer,
  Heading,
  VerticalSpace,
} from "../../components/ui";
import {
  isProductApplicationBlocked,
  getProductApplicationBlockDate,
} from "../../productApplicationBlock";
import {
  TextAreaInput,
  EnumInput,
  AutocompleteReferenceInput,
  PartyReferenceInput,
  FormToolbar,
  UnitInput,
  type BaseInputProps,
  DateTimeInput,
} from "../../components/EDS-ra/inputs";
import { ProductTypeArrayInput } from "../../product_type/components";

// ramping_capability and ramping_description are required in the frontend even
// though the API allows null (the API-level constraint only enforces non-null
// for manual_congestion, but this form is only used for applications where
// they are required)
const spgpaFormSchema =
  zServiceProvidingGroupProductApplicationCreateRequest.extend({
    ramping_capability:
      zServiceProvidingGroupProductApplicationRampingCapability,
    ramping_description: z.string(),
  });

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

const RampingNotice = () => {
  const translate = useTranslate();
  const { watch } = useFormContext();
  const rampingCapability = watch("ramping_capability");

  return (
    <Alert variant="info">
      <ul className="list-disc pl-4">
        <li>{translate("text.spgpa_ramping_details")}</li>
        {rampingCapability !== "always" && (
          <li>{translate("text.spgpa_ramping_deviations")}</li>
        )}
      </ul>
    </Alert>
  );
};

// common layout to create and edit pages
export const ServiceProvidingGroupProductApplicationInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();
  const parsedOverrideRecord = spgpaFormSchema
    .partial()
    .parse(overrideRecord ?? {});

  const record = { ...actualRecord, ...parsedOverrideRecord };
  const createOrUpdate = useCreateOrUpdate();

  if (createOrUpdate === "create" && isProductApplicationBlocked()) {
    return (
      <FormContainer>
        <Alert variant="warning">
          Product applications cannot be created before{" "}
          {getProductApplicationBlockDate()}.
        </Alert>
      </FormContainer>
    );
  }

  const fields = getFields(spgpaFormSchema.shape);

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(spgpaFormSchema)}
      sanitizeEmptyValues
    >
      <FormContainer>
        <Heading level={3} size="medium">
          {createOrUpdate === "create"
            ? "Create SPG product application"
            : "Edit  SPG product application"}
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
        <EnumInput
          {...fields.ramping_capability}
          enumKey="service_providing_group_product_application.ramping_capability"
          description
          tooltip={false}
        />
        <RampingNotice />
        <TextAreaInput
          {...fields.ramping_description}
          rows={5}
          description
          tooltip={false}
        />
        <TextAreaInput
          {...fields.additional_information}
          rows={8}
          description
          tooltip={false}
          warning="Please remember not to write any sensitive (power/market/personal) information in this field."
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
