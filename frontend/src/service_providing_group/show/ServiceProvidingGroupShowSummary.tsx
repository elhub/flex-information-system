import { EnumField, ReferenceField } from "../../components/EDS-ra";
import { Button, Loader, Panel } from "../../components/ui";
import { LabelValue } from "../../components/LabelValue";
import { RecordContextProvider, usePermissions } from "ra-core";
import { useSpgShowViewModel } from "./useSpgShowViewModel";
import { ServiceProvidingGroup } from "../../generated-client";
import { IconPencil } from "@elhub/ds-icons";
import { Link as RouterLink } from "react-router-dom";
import { Permissions } from "../../auth/permissions";

const formatUnit = (value: number | undefined, unit: string) => {
  if (value === undefined) {
    return "-";
  }

  return `${value.toFixed(3)} ${unit}`;
};

export const ServiceProvidingGroupShowSummary = ({
  spg,
}: {
  spg: ServiceProvidingGroup;
}) => {
  const { data, isLoading, error } = useSpgShowViewModel(spg.id);
  const { permissions } = usePermissions<Permissions>();
  const canEdit = permissions?.allow("service_providing_group", "update");

  if (isLoading) {
    return <Loader size="small" />;
  }

  if (error) {
    throw error;
  }

  return (
    <Panel
      border
      className="bg-semantic-background-alternative h-fit p-4 sm:p-5"
    >
      {canEdit && (
        <div className="flex justify-end">
          <Button
            as={RouterLink}
            to={`/service_providing_group/${spg.id}/edit`}
            variant="invisible"
            icon={IconPencil}
          >
            Edit
          </Button>
        </div>
      )}
      <div className="flex flex-col gap-4">
        <RecordContextProvider value={spg}>
          <ReferenceField
            labelDirection="column"
            source="service_provider_id"
            reference="party"
            label
          />

          <EnumField
            labelDirection="column"
            label
            source="bidding_zone"
            enumKey="service_providing_group.bidding_zone"
          />
        </RecordContextProvider>
        <LabelValue
          size="small"
          label="Capacity - Consumption"
          value={formatUnit(data?.consumptionCapacityKw, "kW")}
        />
        <LabelValue
          size="small"
          label="Capacity - Production"
          value={formatUnit(data?.productionCapacityKw, "kW")}
        />
        <LabelValue
          size="small"
          label="Total capacity"
          value={formatUnit(data?.totalCapacityKw, "kW")}
        />
        {spg.additional_information && (
          <LabelValue
            label="Additional information"
            value={spg.additional_information}
          />
        )}
      </div>
    </Panel>
  );
};
