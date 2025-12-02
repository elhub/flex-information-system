import { Children } from "react";
import {
  Datagrid as RADatagrid,
  DatagridProps,
  useResourceContext,
  usePermissions,
  BulkDeleteButton,
} from "react-admin";
import { PermissionTarget, Permissions } from "./permissions";

export const Datagrid = (props: DatagridProps) => {
  const resource = useResourceContext();
  const { children, ...rest } = props;
  const { permissions } = usePermissions<Permissions>();

  const bulkActionButtons = permissions?.allow(
    resource as PermissionTarget,
    "delete",
  ) ? (
    <BulkDeleteButton />
  ) : (
    false
  );

  return (
    <RADatagrid bulkActionButtons={bulkActionButtons} {...rest}>
      {Children.map(
        children,
        (child: any) =>
          (!child?.props?.source ||
            permissions?.allow(
              `${resource}.${child?.props?.source}` as PermissionTarget,
              "read",
            )) &&
          child,
      )}
    </RADatagrid>
  );
};
