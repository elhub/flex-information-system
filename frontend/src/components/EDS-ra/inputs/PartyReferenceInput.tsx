import { RaRecord } from "ra-core";
import { ReferenceInputProps } from "react-admin";
import { AutocompleteReferenceInput } from "./AutocompleteReferenceInput";
import { BaseInputProps } from "./BaseInput";
import { EnumLabel } from "../../../intl/enum-labels";
import { useTranslateEnum } from "../../../intl/intl";

type PartyReferenceInputProps = Omit<
  ReferenceInputProps,
  "children" | "reference"
> &
  BaseInputProps & {
    noTypeFilter?: boolean;
    optionText?: (record: RaRecord) => string;
  };

// Specialized version of AutocompleteReferenceInput for party fields
// Automatically filters by party type derived from the source field name
// e.g., source="service_provider_id" filters to type="service_provider"
// Option labels include the translated party type, e.g. "Acme (Service Provider)"
export const PartyReferenceInput = ({
  noTypeFilter,
  source,
  filter,
  optionText,
  ...rest
}: PartyReferenceInputProps) => {
  const translateEnum = useTranslateEnum();
  const choiceFilter =
    filter || (noTypeFilter ? undefined : { type: source.replace("_id", "") });

  const defaultOptionText = (record: RaRecord) =>
    `${record.name} (${translateEnum(`party.type.${record.type}` as EnumLabel)})`;

  return (
    <AutocompleteReferenceInput
      source={source}
      reference="party"
      filter={choiceFilter}
      optionText={optionText ?? defaultOptionText}
      {...rest}
    />
  );
};
