import { List, TextField } from "react-admin";
import { Datagrid } from "../auth";

export const ProductTypeList = () => (
  <List perPage={25} sort={{ field: "id", order: "ASC" }}>
    <Datagrid>
      <TextField source="id" label="field.product_type.id" />
      <TextField source="business_id" label="field.product_type.business_id" />
      <TextField source="name" label="field.product_type.name" />
      <TextField source="service" label="field.product_type.service" />
      <TextField source="products" label="field.product_type.products" />
    </Datagrid>
  </List>
);
