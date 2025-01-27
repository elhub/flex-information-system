import { List, TextField, FunctionField, useTranslateLabel } from "react-admin";
import { Datagrid } from "../auth";

export const ProductTypeList = () => {
  const translateLabel = useTranslateLabel();

  return (
    <List perPage={25} sort={{ field: "id", order: "ASC" }}>
      <Datagrid>
        <TextField source="id" />
        <TextField source="business_id" label="Business ID" />
        <FunctionField
          label="Name"
          render={(record) => translateLabel({ source: record.business_id })}
        />
        <TextField source="category" />
        <TextField source="market" />
        <TextField source="market_type" />
        <TextField source="examples" />
      </Datagrid>
    </List>
  );
};
