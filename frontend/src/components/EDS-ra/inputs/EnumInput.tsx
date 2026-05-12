import { Select, SelectContent, SelectItem } from "../../ui";
import {
  useInput,
  useTranslate,
  useI18nProvider,
  usePermissions,
  useResourceContext,
} from "ra-core";
import { I18nProvider } from "../../../intl/intl";
import { BaseInput, BaseInputProps } from "./BaseInput";
import { Button } from "../../ui";
import { IconCross } from "@elhub/ds-icons";
import { Permissions, PermissionTarget } from "../../../auth/permissions";
import { useCreateOrUpdate } from "../../../auth/useCreateOrUpdate";

type EnumInputProps = BaseInputProps & {
  enumKey: string;
  defaultValue?: string;
  onChange?: (value: string | null) => void;
  placeholder?: string;
};

export const EnumInput = ({
  source,
  required,
  tooltip,
  enumKey,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  placeholder = "Select...",
  description,
  descriptionOverride,
  ...rest
}: EnumInputProps) => {
  const { id, field, fieldState } = useInput({
    source,
    defaultValue,
    ...rest,
  });
  const translate = useTranslate();
  const i18nProvider = useI18nProvider() as I18nProvider;

  const resource = useResourceContext();
  const { permissions } = usePermissions<Permissions>();
  const createOrUpdate = useCreateOrUpdate();
  const isPermissionDisabled =
    createOrUpdate != null &&
    permissions?.allow(
      `${resource}.${source.split("@")[0]}` as PermissionTarget,
      createOrUpdate,
    ) === false;
  const isEffectivelyDisabled = disabled || readOnly || isPermissionDisabled;

  const choices = i18nProvider.getEnumValues(enumKey).map((value) => ({
    id: value.split(".").pop() ?? value,
    name: translate(`enum.${value}`),
  }));

  const handleValueChange = (value: string) => {
    field.onChange(value);
    onChange?.(value);
  };

  const displayClearButton = !required && !isEffectivelyDisabled && field.value;

  return (
    <BaseInput
      source={source}
      required={required}
      tooltip={tooltip}
      disabled={disabled}
      readOnly={readOnly}
      id={id}
      error={fieldState.error?.message}
      description={description}
      descriptionOverride={descriptionOverride}
    >
      <div className="flex items-center gap-3">
        <Select
          className="min-w-48"
          value={field.value ?? ""}
          onValueChange={handleValueChange}
          disabled={isEffectivelyDisabled}
          placeholder={placeholder}
        >
          <SelectContent>
            {choices.map((choice) => (
              <SelectItem key={choice.id} value={choice.id}>
                {choice.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {displayClearButton && (
          <Button
            type="button"
            variant="tertiary"
            size="small"
            icon={IconCross}
            aria-label="Clear"
            onClick={() => {
              field.onChange(null);
              onChange?.(null);
            }}
          >
            Clear
          </Button>
        )}
      </div>
    </BaseInput>
  );
};
