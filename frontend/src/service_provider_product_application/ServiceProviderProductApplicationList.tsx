import { Link } from "react-router-dom";
import { List, Datagrid } from "../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  ReferenceField,
  TextField,
} from "../components/EDS-ra/fields";
import {
  EnumArrayInput,
  PartyReferenceInput,
} from "../components/EDS-ra/inputs";
import { Button, Tooltip } from "../components/ui";
import { IconPlus, IconQuestionCircleOutlined } from "@elhub/ds-icons";
import { ProductTypeArrayField } from "../product_type/components";
import {
  isProductApplicationBlocked,
  getProductApplicationBlockDate,
} from "../productApplicationBlock";
import { zServiceProviderProductApplication } from "../generated-client/zod.gen";
import { getFields } from "../zod";

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

  const filters = [
    <PartyReferenceInput
      key="service_provider_id"
      source="service_provider_id"
    />,
    <PartyReferenceInput
      key="system_operator_id"
      source="system_operator_id"
    />,
    <EnumArrayInput
      key="status"
      enumKey="service_provider_product_application.status"
      source="status@in"
    />,
  ];

  const actions = blocked
    ? [
        <div key="create-blocked" className="flex items-center gap-1">
          <Button
            variant="primary"
            icon={IconPlus}
            iconPosition="left"
            disabled
          >
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
        </div>,
      ]
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
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          source={fields.system_operator_id.source}
          reference="party"
        >
          <TextField source="name" />
        </ReferenceField>
        <ProductTypeArrayField source={fields.product_type_ids.source} />
        <EnumField
          source={fields.status.source}
          enumKey="service_provider_product_application.status"
        />
        <DateField source={fields.qualified_at.source} showTime />
      </Datagrid>
    </List>
  );
};
