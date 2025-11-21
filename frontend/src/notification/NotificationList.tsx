import {
  BooleanField,
  List,
  ReferenceField,
  TextField,
  useGetIdentity,
} from "react-admin";
import { Datagrid } from "../auth";
import { DateField } from "../components/datetime";
import { QuickFilter } from "../components/QuickFilter";

export const NotificationList = () => {
  const { data: identity, isPending } = useGetIdentity();
  if (isPending) return <p>Loading...</p>;

  const notificationFilters = [
    <QuickFilter
      key="acknowledged"
      source="acknowledged"
      label="Non-acknowledged only"
      defaultValue={false}
    />,
    <QuickFilter
      key="party_id"
      source="party_id"
      label="Current party only"
      defaultValue={identity?.partyID}
    />,
  ];

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={notificationFilters}
      filterDefaultValues={{
        acknowledged: false,
        party_id: identity?.partyID,
      }}
    >
      <Datagrid>
        <TextField source="id" label="ID" />
        <BooleanField source="acknowledged" />
        <TextField source="event_id" label="Event ID" />
        <ReferenceField
          source="event_id"
          reference="event"
          label="Event type"
          sortable={false}
        >
          <TextField source="type" />
        </ReferenceField>
        <ReferenceField
          source="event_id"
          reference="event"
          label="Event source"
          sortable={false}
        >
          <TextField source="source" />
        </ReferenceField>
        <ReferenceField
          source="event_id"
          reference="event"
          label="Event time"
          sortable={false}
        >
          <DateField source="time" showTime />
        </ReferenceField>
        <ReferenceField source="party_id" reference="party" sortable={false}>
          <TextField source="name" />
        </ReferenceField>
        <DateField source="recorded_at" showTime />
      </Datagrid>
    </List>
  );
};
export default NotificationList;
