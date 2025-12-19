import {
  Button,
  ButtonProps,
  usePermissions,
  useRecordContext,
  useResourceContext,
} from "react-admin";
import { Permissions } from "../auth/permissions";
import { Link } from "react-router-dom";
import NewReleasesIcon from "@mui/icons-material/NewReleases";

export const EventButton = (
  props: ButtonProps & { filterOnSubject?: boolean; recordId?: string },
) => {
  const resource = useResourceContext();
  const record = useRecordContext();
  const { recordId, filterOnSubject, ...rest } = props;
  const actualRecordId = recordId || record?.id;

  const { permissions } = usePermissions<Permissions>();

  // Permission checks
  const canRead = permissions?.allow("event", "read");

  // if the button is on a subresource's page, we should filter events on subject,
  // because the source field will contain the parent resource instead
  const filterField = filterOnSubject ? "subject" : "source";
  const filter =
    "?filter=" +
    encodeURIComponent(
      `{ "${filterField}@like": "/${resource}/${actualRecordId}" }`,
    );

  return canRead ? (
    <Button
      component={Link}
      to={`/event${filter}`}
      startIcon={<NewReleasesIcon />}
      label="Events"
      {...rest}
    />
  ) : null;
};
