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
      // required: false is a workaround to avoid native HTML5 validation
      // Notice that we are manually setting the required asterisk in the label.
      // It is part of the workaround.
      inputProps={{ required: false, disabled: isDisabled }}
      size="large"
    >
      <FlexDiv style={{ gap: "var(--eds-size-2)", alignItems: "center" }}>
        <FormItemLabel htmlFor={id} size="large">
          {labelText}
          {required && (
            <span aria-hidden="true" className="eds-form-item__label--required">
              *
            </span>
          )}
        </FormItemLabel>
        {tooltip && <FieldTooltip resource={resource} field={source} />}
      </FlexDiv>
      {description || descriptionOverride ? (
        <FormItemDescription>{descriptionText}</FormItemDescription>
      ) : null}
      {children}
    </FormItem>
  );
};
