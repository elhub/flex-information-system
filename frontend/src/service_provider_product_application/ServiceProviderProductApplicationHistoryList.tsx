import { List, ReferenceField, TextField } from "react-admin";
import { Datagrid } from "../auth";
import { useParams } from "react-router-dom";
import { historyRowClick } from "../history";
import { DateField } from "../DateField";

export const ServiceProviderProductApplicationHistoryList = () => {
  const { service_provider_product_application_id } = useParams();
  return (
    <List
      resource="service_provider_product_application_history"
      filter={{
        service_provider_product_application_id:
          service_provider_product_application_id,
      }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid rowClick={historyRowClick}>
        <TextField source="id" label="ID" />
        <TextField source="service_provider_product_application_id" />
        <ReferenceField source="service_provider_id" reference="party">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="system_operator_id" reference="party">
          <TextField source="name" />
        </ReferenceField>
        <TextField source="status" />
        <DateField source="last_qualified" showTime />
        <DateField source="recorded_at" showTime />
        <DateField source="replaced_at" showTime />
      </Datagrid>
    </List>
  );
};
