import { useInput } from "ra-core";
import { Chips } from "../../ui";
import { BaseInput, BaseInputProps } from "./BaseInput";

// TODO: use all scopes, not only this practical subset
export const ALL_SCOPES = [
  "read:data",
  "use:data",
  "use:data:entity:lookup",
  "manage:data",
  "manage:data:party_membership",
  "manage:data:entity_client",
  "read:auth",
  "use:auth",
  "manage:auth",
  "read:grid",
  "read:attachment",
  "manage:attachment",
] as const;

export type Scope = (typeof ALL_SCOPES)[number];

export const DEFAULT_SCOPES: Scope[] = [
  "manage:data",
  "manage:auth",
  "read:grid",
  "manage:attachment",
];

type ScopesChipsInputProps = {
  value: string[];
  onChange: (scopes: string[]) => void;
  disabled?: boolean;
};

// pure presentational component, usable in both RA and react-hook-form
// (kept separate from the RA wrapper so that we can use it in custom modals
// for example)
export const ScopesChipsInput = ({
  value,
  onChange,
  disabled,
}: ScopesChipsInputProps) => {
  const toggle = (scope: Scope) => {
    if (disabled) return;
    onChange(
      value.includes(scope)
        ? value.filter((s) => s !== scope)
        : [...value, scope],
    );
  };

  return (
    <Chips>
      {ALL_SCOPES.map((scope) => (
        <Chips.Chip
          key={scope}
          onClick={() => toggle(scope)}
          aria-pressed={value.includes(scope)}
          disabled={disabled}
          style={{
            fontWeight: value.includes(scope) ? 600 : undefined,
            opacity: value.includes(scope) ? 1 : 0.5,
          }}
        >
          {scope}
        </Chips.Chip>
      ))}
    </Chips>
  );
};

type ScopesInputProps = BaseInputProps & {
  defaultValue?: string[];
};

// RA-integrated wrapper using BaseInput for label/permissions/layout
export const ScopesInput = ({
  source,
  required,
  tooltip,
  readOnly,
  disabled,
  defaultValue = DEFAULT_SCOPES,
  description,
  descriptionOverride,
  ...rest
}: ScopesInputProps) => {
  const { id, field, fieldState } = useInput({
    source,
    defaultValue,
    ...rest,
  });

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
      <ScopesChipsInput
        value={(field.value as string[] | undefined) ?? []}
        onChange={field.onChange}
        disabled={disabled || readOnly}
      />
    </BaseInput>
  );
};
