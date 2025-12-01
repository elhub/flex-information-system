import {
  Button,
  usePermissions,
  useRecordContext,
  useResourceContext,
} from "react-admin";
import { Link } from "react-router-dom";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import { permissionRefs } from "../auth/permissions";

export const EventButton = (props: any) => {
  const resource = useResourceContext();
  const record = useRecordContext()!;

  const { permissions } = usePermissions();

  // Permission checks
  const canRead = permissions.includes(permissionRefs.event.read);

  const filter =
    "?filter=" +
    encodeURIComponent(`{ "source@like": "/${resource}/${record.id}" }`);

  return canRead ? (
    <Button
      component={Link}
      to={`/event${filter}`}
      startIcon={<NewReleasesIcon />}
      label="Events"
      {...props}
    />
  ) : null;
};
