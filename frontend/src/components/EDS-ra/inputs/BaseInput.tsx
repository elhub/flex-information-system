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

export type BaseInputProps = {
  source: string;
  required?: boolean;
  tooltip?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  resource?: string;
  overrideLabel?: string;
  description?: string;
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
      description={description}
    >
      <FlexDiv style={{ gap: "var(--eds-size-2)", alignItems: "center" }}>
        <FormItemLabel htmlFor={id} size="large">
          {labelText}
        </FormItemLabel>
        {tooltip && <FieldTooltip resource={resource} field={source} />}
      </FlexDiv>
      {description && <FormItemDescription>{description}</FormItemDescription>}
      {children}
    </FormItem>
  );
};
