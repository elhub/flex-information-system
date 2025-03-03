import {
  Button,
  usePermissions,
  useRecordContext,
  useResourceContext,
} from "react-admin";
import { Link } from "react-router-dom";
import NewReleasesIcon from "@mui/icons-material/NewReleases";

export const EventButton = (props: any) => {
  const resource = useResourceContext();
  const record = useRecordContext()!;

  const { permissions } = usePermissions();

  const filter =
    "?filter=" +
    encodeURIComponent(`{ "source@like": "/${resource}/${record.id}" }`);

  return permissions.includes("event.read") ? (
    <Button
      component={Link}
      to={`/event${filter}`}
      startIcon={<NewReleasesIcon />}
      label="Events"
      {...props}
    />
  ) : null;
};
