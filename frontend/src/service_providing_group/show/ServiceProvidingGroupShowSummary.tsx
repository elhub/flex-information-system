import { EnumField, ReferenceField } from "../../components/EDS-ra";
import { BodyText, Loader, Panel } from "../../components/ui";
import { RecordContextProvider } from "ra-core";
import { useSpgShowViewModel } from "./useSpgShowViewModel";
import { ServiceProvidingGroup } from "../../generated-client";

const FieldItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <BodyText size="small" weight="bold">
      {label}
    </BodyText>
    <BodyText size="small">{value}</BodyText>
  </div>
);

const formatUnit = (value: number | undefined, unit: string) => {
  if (value === undefined) {
    return "-";
  }

  return `${Math.round(value)} ${unit}`;
};

export const ServiceProvidingGroupShowSummary = ({
  spg,
}: {
  spg: ServiceProvidingGroup;
}) => {
  const { data, isLoading } = useSpgShowViewModel(spg.id);

  if (isLoading) {
    return <Loader size="small" />;
  }

  return (
    <Panel
      border
      className="bg-semantic-background-alternative h-fit p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4">
        <RecordContextProvider value={spg}>
          <ReferenceField
            labelDirection="column"
            source="service_provider_id"
            reference="party"
            label
          />

          <div className="flex flex-col gap-1">
            <EnumField
              labelDirection="column"
              label
              source="bidding_zone"
              enumKey="service_providing_group.bidding_zone"
            />
          </div>
        </RecordContextProvider>
        <FieldItem
          label="Capacity - Consumption"
          value={formatUnit(data?.consumptionCapacityKw, "kW")}
        />
        <FieldItem
          label="Capacity - Production"
          value={formatUnit(data?.productionCapacityKw, "kW")}
        />
        <FieldItem
          label="Total capacity"
          value={formatUnit(data?.totalCapacityKw, "kW")}
        />
      </div>
    </Panel>
  );
};
