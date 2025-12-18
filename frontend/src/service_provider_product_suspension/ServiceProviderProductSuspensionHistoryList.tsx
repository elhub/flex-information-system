import { List, ReferenceField, TextField } from "react-admin";
import { Datagrid } from "../auth";
import { useParams } from "react-router-dom";
import { historyRowClick } from "../components/history";
import { DateField } from "../components/datetime";
import { EnumField } from "../components/enum";

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
        <TextField
          source="id"
          label="field.service_provider_product_suspension_history.id"
        />
        <TextField
          source="service_provider_product_suspension_id"
          label="field.service_provider_product_suspension_history.service_provider_product_suspension_id"
        />
        <ReferenceField
          source="procuring_system_operator_id"
          reference="party"
          sortable={false}
          label="field.service_provider_product_suspension_history.procuring_system_operator_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          source="service_provider_id"
          reference="party"
          sortable={false}
          label="field.service_provider_product_suspension_history.service_provider_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <EnumField
          source="reason"
          enumKey="service_provider_product_suspension.reason"
          label="field.service_provider_product_suspension_history.reason"
        />
        <DateField
          source="recorded_at"
          showTime
          label="field.service_provider_product_suspension_history.recorded_at"
        />
        <DateField
          source="replaced_at"
          showTime
          label="field.service_provider_product_suspension_history.replaced_at"
        />
      </Datagrid>
    </List>
  );
};
