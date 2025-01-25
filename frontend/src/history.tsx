import {
  Button,
  Identifier,
  RaRecord,
  usePermissions,
  useRecordContext,
  useResourceContext,
} from "react-admin";
import HistoryIcon from "@mui/icons-material/History";
import { Link } from "react-router-dom";
import RestorePageIcon from "@mui/icons-material/RestorePage";

export const historyRowClick = (
  _: Identifier,
  resource: string,
  record: RaRecord,
) => {
  const mainResource = resource.replace(/_history$/, "");
  return `/${mainResource}/${record[mainResource + "_id"]}/history/${
    record.id
  }/show`;
};

export const ResourceHistoryButton = () => {
  const record = useRecordContext()!;
  const resource = useResourceContext()!;
  const { permissions } = usePermissions();

  /* this allows reuse on both the main and history resource */
  const actualResource = resource.replace(/_history$/, "");
  const historyResource = `${actualResource}_history`;

  if (permissions.includes(`${historyResource}.read`)) {
    const actualId = resource.endsWith("_history")
      ? record[actualResource + "_id"]
      : record.id;

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

export const NestedResourceHistoryButton = (props: any) => {
  const record = useRecordContext()!;
  const { permissions } = usePermissions();
  const resource = useResourceContext();

  const childResource: string = props.child;
  const parentResource: string = props.parent ?? resource;

  // if the child resource lives on its own in the database (it does not have
  // the parent resource name as a prefix), this must be true
  const noResourceNameMerge: boolean = props.noResourceNameMerge ?? false;

  // this button goes to the history of the relations linked to one row of the
  // parent resource, and possibly only one relation depending on where the
  // button is displayed

  // if we are in the history or the child resource, the row ID is given in the
  // [parentresource]_id field, otherwise it is in the id field

  // if we are in the parent resource, then there is no child and we display
  // the full history of relations for the row ID

  // otherwise, we display the history only for the child concerned by the
  // history or child show page we come from

  const parentIdEntry = record[parentResource + "_id"];
  const childIdEntry = noResourceNameMerge
    ? record[`${childResource}_id`]
    : record[`${parentResource}_${childResource}_id`];

  const [parentId, childId] = parentIdEntry
    ? [parentIdEntry, childIdEntry ?? record.id]
    : [record.id, null];

  const filter =
    childId != null
      ? "?filter=" +
        encodeURIComponent(
          noResourceNameMerge
            ? `{ "${childResource}_id" : ${childId} }`
            : `{ "${parentResource}_${childResource}_id" : ${childId} }`,
        )
      : "";

  return (
    <Button
      disabled={
        !permissions.includes(
          noResourceNameMerge
            ? `${childResource}_history.read`
            : `${parentResource}_${childResource}_history.read`,
        )
      }
      component={Link}
      to={`/${parentResource}/${parentId}/${childResource}_history${filter}`}
      startIcon={<HistoryIcon />}
      label={`View History of ${props.label ?? "Relations"}`}
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
