import { Children, cloneElement } from "react";
import { useResourceContext, usePermissions } from "react-admin";
import { Stack as MUIStack, StackProps, InputAdornment } from "@mui/material";
import { useCreateOrUpdate } from "../auth/useCreateOrUpdate";
import { FieldTooltip } from "../tooltip/FieldTooltip";

// custom Stack component disabling the underlying inputs based on permissions
export const InputStack = (props: StackProps) => {
  const resource = useResourceContext();
  const { children, ...rest } = props;
  const { permissions } = usePermissions();
  const createOrUpdate = useCreateOrUpdate();

  const addPermissionToInput = (input: any) =>
    cloneElement(input, {
      margin: "none",
      disabled:
        input.props.disabled ||
        !permissions.includes(
          `${resource}.${input.props.source}.${createOrUpdate}`,
        ),
      slotProps: {
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <FieldTooltip resource={resource} field={input.props.source} />
            </InputAdornment>
          ),
        },
      },
    });

  return (
    <MUIStack {...rest}>
      {Children.map(children, (child: any) =>
        child.props.source ? addPermissionToInput(child) : child,
      )}
    </MUIStack>
  );
};
