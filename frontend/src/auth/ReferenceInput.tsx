import {
  AutocompleteInput,
  ReferenceInput,
  useRecordContext,
} from "react-admin";

// reference input with filtering of choices based on the search text
// against a field of the referenced resource, defaulting to `name`

// also features automated filling of the source field in edit mode
// and passing the "disabled" boolean to the child input

export const AutocompleteReferenceInput = (props: any) => {
  const { field, disabled, readOnly, source, ...rest } = props;

  const record = useRecordContext();
  const defaultValue = record ? record[source] : undefined;

  const filterToQuery = (searchText: string) => {
    const filter: any = {};
    filter[`${field ?? "name"}@ilike`] = `%${searchText}%`;
    return filter;
  };

  return (
    <ReferenceInput
      defaultValue={defaultValue}
      source={source}
      perPage={1000}
      {...rest}
    >
      <AutocompleteInput
        disabled={disabled}
        readOnly={readOnly}
        filterToQuery={filterToQuery}
      />
    </ReferenceInput>
  );
};

// version specialised to fields referencing party (optional type filtering)
export const PartyReferenceInput = (props: any) => {
  const { source, noTypeFilter, filter, ...rest } = props;

  const choiceFilter =
    filter || (noTypeFilter ? undefined : { type: source.replace("_id", "") });

  return (
    <AutocompleteReferenceInput
      source={source}
      reference="party"
      filter={choiceFilter}
      {...rest}
    />
  );
};
