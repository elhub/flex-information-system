import { List, ReferenceField, TextField } from "react-admin";
import { Datagrid } from "../auth";
import { useParams } from "react-router-dom";
import { historyRowClick } from "../history";
import { DateField } from "../datetime";

export const ServiceProvidingGroupHistoryList = () => {
  const { service_providing_group_id } = useParams();
  return (
    <List
      title={`Full history of service providing group #${service_providing_group_id}`}
      resource="service_providing_group_history"
      filter={{ service_providing_group_id: service_providing_group_id }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid rowClick={historyRowClick}>
        <TextField source="id" />
        <TextField source="service_providing_group_id" />
        <TextField source="name" />
        <ReferenceField source="service_provider_id" reference="party">
          <TextField source="name" />
        </ReferenceField>
        <TextField source="status" />
        <DateField source="recorded_at" showTime />
        <DateField source="replaced_at" showTime />
      </Datagrid>
    </List>
  );
};
