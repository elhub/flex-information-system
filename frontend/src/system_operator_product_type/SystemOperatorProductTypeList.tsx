import { List, ReferenceField, TextField } from "react-admin";
import { Datagrid, PartyReferenceInput } from "../auth";
import { DateField } from "../components/datetime";
import { QuickFilter } from "../components/QuickFilter";
import {
  ProductTypeArrayInput,
  ProductTypeField,
} from "../product_type/components";

export const SystemOperatorProductTypeList = () => {
  const SystemOperatorProductTypeListFilters = [
    <PartyReferenceInput
      key="system_operator_id"
      source="system_operator_id"
      alwaysOn
    />,
    <ProductTypeArrayInput
      key="product_type_id"
      label="Product types"
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
        <TextField source="id" />
        <ReferenceField source="system_operator_id" reference="party">
          <TextField source="name" />
        </ReferenceField>
        <ProductTypeField source="product_type_id" />
        <TextField source="status" />
        <DateField source="recorded_at" showTime />
      </Datagrid>
    </List>
  );
};
