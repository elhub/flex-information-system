import { BooleanField, List, ReferenceField, TextField } from "react-admin";
import { Datagrid } from "../auth";
import { useParams } from "react-router-dom";
import { historyRowClick } from "../components/history";
import { DateField } from "../components/datetime";

export const ControllableUnitHistoryList = () => {
  const { controllable_unit_id } = useParams();
  return (
    <List
      title={`Full history of controllable unit #${controllable_unit_id}`}
      resource="controllable_unit_history"
      filter={{ controllable_unit_id: controllable_unit_id }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid rowClick={historyRowClick}>
        <TextField source="id" label="ID" />
        <TextField source="controllable_unit_id" />
        <TextField source="business_id" label="Business ID" />
        <TextField source="name" />
        <DateField source="start_date" />
        <TextField source="status" />
        <TextField source="regulation_direction" />
        <BooleanField source="is_small" />
        <ReferenceField
          source="accounting_point_id"
          reference="accounting_point"
        >
          <TextField source="business_id" />
        </ReferenceField>
        <TextField source="accounting_point_id" />
        <TextField source="grid_node_id" />
        <ReferenceField
          source="connecting_system_operator_id"
          reference="party"
        >
          <TextField source="name" />
        </ReferenceField>
        <TextField source="grid_validation_status" />
        <DateField source="recorded_at" showTime />
        <DateField source="replaced_at" showTime />
      </Datagrid>
    </List>
  );
};
