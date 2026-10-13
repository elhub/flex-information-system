import {
  Card,
  CardContent,
  CardHeader,
  CardHeaderContent,
  CardTitle,
  Loader,
} from "../../components/ui";
import { LabelValue } from "../../components/LabelValue";
import { KILO } from "../../utils/scales";
import { useTechnicalResources } from "../technical_resource/useTechnicalResources";
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
    <Card className="h-fit">
      <CardHeader>
        <CardHeaderContent>
          <CardTitle>
            {translate("text.cu_technical_resource_summary.heading")} ({count})
          </CardTitle>
        </CardHeaderContent>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
      </CardContent>
    </Card>
  );
};
