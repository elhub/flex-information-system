import { usePermissions, useRecordContext, useResourceContext } from "ra-core";
import { Permissions, PermissionTarget } from "../../../../auth/permissions";

export type UseResourceHistoryProps = {
  id?: string;
};

export const useResourceHistory = (props: UseResourceHistoryProps = {}) => {
  const record = useRecordContext();
  const resource = useResourceContext()!;
  const { permissions } = usePermissions<Permissions>();

  const actualResource = resource.replace(/_history$/, "");
  const historyResource = `${actualResource}_history` as PermissionTarget;

  const canRead = permissions?.allow(historyResource, "read");

  const actualId = resource.endsWith("_history")
    ? record?.[actualResource + "_id"]
    : props.id || record?.id;

  const to = `/${actualResource}/${actualId}/history`;
  const disabled = !canRead;

  return { to, disabled };
};
