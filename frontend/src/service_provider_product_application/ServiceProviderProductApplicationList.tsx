import {
  CreateButton,
  List,
  ReferenceField,
  TextField,
  TopToolbar,
} from "react-admin";
import { Datagrid, PartyReferenceInput } from "../auth";
import { DateField } from "../components/datetime";
import { ProductTypeArrayField } from "../product_type/components";
import { EnumArrayInput, EnumField } from "../components/enum";
import {
  isProductApplicationBlocked,
  getProductApplicationBlockDate,
} from "../productApplicationBlock";
import { Button, Tooltip } from "../components/ui";
import { IconPlus, IconQuestionCircleOutlined } from "@elhub/ds-icons";

export const ServiceProviderProductApplicationList = () => {
  const ServiceProviderProductApplicationListFilters = [
    <PartyReferenceInput
      key="service_provider_id"
      source="service_provider_id"
      label="field.service_provider_product_application.service_provider_id"
      alwaysOn
    />,
    <PartyReferenceInput
      key="system_operator_id"
      source="system_operator_id"
      label="field.service_provider_product_application.system_operator_id"
      alwaysOn
    />,
    <EnumArrayInput
      key="status"
      enumKey="service_provider_product_application.status"
      label="field.service_provider_product_application.status"
      source="status@in"
      alwaysOn
    />,
  ];

  const blocked = isProductApplicationBlocked();

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      actions={
        <TopToolbar>
          {blocked ? (
            <div className="flex items-center gap-1">
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
            </div>
          ) : (
            <CreateButton />
          )}
        </TopToolbar>
      }
      filters={ServiceProviderProductApplicationListFilters}
    >
      <Datagrid>
        <TextField
          source="id"
          label="field.service_provider_product_application.id"
        />
        <ReferenceField
          source="service_provider_id"
          reference="party"
          sortable={false}
          label="field.service_provider_product_application.service_provider_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          source="system_operator_id"
          reference="party"
          sortable={false}
          label="field.service_provider_product_application.system_operator_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <ProductTypeArrayField
          label="field.service_provider_product_application.product_type_ids"
          source="product_type_ids"
        />
        <EnumField
          source="status"
          enumKey="service_provider_product_application.status"
          label="field.service_provider_product_application.status"
        />
        <DateField
          source="qualified_at"
          showTime
          label="field.service_provider_product_application.qualified_at"
        />
      </Datagrid>
    </List>
  );
};
