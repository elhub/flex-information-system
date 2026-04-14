import { Badge, Button, Link, Panel } from "../../../components/ui";
import { LabelValue } from "../../../components/LabelValue";
import { Link as RouterLink } from "react-router-dom";
import { IconPencil } from "@elhub/ds-icons";
import { RecordContextProvider, usePermissions } from "ra-core";
import { Permissions } from "../../../auth/permissions";
import { ServiceProvidingGroupProductApplication } from "../../../generated-client";
import { ProductTypeArrayField, useGetAllProductTypes } from "../../../product_type/components";
import { useParty } from "../../../hooks/party";
import { useServiceProvidingGroup } from "../../show/useSpgShowViewModel";

type Props = {
  spgpa: ServiceProvidingGroupProductApplication;
};

export const SpgpaShowSummary = ({ spgpa }: Props) => {
  const { permissions } = usePermissions<Permissions>();
  const canEdit = permissions?.allow(
    "service_providing_group_product_application",
    "update",
  );

  const spg = useServiceProvidingGroup(spgpa.service_providing_group_id);
  const procuringServiceProvider = useParty(spgpa.procuring_system_operator_id);

  const productTypes = useGetAllProductTypes();


  return (
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
              {spg.data?.name} (#{spg.data?.id})
            </Link>
          }
        />

        <LabelValue
          size="small"
          label="System Operator / PSO"
          value={<Link to={`/party/${spgpa.procuring_system_operator_id}`}>{procuringServiceProvider.data?.name}</Link>}
        />

        <LabelValue
          size="small"
          label="Product types"
          value={productTypes?.filter((pt) => spgpa.product_type_ids.includes(pt.id)).map((pt) => pt.name).join(", ")}
        />

        <LabelValue
          size="small"
          label="Max active power"
          value={spgpa.maximum_active_power}
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
  );
};
