import { Children } from "react";
import { useResourceContext, usePermissions, Labeled } from "react-admin";
import { Stack as MUIStack, StackProps } from "@mui/material";
import { FieldTooltip } from "../tooltip/FieldTooltip";

// custom Stack component forcing label display and hiding the underlying
// fields based on permissions
export const FieldStack = (props: StackProps) => {
  const resource = useResourceContext();
  const { children, ...rest } = props;
  const { permissions } = usePermissions();

  const addPermissionToField = (field: any) =>
    permissions.includes(`${resource}.${field.props.source}.read`) && (
      <>
        <Labeled>{field}</Labeled>
        <FieldTooltip resource={resource} field={field.props.source} />
      </>
    );

  return (
    <MUIStack {...rest}>
      {Children.map(children, (child: any) =>
        child.props.source ? addPermissionToField(child) : child,
      )}
    </MUIStack>
  );
};
