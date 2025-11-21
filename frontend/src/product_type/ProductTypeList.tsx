import { List, TextField } from "react-admin";
import { Datagrid } from "../auth";

export const ProductTypeList = () => (
  <List perPage={25} sort={{ field: "id", order: "ASC" }}>
    <Datagrid>
      <TextField source="id" label="ID" />
      <TextField source="business_id" label="Business ID" />
      <TextField source="name" />
      <TextField source="service" />
      <TextField source="products" />
    </Datagrid>
  </List>
);
export default ProductTypeList;
