import {
  ReferenceInput,
  UseReferenceInputControllerParams,
  useResourceContext,
} from "react-admin";
import { ReferenceComboboxInput } from "./ReferenceComboboxInput";
import { BaseInputProps } from "./BaseInput";

type AutocompleteReferenceInputProps = Omit<
  UseReferenceInputControllerParams,
  "source"
> &
  BaseInputProps & {
    reference: string;
    fieldName?: string;
  };

export const AutocompleteReferenceInput = ({
  source,
  required,
  reference,
  fieldName,
  overrideLabel,
  readOnly,
  disabled,
  resource: resourceProp,
  ...rest
}: AutocompleteReferenceInputProps) => {
  const resource = useResourceContext({ resource: resourceProp });
  return (
    <ReferenceInput
      source={source}
      reference={reference}
      perPage={1000}
      {...rest}
    >
      <ReferenceComboboxInput
        source={source}
        required={required}
        overrideLabel={overrideLabel}
        fieldName={fieldName}
        readOnly={readOnly}
        resource={resource}
        disabled={disabled}
      />
    </ReferenceInput>
  );
};
