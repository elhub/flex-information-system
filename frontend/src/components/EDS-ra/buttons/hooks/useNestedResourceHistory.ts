import { usePermissions } from "ra-core";
import { useLocation } from "react-router-dom";
import { Permissions, PermissionTarget } from "../../../../auth/permissions";
import { chunksOf, removeSuffix } from "../../../../util";

export type UseNestedResourceHistoryProps = {
  child: string;
  childAPIResource?: string;
  parentPath?: { resource: string; id: number }[];
};

export const useNestedResourceHistory = (
  props: UseNestedResourceHistoryProps,
) => {
  const { permissions } = usePermissions<Permissions>();
  const location = useLocation();

  const url = removeSuffix("/show", location.pathname);

  const parentPath =
    props.parentPath ??
    chunksOf(2, url.split("/").slice(1)).map(([resource, id]) => ({
      resource,
      id: Number(id),
    }));

  if (parentPath.at(-1)?.resource == `${props.child}_history`) parentPath.pop();

  const targetingHistoryOfSingleRow =
    props.child == parentPath.at(-1)?.resource;

  const childID = targetingHistoryOfSingleRow
    ? parentPath.at(-1)?.id
    : undefined;

  if (targetingHistoryOfSingleRow) parentPath.pop();

  const parentPathS = parentPath.map((p) => `/${p.resource}/${p.id}`).join("");

  const childAPIResource =
    props.childAPIResource ??
    `${parentPath.map((p) => p.resource).join("_")}_${props.child}`;

  const filter = childID
    ? `?filter=` +
      encodeURIComponent(`{ "${childAPIResource}_id": ${childID} }`)
    : "";

  const to = `${parentPathS}/${props.child}_history${filter}`;

  const disabled = !permissions?.allow(
    `${childAPIResource}_history` as PermissionTarget,
    "read",
  );

  return { to, disabled };
};
