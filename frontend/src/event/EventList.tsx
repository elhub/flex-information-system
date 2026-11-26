import { useTranslate } from "ra-core";
import { ResourceListLayout } from "../components/list/ResourceListLayout";
import type { ListColumn, ListFilterDef } from "../components/list/types";
import { BodyText } from "../components/ui";
import type { Event } from "../generated-client";
import { toDateTimeString } from "../util";
import eventTypes, { useEventTypeLabel } from "./eventTypes";
import { useEventList } from "./useEventList";

const Dash = () => <BodyText size="small">-</BodyText>;

export const EventList = () => {
  const translate = useTranslate();
  const eventTypeLabel = useEventTypeLabel();
  const { list } = useEventList();

  const filters: ListFilterDef[] = [
    {
      type: "multiselect",
      source: "type@in",
      label: translate("field.event.type"),
      className: "min-w-64",
      options: eventTypes
        .map((et) => ({ value: et.id, label: eventTypeLabel(et.id) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    },
  ];

  const columns: ListColumn<Event>[] = [
    {
      header: translate("field.event.id"),
      sortField: "id",
      sortType: "number",
      render: (event) => <BodyText size="small">{event.id}</BodyText>,
    },
    {
      header: translate("field.event.type"),
      render: (event) => (
        <BodyText size="small">{eventTypeLabel(event.type)}</BodyText>
      ),
    },
    {
      header: translate("field.event.source"),
      render: (event) => <BodyText size="small">{event.source}</BodyText>,
    },
    {
      header: translate("field.event.subject"),
      render: (event) =>
        event.subject ? (
          <BodyText size="small">{event.subject}</BodyText>
        ) : (
          <Dash />
        ),
    },
    {
      header: translate("field.event.time"),
      sortField: "time",
      sortType: "date",
      render: (event) => (
        <BodyText size="small">{toDateTimeString(event.time)}</BodyText>
      ),
    },
  ];

  return (
    <ResourceListLayout
      title={translate("text.events")}
      list={list}
      columns={columns}
      filters={filters}
      rowLink={(event) => `/event/${event.id}/show`}
    />
  );
};
