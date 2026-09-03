import { usePermissions } from "ra-core";
import { FunctionField } from "react-admin";
import { Link } from "react-router-dom";
import { Datagrid } from "../components/EDS-ra/list/Datagrid";
import { List } from "../components/EDS-ra/list/List";
import { DateField } from "../components/EDS-ra/fields/DateField";
import { ReferenceField } from "../components/EDS-ra/fields/ReferenceField";
import { StatusBadgeField } from "../components/EDS-ra/fields/StatusBadgeField";
import { TextField } from "../components/EDS-ra/fields/TextField";
import { sppaStatusVariantMap } from "./show/sppaStatus";
import { EnumArrayInput } from "../components/EDS-ra/inputs/EnumArrayInput";
import { PartyReferenceInput } from "../components/EDS-ra/inputs/PartyReferenceInput";
import { Button, Tooltip } from "../components/ui";
import { IconPlus, IconQuestionCircleOutlined } from "@elhub/ds-icons";
import { ProductTypeArrayField } from "../components/ProductTypeArrayField";
import {
  isProductApplicationBlocked,
  getProductApplicationBlockDate,
} from "../productApplicationBlock";
import { Permissions } from "../auth/permissions";
import { zServiceProviderProductApplication } from "../generated-client/zod.gen";
import { getFields } from "../zod";
import { useTranslateField } from "../intl/intl";

const BlockedCreateButton = () => (
  <div className="flex items-center gap-1">
    <Button variant="primary" icon={IconPlus} iconPosition="left" disabled>
      Create
    </Button>
    <Tooltip
      content={`Product applications cannot be created before ${getProductApplicationBlockDate()}`}
      className="max-w-2xl"
    >
      <IconQuestionCircleOutlined
        size="small"
        className="text-semantic-text-subtle cursor-help"
      />
    </Tooltip>
  </div>
);

const CreateButton = () => (
  <Button
    as={Link}
    icon={IconPlus}
    to="/service_provider_product_application/create"
    variant="invisible"
  >
    Create
  </Button>
);

export const ServiceProviderProductApplicationList = () => {
  const fields = getFields(zServiceProviderProductApplication.shape);
  const blocked = isProductApplicationBlocked();
  const { permissions } = usePermissions<Permissions>();
  const t = useTranslateField();
  const canCreate = !!permissions?.allow(
    "service_provider_product_application",
    "create",
  );

  const filters = [
    <PartyReferenceInput
      key="service_provider_id"
      source="service_provider_id"
      optionText={(record) => record.name}
    />,
    <PartyReferenceInput
      key="system_operator_id"
      source="system_operator_id"
      optionText={(record) => record.name}
    />,
    <EnumArrayInput
      key="status"
      enumKey="service_provider_product_application.status"
      source="status@in"
    />,
  ];

  const actions = !canCreate
    ? []
    : blocked
      ? [<BlockedCreateButton key="create" />]
      : [<CreateButton key="create" />];

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      actions={actions}
      filters={filters}
    >
      <Datagrid
        rowClick={(r) => `/service_provider_product_application/${r.id}/show`}
      >
        <TextField source={fields.id.source} />
        <ReferenceField
          source={fields.service_provider_id.source}
          reference="party"
          label={t("service_provider_product_application.service_provider_id")}
          hideLabel={true}
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          source={fields.system_operator_id.source}
          reference="party"
          label={t("service_provider_product_application.system_operator_id")}
          hideLabel={true}
        >
          <TextField source="name" />
        </ReferenceField>
        <FunctionField
          source={fields.product_type_ids.source}
          render={(record) => (
            <ProductTypeArrayField productTypeIds={record.product_type_ids} />
          )}
        />
        <StatusBadgeField
          source={fields.status.source}
          enumKey="service_provider_product_application.status"
          variantMap={sppaStatusVariantMap}
        />
        <DateField source={fields.qualified_at.source} showTime />
      </Datagrid>
    </List>
  );
};
