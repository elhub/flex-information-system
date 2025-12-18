import { List, ReferenceField, TextField } from "react-admin";
import { Datagrid } from "../auth";
import { useParams } from "react-router-dom";
import { historyRowClick } from "../components/history";
import { DateField } from "../components/datetime";
import { EnumField } from "../components/enum";

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
        <TextField
          source="id"
          label="field.service_provider_product_application_history.id"
        />
        <TextField
          source="service_provider_product_application_id"
          label="field.service_provider_product_application_history.service_provider_product_application_id"
        />
        <ReferenceField
          source="service_provider_id"
          reference="party"
          sortable={false}
          label="field.service_provider_product_application_history.service_provider_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          source="system_operator_id"
          reference="party"
          sortable={false}
          label="field.service_provider_product_application_history.system_operator_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <EnumField
          source="status"
          enumKey="service_provider_product_application.status"
          label="field.service_provider_product_application_history.status"
        />
        <DateField
          source="qualified_at"
          showTime
          label="field.service_provider_product_application_history.qualified_at"
        />
        <DateField
          source="recorded_at"
          showTime
          label="field.service_provider_product_application_history.recorded_at"
        />
        <DateField
          source="replaced_at"
          showTime
          label="field.service_provider_product_application_history.replaced_at"
        />
      </Datagrid>
    </List>
  );
};
