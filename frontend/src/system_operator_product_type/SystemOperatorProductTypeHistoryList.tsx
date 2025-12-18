import { List, ReferenceField, TextField } from "react-admin";
import { Datagrid } from "../auth";
import { useParams } from "react-router-dom";
import { historyRowClick } from "../components/history";
import { DateField } from "../components/datetime";
import { EnumField } from "../components/enum";

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
        <TextField
          source="id"
          label="field.system_operator_product_type_history.id"
        />
        <TextField
          source="system_operator_product_type_id"
          label="field.system_operator_product_type_history.system_operator_product_type_id"
        />
        <ReferenceField
          source="system_operator_id"
          reference="party"
          sortable={false}
          label="field.system_operator_product_type_history.system_operator_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          reference="product_type"
          source="product_type_id"
          sortable={false}
          label="field.system_operator_product_type_history.product_type_id"
        />
        <EnumField
          source="status"
          enumKey="system_operator_product_type.status"
          label="field.system_operator_product_type_history.status"
        />
        <DateField
          source="recorded_at"
          showTime
          label="field.system_operator_product_type_history.recorded_at"
        />
        <DateField
          source="replaced_at"
          showTime
          label="field.system_operator_product_type_history.replaced_at"
        />
      </Datagrid>
    </List>
  );
};
