import { Divider, Stack as MUIStack, StackProps } from "@mui/material";
import { ViewPermissionGuard } from "./";
import React from "react";

type FieldStackProps = {
  children: React.ReactNode;
  allowAll?: boolean;
  hideTooltips?: boolean;
  resource?: string;
} & StackProps;

// custom Stack component forcing label display and hiding the underlying
// fields based on permissions
export const FieldStack = (props: FieldStackProps) => {
  const {
    children,
    allowAll = false,
    hideTooltips = false,
    resource,
    ...rest
  } = props;
  return (
    <MUIStack divider={<Divider flexItem orientation="vertical" />} {...rest}>
      <ViewPermissionGuard
        allowAll={allowAll}
        hideTooltips={hideTooltips}
        resource={resource}
      >
        {children}
      </ViewPermissionGuard>
    </MUIStack>
  );
};
