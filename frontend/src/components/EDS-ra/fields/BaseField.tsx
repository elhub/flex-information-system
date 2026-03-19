import { ReactNode } from "react";
import { BodyText } from "../../ui";
import { usePermissions, useResourceContext, useTranslate } from "ra-core";
import { Permissions, PermissionTarget } from "../../../auth/permissions";
import { FieldTooltip } from "./FieldTooltip";

export type BaseFieldProps = {
  source: string;
  label?: boolean;
  tooltip?: boolean;
  descriptionOverride?: string;
  labelDirection?: "row" | "column";
  textSize?: "small" | "medium" | "large";
};

type BaseFieldPropsWithChildren = BaseFieldProps & {
  children: ReactNode;
};

export const BaseField = ({
  source,
  label,
  tooltip,
  children,
  labelDirection = "row",
  textSize = "small",
}: BaseFieldPropsWithChildren) => {
  const resource = useResourceContext();
  const { permissions } = usePermissions<Permissions>();
  const shouldShowTooltip = tooltip ?? false;
  const translate = useTranslate();
  const allowed =
    !resource ||
    !source ||
    permissions?.allow(`${resource}.${source}` as PermissionTarget, "read") !==
      false;

  const labelText = translate(`field.${resource}.${source}`);
  const formattedLabelText =
    labelDirection === "column" ? labelText : `${labelText} :`;

  if (!allowed) {
    return null;
  }

  return (
    <div
      className={`flex gap-2 text-body-size-small ${labelDirection === "column" ? "flex-col justify-start items-start" : "flex-row items-center"}`}
    >
      {label === true ? (
        <BodyText weight="bold" size={textSize}>
          {formattedLabelText}
        </BodyText>
      ) : null}
      {children}
      {shouldShowTooltip ? (
        <FieldTooltip resource={resource} field={source} />
      ) : null}
    </div>
  );
};
