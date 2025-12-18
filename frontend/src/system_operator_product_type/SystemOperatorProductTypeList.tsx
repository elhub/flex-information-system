import { List, ReferenceField, TextField } from "react-admin";
import { Datagrid, PartyReferenceInput } from "../auth";
import { DateField } from "../components/datetime";
import { QuickFilter } from "../components/QuickFilter";
import { ProductTypeArrayInput } from "../product_type/components";
import { EnumField } from "../components/enum";

export const SystemOperatorProductTypeList = () => {
  const SystemOperatorProductTypeListFilters = [
    <PartyReferenceInput
      key="system_operator_id"
      source="system_operator_id"
      label="field.system_operator_product_type.system_operator_id"
      alwaysOn
    />,
    <ProductTypeArrayInput
      key="product_type_id"
      label="field.system_operator_product_type.product_type_id"
      source="product_type_id@in"
      alwaysOn
    />,
    <QuickFilter
      key="status"
      source="status"
      label="Active only"
      defaultValue="active"
    />,
  ];

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={SystemOperatorProductTypeListFilters}
    >
      <Datagrid>
        <TextField source="id" label="field.system_operator_product_type.id" />
        <ReferenceField
          source="system_operator_id"
          reference="party"
          sortable={false}
          label="field.system_operator_product_type.system_operator_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          reference="product_type"
          source="product_type_id"
          sortable={false}
          label="field.system_operator_product_type.product_type_id"
        />
        <EnumField
          source="status"
          enumKey="system_operator_product_type.status"
          label="field.system_operator_product_type.status"
        />
        <DateField
          source="recorded_at"
          showTime
          label="field.system_operator_product_type.recorded_at"
        />
      </Datagrid>
    </List>
  );
};
