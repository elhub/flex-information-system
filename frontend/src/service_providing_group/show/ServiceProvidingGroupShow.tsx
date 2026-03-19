import { IconPencil, IconUser } from "@elhub/ds-icons";
import { BodyText, Button, Loader } from "../../components/ui";
import { usePermissions } from "ra-core";
import { Permissions } from "../../auth/permissions";
import { Link as RouterLink, useParams } from "react-router-dom";
import { ServiceProvidingGroupShowSummary } from "./ServiceProvidingGroupShowSummary";
import { ServiceProvidingGroupShowTable } from "./ServiceProvidingGroupShowTable";
import { readServiceProvidingGroup } from "../../generated-client";
import { throwOnError } from "../../util";
import { useQuery } from "@tanstack/react-query";

export const ServiceProvidingGroupShow = () => {
  const { permissions } = usePermissions<Permissions>();
  const spgId = useParams<{ id: string }>().id;
  const canManageMembers = permissions?.allow(
    "service_providing_group_membership",
    "create",
  );
  const canEdit = permissions?.allow("service_providing_group", "update");

  const { data: spg } = useQuery({
    queryKey: ["service_providing_group", spgId],
    queryFn: () =>
      readServiceProvidingGroup({ path: { id: Number(spgId) } }).then(
        throwOnError,
      ),
    enabled: !!spgId,
  });

  if (!spg) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BodyText weight="bold" size="large">
          {`<- Group details${spg.name ? ` - ${spg.name}` : ""}`}
        </BodyText>

        <div>
          {canManageMembers ? (
            <Button
              as={RouterLink}
              to={`/service_providing_group/${spgId}/manage-members`}
              variant="invisible"
              icon={IconUser}
            >
              Manage members
            </Button>
          ) : null}
          {canEdit ? (
            <Button
              as={RouterLink}
              to={`/service_providing_group/${spgId}/edit`}
              variant="invisible"
              icon={IconPencil}
            >
              Edit
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[475px_minmax(0,1fr)]">
        <ServiceProvidingGroupShowSummary spg={spg} />
        <ServiceProvidingGroupShowTable spgId={spg.id} />
      </div>
    </div>
  );
};
