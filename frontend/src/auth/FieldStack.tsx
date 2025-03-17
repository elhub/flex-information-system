import { Children } from "react";
import { useResourceContext, usePermissions, Labeled } from "react-admin";
import { Divider, Stack as MUIStack } from "@mui/material";
import { FieldTooltip } from "../tooltip/FieldTooltip";

// custom Stack component forcing label display and hiding the underlying
// fields based on permissions
export const FieldStack = (props: any) => {
  const resourceFromContext = useResourceContext();
  const { children, ...rest } = props;
  const { permissions } = usePermissions();

  const allowAll = props.allowAll ?? false;
  const resource = props.resource ?? resourceFromContext;

  const addPermissionToField = (field: any) =>
    (allowAll ||
      permissions.includes(`${resource}.${field.props.source}.read`)) && (
      <>
        <Labeled>{field}</Labeled>
        <FieldTooltip resource={resource} field={field.props.source} />
      </>
    );

  return (
    <MUIStack divider={<Divider flexItem orientation="vertical" />} {...rest}>
      {Children.map(children, (child: any) =>
        child.props.source ? addPermissionToField(child) : child,
      )}
    </MUIStack>
  );
};
