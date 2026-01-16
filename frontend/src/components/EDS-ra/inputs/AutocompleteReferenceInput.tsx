import { ReferenceInputBase, ReferenceInputBaseProps } from "ra-core";
import { ReferenceComboboxInput } from "./ReferenceComboboxInput";

type AutocompleteReferenceInputProps = ReferenceInputBaseProps & {
  label?: string;
  fieldName?: string;
};

export const AutocompleteReferenceInput = (
  props: AutocompleteReferenceInputProps,
) => {
  const {
    label,
    fieldName,
    disabled,
    readOnly,
    validate,
    defaultValue,
    parse,
    format,
    name,
    perPage,
    ...rest
  } = props;
  return (
    <ReferenceInputBase perPage={perPage ?? 1000} {...rest}>
      <ReferenceComboboxInput
        source={props.source}
        label={label}
        disabled={disabled}
        readOnly={readOnly}
        validate={validate}
        defaultValue={defaultValue}
        parse={parse}
        format={format}
        name={name}
        fieldName={fieldName}
      />
    </ReferenceInputBase>
  );
};
