import { ReactNode } from "react";
import {
  FormItem,
  FormItemLabel,
  FlexDiv,
  FormItemDescription,
} from "../../ui";
import { usePermissions, useResourceContext, useTranslate } from "ra-core";
import { Permissions, PermissionTarget } from "../../../auth/permissions";
import { useCreateOrUpdate } from "../../../auth/useCreateOrUpdate";
import { FieldTooltip } from "../fields/FieldTooltip";
import { useTooltipText } from "../fields/useTooltipText";

export type BaseInputProps = {
  source: string;
  required?: boolean;
  tooltip?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  resource?: string;
  overrideLabel?: string;
  description?: boolean;
  descriptionOverride?: string;
};

type BaseInputPropsWithChildren = BaseInputProps & {
  id: string;
  error?: string;
  children: ReactNode;
  // When false, prevents native browser required validation on the underlying input
  // (needed for multi-select Combobox where the search input is always empty after selection)
  // The outer FormItem still has required=true so the label asterisk is shown.
  nativeRequired?: boolean;
};

export const BaseInput = ({
  source,
  required,
  tooltip = true,
  disabled,
  readOnly,
  id,
  error,
  description,
  descriptionOverride,
  children,
  resource: resourceProp,
  overrideLabel,
  nativeRequired,
}: BaseInputPropsWithChildren) => {
  const resource = useResourceContext({ resource: resourceProp });
  const formattedSource = source.split("@")[0];

  const { permissions } = usePermissions<Permissions>();
  const createOrUpdate = useCreateOrUpdate();
  const translate = useTranslate();

  const labelText =
    overrideLabel ?? translate(`field.${resource}.${formattedSource}`);
  const defaultDescription = useTooltipText({
    resource,
    field: formattedSource,
  });
  const descriptionText = descriptionOverride ?? defaultDescription;

  // Check permissions for this field
  const isPermissionDisabled =
    createOrUpdate != null &&
    permissions?.allow(
      `${resource}.${formattedSource}` as PermissionTarget,
      createOrUpdate,
    ) === false;

  const isDisabled = disabled || readOnly || isPermissionDisabled;

  return (
    <FormItem
      id={id}
      error={error}
      inputProps={{ required: required, disabled: isDisabled }}
      size="large"
    >
      <FlexDiv style={{ gap: "var(--eds-size-2)", alignItems: "center" }}>
        <FormItemLabel htmlFor={id} size="large">
          {labelText}
        </FormItemLabel>
        {tooltip && <FieldTooltip resource={resource} field={source} />}
      </FlexDiv>
      {description || descriptionOverride ? (
        <FormItemDescription>{descriptionText}</FormItemDescription>
      ) : null}
      {nativeRequired === false && required ? (
        // Wrap in a nested FormItem context with required:false so the Combobox's
        // internal search <input> does not get the required attribute. This prevents
        // false native browser validation errors on multi-select inputs where the
        // search text is always empty even after options are selected.
        // The outer FormItem still has required:true so the label asterisk is shown.
        <FormItem
          id={id}
          inputProps={{ required: false, disabled: isDisabled }}
        >
          {children}
        </FormItem>
      ) : (
        children
      )}
    </FormItem>
  );
};
