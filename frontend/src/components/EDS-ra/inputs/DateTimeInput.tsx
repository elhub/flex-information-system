import { DateTimePicker } from "../../ui";
import { useInput, usePermissions, useResourceContext } from "ra-core";
import { BaseInput, BaseInputProps } from "./BaseInput";
import { formatISO, parseISO } from "date-fns";
import { tz } from "@date-fns/tz";
import { Button, FlexDiv } from "../../ui";
import { ClearButton } from "./ClearButton";
import { IconClockCircle } from "@elhub/ds-icons";
import { Permissions, PermissionTarget } from "../../../auth/permissions";
import { useCreateOrUpdate } from "../../../auth/useCreateOrUpdate";

type DateTimeInputProps = BaseInputProps & {
  showNow?: boolean;
  // shows a button to clear the value
  clearable?: boolean;
};

export const DateTimeInput = ({
  source,
  required,
  tooltip,
  readOnly,
  disabled,
  showNow,
  clearable,
  description,
  descriptionOverride,
  ...rest
}: DateTimeInputProps) => {
  const { id, field, fieldState } = useInput({ source, ...rest });

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

  const onDateChange = (date: Date | null) => {
    field.onChange(
      date
        ? formatISO(date, {
            representation: "complete",
            in: tz("Europe/Oslo"),
          })
        : null,
    );
  };

  const displayNowButton = showNow && !isEffectivelyDisabled;
  const displayClearButton =
    (clearable ?? !required) && !isEffectivelyDisabled && field.value;

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
      <FlexDiv style={{ gap: "var(--eds-size-2)", alignItems: "center" }}>
        <DateTimePicker
          id={id}
          selected={
            field.value
              ? parseISO(field.value, { in: tz("Europe/Oslo") })
              : undefined
          }
          onChange={(date) => onDateChange(date)}
          onBlur={field.onBlur}
          size="large"
          disabled={isEffectivelyDisabled}
          navigateButtons={false}
        />
        {displayNowButton && (
          <Button
            type="button"
            variant="tertiary"
            size="small"
            icon={IconClockCircle}
            aria-label="Set to now"
            onClick={() => onDateChange(new Date())}
          >
            Now
          </Button>
        )}
        {displayClearButton && (
          <ClearButton onClear={() => field.onChange(null)} />
        )}
      </FlexDiv>
    </BaseInput>
  );
};
