import { Children } from "react";
import {
  Datagrid as RADatagrid,
  DatagridProps,
  useResourceContext,
  usePermissions,
  BulkDeleteButton,
} from "react-admin";

export const Datagrid = (props: DatagridProps) => {
  const resource = useResourceContext();
  const { children, ...rest } = props;
  const { permissions } = usePermissions();

  const bulkActionButtons = permissions.includes(`${resource}.delete`) ? (
    <BulkDeleteButton />
  ) : (
    false
  );

  return (
    <RADatagrid bulkActionButtons={bulkActionButtons} {...rest}>
      {Children.map(
        children,
        (child: any) =>
          (!(child?.props as any)?.source ||
            permissions.includes(
              `${resource}.${(child?.props as any)?.source}.read`,
            )) &&
          child,
      )}
    </RADatagrid>
  );
};
