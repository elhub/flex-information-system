import {
  Button,
  Identifier,
  RaRecord,
  usePermissions,
  useRecordContext,
  useResourceContext,
} from "react-admin";
import { Permissions, PermissionTarget } from "../auth/permissions";
import HistoryIcon from "@mui/icons-material/History";
import { Link, useLocation } from "react-router-dom";
import RestorePageIcon from "@mui/icons-material/RestorePage";
import { chunksOf, removeSuffix } from "../util";

export const historyRowClick = (
  _: Identifier,
  resource: string,
  record: RaRecord
) => {
  const mainResource = resource.replace(/_history$/, "");
  return `/${mainResource}/${record[mainResource + "_id"]}/history/${
    record.id
  }/show`;
};

export const ResourceHistoryButton = ({ id }: { id?: string }) => {
  const record = useRecordContext();
  const resource = useResourceContext()!;
  const { permissions } = usePermissions<Permissions>();

  /* this allows reuse on both the main and history resource */
  const actualResource = resource.replace(/_history$/, "");
  const historyResource = `${actualResource}_history` as PermissionTarget;

  if (permissions?.allow(historyResource, "read")) {
    const actualId = resource.endsWith("_history")
      ? record?.[actualResource + "_id"]
      : id || record?.id;

    return (
      <Button
        component={Link}
        to={`/${actualResource}/${actualId}/history`}
        startIcon={<HistoryIcon />}
        label="View History"
      />
    );
  }

  return false;
};

// NestedResourceHistoryButton navigates to the history of a child resource
// (parent resource is inferred from the URL of the page where the button is)

export type NestedResourceHistoryButtonProps = {
  // name of the child resource in the frontend (target history)
  child: string;
  // name of the child resource in the *API* if different
  // (default will be parent1_..._parentN_child, but some resources do not carry
  // the parent prefix in the API, e.g., technical_resource)
  childAPIResource?: string;
  // possible override of the parent path extracted from the URL
  // (escape hatch allowing to target a custom history page from anywhere)
  parentPath?: { resource: string; id: number }[];
  // name of the resource to show on the button
  label?: string;
};

export const NestedResourceHistoryButton = (
  props: NestedResourceHistoryButtonProps
) => {
  const { permissions } = usePermissions<Permissions>();
  const location = useLocation();

  // URL looks like /r1/:id1/.../rN/:idN[/show]
  const url = removeSuffix("/show", location.pathname);

  // turn it into [{r1, id1}, ..., {rN, idN}] (unless overridden in the props)
  const parentPath =
    props.parentPath ??
    chunksOf(2, url.split("/").slice(1)).map(([resource, id]) => ({
      resource,
      id: Number(id),
    }));

  // If rN == *_history, it means we are coming from a history record view.
  // In this case, ignore this last segment to come back to the history list.
  if (parentPath.at(-1)?.resource == `${props.child}_history`) parentPath.pop();

  // If rN == child, it means we are coming from the page of a single row from
  // the child resource, and we want to read its history.
  const targetingHistoryOfSingleRow =
    props.child == parentPath.at(-1)?.resource;
  // in this case, get the ID of the single row to add it as a filter on history
  const childID = targetingHistoryOfSingleRow
    ? parentPath.at(-1)?.id
    : undefined;
  // we can now forget that last segment
  if (targetingHistoryOfSingleRow) parentPath.pop();

  // reconstruct as string to make the link later
  const parentPathS = parentPath.map((p) => `/${p.resource}/${p.id}`).join("");

  // name of the child resource in the API, for permissions check / filtering
  const childAPIResource =
    props.childAPIResource ??
    `${parentPath.map((p) => p.resource).join("_")}_${props.child}`;

  const filter = childID
    ? `?filter=` +
      encodeURIComponent(`{ "${childAPIResource}_id": ${childID} }`)
    : "";

  return (
    <Button
      disabled={
        !permissions?.allow(
          `${childAPIResource}_history` as PermissionTarget,
          "read"
        )
      }
      component={Link}
      to={`${parentPathS}/${props.child}_history${filter}`}
      startIcon={<HistoryIcon />}
      label={`View History ${props.label ?? ""}`}
    />
  );
};

export const RestoreButton = (props: any) => {
  const resource = useResourceContext()!;
  const record = useRecordContext()!;

  const childResource: string = props.child;
  const parentResource: string = props.parent;
  const parentId = record[parentResource + "_id"];

  const actualResource = resource.replace(/_history$/, "");
  const actualId = record[actualResource + "_id"];
  const actualRecord = { ...record, id: actualId };

  const url =
    parentResource && childResource
      ? `/${parentResource}/${parentId}/${childResource}/${actualId}`
      : `/${actualResource}/${actualId}`;

  return (
    <Button
      component={Link}
      to={url}
      startIcon={<RestorePageIcon />}
      label="Restore"
      state={actualRecord}
    />
  );
};
