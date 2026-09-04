import { Datagrid, List } from "../components/EDS-ra/list";
import { DateField, TextField } from "../components/EDS-ra/fields";
import { zEvent } from "../generated-client/zod.gen";
import { getFields } from "../zod";

export const EventList = () => {
  const fields = getFields(zEvent.shape);

  return (
    <List perPage={25} sort={{ field: "id", order: "DESC" }} empty={false}>
      <Datagrid>
        <TextField source={fields.id.source} />
        <TextField source={fields.type.source} />
        <TextField source={fields.source.source} />
        <TextField source={fields.subject.source} />
        <DateField source={fields.time.source} showTime />
      </Datagrid>
    </List>
  );
};
