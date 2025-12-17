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
        <TextField source="id" label="field.controllable_unit_history.id" />
        <TextField
          source="controllable_unit_id"
          label="field.controllable_unit_history.controllable_unit_id"
        />
        <TextField
          source="business_id"
          label="field.controllable_unit_history.business_id"
        />
        <TextField source="name" label="field.controllable_unit_history.name" />
        <DateField
          source="start_date"
          label="field.controllable_unit_history.start_date"
        />
        <TextField
          source="status"
          label="field.controllable_unit_history.status"
        />
        <TextField
          source="regulation_direction"
          label="field.controllable_unit_history.regulation_direction"
        />
        <BooleanField
          source="is_small"
          label="field.controllable_unit_history.is_small"
        />
        <ReferenceField
          source="accounting_point_id"
          reference="accounting_point"
          label="field.controllable_unit_history.accounting_point_id"
        >
          <TextField source="business_id" />
        </ReferenceField>
        <TextField
          source="accounting_point_id"
          label="field.controllable_unit_history.accounting_point_id"
        />
        <TextField
          source="grid_node_id"
          label="field.controllable_unit_history.grid_node_id"
        />
        <TextField
          source="grid_validation_status"
          label="field.controllable_unit_history.grid_validation_status"
        />
        <DateField
          source="recorded_at"
          showTime
          label="field.controllable_unit_history.recorded_at"
        />
        <DateField
          source="replaced_at"
          showTime
          label="field.controllable_unit_history.replaced_at"
        />
      </Datagrid>
    </List>
  );
};
