import { Form, useGetIdentity, useRecordContext, useTranslate } from "ra-core";
import { FieldValues, Resolver, useFormContext } from "react-hook-form";
import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getFields, unTypedZodResolver } from "../../zod";
import { useCreateOrUpdate } from "../../auth";
import {
  Alert,
  FormContainer,
  Heading,
  Loader,
  VerticalSpace,
} from "../../components/ui";
import {
  TextAreaInput,
  TextInput,
  EnumInput,
  BooleanInput,
  DateInput,
  AutocompleteReferenceInput,
  PartyReferenceInput,
  FormToolbarWithConfirmation,
  UnitInput,
  DateTimeInput,
  FormToolbar,
} from "../../components/EDS-ra/inputs";
import {
  SystemOperatorProductTypeInput,
  useProductTypes,
} from "../../product_type/components";
import { draftStorageKey } from "../../hooks/useSpgpaDrafts";
import { DraftAutosaveWatcher } from "./DraftAutosaveWatcher";
import {
  zSpgpaApplicationDetailsFcrD,
  zSpgpaApplicationDetailsMfrr,
  zSpgpaApplicationDetailsFcrN,
} from "../../generated-client/zod.gen";
import {
  FCR_D_KIND,
  FCR_N_KIND,
  MFRR_KIND,
  hasApplicationDetails,
  spgpaFormSchema,
  spgpaFormSchemaWithoutDetails,
  spgpaPartialFormSchema,
  toApiValues,
  toFormValues,
} from "./spgpaDetails";

const POWER_UNITS = [
  { label: "kW", scale: 1 },
  { label: "MW", scale: 1000 },
];

const DETAILS = "application_details";

