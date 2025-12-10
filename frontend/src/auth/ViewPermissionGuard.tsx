import React, { Children } from "react";
import { useResourceContext, usePermissions, Labeled } from "react-admin";
import { Permissions, PermissionTarget } from "./permissions";
import { FieldTooltip } from "../tooltip/FieldTooltip";

type ViewPermissionGuardProps = {
  children: React.ReactNode;
  allowAll?: boolean;
  hideTooltips?: boolean;
  hideLabels?: boolean;
  resource?: string;
};

const hasSourceProp = (
  child: unknown
): child is React.ReactElement<{ source: string }> => {
  if (typeof child !== "object" || child === null) {
    return false;
  }

  if (!("props" in child)) {
    return false;
  }

  if (typeof child.props !== "object" || child.props === null) {
    return false;
  }

  return "source" in child.props;
};

// custom component hiding the underlying fields based on permissions
export const ViewPermissionGuard = (props: ViewPermissionGuardProps) => {
  const resourceFromContext = useResourceContext();
  const {
    children,
    allowAll = false,
    hideTooltips = false,
    hideLabels = false,
    resource: resourceFromProps,
  } = props;

  const { permissions } = usePermissions<Permissions>();

  const resource = resourceFromProps ?? resourceFromContext;

  const addPermissionToField = (
    field: React.ReactElement<{ source: string }>
  ) =>
    (allowAll ||
      permissions?.allow(
        `${resource}.${field.props.source}` as PermissionTarget,
        "read"
      )) && (
      <>
        {!hideLabels ? <Labeled>{field}</Labeled> :  field }
        {!hideTooltips && (
          <FieldTooltip resource={resource} field={field.props.source} />
        )}
      </>
    );

  return Children.map(children, (child) =>
    hasSourceProp(child) ? addPermissionToField(child) : child
  );
};
