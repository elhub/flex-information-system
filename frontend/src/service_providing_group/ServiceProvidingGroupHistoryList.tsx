import { List, ReferenceField, TextField } from "react-admin";
import { Datagrid } from "../auth";
import { useParams } from "react-router-dom";
import { historyRowClick } from "../components/history";
import { DateField } from "../components/datetime";
import { EnumField } from "../components/enum";

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
        <TextField
          source="id"
          label="field.service_providing_group_history.id"
        />
        <TextField
          source="service_providing_group_id"
          label="field.service_providing_group_history.service_providing_group_id"
        />
        <TextField source="name" />
        <ReferenceField
          source="service_provider_id"
          reference="party"
          sortable={false}
          label="field.service_providing_group_history.service_provider_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <EnumField
          source="bidding_zone"
          enumKey="service_providing_group.bidding_zone"
          label="field.service_providing_group_history.bidding_zone"
        />
        <EnumField
          source="status"
          enumKey="service_providing_group.status"
          label="field.service_providing_group_history.status"
        />
        <DateField
          source="recorded_at"
          showTime
          label="field.service_providing_group_history.recorded_at"
        />
        <DateField
          source="replaced_at"
          showTime
          label="field.service_providing_group_history.replaced_at"
        />
      </Datagrid>
    </List>
  );
};
