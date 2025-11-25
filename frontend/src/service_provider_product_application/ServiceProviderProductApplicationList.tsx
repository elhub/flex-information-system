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
        <TextField source="id" label="ID" />
        <ReferenceField
          source="service_provider_id"
          reference="party"
          sortable={false}
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          source="system_operator_id"
          reference="party"
          sortable={false}
        >
          <TextField source="name" />
        </ReferenceField>
        <ProductTypeArrayField
          label="Product types"
          source="product_type_ids"
        />
        <TextField source="status" />
        <DateField source="qualified_at" showTime />
      </Datagrid>
    </List>
  );
};
