import { AutocompleteReferenceInput } from "./AutocompleteReferenceInput";

type PartyReferenceInputProps = Omit<
  Parameters<typeof AutocompleteReferenceInput>[0],
  "reference"
> & {
  noTypeFilter?: boolean;
};

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
