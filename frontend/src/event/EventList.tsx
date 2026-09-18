import { useSearchParams } from "react-router-dom";
import { useListContext } from "ra-core";
import { Datagrid, List } from "../components/EDS-ra/list";
import { DateField, TextField } from "../components/EDS-ra/fields";
import { Event } from "../generated-client";
import { zEvent } from "../generated-client/zod.gen";
import { getFields } from "../zod";
import { EventDetailModal } from "./EventDetailModal";

export const EventList = ({ filter }: { filter?: Record<string, string> }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const fields = getFields(zEvent.shape);
  const selectedEventId = searchParams.get("event");

  const setSelectedEventId = (eventId: number | null) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (eventId == null) {
          next.delete("event");
        } else {
          next.set("event", String(eventId));
        }
        return next;
      },
      { replace: true },
    );

  return (
    <List
      resource="event"
      filter={filter}
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
    >
      <EventListContent
        fields={fields}
        selectedEventId={selectedEventId}
        onSelect={setSelectedEventId}
      />
    </List>
  );
};

const EventListContent = ({
  fields,
  selectedEventId,
  onSelect,
}: {
  fields: ReturnType<typeof getFields<typeof zEvent.shape>>;
  selectedEventId: string | null;
  onSelect: (eventId: number | null) => void;
}) => {
  const { data } = useListContext<Event>();
  const selectedRecord =
    data?.find((record) => record.id === Number(selectedEventId)) ?? null;

  return (
    <>
      <Datagrid rowClick={(record) => onSelect(Number(record.id))}>
        <TextField source={fields.id.source} />
        <TextField source={fields.type.source} />
        <TextField source={fields.source.source} />
        <TextField source={fields.subject.source} />
        <DateField source={fields.time.source} showTime />
      </Datagrid>
      <EventDetailModal
        record={selectedRecord}
        open={selectedRecord !== null}
        onClose={() => onSelect(null)}
      />
    </>
  );
};
