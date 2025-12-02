import {
  AutocompleteInput,
  ReferenceInput,
  ReferenceInputBaseProps,
  ReferenceInputProps,
  useRecordContext,
} from "react-admin";

// reference input with filtering of choices based on the search text
// against a field of the referenced resource, defaulting to `name`

// also features automated filling of the source field in edit mode
// and passing the "disabled" boolean to the child input

type AutocompleteReferenceInputProps = ReferenceInputBaseProps & {
  disabled?: boolean;
  readOnly?: boolean;
  validate?: ReferenceInputProps["validate"];
  fieldName?: string;
};

export const AutocompleteReferenceInput = (
  props: AutocompleteReferenceInputProps,
) => {
  const { disabled, readOnly, source, label, fieldName, ...rest } = props;

  const record = useRecordContext();
  const defaultValue = record ? record[source] : undefined;

  const filterToQuery = (searchText: string) => {
    const filter: any = {};
    filter[`${fieldName ?? "name"}@ilike`] = `%${searchText}%`;
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
        label={label}
      />
    </ReferenceInput>
  );
};

type PartyReferenceInputProps = Omit<
  AutocompleteReferenceInputProps,
  "reference"
> & {
  noTypeFilter?: boolean;
};

// version specialised to fields referencing party (optional type filtering)
export const PartyReferenceInput = (props: PartyReferenceInputProps) => {
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
