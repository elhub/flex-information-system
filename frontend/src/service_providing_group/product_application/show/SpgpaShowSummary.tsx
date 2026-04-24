import { Button, Link, Panel } from "../../../components/ui";
import { LabelValue } from "../../../components/LabelValue";
import { Link as RouterLink } from "react-router-dom";
import { IconPencil } from "@elhub/ds-icons";
import { usePermissions } from "ra-core";
import type { Permissions } from "../../../auth/permissions";
import {
  ServiceProvidingGroup,
  ServiceProvidingGroupProductApplication,
} from "../../../generated-client";
import { useGetAllProductTypes } from "../../../product_type/components";
import { useParty } from "../../../hooks/party";
import {
  EventButton,
  NestedResourceHistoryButton,
} from "../../../components/EDS-ra/buttons";

type Props = {
  spgpa: ServiceProvidingGroupProductApplication;
  spg: ServiceProvidingGroup | undefined;
};

export const SpgpaShowSummary = ({ spgpa, spg }: Props) => {
  const { permissions } = usePermissions<Permissions>();
  const canEdit = permissions?.allow(
    "service_providing_group_product_application",
    "update",
  );

  const procuringServiceProvider = useParty(spgpa.procuring_system_operator_id);
  const productTypes = useGetAllProductTypes();

  if (procuringServiceProvider.error) throw procuringServiceProvider.error;

  const productTypeNames = productTypes
    ?.filter((pt) => spgpa.product_type_ids.includes(pt.id))
    .map((pt) => pt.name)
    .join(", ");

  return (
    <div className="flex flex-col gap-4">
      <Panel
        border
        className="bg-semantic-background-alternative h-fit p-4 sm:p-5"
      >
        {canEdit && (
          <div className="flex justify-end">
            <Button
              as={RouterLink}
              to={`/service_providing_group/${spgpa.service_providing_group_id}/product_application/${spgpa.id}`}
              variant="invisible"
              icon={IconPencil}
            >
              Edit
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {/* Application fields */}
          <LabelValue
            size="small"
            label="Service providing group"
            value={
              <Link
                as={RouterLink}
                to={`/service_providing_group/${spgpa.service_providing_group_id}/show`}
              >
                {spg?.name} (#{spg?.id})
              </Link>
            }
          />

          <LabelValue
            size="small"
            label="System Operator / PSO"
            value={
              <Link
                as={RouterLink}
                to={`/party/${spgpa.procuring_system_operator_id}/show`}
              >
                {procuringServiceProvider.data?.name}
              </Link>
            }
          />

          <LabelValue
            size="small"
            label="Product types"
            value={productTypeNames}
          />

          <LabelValue
            size="small"
            label="Max active power (up)"
            value={spgpa.maximum_active_power_up}
            unit="kW"
          />

          <LabelValue
            size="small"
            label="Max active power (down)"
            value={spgpa.maximum_active_power_down}
            unit="kW"
          />

          <LabelValue
            size="small"
            label="Prequalified at"
            value={spgpa.prequalified_at}
          />
          <LabelValue
            size="small"
            label="Verified at"
            value={spgpa.verified_at}
          />

          {spgpa.additional_information && (
            <LabelValue
              label="Additional information"
              value={spgpa.additional_information}
            />
          )}
        </div>
      </Panel>
      <div className="flex gap-4 mt-2">
        <NestedResourceHistoryButton child="product_application" />
        <EventButton filterOnSubject recordId={String(spgpa.id)} />
      </div>
    </div>
  );
};
