import {
  BooleanField,
  List,
  ReferenceField,
  TextField,
  useGetIdentity,
} from "react-admin";
import { Datagrid } from "../auth";
import { DateField } from "../datetime";
import { QuickFilter } from "../QuickFilter";

export const NotificationList = () => {
  const { identity } = useGetIdentity();

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
      defaultValue={identity?.party_id}
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
        party_id: identity?.party_id,
      }}
    >
      <Datagrid>
        <TextField source="id" label="ID" />
        <BooleanField source="acknowledged" />
        <TextField source="event_id" label="Event ID" />
        <ReferenceField source="event_id" reference="event" label="Event type">
          <TextField source="type" />
        </ReferenceField>
        <ReferenceField
          source="event_id"
          reference="event"
          label="Event source"
        >
          <TextField source="source" />
        </ReferenceField>
        <ReferenceField source="event_id" reference="event" label="Event time">
          <DateField source="time" showTime />
        </ReferenceField>
        <ReferenceField source="party_id" reference="party">
          <TextField source="name" />
        </ReferenceField>
        <DateField source="recorded_at" showTime />
      </Datagrid>
    </List>
  );
};
