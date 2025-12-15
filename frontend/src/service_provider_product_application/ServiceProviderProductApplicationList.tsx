import { List, ReferenceField, SelectArrayInput, TextField } from "react-admin";
import { Datagrid, PartyReferenceInput } from "../auth";
import { DateField } from "../components/datetime";
import { ProductTypeArrayField } from "../product_type/components";

export const ServiceProviderProductApplicationList = () => {
  const ServiceProviderProductApplicationListFilters = [
    <PartyReferenceInput
      key="service_provider_id"
      source="service_provider_id"
      alwaysOn
    />,
    <PartyReferenceInput
      key="system_operator_id"
      source="system_operator_id"
      alwaysOn
    />,
    <SelectArrayInput
      key="status"
      label="Status"
      source="status@in"
      choices={[
        "requested",
        "in_progress",
        "communication_test",
        "not_qualified",
        "qualified",
      ]}
      alwaysOn
    />,
  ];

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
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
        <TextField
          source="status"
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
