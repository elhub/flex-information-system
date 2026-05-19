import { ReactNode } from "react";
import { BodyText } from "../../ui";
import { usePermissions, useResourceContext, useTranslate } from "ra-core";
import { Permissions, PermissionTarget } from "../../../auth/permissions";
import { FieldTooltip } from "./FieldTooltip";

export type BaseFieldProps = {
  source: string;
  label?: string | boolean;
  tooltip?: boolean;
  descriptionOverride?: string;
  unit?: string;
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
  unit,
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

  const derivedLabelText = translate(`field.${resource}.${source}`);
  const labelText =
    typeof label === "string" ? translate(label) : derivedLabelText;
  const formattedLabelText =
    labelDirection === "column" ? labelText : `${labelText} :`;

  if (!allowed) {
    return null;
  }

  return (
    <div
      className={`flex gap-2 ${labelDirection === "column" ? "flex-col justify-start items-start" : "flex-row items-center"}`}
    >
      {label ? (
        <BodyText weight="bold" size={textSize}>
          {formattedLabelText}
        </BodyText>
      ) : null}
      {children}
      {unit ? <BodyText>{unit}</BodyText> : null}
      {shouldShowTooltip ? (
        <FieldTooltip resource={resource} field={source} />
      ) : null}
    </div>
  );
};
