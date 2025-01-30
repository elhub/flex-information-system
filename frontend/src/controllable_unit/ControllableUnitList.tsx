import {
  List,
  BooleanField,
  ReferenceField,
  TextField,
  SelectArrayInput,
} from "react-admin";
import { Datagrid } from "../auth";
import { DateField } from "../datetime";

export const ControllableUnitList = () => {
  const controllableUnitFilters = [
    <SelectArrayInput
      key="status"
      label="Status"
      source="status@in"
      choices={["new", "active", "suspended", "terminated"]}
      alwaysOn
    />,
  ];

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={controllableUnitFilters}
    >
      <Datagrid>
        <TextField source="id" label="ID" />
        <TextField source="business_id" label="Business ID" />
        <TextField source="name" />
        <DateField source="start_date" />
        <TextField source="status" />
        <TextField source="regulation_direction" />
        <BooleanField source="is_small" />
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
      </Datagrid>
    </List>
  );
};