const RampingNotice = () => {
  const translate = useTranslate();
  const { watch } = useFormContext();
  const rampingCapability = watch(`${DETAILS}.ramping_capability`);

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

// the product type chosen in the form, which decides the fields to show
const useSelectedKind = () => {
  const { watch } = useFormContext();
  const { data: productTypes } = useProductTypes();
  const productTypeId: number | undefined = watch("product_type_ids")?.[0];

  return {
    productTypeSelected: productTypeId !== undefined,
    kind: productTypes?.find((pt) => pt.id === productTypeId)?.business_id,
  };
};

const useApplicationDetailsKind = (kind: string | undefined) => {
  const { getValues, setValue } = useFormContext();

  // the details have to match the product type, so they restart when it changes
  useEffect(() => {
    if (kind === undefined) return;
    const current = getValues(DETAILS)?.kind;
    if (hasApplicationDetails(kind) && current !== kind) {
      setValue(DETAILS, { kind }, { shouldDirty: true });
    } else if (!hasApplicationDetails(kind) && current !== undefined) {
      setValue(DETAILS, undefined, { shouldDirty: true });
    }
  }, [kind, getValues, setValue]);
};

const MfrrFields = () => {
  const translate = useTranslate();
  const fields = getFields(zSpgpaApplicationDetailsMfrr.shape);
  const label = (key: string) =>
    translate(`field.service_providing_group_product_application.${key}`);

  return (
    <>
      <UnitInput
        {...fields.maximum_active_power_up}
        source={`${DETAILS}.maximum_active_power_up`}
        overrideLabel={label("maximum_active_power_up")}
        units={POWER_UNITS}
        descriptionOverride={translate(
          "text.spgpa_maximum_active_power_up_description",
        )}
        tooltip={false}
      />
      <UnitInput
        {...fields.maximum_active_power_down}
        source={`${DETAILS}.maximum_active_power_down`}
        overrideLabel={label("maximum_active_power_down")}
        units={POWER_UNITS}
        descriptionOverride={translate(
          "text.spgpa_maximum_active_power_down_description",
        )}
        tooltip={false}
      />
      <EnumInput
        {...fields.ramping_capability}
        source={`${DETAILS}.ramping_capability`}
        overrideLabel={label("ramping_capability")}
        enumKey="service_providing_group_product_application.ramping_capability"
        descriptionOverride={translate(
          "text.spgpa_ramping_capability_description",
        )}
        tooltip={false}
      />
      <TextAreaInput
        {...fields.ramping_description}
        source={`${DETAILS}.ramping_description`}
        overrideLabel={label("ramping_description")}
        rows={5}
        tooltip={false}
        infoElement={<RampingNotice />}
      />
      <TextAreaInput
        {...fields.additional_information}
        source={`${DETAILS}.additional_information`}
        overrideLabel={label("additional_information")}
        rows={8}
        tooltip={false}
        warning="Please remember not to write any sensitive (power/market/personal) information in this field."
        infoElement={<AdditionalInformationNotice />}
      />
    </>
  );
};

// fields shared by FCR-N and FCR-D
const FcrCommonFields = () => {
  const translate = useTranslate();
  const fields = getFields(zSpgpaApplicationDetailsFcrD.shape);
  const text = (key: string) => ({
    overrideLabel: translate(`text.spgpa_${key}`),
    descriptionOverride: translate(`text.spgpa_${key}_description`),
    tooltip: false,
  });

  return (
    <>
      <TextInput
        {...fields.service_provider_contact_information}
        source={`${DETAILS}.service_provider_contact_information`}
        {...text("service_provider_contact_information")}
      />
      <TextInput
        {...fields.technical_contact_information}
        source={`${DETAILS}.technical_contact_information`}
        {...text("technical_contact_information")}
      />
      <BooleanInput
        {...fields.limited_energy_reservoir}
        source={`${DETAILS}.limited_energy_reservoir`}
        {...text("limited_energy_reservoir")}
      />
      <BooleanInput
        {...fields.variable_production_consumption}
        source={`${DETAILS}.variable_production_consumption`}
        {...text("variable_production_consumption")}
      />
      <DateInput
        {...fields.planned_prequalification_test_date}
        source={`${DETAILS}.planned_prequalification_test_date`}
        {...text("planned_prequalification_test_date")}
      />
    </>
  );
};

const FcrNFields = () => {
  const translate = useTranslate();
  const fields = getFields(zSpgpaApplicationDetailsFcrN.shape);

  return (
    <>
      <FcrCommonFields />
      <UnitInput
        {...fields.maximum_active_power_up}
        source={`${DETAILS}.maximum_active_power`}
        overrideLabel={translate("text.spgpa_maximum_active_power")}
        units={POWER_UNITS}
        descriptionOverride={translate(
          "text.spgpa_maximum_active_power_description",
        )}
        tooltip={false}
      />
    </>
  );
};

const FcrDFields = () => {
  const translate = useTranslate();
  const fields = getFields(zSpgpaApplicationDetailsFcrD.shape);
  const label = (key: string) =>
    translate(`field.service_providing_group_product_application.${key}`);

  return (
    <>
      <FcrCommonFields />
      <UnitInput
        {...fields.maximum_active_power_up}
        source={`${DETAILS}.maximum_active_power_up`}
        overrideLabel={label("maximum_active_power_up")}
        units={POWER_UNITS}
        descriptionOverride={translate(
          "text.spgpa_maximum_active_power_up_description",
        )}
        tooltip={false}
      />
      <UnitInput
        {...fields.maximum_active_power_down}
        source={`${DETAILS}.maximum_active_power_down`}
        overrideLabel={label("maximum_active_power_down")}
        units={POWER_UNITS}
        descriptionOverride={translate(
          "text.spgpa_maximum_active_power_down_description",
        )}
        tooltip={false}
      />
    </>
  );
};

const DETAILS_FIELDS: Record<string, () => ReactNode> = {
  [MFRR_KIND]: () => <MfrrFields />,
  [FCR_N_KIND]: () => <FcrNFields />,
  [FCR_D_KIND]: () => <FcrDFields />,
};

// the fields depend on the product type, so nothing is shown until one is chosen
const ProductSpecificFields = ({
  createOrUpdate,
}: {
  createOrUpdate: "create" | "update" | null;
}) => {
  const { productTypeSelected, kind } = useSelectedKind();
  const fields = getFields(spgpaFormSchema.shape);
  useApplicationDetailsKind(kind);

  if (!productTypeSelected) return null;

  return (
    <>
      <EnumInput
        {...fields.status}
        enumKey="service_providing_group_product_application.status"
        defaultValue="requested"
        readOnly={createOrUpdate === "create"}
        description
        tooltip={false}
      />
      {kind !== undefined && hasApplicationDetails(kind)
        ? DETAILS_FIELDS[kind]()
        : null}
      <DateTimeInput {...fields.prequalified_at} description tooltip={false} />
      <DateTimeInput {...fields.verified_at} description tooltip={false} />
      <DateTimeInput {...fields.complete_at} description tooltip={false} />
    </>
  );
};

// common layout to create and edit pages
export const ServiceProvidingGroupProductApplicationInput = () => {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();

  // Read the draft ID from location state when restoring a saved draft.
  // This must be extracted before Zod parses the state, as Zod strips unknown keys.
  const restoredDraftId = overrideRecord?.__draftId as string | undefined;

  const parsedOverrideRecord = spgpaPartialFormSchema.parse(
    overrideRecord ?? {},
  );

  const record = { ...toFormValues(actualRecord), ...parsedOverrideRecord };
  const { data: productTypes } = useProductTypes();

  // the form is validated for the variant of the product type, and the form
  // values are mapped to the API format when they are valid
  const resolver: Resolver<FieldValues> = async (values, context, options) => {
    const kind = productTypes?.find(
      (pt) => pt.id === values.product_type_ids?.[0],
    )?.business_id;
    const schema = hasApplicationDetails(kind)
      ? spgpaFormSchema
      : spgpaFormSchemaWithoutDetails;
    const result = await unTypedZodResolver(schema)(values, context, options);
    if (Object.keys(result.errors).length > 0) return result;
    return { values: toApiValues(result.values), errors: {} };
  };
  const createOrUpdate = useCreateOrUpdate();
  const { data: identity, isLoading: identityLoading } = useGetIdentity();

  const [draftId] = useState(() => restoredDraftId ?? crypto.randomUUID());

  const fields = getFields(spgpaFormSchema.shape);

  const recordSpgId = record?.service_providing_group_id as number | undefined;
  const isServiceProvider = identity?.role === "flex_service_provider";

  const handleCreateSuccess = (values: FieldValues) => {
    const spgId = values.service_providing_group_id as number | undefined;

    if (spgId !== undefined) {
      localStorage.removeItem(draftStorageKey(spgId, draftId));
    }

    navigate(-1);
  };

  if (identityLoading) return <Loader />;

  return (
    <Form record={record} resolver={resolver} sanitizeEmptyValues>
      {createOrUpdate === "create" && (
        <DraftAutosaveWatcher spgId={recordSpgId} draftId={draftId} />
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
        <SystemOperatorProductTypeInput
          {...fields.product_type_ids}
          systemOperatorSource="procuring_system_operator_id"
          description
          tooltip={false}
        />
        <ProductSpecificFields createOrUpdate={createOrUpdate} />
        {isServiceProvider ? (
          <FormToolbarWithConfirmation
            confirmTitle={translate("ra.action.save")}
            confirmContent={
              <p>{translate("text.spga_save_confirmation_text")}</p>
            }
            onSuccess={
              createOrUpdate === "create" ? handleCreateSuccess : undefined
            }
          />
        ) : (
          <FormToolbar />
        )}
      </FormContainer>
    </Form>
  );
};
