import { LabelValue } from "../../../components/LabelValue";
import { ServiceProvidingGroupProductApplication } from "../../../generated-client";
import { useTranslateEnum } from "../../../intl/intl";

type Props = {
  spgpa: ServiceProvidingGroupProductApplication;
  spgName: string | undefined;
  spgId: number | undefined;
  psoName: string | undefined;
  productTypeNames: string | undefined;
};

export const SpgpaPrintSummary = ({
  spgpa,
  spgName,
  spgId,
  psoName,
  productTypeNames,
}: Props) => {
  const translateEnum = useTranslateEnum();

  return (
    <div className="flex flex-col gap-4">
      <LabelValue
        size="small"
        label="Service providing group"
        value={`${spgName} (#${spgId})`}
      />

      <LabelValue size="small" label="System Operator / PSO" value={psoName} />

      <LabelValue size="small" label="Product types" value={productTypeNames} />

      <LabelValue
        size="small"
        label="Max active power (up)"
        value={spgpa.maximum_active_power_up}
        unit="kW"
      />

      <LabelValue
        size="small"
        label="Max active power (down)"
        value={spgpa.maximum_active_power_down}
        unit="kW"
      />

      {spgpa.ramping_capability && (
        <LabelValue
          size="small"
          labelKey="service_providing_group_product_application.ramping_capability"
          value={translateEnum(
            `service_providing_group_product_application.ramping_capability.${spgpa.ramping_capability}`,
          )}
        />
      )}

      {spgpa.ramping_description && (
        <LabelValue
          size="small"
          labelKey="service_providing_group_product_application.ramping_description"
          value={
            <span className="whitespace-pre-wrap">
              {spgpa.ramping_description}
            </span>
          }
        />
      )}

      <LabelValue
        size="small"
        label="Prequalified at"
        value={spgpa.prequalified_at}
      />
      <LabelValue size="small" label="Verified at" value={spgpa.verified_at} />

      {spgpa.additional_information && (
        <LabelValue
          size="small"
          label="Additional information"
          value={
            <span className="whitespace-pre-wrap">
              {spgpa.additional_information}
            </span>
          }
        />
      )}
    </div>
  );
};
