// Link to the event list showing only the events with the given source or
// subject, e.g. eventListLink("source", "/party/1").
export const eventListLink = (field: "source" | "subject", uri: string) => {
  const params = new URLSearchParams({
    filtered: "1",
    [`f.${field}@eq`]: uri,
  });
  return `/event?${params}`;
};
