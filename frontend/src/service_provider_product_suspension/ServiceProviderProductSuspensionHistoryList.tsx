import { List, ReferenceField, TextField } from "react-admin";
import { Datagrid } from "../auth";
import { useParams } from "react-router-dom";
import { historyRowClick } from "../components/history";
import { DateField } from "../components/datetime";

export const ServiceProviderProductSuspensionHistoryList = () => {
  const { service_provider_product_suspension_id } = useParams();
  return (
    <List
      resource="service_provider_product_suspension_history"
      filter={{
        service_provider_product_suspension_id:
          service_provider_product_suspension_id,
      }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid rowClick={historyRowClick}>
        <TextField source="id" label="ID" />
        <TextField source="service_provider_product_suspension_id" />
        <ReferenceField
          source="procuring_system_operator_id"
          reference="party"
          sortable={false}
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          source="service_provider_id"
          reference="party"
          sortable={false}
        >
          <TextField source="name" />
        </ReferenceField>
        <TextField source="reason" />
        <DateField source="recorded_at" showTime />
        <DateField source="replaced_at" showTime />
      </Datagrid>
    </List>
  );
};
export default ServiceProviderProductSuspensionHistoryList;
