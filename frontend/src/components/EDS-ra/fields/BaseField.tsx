import { ReactNode } from "react";
import { BodyText, FlexDiv } from "../../ui";
import { usePermissions, useResourceContext, useTranslate } from "ra-core";
import { Permissions, PermissionTarget } from "../../../auth/permissions";
import { FieldTooltip } from "./FieldTooltip";

export type BaseFieldProps = {
  source: string;
  label?: boolean;
  tooltip?: boolean;
};

type BaseFieldPropsWithChildren = BaseFieldProps & {
  children: ReactNode;
};

export const BaseField = ({
  source,
  label,
  tooltip,
  children,
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

  if (!allowed) {
    return null;
  }

  return (
    <FlexDiv style={{ gap: "0.5rem", alignItems: "center" }}>
      {label === true ? <BodyText weight="bold">{labelText}:</BodyText> : null}
      {children}
      {shouldShowTooltip ? (
        <FieldTooltip resource={resource} field={source} />
      ) : null}
    </FlexDiv>
  );
};
