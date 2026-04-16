import type { ReactNode } from "react";
import { usePermissions } from "ra-core";
import type { Permissions } from "../auth/permissions";
import type {
  PermissionTarget,
  PermissionOperation,
} from "../auth/permissions";

type AccessGateProps = {
  access?: string;
  children: ReactNode;
};

/**
 * Renders children only if the user has the required permission.
 * If no access string is provided, always renders.
 */
export const AccessGate = ({ access, children }: AccessGateProps) => {
  const { permissions } = usePermissions<Permissions>();

  if (!access) return <>{children}</>;
  if (!permissions) return null;

  const [target, operation] = access.split(".") as [
    PermissionTarget,
    PermissionOperation,
  ];
  if (!permissions.allow(target, operation)) return null;

  return <>{children}</>;
};
