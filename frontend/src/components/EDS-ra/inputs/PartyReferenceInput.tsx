import { ReferenceInputProps } from "react-admin";
import { AutocompleteReferenceInput } from "./AutocompleteReferenceInput";
import { BaseInputProps } from "./BaseInput";

type PartyReferenceInputProps = Omit<
  ReferenceInputProps,
  "children" | "reference"
> &
  BaseInputProps & {
    noTypeFilter?: boolean;
  };

// Specialized version of AutocompleteReferenceInput for party fields
// Automatically filters by party type derived from the source field name
// e.g., source="service_provider_id" filters to type="service_provider"
export const PartyReferenceInput = ({
  noTypeFilter,
  source,
  filter,
  ...rest
}: PartyReferenceInputProps) => {
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
