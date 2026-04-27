import { EnumField, ReferenceField } from "../../components/EDS-ra";
import { Button, Panel } from "../../components/ui";
import { LabelValue } from "../../components/LabelValue";
import { RecordContextProvider, usePermissions } from "ra-core";
import { ServiceProvidingGroup } from "../../generated-client";
import { IconPencil } from "@elhub/ds-icons";
import { Link as RouterLink } from "react-router-dom";
import { Permissions } from "../../auth/permissions";

export const ServiceProvidingGroupShowSummary = ({
  spg,
}: {
  spg: ServiceProvidingGroup;
}) => {
  const { permissions } = usePermissions<Permissions>();
  const canEdit = permissions?.allow("service_providing_group", "update");

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
