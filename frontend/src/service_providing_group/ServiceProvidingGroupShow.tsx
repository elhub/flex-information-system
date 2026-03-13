import { IconUser } from "@elhub/ds-icons";
import { Show } from "../components/EDS-ra";
import { BodyText, Button } from "../components/ui";
import { usePermissions, useRecordContext } from "ra-core";
import { Permissions } from "../auth/permissions";
import { Link as RouterLink } from "react-router-dom";
import { ServiceProvidingGroupShowSummary } from "./ServiceProvidingGroupShowSummary";
import { ServiceProvidingGroupShowTable } from "./ServiceProvidingGroupShowTable";

export const ServiceProvidingGroupShow = () => {
  const record = useRecordContext<{ id?: number; name?: string }>();
  const { permissions } = usePermissions<Permissions>();
  const canManageMembers = permissions?.allow(
    "service_providing_group_membership",
    "create",
  );
  return (
    <Show>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <BodyText weight="bold" size="large">
            {`<- Group details${record?.name ? ` - ${record.name}` : ""}`}
          </BodyText>

          {record?.id && canManageMembers ? (
            <Button
              as={RouterLink}
              to={`/service_providing_group/${record.id}/manage-members`}
              variant="invisible"
              icon={IconUser}
            >
              Manage members
            </Button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[475px_minmax(0,1fr)]">
          <ServiceProvidingGroupShowSummary />
          <ServiceProvidingGroupShowTable />
        </div>
      </div>
    </Show>
  );
};
