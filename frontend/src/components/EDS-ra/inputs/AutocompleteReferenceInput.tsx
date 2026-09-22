import {
  RaRecord,
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
    optionText?: (record: RaRecord) => string;
    inputClassName?: string;
  };

export const AutocompleteReferenceInput = ({
  source,
  required,
  reference,
  fieldName,
  optionText,
  overrideLabel,
  readOnly,
  disabled,
  resource: resourceProp,
  inputClassName,
  tooltip,
  description,
  descriptionOverride,
  ...rest
}: AutocompleteReferenceInputProps) => {
  const resource = useResourceContext({ resource: resourceProp });
  return (
    <ReferenceInput
      source={source}
      reference={reference}
      perPage={5000}
      {...rest}
    >
      <ReferenceComboboxInput
        source={source}
        required={required}
        overrideLabel={overrideLabel}
        fieldName={fieldName}
        optionText={optionText}
        readOnly={readOnly}
        resource={resource}
        disabled={disabled}
        inputClassName={inputClassName}
        tooltip={tooltip}
        description={description}
        descriptionOverride={descriptionOverride}
      />
    </ReferenceInput>
  );
};
