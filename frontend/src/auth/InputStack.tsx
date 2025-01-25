import { Children, cloneElement } from "react";
import { useResourceContext, usePermissions } from "react-admin";
import { Stack as MUIStack, StackProps } from "@mui/material";
import { useCreateOrUpdate } from "../auth/useCreateOrUpdate";

// custom Stack component disabling the underlying inputs based on permissions
export const InputStack = (props: StackProps) => {
  const resource = useResourceContext();
  const { children, ...rest } = props;
  const { permissions } = usePermissions();
  const createOrUpdate = useCreateOrUpdate();

  const addPermissionToInput = (input: any) =>
    cloneElement(input, {
      disabled:
        input.props.disabled ||
        !permissions.includes(
          `${resource}.${input.props.source}.${createOrUpdate}`,
        ),
    });

  return (
    <MUIStack {...rest}>
      {Children.map(children, (child: any) =>
        child.props.source ? addPermissionToInput(child) : child,
      )}
    </MUIStack>
  );
};
