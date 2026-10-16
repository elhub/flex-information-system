import { Heading, Loader, Panel } from "../../../../components/ui";
import { LabelValue } from "../../../../components/LabelValue";
import { KILO } from "../../../../utils/scales";
import { useTechnicalResources } from "../../common/useTechnicalResources";
import { useTranslate } from "ra-core";

type Props = {
  controllableUnitId: number;
};

export const ControllableUnitTechnicalResourceSummary = ({
  controllableUnitId,
}: Props) => {
  const translate = useTranslate();
  const {
    data: technicalResources,
    isLoading,
    error,
  } = useTechnicalResources(controllableUnitId);

  if (error) throw error;
  if (isLoading) return <Loader />;

  const powers = (technicalResources ?? []).map(
    (resource) => resource.maximum_active_power,
  );
  const count = powers.length;
  const sum =
    Math.round(powers.reduce((total, power) => total + power, 0) * 1000) / 1000;
  const average = count > 0 ? Math.round((sum / count) * 100) / 100 : 0;
  const min = powers.reduce(
    (minimum, power) => Math.min(minimum, power),
    powers[0] ?? 0,
  );
  const max = powers.reduce(
    (maximum, power) => Math.max(maximum, power),
    powers[0] ?? 0,
  );

  return (
    <Panel border className="h-fit p-4 sm:p-5 flex flex-col gap-4">
      <Heading size="large">
        {translate("text.cu_technical_resource_summary.heading")}
      </Heading>
      <p>
        {translate("text.cu_technical_resource_summary.description_prefix")}{" "}
        <b>{count}</b>{" "}
        {translate("text.cu_technical_resource_summary.description_suffix")}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <LabelValue
          label={translate(
            "text.cu_technical_resource_summary.aggregated_rated_power",
          )}
          value={sum}
          unit="W"
          storageScale={KILO}
        />
        <LabelValue
          label={translate(
            "text.cu_technical_resource_summary.average_rated_power",
          )}
          value={average}
          unit="W"
          storageScale={KILO}
        />
        <LabelValue
          label={translate(
            "text.cu_technical_resource_summary.minimum_rated_power",
          )}
          value={min}
          unit="W"
          storageScale={KILO}
        />
        <LabelValue
          label={translate(
            "text.cu_technical_resource_summary.maximum_rated_power",
          )}
          value={max}
          unit="W"
          storageScale={KILO}
        />
      </div>
    </Panel>
  );
};
