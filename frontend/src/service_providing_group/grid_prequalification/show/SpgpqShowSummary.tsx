import { Button, Link, Panel } from "../../../components/ui";
import { LabelValue } from "../../../components/LabelValue";
import { Link as RouterLink } from "react-router-dom";
import { IconPencil } from "@elhub/ds-icons";
import { usePermissions } from "ra-core";
import type { Permissions } from "../../../auth/permissions";
import {
  ServiceProvidingGroup,
  ServiceProvidingGroupGridPrequalification,
} from "../../../generated-client";
import { useParty } from "../../../hooks/party";
import {
  EventButton,
  NestedResourceHistoryButton,
} from "../../../components/EDS-ra/buttons";

type Props = {
  spgpq: ServiceProvidingGroupGridPrequalification;
  spg: ServiceProvidingGroup | undefined;
  isHistory: boolean;
};

export const SpgpqShowSummary = ({ spgpq, spg, isHistory }: Props) => {
  const { permissions } = usePermissions<Permissions>();
  const canEdit = permissions?.allow(
    "service_providing_group_grid_prequalification",
    "update",
  );

  const impactedSystemOperator = useParty(spgpq.impacted_system_operator_id);

  if (impactedSystemOperator.error) throw impactedSystemOperator.error;

  return (
    <div className="flex flex-col gap-4">
      <Panel
        border
        className="bg-semantic-background-alternative h-fit p-4 sm:p-5"
      >
        {!isHistory && canEdit && (
          <div className="flex justify-end">
            <Button
              as={RouterLink}
              to={`/service_providing_group/${spgpq.service_providing_group_id}/grid_prequalification/${spgpq.id}`}
              variant="invisible"
              icon={IconPencil}
            >
              Edit
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-4">
          <LabelValue
            size="small"
            label="Service providing group"
            value={
              <Link
                as={RouterLink}
                to={`/service_providing_group/${spgpq.service_providing_group_id}/show`}
              >
                {spg?.name} (#{spg?.id})
              </Link>
            }
          />

          <LabelValue
            size="small"
            label="Impacted system operator"
            value={
              <Link
                as={RouterLink}
                to={`/party/${spgpq.impacted_system_operator_id}/show`}
              >
                {impactedSystemOperator.data?.name}
              </Link>
            }
          />

          <LabelValue
            size="small"
            label="Prequalified at"
            value={spgpq.prequalified_at}
          />
        </div>
      </Panel>
      {!isHistory && (
        <div className="flex gap-4 mt-2">
          <NestedResourceHistoryButton child="grid_prequalification" />
          <EventButton filterOnSubject recordId={String(spgpq.id)} />
        </div>
      )}
    </div>
  );
};
