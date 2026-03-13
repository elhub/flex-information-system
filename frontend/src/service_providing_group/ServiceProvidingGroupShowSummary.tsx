import { EnumField, ReferenceField, TextField } from "../components/EDS-ra";
import { BodyText, Loader, Panel } from "../components/ui";
import { useRecordContext } from "ra-core";
import { useSpgShowViewModel } from "./useSpgShowViewModel";

const FieldItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5">
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

export const ServiceProvidingGroupShowSummary = () => {
  const spgRecord = useRecordContext<{ id: number }>();
  const { data, isLoading } = useSpgShowViewModel(spgRecord);

  if (isLoading) {
    return <Loader size="small" />;
  }

  const containsRows = data?.containsRows ?? [];

  return (
    <Panel border className="bg-background-alternative h-fit p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        <ReferenceField source="service_provider_id" reference="party" label>
          <TextField source="name" />
        </ReferenceField>

        <div className="flex flex-col gap-1">
          <BodyText size="small" weight="bold">
            Bidding zone
          </BodyText>
          <EnumField
            source="bidding_zone"
            enumKey="service_providing_group.bidding_zone"
          />
        </div>

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

        <div className="flex flex-col gap-1">
          <BodyText size="small" weight="bold">
            Contains
          </BodyText>
          {containsRows.length === 0 ? (
            <BodyText size="small">-</BodyText>
          ) : (
            <div className="grid grid-cols-[28px_minmax(0,1fr)_92px] gap-x-2 gap-y-1">
              {containsRows.map((row) => (
                <div key={row.type} className="contents">
                  <BodyText size="small">{row.count}</BodyText>
                  <BodyText size="small">{row.type}</BodyText>
                  <BodyText size="small" className="text-right">
                    {formatUnit(row.capacityKw, "kW")}
                  </BodyText>
                </div>
              ))}
            </div>
          )}
        </div>

        <FieldItem label="Notes" value="-" />
      </div>
    </Panel>
  );
};
