import { Form, useRecordContext, useTranslate } from "ra-core";
import { useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
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
  FormToolbarWithConfirmation,
  UnitInput,
  type BaseInputProps,
  DateTimeInput,
} from "../../components/EDS-ra/inputs";
import { ProductTypeArrayInput } from "../../product_type/components";
import { draftStorageKey } from "../../hooks/useSpgpaDrafts";
import { DraftAutosaveWatcher } from "./DraftAutosaveWatcher";

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
    <ProductTypeArrayInput
      systemOperatorId={systemOperatorID}
      {...props}
      status={"active"}
    />
  );
};

const RampingNotice = () => {
  const translate = useTranslate();
  const { watch } = useFormContext();
  const rampingCapability = watch("ramping_capability");

  return (
    <ul className="list-disc pl-4">
      <li>{translate("text.spgpa_ramping_details")}</li>
      <li>{translate("text.spgpa_ramping_rate")}</li>
      {rampingCapability !== "always" && (
        <>
          <li>{translate("text.spgpa_ramping_deviations")}</li>
          <li>{translate("text.spgpa_add_attachment")}</li>
        </>
      )}
    </ul>
  );
};

const AdditionalInformationNotice = () => {
  const translate = useTranslate();
  return (
    <>
      {translate("text.spga_additional_information_description")
        .split("\n\n")
        .map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
    </>
  );
};

// common layout to create and edit pages
export const ServiceProvidingGroupProductApplicationInput = () => {
  const translate = useTranslate();
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();

  // Read the draft ID from location state when restoring a saved draft.
  // This must be extracted before Zod parses the state, as Zod strips unknown keys.
  const restoredDraftId = overrideRecord?.__draftId as string | undefined;

  const parsedOverrideRecord = spgpaFormSchema
    .partial()
    .parse(overrideRecord ?? {});

  const record = { ...actualRecord, ...parsedOverrideRecord };
  const createOrUpdate = useCreateOrUpdate();

  const [draftId] = useState(() => restoredDraftId ?? crypto.randomUUID());

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

  const spgId = record?.service_providing_group_id as number | undefined;

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(spgpaFormSchema)}
      sanitizeEmptyValues
    >
      {createOrUpdate === "create" && (
        <DraftAutosaveWatcher spgId={spgId} draftId={draftId} />
      )}
      <FormContainer>
        <Heading level={3} size="medium">
          {createOrUpdate === "create"
            ? "Create SPG product application"
            : "Edit  SPG product application"}
        </Heading>
        <VerticalSpace size="small" />
        {createOrUpdate === "create" && (
          <Alert variant="info">
            If not already done, a service provider product application must be
            created before creating a service providing group product
            application.
          </Alert>
        )}
        <AutocompleteReferenceInput
          {...fields.service_providing_group_id}
          filter={{ status: "active" }}
          reference="service_providing_group"
          readOnly={!!record?.service_providing_group_id}
          descriptionOverride={translate("text.spgpa_spg_override_description")}
          tooltip={false}
        />
        <PartyReferenceInput
          {...fields.procuring_system_operator_id}
          filter={{
            type: "system_operator",
            embed: "system_operator_product_type!",
            "system_operator_product_type.status": "active",
          }}
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
        <TextAreaInput
          {...fields.ramping_description}
          rows={5}
          description
          tooltip={false}
          infoElement={<RampingNotice />}
        />
        <TextAreaInput
          {...fields.additional_information}
          rows={8}
          description
          tooltip={false}
          warning="Please remember not to write any sensitive (power/market/personal) information in this field."
          infoElement={<AdditionalInformationNotice />}
        />
        <DateTimeInput
          {...fields.prequalified_at}
          description
          tooltip={false}
        />
        <DateTimeInput {...fields.verified_at} description tooltip={false} />
        <FormToolbarWithConfirmation
          confirmTitle={translate("ra.action.save")}
          confirmContent={
            <p>{translate("text.spga_save_confirmation_text")}</p>
          }
          onSuccess={
            createOrUpdate === "create" && spgId
              ? () => localStorage.removeItem(draftStorageKey(spgId, draftId))
              : undefined
          }
        />
      </FormContainer>
    </Form>
  );
};
