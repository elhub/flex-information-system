import { LabelValue } from "../../../components/LabelValue";
import { useSpgpaDetailsSummary } from "../useSpgpaDetailsSummary";
import { ServiceProvidingGroupProductApplication } from "../../../generated-client";

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
  const detailsFields = useSpgpaDetailsSummary(spgpa.application_details);

  return (
    <div className="flex flex-col gap-4">
      <LabelValue
        size="small"
        label="Service providing group"
        value={`${spgName} (#${spgId})`}
      />

      <LabelValue size="small" label="System Operator / PSO" value={psoName} />

      <LabelValue size="small" label="Product types" value={productTypeNames} />

      {detailsFields.map(({ shouldShow, ...field }, index) =>
        (shouldShow ?? true) ? (
          <LabelValue key={index} size="small" {...field} />
        ) : null,
      )}

      <LabelValue
        size="small"
        label="Prequalified at"
        value={spgpa.prequalified_at}
      />
      <LabelValue size="small" label="Verified at" value={spgpa.verified_at} />
    </div>
  );
};
