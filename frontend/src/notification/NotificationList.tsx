import { useGetIdentity, useRecordContext } from "ra-core";
import { Datagrid, List } from "../components/EDS-ra/list";
import {
  DateField,
  ReferenceField,
  TextField,
} from "../components/EDS-ra/fields";
import { BodyText } from "../components/ui";
import { zNotification } from "../generated-client/zod.gen";
import { getFields } from "../zod";

const AcknowledgedField = ({ source: _source }: { source: string }) => {
  const record = useRecordContext();
  return (
    <BodyText size="small">{record?.acknowledged ? "Yes" : "No"}</BodyText>
  );
};

export const NotificationList = () => {
  const fields = getFields(zNotification.shape);
  const { data: identity, isPending } = useGetIdentity();

  if (isPending) return null;

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filterDefaultValues={{
        acknowledged: false,
        party_id: identity?.partyID,
      }}
    >
      <Datagrid>
        <TextField source={fields.id.source} />
        <AcknowledgedField source={fields.acknowledged.source} />
        <TextField source={fields.event_id.source} />
        <ReferenceField source={fields.event_id.source} reference="event">
          <TextField source="type" />
        </ReferenceField>
        <ReferenceField source={fields.event_id.source} reference="event">
          <TextField source="source" />
        </ReferenceField>
        <ReferenceField source={fields.event_id.source} reference="event">
          <DateField source="time" showTime />
        </ReferenceField>
        <ReferenceField source={fields.party_id.source} reference="party">
          <TextField source="name" />
        </ReferenceField>
        <DateField source={fields.recorded_at.source} showTime />
      </Datagrid>
    </List>
  );
};
