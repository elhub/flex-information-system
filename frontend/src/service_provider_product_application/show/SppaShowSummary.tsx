import { Button, Link, Panel } from "../../components/ui";
import { LabelValue } from "../../components/LabelValue";
import { Link as RouterLink } from "react-router-dom";
import { IconPencil } from "@elhub/ds-icons";
import { usePermissions } from "ra-core";
import { Permissions } from "../../auth/permissions";
import { ServiceProviderProductApplication } from "../../generated-client";
import { useGetAllProductTypes } from "../../product_type/components";
import { useParty } from "../../hooks/party";

type Props = {
  sppa: ServiceProviderProductApplication;
};

export const SppaShowSummary = ({ sppa }: Props) => {
  const { permissions } = usePermissions<Permissions>();
  const canEdit = permissions?.allow(
    "service_provider_product_application",
    "update",
  );

  const serviceProvider = useParty(sppa.service_provider_id);
  const systemOperator = useParty(sppa.system_operator_id);
  const productTypes = useGetAllProductTypes();

  if (serviceProvider.error) throw serviceProvider.error;
  if (systemOperator.error) throw systemOperator.error;

  const productTypeNames = productTypes
    ?.filter((pt) => sppa.product_type_ids.includes(pt.id))
    .map((pt) => pt.name)
    .join(", ");

  return (
    <Panel
      border
      className="bg-semantic-background-alternative h-fit p-4 sm:p-5"
    >
      {canEdit && (
        <div className="flex justify-end">
          <Button
            as={RouterLink}
            to={`/service_provider_product_application/${sppa.id}`}
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
          label="Service provider"
          value={
            <Link
              as={RouterLink}
              to={`/party/${sppa.service_provider_id}/show`}
            >
              {serviceProvider.data?.name}
            </Link>
          }
        />

        <LabelValue
          size="small"
          label="System operator"
          value={
            <Link as={RouterLink} to={`/party/${sppa.system_operator_id}/show`}>
              {systemOperator.data?.name}
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
          label="Qualified at"
          value={sppa.qualified_at}
        />
      </div>
    </Panel>
  );
};
