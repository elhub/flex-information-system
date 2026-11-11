import { z } from "zod";
import { FieldValues } from "react-hook-form";
import {
  zServiceProvidingGroupProductApplicationCreateRequest,
  zSpgpaApplicationDetailsFcrD,
  zSpgpaApplicationDetailsFcrN,
  zSpgpaApplicationDetailsMfrr,
  zSpgpaMaximumActivePower,
} from "../../generated-client/zod.gen";
import type { SpgpaApplicationDetails } from "../../generated-client";

export const MFRR_KIND = "manual_frequency_restoration";
export const FCR_N_KIND = "automatic_frequency_containment";
export const FCR_D_KIND = "automatic_frequency_containment_disturbance";

const VARIANT_KINDS: string[] = [MFRR_KIND, FCR_N_KIND, FCR_D_KIND];

// Product types without a variant have no application details.
export const hasApplicationDetails = (kind: string | undefined) =>
  kind !== undefined && VARIANT_KINDS.includes(kind);

// FCR-N is symmetric, so the form only has one maximum active power, which is
// mapped to up and down when the form is sent to the API.
const zFcrNFormDetails = zSpgpaApplicationDetailsFcrN
  .omit({
    maximum_active_power_up: true,
    maximum_active_power_down: true,
  })
  .extend({ maximum_active_power: zSpgpaMaximumActivePower });

const zFormDetails = z.discriminatedUnion("kind", [
  zSpgpaApplicationDetailsMfrr,
  zFcrNFormDetails,
  zSpgpaApplicationDetailsFcrD,
]);

// The deprecated fields are replaced by application_details, and the
// assessment is made by the procuring system operator, so none of them are
// part of this form.
const zBaseFormSchema = zServiceProvidingGroupProductApplicationCreateRequest
  .omit({
    maximum_active_power_up: true,
    maximum_active_power_down: true,
    ramping_capability: true,
    ramping_description: true,
    additional_information: true,
    application_details: true,
    assessment_details: true,
  })
  .extend({ product_type_ids: z.array(z.coerce.number()).min(1) });

export const spgpaFormSchema = zBaseFormSchema.extend({
  application_details: zFormDetails,
});

export const spgpaFormSchemaWithoutDetails = zBaseFormSchema;

// Used to restore partially filled forms (e.g. drafts).
export const spgpaPartialFormSchema = zBaseFormSchema
  .partial()
  .extend({ application_details: z.looseObject({}).optional() });

export const toFormValues = (record: FieldValues | undefined) => {
  const details = record?.application_details;
  if (details?.kind !== FCR_N_KIND) return record;

  const { maximum_active_power_up, ...rest } = details;
  delete rest.maximum_active_power_down;
  return {
    ...record,
    application_details: {
      ...rest,
      maximum_active_power: maximum_active_power_up,
    },
  };
};

export const toApiValues = (values: FieldValues) => {
  const details = values.application_details;
  if (details?.kind !== FCR_N_KIND) return values;

  const { maximum_active_power, ...rest } = details;
  return {
    ...values,
    application_details: {
      ...rest,
      maximum_active_power_up: maximum_active_power,
      maximum_active_power_down: maximum_active_power,
    },
  };
};

// Reads the power of details in the API format or in the form format (drafts).
export const detailsPower = (
  details: SpgpaApplicationDetails | Record<string, unknown> | null | undefined,
) => {
  const d = details as Record<string, number | undefined> | null | undefined;
  return {
    up: d?.maximum_active_power_up ?? d?.maximum_active_power,
    down: d?.maximum_active_power_down ?? d?.maximum_active_power,
  };
};
