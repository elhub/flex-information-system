import { List, ReferenceField, TextField } from "react-admin";
import { Datagrid } from "../auth";
import { useParams } from "react-router-dom";
import { historyRowClick } from "../components/history";
import { DateField } from "../components/datetime";

export const SystemOperatorProductTypeHistoryList = () => {
  const { system_operator_product_type_id } = useParams();
  return (
    <List
      resource="system_operator_product_type_history"
      filter={{
        system_operator_product_type_id: system_operator_product_type_id,
      }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid rowClick={historyRowClick}>
        <TextField source="id" label="ID" />
        <TextField source="system_operator_product_type_id" />
        <ReferenceField
          source="system_operator_id"
          reference="party"
          sortable={false}
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          reference="product_type"
          source="product_type_id"
          sortable={false}
        />
        <TextField source="status" />
        <DateField source="recorded_at" showTime />
        <DateField source="replaced_at" showTime />
      </Datagrid>
    </List>
  );
};
